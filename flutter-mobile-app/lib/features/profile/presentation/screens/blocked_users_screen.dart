import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../chat/presentation/providers/block_providers.dart';
import '../../../chat/data/datasources/block_remote_datasource.dart';

class BlockedUsersScreen extends ConsumerWidget {
  const BlockedUsersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final muted = theme.colorScheme.onSurface.withOpacity(0.4);
    final blockedAsync = ref.watch(blockedUsersProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Blocked Users',
          style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700),
        ),
        centerTitle: true,
      ),
      body: blockedAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Failed to load', style: TextStyle(color: muted)),
              const SizedBox(height: 8),
              TextButton(
                onPressed: () => ref.invalidate(blockedUsersProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
        data: (users) {
          if (users.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.block_rounded, size: 48, color: muted),
                  const SizedBox(height: 12),
                  Text(
                    'No blocked users',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: muted,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Users you block will appear here',
                    style: TextStyle(fontSize: 12, color: muted),
                  ),
                ],
              ),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.symmetric(vertical: 12),
            itemCount: users.length,
            separatorBuilder: (_, __) => Divider(
              height: 1,
              indent: 72,
              color: theme.colorScheme.outline.withOpacity(0.08),
            ),
            itemBuilder: (context, index) {
              final user = users[index];
              return _BlockedUserTile(
                user: user,
                theme: theme,
                isDark: isDark,
                onUnblock: () async {
                  HapticFeedback.lightImpact();
                  final confirmed = await showDialog<bool>(
                    context: context,
                    builder: (ctx) => AlertDialog(
                      backgroundColor: theme.colorScheme.surface,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      title: Text(
                        'Unblock ${user.name ?? 'this user'}?',
                        style: const TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      content: Text(
                        'They will be able to send you direct messages again.',
                        style: TextStyle(
                          fontSize: 13,
                          color:
                              theme.colorScheme.onSurface.withOpacity(0.5),
                        ),
                      ),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(ctx, false),
                          child: Text(
                            'Cancel',
                            style: TextStyle(
                              color: theme.colorScheme.onSurface
                                  .withOpacity(0.5),
                            ),
                          ),
                        ),
                        FilledButton(
                          style: FilledButton.styleFrom(
                            backgroundColor: AppColors.primary,
                          ),
                          onPressed: () => Navigator.pop(ctx, true),
                          child: const Text('Unblock'),
                        ),
                      ],
                    ),
                  );
                  if (confirmed == true) {
                    ref
                        .read(blockedUsersProvider.notifier)
                        .unblockUser(user.id);
                  }
                },
              );
            },
          );
        },
      ),
    );
  }
}

class _BlockedUserTile extends StatelessWidget {
  final BlockedUser user;
  final ThemeData theme;
  final bool isDark;
  final VoidCallback onUnblock;

  const _BlockedUserTile({
    required this.user,
    required this.theme,
    required this.isDark,
    required this.onUnblock,
  });

  @override
  Widget build(BuildContext context) {
    final muted = theme.colorScheme.onSurface.withOpacity(0.4);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Row(
        children: [
          CircleAvatar(
            radius: 22,
            backgroundColor:
                isDark ? AppColors.elevated : const Color(0xFFF0F0F0),
            backgroundImage: user.profileImage != null
                ? CachedNetworkImageProvider(user.profileImage!)
                : null,
            child: user.profileImage == null
                ? Text(
                    _initials(user.name),
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: muted,
                    ),
                  )
                : null,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  user.name ?? 'Unknown',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
                if (user.designation != null) ...[
                  const SizedBox(height: 2),
                  Text(
                    user.designation!,
                    style: TextStyle(fontSize: 11, color: muted),
                  ),
                ],
              ],
            ),
          ),
          TextButton(
            onPressed: onUnblock,
            style: TextButton.styleFrom(
              foregroundColor: AppColors.primary,
              padding:
                  const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
                side: BorderSide(
                  color: AppColors.primary.withOpacity(0.3),
                ),
              ),
            ),
            child: const Text(
              'Unblock',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }

  String _initials(String? name) {
    if (name == null || name.isEmpty) return '?';
    final parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts.first[0]}${parts[1][0]}'.toUpperCase();
    }
    return parts.first[0].toUpperCase();
  }
}
