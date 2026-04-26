import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:intl/intl.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/services/socket_service.dart';
import '../../../../shared/widgets/skeleton_loader.dart';
import '../../../auth/presentation/providers/auth_providers.dart';
import '../providers/block_providers.dart';
import '../providers/chat_providers.dart';
import '../../data/models/chat_message.dart';
import '../../data/models/message_reaction.dart';
import '../widgets/user_profile_sheet.dart';
import '../widgets/message_actions_sheet.dart';
import '../widgets/reaction_display.dart';
import '../widgets/reply_preview_bar.dart';
import '../widgets/inline_reply_preview.dart';

class ChatDetailScreen extends ConsumerStatefulWidget {
  final String? conversationId;
  final String? participantId;
  final ChatUserProfile? participantInfo;

  const ChatDetailScreen({
    super.key,
    this.conversationId,
    this.participantId,
    this.participantInfo,
  });

  @override
  ConsumerState<ChatDetailScreen> createState() => _ChatDetailScreenState();
}

class _ChatDetailScreenState extends ConsumerState<ChatDetailScreen> {
  final _controller = TextEditingController();
  final _scrollController = ScrollController();
  final _focusNode = FocusNode();
  bool _sending = false;
  String? _conversationId;
  StreamSubscription<Map<String, dynamic>>? _msgSub;
  StreamSubscription<Map<String, dynamic>>? _reactionSub;
  StreamSubscription<Map<String, dynamic>>? _deleteSub;
  ConversationsNotifier? _convoNotifier;

  // Reply state
  ChatMessage? _replyingTo;

  bool get _isNewChat => _conversationId == null;

  @override
  void initState() {
    super.initState();
    _conversationId = widget.conversationId;
    _scrollController.addListener(_onScroll);

    if (_conversationId != null) {
      _setupExistingChat();
    }
  }

  void _setupExistingChat() {
    final socket = ref.read(socketServiceProvider);
    _convoNotifier = ref.read(conversationsProvider.notifier);
    socket.joinConversation(_conversationId!);
    socket.markRead(_conversationId!);
    // Tell the conversations notifier we're viewing this one
    _convoNotifier!.activeConversationId = _conversationId;
    // Clear local unread badge after build completes
    Future(() {
      _convoNotifier!.updateConversation(_conversationId!, unreadCount: 0);
    });

    // Listen for incoming messages
    _msgSub = socket.onNewMessage.listen((data) {
      final convId = data['conversation_id']?.toString();
      if (convId != _conversationId) return;
      try {
        final msg = ChatMessage.fromJson(data);
        ref
            .read(chatMessagesProvider(_conversationId!).notifier)
            .addMessage(msg);
        _scrollToBottom();
        // Mark as read immediately since we're viewing
        socket.markRead(_conversationId!);
      } catch (_) {}
    });

    // Listen for reaction updates
    _reactionSub = socket.onReactionUpdated.listen((data) {
      final convId = data['conversationId']?.toString();
      if (convId != _conversationId) return;
      final msgId = data['messageId']?.toString();
      if (msgId == null) return;
      try {
        final list = data['reactions'] as List<dynamic>? ?? [];
        final reactions = list
            .map((e) =>
                MessageReaction.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList();
        ref
            .read(chatMessagesProvider(_conversationId!).notifier)
            .updateReactions(msgId, reactions);
      } catch (_) {}
    });

    // Listen for message deletions (for everyone)
    _deleteSub = socket.onMessageDeleted.listen((data) {
      final convId = data['conversationId']?.toString();
      if (convId != _conversationId) return;
      final msgId = data['messageId']?.toString();
      if (msgId != null) {
        ref
            .read(chatMessagesProvider(_conversationId!).notifier)
            .markDeleted(msgId);
      }
    });
  }

  @override
  void dispose() {
    _msgSub?.cancel();
    _reactionSub?.cancel();
    _deleteSub?.cancel();
    if (_conversationId != null) {
      SocketService.instance.leaveConversation(_conversationId!);
      // Clear active conversation so unread counts increment normally again
      _convoNotifier?.activeConversationId = null;
    }
    _controller.dispose();
    _scrollController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_isNewChat) return;
    if (_scrollController.position.pixels <=
        _scrollController.position.minScrollExtent + 100) {
      ref
          .read(chatMessagesProvider(_conversationId!).notifier)
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
      // Lazy create: if new chat, create conversation first
      if (_isNewChat) {
        final ds = ref.read(chatDataSourceProvider);
        final result = await ds.getOrCreateConversation(widget.participantId!);
        final newId = result.conversationId;

        // Send the message
        await ref
            .read(chatMessagesProvider(newId).notifier)
            .sendMessage(text, replyToId: replyToId);

        // Refresh conversations list so it shows in DM tab
        ref.read(conversationsProvider.notifier).refresh();

        // Replace this screen with the real conversation screen
        if (mounted) {
          context.pushReplacement('/chat/$newId');
        }
        return;
      }

      await ref
          .read(chatMessagesProvider(_conversationId!).notifier)
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
    final currentUser = ref.watch(currentUserProvider);

    // For existing chats, find conversation in provider
    final conversations = _isNewChat
        ? <dynamic>[]
        : (ref.watch(conversationsProvider).valueOrNull ?? []);
    final conversation = _isNewChat
        ? null
        : conversations
            .where((c) => c.id == _conversationId)
            .firstOrNull;

    // Resolve participant display info from conversation OR passed props
    final pInfo = widget.participantInfo;
    final participantId = conversation?.participantId ?? pInfo?.userId;
    final participantName = conversation?.participantName ?? pInfo?.name;
    final participantImage = conversation?.participantImage ?? pInfo?.image;
    final participantDesignation = conversation?.participantDesignation ?? pInfo?.designation;

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 0,
        title: GestureDetector(
          onTap: () {
            if (participantId != null) {
              showUserProfileSheet(
                context,
                ChatUserProfile(
                  userId: participantId,
                  name: participantName,
                  image: participantImage,
                  designation: participantDesignation,
                  votingState: conversation?.participantVotingState ?? pInfo?.votingState,
                  votingLga: conversation?.participantVotingLga ?? pInfo?.votingLga,
                  votingWard: conversation?.participantVotingWard ?? pInfo?.votingWard,
                  votingPu: conversation?.participantVotingPu ?? pInfo?.votingPu,
                ),
              );
            }
          },
          behavior: HitTestBehavior.opaque,
          child: Row(
            children: [
              CircleAvatar(
              radius: 18,
              backgroundColor:
                  isDark ? AppColors.elevated : const Color(0xFFF0F0F0),
              backgroundImage: participantImage != null
                  ? CachedNetworkImageProvider(participantImage)
                  : null,
              child: participantImage == null
                  ? Text(
                      _initials(participantName),
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: isDark
                            ? AppColors.textSecondary
                            : AppColors.lightTextSecondary,
                      ),
                    )
                  : null,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    participantName ?? 'Chat',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (participantDesignation != null)
                    Text(
                      participantDesignation,
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
        ),
        actions: [
          if (participantId != null)
            PopupMenuButton<String>(
              icon: Icon(
                Icons.more_vert,
                color: isDark ? AppColors.textSecondary : AppColors.lightTextSecondary,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              onSelected: (value) async {
                if (value == 'block' || value == 'unblock') {
                  if (participantId == null) return;
                  final isBlocked = ref.read(blockedIdsProvider).contains(participantId);
                  if (!isBlocked) {
                    final confirmed = await showDialog<bool>(
                      context: context,
                      builder: (ctx) {
                        final t = Theme.of(ctx);
                        return AlertDialog(
                          backgroundColor: t.colorScheme.surface,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          title: Text(
                            'Block ${participantName ?? 'this user'}?',
                            style: const TextStyle(
                              fontSize: 17,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          content: Text(
                            'They won\'t be able to send you direct messages. '
                            'You can unblock them anytime.',
                            style: TextStyle(
                              fontSize: 13,
                              color: t.colorScheme.onSurface.withOpacity(0.5),
                            ),
                          ),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.pop(ctx, false),
                              child: Text(
                                'Cancel',
                                style: TextStyle(
                                  color: t.colorScheme.onSurface.withOpacity(0.5),
                                ),
                              ),
                            ),
                            FilledButton(
                              style: FilledButton.styleFrom(
                                backgroundColor: const Color(0xFFFF3B30),
                              ),
                              onPressed: () => Navigator.pop(ctx, true),
                              child: const Text('Block'),
                            ),
                          ],
                        );
                      },
                    );
                    if (confirmed != true) return;
                    await ref.read(blockedUsersProvider.notifier).blockUser(participantId);
                  } else {
                    await ref.read(blockedUsersProvider.notifier).unblockUser(participantId);
                  }
                }
              },
              itemBuilder: (_) {
                final isBlocked = participantId != null &&
                    ref.read(blockedIdsProvider).contains(participantId);
                return [
                  PopupMenuItem(
                    value: isBlocked ? 'unblock' : 'block',
                    child: Row(
                      children: [
                        Icon(
                          isBlocked ? Icons.lock_open_rounded : Icons.block_rounded,
                          size: 18,
                          color: isBlocked ? null : const Color(0xFFFF3B30),
                        ),
                        const SizedBox(width: 10),
                        Text(
                          isBlocked ? 'Unblock' : 'Block User',
                          style: TextStyle(
                            color: isBlocked ? null : const Color(0xFFFF3B30),
                          ),
                        ),
                      ],
                    ),
                  ),
                ];
              },
            ),
        ],
      ),
      body: Column(
        children: [
          // Blocked banner
          if (ref.watch(blockedIdsProvider).contains(participantId))
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              color: isDark
                  ? const Color(0xFF3A1A1A)
                  : const Color(0xFFFFF3F3),
              child: Row(
                children: [
                  Icon(
                    Icons.block_rounded,
                    size: 16,
                    color: const Color(0xFFFF3B30).withOpacity(0.7),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'You blocked this user. They can\'t send you messages.',
                      style: TextStyle(
                        fontSize: 12,
                        color: const Color(0xFFFF3B30).withOpacity(0.8),
                      ),
                    ),
                  ),
                  GestureDetector(
                    onTap: () {
                      if (participantId != null) {
                        ref
                            .read(blockedUsersProvider.notifier)
                            .unblockUser(participantId);
                      }
                    },
                    child: const Text(
                      'Unblock',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          // Messages
          Expanded(
            child: _isNewChat
                ? Center(
                    child: Text(
                      'Say hello! 👋',
                      style: TextStyle(
                        fontSize: 15,
                        color: isDark
                            ? AppColors.textMuted
                            : AppColors.lightTextSecondary,
                      ),
                    ),
                  )
                : _buildMessagesList(theme, isDark, currentUser),
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
          _MessageInput(
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

  void _setReply(ChatMessage msg) {
    setState(() => _replyingTo = msg);
    _focusNode.requestFocus();
  }

  void _onLongPress(ChatMessage msg, bool isMe, bool isDark) {
    if (_isNewChat || _conversationId == null) return;
    final notifier =
        ref.read(chatMessagesProvider(_conversationId!).notifier);
    showMessageActionsSheet(
      context,
      isMe: isMe,
      isDark: isDark,
      messageContent: msg.content,
      isDeleted: msg.deletedAt != null,
      onReact: (emoji) => notifier.toggleReaction(msg.id, emoji),
      onReply: () => _setReply(msg),
      onDelete: ({required bool forEveryone}) =>
          notifier.deleteMessage(msg.id, forEveryone: forEveryone),
    );
  }

  Widget _buildMessagesList(ThemeData theme, bool isDark, dynamic currentUser) {
    final messagesAsync = ref.watch(chatMessagesProvider(_conversationId!));
    return messagesAsync.when(
      loading: () => const SkeletonList(itemCount: 10, itemHeight: 48),
      error: (e, _) => Center(
        child: Text('Failed to load messages',
            style: TextStyle(
                color: theme.colorScheme.onSurface.withOpacity(0.5))),
      ),
      data: (messages) {
        if (messages.isEmpty) {
          return Center(
            child: Text(
              'Say hello! 👋',
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
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          itemCount: messages.length,
          itemBuilder: (_, i) {
            final msg = messages[i];
            final isMe = msg.senderId == currentUser?.id;
            final showDate = i == 0 ||
                _differentDay(messages[i - 1].createdAt, msg.createdAt);
            final isDeleted = msg.deletedAt != null;
            final hasReactions = msg.reactions.isNotEmpty;
            return Column(
              children: [
                if (showDate) _DateSeparator(date: msg.createdAt),
                // Stack for bubble + overlapping reactions
                Padding(
                  padding: EdgeInsets.only(bottom: hasReactions ? 10 : 0),
                  child: Stack(
                    clipBehavior: Clip.none,
                    children: [
                      // Swipe-to-reply
                      GestureDetector(
                        onLongPress:
                            () => _onLongPress(msg, isMe, isDark),
                        onHorizontalDragEnd: isDeleted
                            ? null
                            : (details) {
                                final v = details.primaryVelocity ?? 0;
                                if ((!isMe && v > 300) || (isMe && v < -300)) {
                                  HapticFeedback.lightImpact();
                                  _setReply(msg);
                                }
                              },
                        child: _MessageBubble(
                          message: msg,
                          isMe: isMe,
                          isDark: isDark,
                        ),
                      ),
                      // Reactions overlay
                      if (hasReactions)
                        Positioned(
                          bottom: -10,
                          left: isMe ? null : 16,
                          right: isMe ? 16 : null,
                          child: ReactionDisplay(
                            reactions: msg.reactions,
                            isDark: isDark,
                            onTap: (emoji) {
                              if (_conversationId != null) {
                                ref
                                    .read(chatMessagesProvider(
                                            _conversationId!)
                                        .notifier)
                                    .toggleReaction(msg.id, emoji);
                              }
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
    );
  }

  bool _differentDay(String a, String b) {
    final da = DateTime.tryParse(a);
    final db = DateTime.tryParse(b);
    if (da == null || db == null) return false;
    return da.year != db.year || da.month != db.month || da.day != db.day;
  }

  String _initials(String? name) {
    if (name == null || name.isEmpty) return '?';
    final parts = name.trim().split(' ');
    if (parts.length >= 2) return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    return parts[0][0].toUpperCase();
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
// MESSAGE BUBBLE — WhatsApp-style
// ═══════════════════════════════════════════════════════════════════

class _MessageBubble extends StatelessWidget {
  final ChatMessage message;
  final bool isMe;
  final bool isDark;

  const _MessageBubble({
    required this.message,
    required this.isMe,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final time = _formatTime(message.createdAt);
    final isDeleted = message.deletedAt != null;

    // WhatsApp green for own messages
    final bgColor = isDeleted
        ? (isDark ? AppColors.elevated.withOpacity(0.5) : const Color(0xFFF5F5F5))
        : isMe
            ? (isDark ? const Color(0xFF054D25) : const Color(0xFFDCF8C6))
            : (isDark ? AppColors.elevated : const Color(0xFFFFFFFF));

    final textColor = isDeleted
        ? (isDark ? AppColors.textMuted : AppColors.lightTextSecondary)
        : isMe
            ? (isDark ? Colors.white : const Color(0xFF111111))
            : (isDark ? AppColors.textPrimary : AppColors.lightTextPrimary);

    final timeColor = isMe
        ? (isDark ? Colors.white70 : const Color(0xFF5A7E4E))
        : (isDark ? AppColors.textMuted : AppColors.lightTextSecondary);

    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.78,
        ),
        margin: EdgeInsets.only(
          top: 2,
          bottom: 2,
          left: isMe ? 48 : 0,
          right: isMe ? 0 : 48,
        ),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: bgColor,
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
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Inline reply preview
            if (message.replyToId != null && !isDeleted)
              InlineReplyPreview(
                senderName: message.replyToSenderName ?? 'Unknown',
                content: message.replyToContent ?? '',
                isMe: isMe,
                isDark: isDark,
              ),
            // Content + time (Wrap shrink-wraps the bubble)
            Wrap(
              alignment: WrapAlignment.end,
              spacing: 6,
              children: [
                Text(
                  message.content,
                  style: TextStyle(
                    fontSize: 14.5,
                    height: 1.35,
                    color: textColor,
                    fontStyle: isDeleted ? FontStyle.italic : null,
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
          ],
        ),
      ),
    );
  }

  String _formatTime(String iso) {
    final dt = DateTime.tryParse(iso)?.toLocal();
    if (dt == null) return '';
    return DateFormat.jm().format(dt);
  }
}

// ═══════════════════════════════════════════════════════════════════
// MESSAGE INPUT BAR
// ═══════════════════════════════════════════════════════════════════

class _MessageInput extends StatelessWidget {
  final TextEditingController controller;
  final FocusNode focusNode;
  final bool sending;
  final VoidCallback onSend;
  final bool isDark;

  const _MessageInput({
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
