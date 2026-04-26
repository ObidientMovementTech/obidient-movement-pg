import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:intl/intl.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/services/socket_service.dart';
import '../../../../shared/widgets/skeleton_loader.dart';
import '../../../auth/presentation/providers/auth_providers.dart';
import '../providers/chat_providers.dart';
import '../../data/models/message_reaction.dart';
import '../../data/models/room_member.dart';
import '../../data/models/room_message.dart';
import '../widgets/user_profile_sheet.dart';
import '../widgets/message_actions_sheet.dart';
import '../widgets/reaction_display.dart';
import '../widgets/reply_preview_bar.dart';
import '../widgets/inline_reply_preview.dart';

class RoomChatScreen extends ConsumerStatefulWidget {
  final String roomId;
  const RoomChatScreen({super.key, required this.roomId});

  @override
  ConsumerState<RoomChatScreen> createState() => _RoomChatScreenState();
}

class _RoomChatScreenState extends ConsumerState<RoomChatScreen> {
  final _controller = TextEditingController();
  final _scrollController = ScrollController();
  final _focusNode = FocusNode();
  bool _sending = false;
  StreamSubscription<Map<String, dynamic>>? _msgSub;
  StreamSubscription<Map<String, dynamic>>? _deleteSub;
  StreamSubscription<Map<String, dynamic>>? _pinSub;
  StreamSubscription<Map<String, dynamic>>? _reactionSub;
  StreamSubscription<Map<String, dynamic>>? _msgDeletedSub;

  // Reply state
  RoomMessage? _replyingTo;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    final socket = ref.read(socketServiceProvider);
    socket.joinRoom(widget.roomId);
    socket.markRoomRead(widget.roomId);
    // Clear local unread badge after build completes
    Future(() {
      ref.read(roomsProvider.notifier).updateRoom(widget.roomId, unreadCount: 0);
    });

    // Listen for incoming room messages
    _msgSub = socket.onRoomMessage.listen((data) {
      final convId = data['conversation_id']?.toString();
      if (convId != widget.roomId) return;
      try {
        final msg = RoomMessage.fromJson(data);
        ref.read(roomMessagesProvider(widget.roomId).notifier).addMessage(msg);
        _scrollToBottom();
        socket.markRoomRead(widget.roomId);
      } catch (_) {}
    });

    // Listen for message deletions
    _deleteSub = socket.onRoomMessageDeleted.listen((data) {
      if (data['roomId']?.toString() != widget.roomId) return;
      final msgId = data['messageId']?.toString();
      if (msgId != null) {
        ref.read(roomMessagesProvider(widget.roomId).notifier).removeMessage(msgId);
      }
    });

    // Listen for pin toggles
    _pinSub = socket.onRoomMessagePinned.listen((data) {
      if (data['roomId']?.toString() != widget.roomId) return;
      final msgId = data['messageId']?.toString();
      final pinned = data['pinned'] as bool? ?? false;
      if (msgId != null) {
        ref.read(roomMessagesProvider(widget.roomId).notifier).togglePin(msgId, pinned);
      }
    });

    // Listen for reaction updates
    _reactionSub = socket.onReactionUpdated.listen((data) {
      final convId = data['conversationId']?.toString();
      if (convId != widget.roomId) return;
      final msgId = data['messageId']?.toString();
      if (msgId == null) return;
      try {
        final list = data['reactions'] as List<dynamic>? ?? [];
        final reactions = list
            .map((e) =>
                MessageReaction.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList();
        ref
            .read(roomMessagesProvider(widget.roomId).notifier)
            .updateReactions(msgId, reactions);
      } catch (_) {}
    });

    // Listen for message:deleted (for everyone)
    _msgDeletedSub = socket.onMessageDeleted.listen((data) {
      final convId = data['conversationId']?.toString();
      if (convId != widget.roomId) return;
      final msgId = data['messageId']?.toString();
      if (msgId != null) {
        ref
            .read(roomMessagesProvider(widget.roomId).notifier)
            .markDeleted(msgId);
      }
    });
  }

  @override
  void dispose() {
    _msgSub?.cancel();
    _deleteSub?.cancel();
    _pinSub?.cancel();
    _reactionSub?.cancel();
    _msgDeletedSub?.cancel();
    SocketService.instance.leaveRoom(widget.roomId);
    _controller.dispose();
    _scrollController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels <=
        _scrollController.position.minScrollExtent + 100) {
      ref
          .read(roomMessagesProvider(widget.roomId).notifier)
          .loadMore();
    }
  }

  Future<void> _send() async {
    final text = _controller.text.trim();
    if (text.isEmpty || _sending) return;

    setState(() => _sending = true);
    _controller.clear();
    final replyToId = _replyingTo?.id;
    setState(() => _replyingTo = null);

    try {
      await ref
          .read(roomMessagesProvider(widget.roomId).notifier)
          .sendMessage(text, replyToId: replyToId);
      _scrollToBottom();
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to send message')),
        );
        _controller.text = text;
      }
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  void _setReply(RoomMessage msg) {
    setState(() => _replyingTo = msg);
    _focusNode.requestFocus();
  }

  void _onLongPress(RoomMessage msg, bool isMe, bool isDark) {
    final notifier =
        ref.read(roomMessagesProvider(widget.roomId).notifier);
    showMessageActionsSheet(
      context,
      isMe: isMe,
      isDark: isDark,
      messageContent: msg.content,
      isDeleted: msg.isDeleted || msg.deletedAt != null,
      onReact: (emoji) => notifier.toggleReaction(msg.id, emoji),
      onReply: () => _setReply(msg),
      onDelete: ({required bool forEveryone}) =>
          notifier.deleteMessage(msg.id, forEveryone: forEveryone),
    );
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final messagesAsync = ref.watch(roomMessagesProvider(widget.roomId));
    final currentUser = ref.watch(currentUserProvider);
    final rooms = ref.watch(roomsProvider).valueOrNull ?? [];
    final room = rooms.where((r) => r.id == widget.roomId).firstOrNull;

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 0,
        title: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(isDark ? 0.15 : 0.08),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Center(
                child: Text(
                  room?.icon ?? '💬',
                  style: const TextStyle(fontSize: 18),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    room?.title ?? 'Community Room',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (room != null)
                    Text(
                      '${room.memberCount} members',
                      style: TextStyle(
                        fontSize: 11.5,
                        color: isDark
                            ? AppColors.textMuted
                            : AppColors.lightTextSecondary,
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.people_outline_rounded, size: 22),
            onPressed: () => _showMembersSheet(context),
          ),
        ],
      ),
      body: Column(
        children: [
          // Messages
          Expanded(
            child: messagesAsync.when(
              loading: () =>
                  const SkeletonList(itemCount: 10, itemHeight: 52),
              error: (e, _) => Center(
                child: Text(
                  'Failed to load messages',
                  style: TextStyle(
                      color: theme.colorScheme.onSurface.withOpacity(0.5)),
                ),
              ),
              data: (messages) {
                if (messages.isEmpty) {
                  return Center(
                    child: Text(
                      'No messages yet. Start the conversation! 🎉',
                      style: TextStyle(
                        fontSize: 15,
                        color: isDark
                            ? AppColors.textMuted
                            : AppColors.lightTextSecondary,
                      ),
                    ),
                  );
                }
                return ListView.builder(
                  controller: _scrollController,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  itemCount: messages.length,
                  itemBuilder: (_, i) {
                    final msg = messages[i];
                    final isMe = msg.senderId == currentUser?.id;
                    final showDate = i == 0 ||
                        _differentDay(
                            messages[i - 1].createdAt, msg.createdAt);
                    final showSender = !isMe &&
                        (i == 0 || messages[i - 1].senderId != msg.senderId);
                    final isDeleted = msg.isDeleted || msg.deletedAt != null;
                    final hasReactions = msg.reactions.isNotEmpty;
                    return Column(
                      children: [
                        if (showDate) _DateSeparator(date: msg.createdAt),
                        Padding(
                          padding: EdgeInsets.only(bottom: hasReactions ? 10 : 0),
                          child: Stack(
                            clipBehavior: Clip.none,
                            children: [
                              GestureDetector(
                                onLongPress: () =>
                                    _onLongPress(msg, isMe, isDark),
                                onHorizontalDragEnd: isDeleted
                                    ? null
                                    : (details) {
                                        final v = details.primaryVelocity ?? 0;
                                        if ((!isMe && v > 300) ||
                                            (isMe && v < -300)) {
                                          HapticFeedback.lightImpact();
                                          _setReply(msg);
                                        }
                                      },
                                child: _RoomMessageBubble(
                                  message: msg,
                                  isMe: isMe,
                                  isDark: isDark,
                                  showSender: showSender,
                                ),
                              ),
                              if (hasReactions)
                                Positioned(
                                  bottom: -10,
                                  left: isMe ? null : (showSender ? 46 : 46),
                                  right: isMe ? 16 : null,
                                  child: ReactionDisplay(
                                    reactions: msg.reactions,
                                    isDark: isDark,
                                    onTap: (emoji) {
                                      ref
                                          .read(roomMessagesProvider(widget.roomId)
                                              .notifier)
                                          .toggleReaction(msg.id, emoji);
                                    },
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ],
                    );
                  },
                );
              },
            ),
          ),
          // Reply preview bar
          if (_replyingTo != null)
            ReplyPreviewBar(
              senderName: _replyingTo!.senderName ?? 'Unknown',
              content: _replyingTo!.content,
              isDark: isDark,
              onDismiss: () => setState(() => _replyingTo = null),
            ),
          // Input bar
          _RoomMessageInput(
            controller: _controller,
            focusNode: _focusNode,
            sending: _sending,
            onSend: _send,
            isDark: isDark,
          ),
        ],
      ),
    );
  }

  bool _differentDay(String a, String b) {
    final da = DateTime.tryParse(a);
    final db = DateTime.tryParse(b);
    if (da == null || db == null) return false;
    return da.year != db.year || da.month != db.month || da.day != db.day;
  }

  void _showMembersSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _MembersSheet(roomId: widget.roomId),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// DATE SEPARATOR
// ═══════════════════════════════════════════════════════════════════

class _DateSeparator extends StatelessWidget {
  final String date;
  const _DateSeparator({required this.date});

  @override
  Widget build(BuildContext context) {
    final dt = DateTime.tryParse(date);
    final label = dt != null ? DateFormat('MMM d, yyyy').format(dt) : '';
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Center(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: Theme.of(context).brightness == Brightness.dark
                ? AppColors.elevated
                : const Color(0xFFEEEEEE),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Text(
            label,
            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w500),
          ),
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// ROOM MESSAGE BUBBLE — shows sender avatar + name + designation for others
// ═══════════════════════════════════════════════════════════════════

class _RoomMessageBubble extends StatelessWidget {
  final RoomMessage message;
  final bool isMe;
  final bool isDark;
  final bool showSender;

  const _RoomMessageBubble({
    required this.message,
    required this.isMe,
    required this.isDark,
    required this.showSender,
  });

  void _showProfile(BuildContext context) {
    showUserProfileSheet(
      context,
      ChatUserProfile(
        userId: message.senderId,
        name: message.senderName,
        image: message.senderImage,
        designation: message.senderDesignation,
        votingState: message.senderVotingState,
        votingLga: message.senderVotingLga,
        votingWard: message.senderVotingWard,
        votingPu: message.senderVotingPu,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final time = _formatTime(message.createdAt);

    final bgColor = isMe
        ? (isDark ? const Color(0xFF054D25) : const Color(0xFFDCF8C6))
        : (isDark ? AppColors.elevated : const Color(0xFFFFFFFF));

    final textColor = isMe
        ? (isDark ? Colors.white : const Color(0xFF111111))
        : (isDark ? AppColors.textPrimary : AppColors.lightTextPrimary);

    final timeColor = isMe
        ? (isDark ? Colors.white70 : const Color(0xFF5A7E4E))
        : (isDark ? AppColors.textMuted : AppColors.lightTextSecondary);

    // For own messages — no avatar needed
    if (isMe) {
      return Align(
        alignment: Alignment.centerRight,
        child: Container(
          constraints: BoxConstraints(
            maxWidth: MediaQuery.of(context).size.width * 0.78,
          ),
          margin: const EdgeInsets.only(top: 2, bottom: 2, left: 48),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: _bubbleDecoration(bgColor, true),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Inline reply preview (own messages)
              if (message.replyToId != null && !message.isDeleted)
                InlineReplyPreview(
                  senderName: message.replyToSenderName ?? 'Unknown',
                  content: message.replyToContent ?? '',
                  isMe: true,
                  isDark: isDark,
                ),
              ..._bubbleContent(textColor, timeColor, time),
            ],
          ),
        ),
      );
    }

    // For others — show avatar to the left
    return Padding(
      padding: EdgeInsets.only(top: showSender ? 8 : 2, bottom: 2),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Avatar — only visible on first message in a group
          if (showSender)
            GestureDetector(
              onTap: () => _showProfile(context),
              child: CircleAvatar(
                radius: 16,
                backgroundColor:
                    isDark ? AppColors.elevated : const Color(0xFFF0F0F0),
                backgroundImage: message.senderImage != null
                    ? CachedNetworkImageProvider(message.senderImage!)
                    : null,
                child: message.senderImage == null
                    ? Text(
                        _senderInitial(message.senderName),
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: isDark
                              ? AppColors.textSecondary
                              : AppColors.lightTextSecondary,
                        ),
                      )
                    : null,
              ),
            )
          else
            const SizedBox(width: 32), // spacing to align with avatar above
          const SizedBox(width: 6),
          // Bubble
          Flexible(
            child: Container(
              constraints: BoxConstraints(
                maxWidth: MediaQuery.of(context).size.width * 0.72,
              ),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: _bubbleDecoration(bgColor, false),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Sender name + designation (tappable)
                  if (showSender) ...[
                    GestureDetector(
                      onTap: () => _showProfile(context),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Flexible(
                            child: Text(
                              message.senderName ?? 'Unknown',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color:
                                    _senderColor(message.senderName ?? ''),
                              ),
                            ),
                          ),
                          if (message.senderDesignation != null) ...[
                            const SizedBox(width: 6),
                            Text(
                              message.senderDesignation!,
                              style: TextStyle(
                                fontSize: 10.5,
                                color: isDark
                                    ? AppColors.textMuted
                                    : AppColors.lightTextSecondary,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                    const SizedBox(height: 3),
                  ],
                  // Inline reply preview (others)
                  if (message.replyToId != null && !message.isDeleted)
                    InlineReplyPreview(
                      senderName: message.replyToSenderName ?? 'Unknown',
                      content: message.replyToContent ?? '',
                      isMe: false,
                      isDark: isDark,
                    ),
                  // Pinned indicator
                  if (message.isPinned) ...[
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.push_pin_rounded,
                            size: 11,
                            color: isDark
                                ? AppColors.textMuted
                                : AppColors.lightTextSecondary),
                        const SizedBox(width: 3),
                        Text(
                          'Pinned',
                          style: TextStyle(
                            fontSize: 10,
                            color: isDark
                                ? AppColors.textMuted
                                : AppColors.lightTextSecondary,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 3),
                  ],
                  // Content + time
                  Wrap(
                    alignment: WrapAlignment.end,
                    spacing: 6,
                    children: [
                      Text(
                        message.content,
                        style: TextStyle(
                          fontSize: 14.5,
                          height: 1.35,
                          color: message.isDeleted
                              ? (isDark
                                  ? AppColors.textMuted
                                  : AppColors.lightTextSecondary)
                              : textColor,
                          fontStyle:
                              message.isDeleted ? FontStyle.italic : null,
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.only(top: 2),
                        child: Text(
                          time,
                          style:
                              TextStyle(fontSize: 10.5, color: timeColor),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  BoxDecoration _bubbleDecoration(Color bgColor, bool isMe) {
    return BoxDecoration(
      color: message.isDeleted
          ? (isDark
              ? AppColors.elevated.withOpacity(0.5)
              : const Color(0xFFF5F5F5))
          : bgColor,
      borderRadius: BorderRadius.only(
        topLeft: const Radius.circular(16),
        topRight: const Radius.circular(16),
        bottomLeft: Radius.circular(isMe ? 16 : 4),
        bottomRight: Radius.circular(isMe ? 4 : 16),
      ),
      boxShadow: isDark
          ? null
          : [
              BoxShadow(
                color: Colors.black.withOpacity(0.04),
                blurRadius: 4,
                offset: const Offset(0, 1),
              ),
            ],
    );
  }

  List<Widget> _bubbleContent(Color textColor, Color timeColor, String time) {
    return [
        if (message.isPinned) ...[
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.push_pin_rounded,
                  size: 11,
                  color: isDark
                      ? AppColors.textMuted
                      : AppColors.lightTextSecondary),
              const SizedBox(width: 3),
              Text(
                'Pinned',
                style: TextStyle(
                  fontSize: 10,
                  color: isDark
                      ? AppColors.textMuted
                      : AppColors.lightTextSecondary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 3),
        ],
        Wrap(
          alignment: WrapAlignment.end,
          spacing: 6,
          children: [
            Text(
              message.content,
              style: TextStyle(
                fontSize: 14.5,
                height: 1.35,
                color: message.isDeleted
                    ? (isDark
                        ? AppColors.textMuted
                        : AppColors.lightTextSecondary)
                    : textColor,
                fontStyle: message.isDeleted ? FontStyle.italic : null,
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(top: 2),
              child: Text(
                time,
                style: TextStyle(fontSize: 10.5, color: timeColor),
              ),
            ),
          ],
        ),
    ];
  }

  String _formatTime(String iso) {
    final dt = DateTime.tryParse(iso)?.toLocal();
    if (dt == null) return '';
    return DateFormat.jm().format(dt);
  }

  String _senderInitial(String? name) {
    if (name == null || name.isEmpty) return '?';
    return name[0].toUpperCase();
  }

  /// Deterministic color for sender name based on name hash
  Color _senderColor(String name) {
    const colors = [
      Color(0xFF1E88E5),
      Color(0xFFD81B60),
      Color(0xFF00897B),
      Color(0xFFFB8C00),
      Color(0xFF8E24AA),
      Color(0xFF43A047),
      Color(0xFFE53935),
      Color(0xFF3949AB),
    ];
    return colors[name.hashCode.abs() % colors.length];
  }
}

// ═══════════════════════════════════════════════════════════════════
// ROOM MESSAGE INPUT
// ═══════════════════════════════════════════════════════════════════

class _RoomMessageInput extends StatelessWidget {
  final TextEditingController controller;
  final FocusNode focusNode;
  final bool sending;
  final VoidCallback onSend;
  final bool isDark;

  const _RoomMessageInput({
    required this.controller,
    required this.focusNode,
    required this.sending,
    required this.onSend,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(
        12,
        8,
        8,
        MediaQuery.of(context).padding.bottom + 8,
      ),
      decoration: BoxDecoration(
        color: isDark ? AppColors.surface : Colors.white,
        border: Border(
          top: BorderSide(
            color: isDark ? AppColors.border : const Color(0xFFE5E5E5),
            width: 0.5,
          ),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: isDark ? AppColors.elevated : const Color(0xFFF5F5F5),
                borderRadius: BorderRadius.circular(22),
              ),
              child: TextField(
                controller: controller,
                focusNode: focusNode,
                minLines: 1,
                maxLines: 5,
                textCapitalization: TextCapitalization.sentences,
                decoration: const InputDecoration(
                  hintText: 'Type a message...',
                  contentPadding:
                      EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  border: InputBorder.none,
                ),
                style: const TextStyle(fontSize: 14.5),
                onSubmitted: (_) => onSend(),
              ),
            ),
          ),
          const SizedBox(width: 6),
          Container(
            width: 44,
            height: 44,
            margin: const EdgeInsets.only(bottom: 1),
            child: IconButton(
              onPressed: sending ? null : () {
                HapticFeedback.lightImpact();
                onSend();
              },
              style: IconButton.styleFrom(
                backgroundColor: AppColors.primary,
                disabledBackgroundColor: AppColors.primary.withOpacity(0.4),
                shape: const CircleBorder(),
              ),
              icon: sending
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Icon(
                      Icons.send_rounded,
                      size: 20,
                      color: Colors.white,
                    ),
            ),
          ),
        ],
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// MEMBERS BOTTOM SHEET — search, alphabetical sections, pagination
// ═══════════════════════════════════════════════════════════════════

class _MembersSheet extends ConsumerStatefulWidget {
  final String roomId;
  const _MembersSheet({required this.roomId});

  @override
  ConsumerState<_MembersSheet> createState() => _MembersSheetState();
}

class _MembersSheetState extends ConsumerState<_MembersSheet> {
  final _scrollController = ScrollController();
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      ref.read(roomMembersProvider(widget.roomId).notifier).loadMore();
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final membersAsync = ref.watch(roomMembersProvider(widget.roomId));

    return Container(
      height: MediaQuery.of(context).size.height * 0.75,
      decoration: BoxDecoration(
        color: isDark ? AppColors.surface : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          // Handle
          Container(
            width: 36,
            height: 4,
            margin: const EdgeInsets.only(top: 12, bottom: 16),
            decoration: BoxDecoration(
              color: isDark ? AppColors.border : const Color(0xFFD4D4D4),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          // Title
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              children: [
                Text(
                  'Members',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.close_rounded, size: 22),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
          // Search bar
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 12),
            child: TextField(
              controller: _searchController,
              onChanged: (v) {
                ref
                    .read(roomMembersProvider(widget.roomId).notifier)
                    .search(v);
              },
              decoration: InputDecoration(
                hintText: 'Search members...',
                prefixIcon: const Icon(Icons.search_rounded, size: 20),
                filled: true,
                fillColor: isDark ? AppColors.elevated : const Color(0xFFF5F5F5),
                contentPadding: const EdgeInsets.symmetric(vertical: 10),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
              style: const TextStyle(fontSize: 14),
            ),
          ),
          // Members list
          Expanded(
            child: membersAsync.when(
              loading: () =>
                  const SkeletonList(itemCount: 10, itemHeight: 52),
              error: (e, _) => Center(
                child: Text('Failed to load members',
                    style: TextStyle(
                        color:
                            theme.colorScheme.onSurface.withOpacity(0.5))),
              ),
              data: (members) {
                if (members.isEmpty) {
                  return Center(
                    child: Text(
                      _searchController.text.isNotEmpty
                          ? 'No members match "${_searchController.text}"'
                          : 'No members',
                      style: TextStyle(
                        color: theme.colorScheme.onSurface.withOpacity(0.5),
                      ),
                    ),
                  );
                }

                // Build items with alphabetical section headers
                final items = _buildAlphabeticalList(members);

                return ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.only(bottom: 20),
                  itemCount: items.length,
                  itemBuilder: (_, i) {
                    final item = items[i];
                    if (item is String) {
                      // Section header
                      return _SectionHeader(letter: item, isDark: isDark);
                    }
                    final m = item as RoomMember;
                    return _MemberTile(
                      member: m,
                      isDark: isDark,
                      onTap: () => showUserProfileSheet(
                        context,
                        ChatUserProfile(
                          userId: m.id,
                          name: m.name,
                          image: m.profileImage,
                          designation: m.designation,
                          votingState: m.votingState,
                          votingLga: m.votingLga,
                          votingWard: m.votingWard,
                          votingPu: m.votingPu,
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  /// Sort members alphabetically and interleave section headers.
  List<Object> _buildAlphabeticalList(List<RoomMember> members) {
    // Re-sort purely alphabetical (backend sorts by role first)
    final sorted = [...members];
    sorted.sort((a, b) {
      final aName = (a.name ?? '').trim().toLowerCase();
      final bName = (b.name ?? '').trim().toLowerCase();
      // Push empty names to the end
      if (aName.isEmpty && bName.isEmpty) return 0;
      if (aName.isEmpty) return 1;
      if (bName.isEmpty) return -1;
      return aName.compareTo(bName);
    });

    final items = <Object>[];
    String? currentLetter;

    for (final m in sorted) {
      final name = (m.name ?? '').trim();
      final letter =
          name.isNotEmpty ? name[0].toUpperCase() : '#';

      if (letter != currentLetter) {
        currentLetter = letter;
        items.add(letter);
      }
      items.add(m);
    }
    return items;
  }
}

class _SectionHeader extends StatelessWidget {
  final String letter;
  final bool isDark;
  const _SectionHeader({required this.letter, required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 6),
      child: Text(
        letter,
        style: TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.5,
          color: isDark ? AppColors.textMuted : AppColors.lightTextSecondary,
        ),
      ),
    );
  }
}

class _MemberTile extends StatelessWidget {
  final RoomMember member;
  final bool isDark;
  final VoidCallback onTap;

  const _MemberTile({
    required this.member,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        child: Row(
          children: [
            // Avatar
            CircleAvatar(
              radius: 20,
              backgroundColor:
                  isDark ? AppColors.elevated : const Color(0xFFF0F0F0),
              backgroundImage: member.profileImage != null
                  ? CachedNetworkImageProvider(member.profileImage!)
                  : null,
              child: member.profileImage == null
                  ? Text(
                      (member.name != null && member.name!.isNotEmpty)
                          ? member.name![0].toUpperCase()
                          : '?',
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 14,
                        color: isDark
                            ? AppColors.textSecondary
                            : AppColors.lightTextSecondary,
                      ),
                    )
                  : null,
            ),
            const SizedBox(width: 12),
            // Name + designation
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    member.name ?? 'Unknown',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  if (member.designation != null)
                    Text(
                      member.designation!,
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark
                            ? AppColors.textMuted
                            : AppColors.lightTextSecondary,
                      ),
                    ),
                ],
              ),
            ),
            // Role badge — hidden for privacy
            // Online indicator
            if (member.online) ...[
              const SizedBox(width: 8),
              Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: AppColors.success,
                  shape: BoxShape.circle,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
