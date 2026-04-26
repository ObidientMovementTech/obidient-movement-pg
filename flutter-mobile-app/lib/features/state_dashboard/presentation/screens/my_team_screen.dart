import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/coordinator_models.dart';
import '../providers/dashboard_providers.dart';

class MyTeamScreen extends ConsumerWidget {
  const MyTeamScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final subsAsync = ref.watch(subordinatesProvider);

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // ── Header ────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () => Navigator.of(context).pop(),
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.onSurface.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(Icons.arrow_back_rounded,
                          size: 20, color: theme.colorScheme.onSurface),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    'My Team',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.4,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // ── Content ───────────────────────────────
            Expanded(
              child: subsAsync.when(
                loading: () => const Center(
                    child:
                        CircularProgressIndicator(color: AppColors.primary)),
                error: (e, _) => Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.error_outline_rounded,
                          size: 40,
                          color: theme.colorScheme.onSurface
                              .withOpacity(0.2)),
                      const SizedBox(height: 12),
                      Text('Could not load team',
                          style: TextStyle(
                              fontSize: 14,
                              color: theme.colorScheme.onSurface
                                  .withOpacity(0.5))),
                      const SizedBox(height: 14),
                      OutlinedButton(
                        onPressed: () =>
                            ref.invalidate(subordinatesProvider),
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                ),
                data: (result) {
                  if (result.subordinates.isEmpty) {
                    return Center(
                      child: Padding(
                        padding: const EdgeInsets.all(40),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.group_off_outlined,
                                size: 48,
                                color: theme.colorScheme.onSurface
                                    .withOpacity(0.12)),
                            const SizedBox(height: 14),
                            Text('No team members yet',
                                style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w600,
                                    color: theme.colorScheme.onSurface)),
                            const SizedBox(height: 6),
                            Text(
                                'Assign leaders to see them here.',
                                style: TextStyle(
                                    fontSize: 13,
                                    color: theme.colorScheme.onSurface
                                        .withOpacity(0.4))),
                          ],
                        ),
                      ),
                    );
                  }

                  return RefreshIndicator(
                    color: AppColors.primary,
                    onRefresh: () async {
                      HapticFeedback.mediumImpact();
                      ref.invalidate(subordinatesProvider);
                    },
                    child: ListView.builder(
                      padding:
                          const EdgeInsets.fromLTRB(16, 4, 16, 40),
                      itemCount: result.subordinates.length,
                      itemBuilder: (_, i) => _TeamMemberCard(
                        user: result.subordinates[i],
                        theme: theme,
                        onRemove: () => _confirmRemove(
                            context, ref, result.subordinates[i]),
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _confirmRemove(
      BuildContext context, WidgetRef ref, SearchedUser user) {
    HapticFeedback.lightImpact();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Remove Designation'),
        content: Text(
            'Remove "${user.designation}" from ${user.name}? They will be set back to Community Member.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(ctx);
              try {
                final ds = ref.read(coordinatorDsProvider);
                await ds.removeDesignation(user.id);
                ref.invalidate(subordinatesProvider);
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                          '${user.name} has been removed as ${user.designation}'),
                      backgroundColor: AppColors.warning,
                    ),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Failed: $e'),
                      backgroundColor: AppColors.error,
                    ),
                  );
                }
              }
            },
            child: const Text('Remove',
                style: TextStyle(color: AppColors.error)),
          ),
        ],
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════

class _TeamMemberCard extends StatelessWidget {
  final SearchedUser user;
  final ThemeData theme;
  final VoidCallback onRemove;
  const _TeamMemberCard(
      {required this.user, required this.theme, required this.onRemove});

  @override
  Widget build(BuildContext context) {
    final location = [
      user.assignedState,
      user.assignedLGA,
      user.assignedWard,
    ].where((s) => s != null && s.isNotEmpty).join(' · ');

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border:
            Border.all(color: theme.colorScheme.outline.withOpacity(0.1)),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 20,
            backgroundColor:
                theme.colorScheme.onSurface.withOpacity(0.06),
            backgroundImage: user.profileImage != null
                ? NetworkImage(user.profileImage!)
                : null,
            child: user.profileImage == null
                ? Text(
                    user.name.isNotEmpty
                        ? user.name[0].toUpperCase()
                        : '?',
                    style: TextStyle(
                        fontWeight: FontWeight.w700,
                        color: theme.colorScheme.onSurface
                            .withOpacity(0.4)))
                : null,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(user.name,
                    style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: theme.colorScheme.onSurface)),
                const SizedBox(height: 2),
                if (user.designation != null)
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(user.designation!,
                        style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: AppColors.primary)),
                  ),
                if (location.isNotEmpty) ...[
                  const SizedBox(height: 3),
                  Text(location,
                      style: TextStyle(
                          fontSize: 11,
                          color: theme.colorScheme.onSurface
                              .withOpacity(0.35))),
                ],
              ],
            ),
          ),
          GestureDetector(
            onTap: onRemove,
            child: Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.error.withOpacity(0.08),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.person_remove_outlined,
                  size: 16, color: AppColors.error),
            ),
          ),
        ],
      ),
    );
  }
}
