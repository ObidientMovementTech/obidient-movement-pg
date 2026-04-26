import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:timeago/timeago.dart' as timeago;
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../shared/widgets/skeleton_loader.dart';
import '../providers/chat_providers.dart';
import '../widgets/user_profile_sheet.dart';
import '../../data/models/conversation.dart';
import '../../data/models/room.dart';

class ChatScreen extends ConsumerWidget {
  const ChatScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        body: SafeArea(
          child: Column(
            children: [
              // ── Header ──────────────────────────────────────
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                child: Row(
                  children: [
                    Text(
                      'Chat',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -0.5,
                        color: theme.colorScheme.onSurface,
                      ),
                    ),
                    const Spacer(),
                    _NewChatButton(),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              // ── Tab Bar ─────────────────────────────────────
              TabBar(
                labelColor: theme.colorScheme.onSurface,
                unselectedLabelColor:
                    theme.colorScheme.onSurface.withOpacity(0.4),
                indicatorColor: AppColors.primary,
                indicatorWeight: 2,
                indicatorSize: TabBarIndicatorSize.label,
                dividerHeight: 0,
                labelStyle: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.2,
                ),
                unselectedLabelStyle: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                ),
                tabs: [
                  _BadgedTab(label: 'Messages', countProvider: dmUnreadCountProvider),
                  _BadgedTab(label: 'Groups', countProvider: roomUnreadCountProvider),
                ],
              ),
              // ── Tab Views ───────────────────────────────────
              Expanded(
                child: TabBarView(
                  children: [
                    _ConversationsList(),
                    _RoomsList(),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// BADGED TAB (unread count on each tab)
// ═══════════════════════════════════════════════════════════════════

class _BadgedTab extends ConsumerWidget {
  final String label;
  final ProviderListenable<int> countProvider;
  const _BadgedTab({required this.label, required this.countProvider});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(countProvider);
    return Tab(
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(label),
          if (count > 0) ...[
            const SizedBox(width: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
              decoration: BoxDecoration(
                color: Colors.red,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                count > 99 ? '99+' : '$count',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// NEW CHAT BUTTON
// ═══════════════════════════════════════════════════════════════════

class _NewChatButton extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return IconButton(
      icon: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: AppColors.primary.withOpacity(0.1),
          borderRadius: BorderRadius.circular(10),
        ),
        child: const Icon(
          Icons.edit_outlined,
          size: 18,
          color: AppColors.primary,
        ),
      ),
      onPressed: () {
        HapticFeedback.lightImpact();
        _showContactsPicker(context, ref);
      },
    );
  }

  void _showContactsPicker(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const _ContactsSheet(),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// CONVERSATIONS LIST
// ═══════════════════════════════════════════════════════════════════

class _ConversationsList extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncConvos = ref.watch(conversationsProvider);

    return asyncConvos.when(
      loading: () => const SkeletonList(itemCount: 8, itemHeight: 72),
      error: (e, _) => _ErrorState(
        message: 'Could not load messages',
        onRetry: () => ref.invalidate(conversationsProvider),
      ),
      data: (conversations) {
        if (conversations.isEmpty) {
          return const _EmptyState(
            icon: Icons.chat_bubble_outline_rounded,
            title: 'No conversations yet',
            subtitle: 'Tap the compose button to start a chat',
          );
        }
        return RefreshIndicator(
          color: Colors.white,
          backgroundColor: AppColors.primary,
          onRefresh: () async {
            HapticFeedback.mediumImpact();
            await ref.read(conversationsProvider.notifier).refresh();
          },
          child: ListView.builder(
            padding: const EdgeInsets.only(top: 4, bottom: 80),
            itemCount: conversations.length,
            itemBuilder: (_, i) =>
                _ConversationTile(conversation: conversations[i]),
          ),
        );
      },
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// CONVERSATION TILE
// ═══════════════════════════════════════════════════════════════════

class _ConversationTile extends StatelessWidget {
  final Conversation conversation;
  const _ConversationTile({required this.conversation});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final hasUnread = conversation.unreadCount > 0;

    final timeStr = conversation.lastMessageAt != null
        ? timeago.format(DateTime.parse(conversation.lastMessageAt!))
        : '';

    return InkWell(
      onTap: () {
        HapticFeedback.lightImpact();
        context.push('/chat/${conversation.id}');
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        child: Row(
          children: [
            // Avatar
            CircleAvatar(
              radius: 24,
              backgroundColor: isDark ? AppColors.elevated : const Color(0xFFF0F0F0),
              backgroundImage: conversation.participantImage != null
                  ? CachedNetworkImageProvider(conversation.participantImage!)
                  : null,
              child: conversation.participantImage == null
                  ? Text(
                      _initials(conversation.participantName),
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: isDark
                            ? AppColors.textSecondary
                            : AppColors.lightTextSecondary,
                      ),
                    )
                  : null,
            ),
            const SizedBox(width: 14),
            // Name + preview
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Flexible(
                        child: Text(
                          conversation.participantName ?? 'Unknown',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight:
                                hasUnread ? FontWeight.w700 : FontWeight.w500,
                            color: theme.colorScheme.onSurface,
                          ),
                        ),
                      ),
                      if (conversation.participantDesignation != null) ...[
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 6, vertical: 1.5),
                          decoration: BoxDecoration(
                            color: theme.colorScheme.onSurface.withOpacity(0.06),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            conversation.participantDesignation!,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              color: theme.colorScheme.onSurface.withOpacity(0.45),
                            ),
                          ),
                        ),
                      ],
                      if (timeStr.isNotEmpty) ...[
                        const SizedBox(width: 8),
                        Text(
                          timeStr,
                          style: TextStyle(
                            fontSize: 11.5,
                            color: hasUnread
                                ? AppColors.primary
                                : (isDark
                                    ? AppColors.textMuted
                                    : AppColors.lightTextSecondary),
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 3),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          conversation.lastMessagePreview ?? 'No messages yet',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: hasUnread
                                ? FontWeight.w500
                                : FontWeight.w400,
                            color: hasUnread
                                ? theme.colorScheme.onSurface.withOpacity(0.8)
                                : (isDark
                                    ? AppColors.textMuted
                                    : AppColors.lightTextSecondary),
                          ),
                        ),
                      ),
                      if (hasUnread) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 7, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            conversation.unreadCount > 99
                                ? '99+'
                                : '${conversation.unreadCount}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _initials(String? name) {
    if (name == null || name.isEmpty) return '?';
    final parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }
}

// ═══════════════════════════════════════════════════════════════════
// ROOMS LIST
// ═══════════════════════════════════════════════════════════════════

class _RoomsList extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncRooms = ref.watch(roomsProvider);

    return asyncRooms.when(
      loading: () => const SkeletonList(itemCount: 6, itemHeight: 72),
      error: (e, _) => _ErrorState(
        message: 'Could not load rooms',
        onRetry: () => ref.invalidate(roomsProvider),
      ),
      data: (rooms) {
        if (rooms.isEmpty) {
          return const _EmptyState(
            icon: Icons.groups_outlined,
            title: 'No community rooms',
            subtitle: 'Rooms are auto-assigned based on your location',
          );
        }
        return RefreshIndicator(
          color: Colors.white,
          backgroundColor: AppColors.primary,
          onRefresh: () async {
            HapticFeedback.mediumImpact();
            await ref.read(roomsProvider.notifier).refresh();
          },
          child: ListView.builder(
            padding: const EdgeInsets.only(top: 4, bottom: 80),
            itemCount: rooms.length,
            itemBuilder: (_, i) => _RoomTile(room: rooms[i]),
          ),
        );
      },
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// ROOM TILE
// ═══════════════════════════════════════════════════════════════════

class _RoomTile extends StatelessWidget {
  final Room room;
  const _RoomTile({required this.room});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final hasUnread = room.unreadCount > 0;

    final timeStr = room.lastMessageAt != null
        ? timeago.format(DateTime.parse(room.lastMessageAt!))
        : '';

    return InkWell(
      onTap: () {
        HapticFeedback.lightImpact();
        context.push('/chat/room/${room.id}');
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        child: Row(
          children: [
            // Room icon
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(isDark ? 0.15 : 0.08),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Center(
                child: Text(
                  room.icon ?? '💬',
                  style: const TextStyle(fontSize: 22),
                ),
              ),
            ),
            const SizedBox(width: 14),
            // Title + preview
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          room.title ?? 'Community Room',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight:
                                hasUnread ? FontWeight.w700 : FontWeight.w500,
                            color: theme.colorScheme.onSurface,
                          ),
                        ),
                      ),
                      if (timeStr.isNotEmpty) ...[
                        const SizedBox(width: 8),
                        Text(
                          timeStr,
                          style: TextStyle(
                            fontSize: 11.5,
                            color: hasUnread
                                ? AppColors.primary
                                : (isDark
                                    ? AppColors.textMuted
                                    : AppColors.lightTextSecondary),
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 3),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          room.lastMessagePreview ?? 'No messages yet',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: hasUnread
                                ? FontWeight.w500
                                : FontWeight.w400,
                            color: hasUnread
                                ? theme.colorScheme.onSurface.withOpacity(0.8)
                                : (isDark
                                    ? AppColors.textMuted
                                    : AppColors.lightTextSecondary),
                          ),
                        ),
                      ),
                      if (hasUnread) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 7, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            room.unreadCount > 99
                                ? '99+'
                                : '${room.unreadCount}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                  // Member count
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      Icon(
                        Icons.people_outline_rounded,
                        size: 13,
                        color: isDark
                            ? AppColors.textMuted
                            : AppColors.lightTextSecondary,
                      ),
                      const SizedBox(width: 4),
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
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// CONTACTS BOTTOM SHEET
// ═══════════════════════════════════════════════════════════════════

class _ContactsSheet extends ConsumerStatefulWidget {
  const _ContactsSheet();

  @override
  ConsumerState<_ContactsSheet> createState() => _ContactsSheetState();
}

class _ContactsSheetState extends ConsumerState<_ContactsSheet> {
  String _search = '';

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final contactsAsync = ref.watch(chatContactsProvider);

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
                  'New Chat',
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
          // Search
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 12),
            child: TextField(
              onChanged: (v) => setState(() => _search = v.toLowerCase()),
              decoration: InputDecoration(
                hintText: 'Search contacts...',
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
          // Contacts list
          Expanded(
            child: contactsAsync.when(
              loading: () => const SkeletonList(itemCount: 8, itemHeight: 56),
              error: (e, _) => Center(
                child: Text(
                  'Failed to load contacts',
                  style: TextStyle(color: theme.colorScheme.onSurface.withOpacity(0.5)),
                ),
              ),
              data: (contacts) {
                final all = [
                  ...contacts.coordinators,
                  ...contacts.subordinates,
                ];
                final filtered = _search.isEmpty
                    ? all
                    : all.where((c) =>
                        (c.name.toLowerCase()).contains(_search) ||
                        (c.designation?.toLowerCase() ?? '').contains(_search),
                      ).toList();

                if (filtered.isEmpty) {
                  return Center(
                    child: Text(
                      _search.isEmpty
                          ? 'No contacts available'
                          : 'No contacts match "$_search"',
                      style: TextStyle(
                        color: theme.colorScheme.onSurface.withOpacity(0.5),
                      ),
                    ),
                  );
                }

                return ListView.builder(
                  padding: const EdgeInsets.only(bottom: 20),
                  itemCount: filtered.length,
                  itemBuilder: (_, i) {
                    final contact = filtered[i];
                    return ListTile(
                      leading: CircleAvatar(
                        radius: 20,
                        backgroundColor: isDark
                            ? AppColors.elevated
                            : const Color(0xFFF0F0F0),
                        backgroundImage: contact.profileImage != null
                            ? CachedNetworkImageProvider(
                                contact.profileImage!)
                            : null,
                        child: contact.profileImage == null
                            ? Text(
                                contact.name.isNotEmpty
                                    ? contact.name[0].toUpperCase()
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
                      title: Text(
                        contact.name,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      subtitle: contact.designation != null
                          ? Text(
                              contact.designation!,
                              style: TextStyle(
                                fontSize: 12,
                                color: isDark
                                    ? AppColors.textMuted
                                    : AppColors.lightTextSecondary,
                              ),
                            )
                          : null,
                      onTap: () {
                        HapticFeedback.lightImpact();
                        Navigator.pop(context);
                        // Check for existing conversation locally
                        final convos = ref.read(conversationsProvider).valueOrNull ?? [];
                        final existing = convos.where((c) => c.participantId == contact.id).firstOrNull;
                        if (existing != null) {
                          context.push('/chat/${existing.id}');
                        } else {
                          context.push(
                            '/chat/new/${contact.id}',
                            extra: ChatUserProfile(
                              userId: contact.id,
                              name: contact.name,
                              image: contact.profileImage,
                              designation: contact.designation,
                            ),
                          );
                        }
                      },
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
}

// ═══════════════════════════════════════════════════════════════════
// SHARED WIDGETS
// ═══════════════════════════════════════════════════════════════════

class _EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;

  const _EmptyState({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isDark
                    ? AppColors.elevated
                    : const Color(0xFFF5F5F5),
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                size: 40,
                color: isDark ? AppColors.textMuted : AppColors.lightTextSecondary,
              ),
            ),
            const SizedBox(height: 20),
            Text(
              title,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: theme.colorScheme.onSurface,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                color: isDark ? AppColors.textMuted : AppColors.lightTextSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const _ErrorState({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline_rounded, size: 40, color: AppColors.error),
            const SizedBox(height: 16),
            Text(
              message,
              style: TextStyle(
                fontSize: 14,
                color: theme.colorScheme.onSurface.withOpacity(0.7),
              ),
            ),
            const SizedBox(height: 12),
            TextButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh_rounded, size: 18),
              label: const Text('Retry'),
              style: TextButton.styleFrom(foregroundColor: AppColors.primary),
            ),
          ],
        ),
      ),
    );
  }
}
