import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/services/socket_service.dart';
import '../../../auth/presentation/providers/auth_providers.dart';
import '../../data/datasources/chat_remote_datasource.dart';
import '../../data/datasources/room_remote_datasource.dart';
import '../../data/models/chat_contact.dart';
import '../../data/models/chat_message.dart';
import '../../data/models/conversation.dart';
import '../../data/models/message_reaction.dart';
import '../../data/models/room.dart';
import '../../data/models/room_member.dart';
import '../../data/models/room_message.dart';

// ═══════════════════════════════════════════════════════════════
// Data Sources
// ═══════════════════════════════════════════════════════════════

final chatDataSourceProvider = Provider((ref) {
  return ChatRemoteDataSource(ref.watch(apiClientProvider));
});

final roomDataSourceProvider = Provider((ref) {
  return RoomRemoteDataSource(ref.watch(apiClientProvider));
});

// ═══════════════════════════════════════════════════════════════
// Socket Service
// ═══════════════════════════════════════════════════════════════

final socketServiceProvider = Provider<SocketService>((ref) {
  return SocketService.instance;
});

// ═══════════════════════════════════════════════════════════════
// Conversations List  (non-autoDispose — lives for the session)
// ═══════════════════════════════════════════════════════════════

final conversationsProvider =
    AsyncNotifierProvider<ConversationsNotifier, List<Conversation>>(
  ConversationsNotifier.new,
);

class ConversationsNotifier extends AsyncNotifier<List<Conversation>> {
  /// The conversation currently open on screen (so we don't increment its unread).
  String? activeConversationId;

  @override
  Future<List<Conversation>> build() async {
    final ds = ref.read(chatDataSourceProvider);
    final socket = ref.read(socketServiceProvider);

    // ── conversation:updated — authoritative source for preview + unread ──
    final sub = socket.onConversationUpdated.listen((data) {
      final convId = data['conversationId']?.toString();
      if (convId == null) return;

      final unread = data['unreadCount'];
      final parsedUnread = unread is num
          ? unread.toInt()
          : int.tryParse(unread?.toString() ?? '');

      // If user is viewing this conversation, force unread to 0
      final effectiveUnread =
          (convId == activeConversationId) ? 0 : parsedUnread;

      updateConversation(
        convId,
        lastMessagePreview: data['lastMessagePreview']?.toString(),
        lastMessageAt: data['lastMessageAt']?.toString(),
        unreadCount: effectiveUnread,
      );
    });
    ref.onDispose(sub.cancel);

    // ── message:new — fallback for preview + new-conversation detection ──
    final msgSub = socket.onNewMessage.listen((data) {
      final convId = data['conversation_id']?.toString();
      final senderId = data['sender_id']?.toString();
      if (convId == null) return;

      final currentUserId = ref.read(currentUserProvider)?.id;
      // Build preview from message content
      final content = data['content']?.toString() ?? '';
      final preview =
          content.length > 100 ? '${content.substring(0, 100)}...' : content;
      final createdAt = data['created_at']?.toString();

      // Own message — just update preview/time, no unread bump
      if (senderId == currentUserId) {
        updateConversation(convId,
            lastMessagePreview: preview, lastMessageAt: createdAt);
        return;
      }

      final current = state.valueOrNull;
      if (current == null) return;

      final idx = current.indexWhere((c) => c.id == convId);
      if (idx == -1) {
        // New conversation not yet in our list — fetch from server
        refresh();
        return;
      }

      if (convId == activeConversationId) {
        // Viewing this conversation — update preview/time but keep unread 0
        updateConversation(convId,
            lastMessagePreview: preview, lastMessageAt: createdAt);
      } else {
        // Not viewing — bump unread locally (conversation:updated will
        // override with server value when it arrives shortly after)
        updateConversation(
          convId,
          lastMessagePreview: preview,
          lastMessageAt: createdAt,
          unreadCount: current[idx].unreadCount + 1,
        );
      }
    });
    ref.onDispose(msgSub.cancel);

    final result = await ds.getConversations();
    return result.conversations;
  }

  /// Re-fetch from server without clearing current state.
  Future<void> refresh() async {
    try {
      final ds = ref.read(chatDataSourceProvider);
      final result = await ds.getConversations();
      state = AsyncData(result.conversations);
    } catch (e, st) {
      // Only set error if we have no data at all
      if (state.valueOrNull == null) {
        state = AsyncError(e, st);
      }
    }
  }

  /// Update a single conversation in the list (e.g. from socket event).
  void updateConversation(String id,
      {String? lastMessagePreview, String? lastMessageAt, int? unreadCount}) {
    final current = state.valueOrNull;
    if (current == null) return;

    final updated = current.map((c) {
      if (c.id != id) return c;
      return c.copyWith(
        lastMessagePreview: lastMessagePreview ?? c.lastMessagePreview,
        lastMessageAt: lastMessageAt ?? c.lastMessageAt,
        unreadCount: unreadCount ?? c.unreadCount,
      );
    }).toList();

    // Re-sort by last_message_at descending
    updated.sort((a, b) {
      final aTime = a.lastMessageAt ?? '';
      final bTime = b.lastMessageAt ?? '';
      return bTime.compareTo(aTime);
    });

    state = AsyncData(updated);
  }
}

// ═══════════════════════════════════════════════════════════════
// Rooms List  (non-autoDispose — lives for the session)
// ═══════════════════════════════════════════════════════════════

final roomsProvider =
    AsyncNotifierProvider<RoomsNotifier, List<Room>>(
  RoomsNotifier.new,
);

class RoomsNotifier extends AsyncNotifier<List<Room>> {
  @override
  Future<List<Room>> build() async {
    final ds = ref.read(roomDataSourceProvider);
    final socket = ref.read(socketServiceProvider);

    // Listen for new room messages to update preview
    final sub = socket.onRoomMessage.listen((data) {
      final roomId = data['conversation_id']?.toString();
      if (roomId == null) return;
      updateRoom(
        roomId,
        lastMessagePreview: data['content']?.toString(),
        lastMessageAt: data['created_at']?.toString(),
      );
    });
    ref.onDispose(sub.cancel);

    return ds.getMyRooms();
  }

  Future<void> refresh() async {
    try {
      final ds = ref.read(roomDataSourceProvider);
      final rooms = await ds.getMyRooms();
      state = AsyncData(rooms);
    } catch (e, st) {
      if (state.valueOrNull == null) {
        state = AsyncError(e, st);
      }
    }
  }

  void updateRoom(String id, {String? lastMessagePreview, String? lastMessageAt, int? unreadCount}) {
    final current = state.valueOrNull;
    if (current == null) return;

    final updated = current.map((r) {
      if (r.id != id) return r;
      return r.copyWith(
        lastMessagePreview: lastMessagePreview ?? r.lastMessagePreview,
        lastMessageAt: lastMessageAt ?? r.lastMessageAt,
        unreadCount: unreadCount ?? r.unreadCount,
      );
    }).toList();

    updated.sort((a, b) {
      final aTime = a.lastMessageAt ?? '';
      final bTime = b.lastMessageAt ?? '';
      return bTime.compareTo(aTime);
    });

    state = AsyncData(updated);
  }
}

// ═══════════════════════════════════════════════════════════════
// Chat Messages (per conversation)
// ═══════════════════════════════════════════════════════════════

final chatMessagesProvider = StateNotifierProvider.autoDispose
    .family<ChatMessagesNotifier, AsyncValue<List<ChatMessage>>, String>(
  (ref, conversationId) => ChatMessagesNotifier(ref, conversationId),
);

class ChatMessagesNotifier extends StateNotifier<AsyncValue<List<ChatMessage>>> {
  final Ref _ref;
  final String conversationId;
  bool _hasMore = true;

  ChatMessagesNotifier(this._ref, this.conversationId)
      : super(const AsyncLoading()) {
    _loadInitial();
  }

  bool get hasMore => _hasMore;

  Future<void> _loadInitial() async {
    try {
      final ds = _ref.read(chatDataSourceProvider);
      final result = await ds.getMessages(conversationId);
      _hasMore = result.hasMore;
      state = AsyncData(result.messages);
    } catch (e, st) {
      state = AsyncError(e, st);
    }
  }

  /// Load older messages (pagination).
  Future<void> loadMore() async {
    if (!_hasMore) return;
    final current = state.valueOrNull;
    if (current == null || current.isEmpty) return;

    try {
      final ds = _ref.read(chatDataSourceProvider);
      final oldest = current.first.createdAt;
      final result = await ds.getMessages(conversationId, before: oldest);
      _hasMore = result.hasMore;
      state = AsyncData([...result.messages, ...current]);
    } catch (_) {
      // Silently fail — don't blow up the list
    }
  }

  /// Append a new message (from send or socket).
  void addMessage(ChatMessage message) {
    final current = state.valueOrNull ?? [];
    // Deduplicate by ID
    if (current.any((m) => m.id == message.id)) return;
    state = AsyncData([...current, message]);
  }

  /// Update reactions on a message (from socket or API response).
  void updateReactions(String messageId, List<MessageReaction> reactions) {
    final current = state.valueOrNull;
    if (current == null) return;
    state = AsyncData(
      current.map((m) {
        if (m.id != messageId) return m;
        return m.copyWith(reactions: reactions);
      }).toList(),
    );
  }

  /// Mark a message as deleted for everyone (from socket).
  void markDeleted(String messageId) {
    final current = state.valueOrNull;
    if (current == null) return;
    state = AsyncData(
      current.map((m) {
        if (m.id != messageId) return m;
        return m.copyWith(
          deletedAt: DateTime.now().toIso8601String(),
          content: 'This message was deleted',
        );
      }).toList(),
    );
  }

  /// Remove a message from local list (delete for me).
  void removeForMe(String messageId) {
    final current = state.valueOrNull;
    if (current == null) return;
    state = AsyncData(current.where((m) => m.id != messageId).toList());
  }

  /// Send a message via API and append on success.
  Future<void> sendMessage(String content, {String? replyToId}) async {
    try {
      final ds = _ref.read(chatDataSourceProvider);
      final message =
          await ds.sendMessage(conversationId, content, replyToId: replyToId);
      addMessage(message);
    } catch (_) {
      rethrow;
    }
  }

  /// Toggle a reaction via API and update local state.
  Future<void> toggleReaction(String messageId, String emoji) async {
    try {
      final ds = _ref.read(chatDataSourceProvider);
      final reactions =
          await ds.toggleReaction(conversationId, messageId, emoji);
      updateReactions(messageId, reactions);
    } catch (_) {
      // Silently fail
    }
  }

  /// Delete a message via API.
  Future<void> deleteMessage(String messageId,
      {bool forEveryone = false}) async {
    try {
      final ds = _ref.read(chatDataSourceProvider);
      await ds.deleteMessage(conversationId, messageId,
          forEveryone: forEveryone);
      if (forEveryone) {
        markDeleted(messageId);
      } else {
        removeForMe(messageId);
      }
    } catch (_) {
      rethrow;
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// Room Messages (per room)
// ═══════════════════════════════════════════════════════════════

final roomMessagesProvider = StateNotifierProvider.autoDispose
    .family<RoomMessagesNotifier, AsyncValue<List<RoomMessage>>, String>(
  (ref, roomId) => RoomMessagesNotifier(ref, roomId),
);

class RoomMessagesNotifier extends StateNotifier<AsyncValue<List<RoomMessage>>> {
  final Ref _ref;
  final String roomId;
  bool _hasMore = true;

  RoomMessagesNotifier(this._ref, this.roomId)
      : super(const AsyncLoading()) {
    _loadInitial();
  }

  bool get hasMore => _hasMore;

  Future<void> _loadInitial() async {
    try {
      final ds = _ref.read(roomDataSourceProvider);
      final result = await ds.getMessages(roomId);
      _hasMore = result.hasMore;
      state = AsyncData(result.messages);
    } catch (e, st) {
      state = AsyncError(e, st);
    }
  }

  Future<void> loadMore() async {
    if (!_hasMore) return;
    final current = state.valueOrNull;
    if (current == null || current.isEmpty) return;

    try {
      final ds = _ref.read(roomDataSourceProvider);
      final oldest = current.first.createdAt;
      final result = await ds.getMessages(roomId, before: oldest);
      _hasMore = result.hasMore;
      state = AsyncData([...result.messages, ...current]);
    } catch (_) {}
  }

  void addMessage(RoomMessage message) {
    final current = state.valueOrNull ?? [];
    if (current.any((m) => m.id == message.id)) return;
    state = AsyncData([...current, message]);
  }

  void removeMessage(String messageId) {
    final current = state.valueOrNull ?? [];
    state = AsyncData(
      current.map((m) {
        if (m.id != messageId) return m;
        return m.copyWith(isDeleted: true, content: '[Message deleted]');
      }).toList(),
    );
  }

  /// Update reactions on a room message.
  void updateReactions(String messageId, List<MessageReaction> reactions) {
    final current = state.valueOrNull;
    if (current == null) return;
    state = AsyncData(
      current.map((m) {
        if (m.id != messageId) return m;
        return m.copyWith(reactions: reactions);
      }).toList(),
    );
  }

  /// Mark a message as deleted for everyone.
  void markDeleted(String messageId) {
    final current = state.valueOrNull;
    if (current == null) return;
    state = AsyncData(
      current.map((m) {
        if (m.id != messageId) return m;
        return m.copyWith(
          isDeleted: true,
          deletedAt: DateTime.now().toIso8601String(),
          content: 'This message was deleted',
        );
      }).toList(),
    );
  }

  /// Remove a message from local list (delete for me).
  void removeForMe(String messageId) {
    final current = state.valueOrNull;
    if (current == null) return;
    state = AsyncData(current.where((m) => m.id != messageId).toList());
  }

  void togglePin(String messageId, bool pinned) {
    final current = state.valueOrNull ?? [];
    state = AsyncData(
      current.map((m) {
        if (m.id != messageId) return m;
        return m.copyWith(isPinned: pinned);
      }).toList(),
    );
  }

  Future<void> sendMessage(String content, {String? replyToId}) async {
    try {
      final ds = _ref.read(roomDataSourceProvider);
      final message = await ds.sendMessage(roomId, content, replyToId: replyToId);
      addMessage(message);
    } catch (_) {
      rethrow;
    }
  }

  /// Toggle a reaction via API and update local state.
  Future<void> toggleReaction(String messageId, String emoji) async {
    try {
      final ds = _ref.read(roomDataSourceProvider);
      final reactions = await ds.toggleReaction(roomId, messageId, emoji);
      updateReactions(messageId, reactions);
    } catch (_) {
      // Silently fail
    }
  }

  /// Delete a message via API.
  Future<void> deleteMessage(String messageId,
      {bool forEveryone = false}) async {
    try {
      final ds = _ref.read(roomDataSourceProvider);
      await ds.deleteMessage(roomId, messageId);
      if (forEveryone) {
        markDeleted(messageId);
      } else {
        removeForMe(messageId);
      }
    } catch (_) {
      rethrow;
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// Contacts
// ═══════════════════════════════════════════════════════════════

final chatContactsProvider =
    FutureProvider.autoDispose<ChatContacts>((ref) async {
  final ds = ref.watch(chatDataSourceProvider);
  return ds.getContacts();
});

// ═══════════════════════════════════════════════════════════════
// Room Members (paginated with search)
// ═══════════════════════════════════════════════════════════════

final roomMembersProvider = StateNotifierProvider.autoDispose
    .family<RoomMembersNotifier, AsyncValue<List<RoomMember>>, String>(
  (ref, roomId) => RoomMembersNotifier(ref, roomId),
);

class RoomMembersNotifier extends StateNotifier<AsyncValue<List<RoomMember>>> {
  final Ref _ref;
  final String roomId;
  int _page = 1;
  int _totalPages = 1;
  String _search = '';
  bool _loading = false;

  RoomMembersNotifier(this._ref, this.roomId)
      : super(const AsyncLoading()) {
    _loadInitial();
  }

  bool get hasMore => _page < _totalPages;

  Future<void> _loadInitial() async {
    try {
      final ds = _ref.read(roomDataSourceProvider);
      final result = await ds.getMembers(roomId, page: 1, search: _search);
      _page = 1;
      _totalPages = result.totalPages;
      if (mounted) state = AsyncData(result.members);
    } catch (e, st) {
      if (mounted) state = AsyncError(e, st);
    }
  }

  Future<void> loadMore() async {
    if (_loading || !hasMore) return;
    _loading = true;
    try {
      final ds = _ref.read(roomDataSourceProvider);
      final result = await ds.getMembers(roomId, page: _page + 1, search: _search);
      _page++;
      _totalPages = result.totalPages;
      final current = state.valueOrNull ?? [];
      state = AsyncData([...current, ...result.members]);
    } catch (_) {
      // Don't blow up existing list on pagination failure
    } finally {
      _loading = false;
    }
  }

  Future<void> search(String query) async {
    _search = query.trim();
    _page = 1;
    if (mounted) state = const AsyncLoading();
    await _loadInitial();
  }

  Future<void> refresh() async {
    _page = 1;
    _search = '';
    if (mounted) state = const AsyncLoading();
    await _loadInitial();
  }
}

// ═══════════════════════════════════════════════════════════════
// Total unread badge count (DMs + Rooms)
// ═══════════════════════════════════════════════════════════════

final dmUnreadCountProvider = Provider<int>((ref) {
  final convos = ref.watch(conversationsProvider).valueOrNull ?? [];
  return convos.fold<int>(0, (sum, c) => sum + c.unreadCount);
});

final roomUnreadCountProvider = Provider<int>((ref) {
  final rooms = ref.watch(roomsProvider).valueOrNull ?? [];
  return rooms.fold<int>(0, (sum, r) => sum + r.unreadCount);
});

final chatUnreadCountProvider = Provider<int>((ref) {
  return ref.watch(dmUnreadCountProvider) + ref.watch(roomUnreadCountProvider);
});

// ═══════════════════════════════════════════════════════════════
// Active chat tab index (0 = DMs, 1 = Rooms)
// ═══════════════════════════════════════════════════════════════

final chatTabIndexProvider = StateProvider.autoDispose<int>((_) => 0);
