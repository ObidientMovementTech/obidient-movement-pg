import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shimmer/shimmer.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/voting_bloc.dart';
import '../../data/models/bloc_member.dart';
import '../providers/voting_bloc_providers.dart';

class MembersTab extends ConsumerWidget {
  final VotingBloc bloc;
  const MembersTab({super.key, required this.bloc});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final membersAsync = ref.watch(blocMembersProvider(bloc.id));

    return membersAsync.when(
      loading: () => _MembersSkeleton(),
      error: (err, _) => _ErrorView(
        onRetry: () => ref.invalidate(blocMembersProvider(bloc.id)),
      ),
      data: (members) {
        if (members.isEmpty) {
          return _EmptyView();
        }
        return RefreshIndicator(
          color: AppColors.primary,
          onRefresh: () async {
            HapticFeedback.mediumImpact();
            ref.invalidate(blocMembersProvider(bloc.id));
          },
          child: CustomScrollView(
            slivers: [
              // ── Action buttons header ──────────────────────
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            'Members',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              letterSpacing: -0.2,
                              color: theme.colorScheme.onSurface,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 7, vertical: 2),
                            decoration: BoxDecoration(
                              color: theme.colorScheme.onSurface
                                  .withOpacity(0.06),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              '${members.length}',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: theme.colorScheme.onSurface
                                    .withOpacity(0.5),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      // Action row
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: [
                            _ActionChip(
                              icon: Icons.campaign_outlined,
                              label: 'Broadcast',
                              color: AppColors.info,
                              onTap: () {
                                // Phase 4: broadcast bottom sheet
                              },
                            ),
                            const SizedBox(width: 8),
                            _ActionChip(
                              icon: Icons.person_add_outlined,
                              label: 'Invite',
                              color: AppColors.primary,
                              onTap: () {
                                // Phase 4: invite bottom sheet
                              },
                            ),
                            const SizedBox(width: 8),
                            _ActionChip(
                              icon: Icons.person_outline_rounded,
                              label: 'Add Manual',
                              color: AppColors.warning,
                              onTap: () {
                                // Phase 4: add manual bottom sheet
                              },
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // ── Members list ───────────────────────────────
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 40),
                sliver: SliverList.builder(
                  itemCount: members.length,
                  itemBuilder: (context, index) {
                    final m = members[index];
                    return _MemberCard(
                      member: m,
                      blocId: bloc.id,
                      theme: theme,
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

// ── Member Card ──────────────────────────────────────────────

class _MemberCard extends StatelessWidget {
  final BlocMember member;
  final String blocId;
  final ThemeData theme;

  const _MemberCard({
    required this.member,
    required this.blocId,
    required this.theme,
  });

  @override
  Widget build(BuildContext context) {
    final isManual = member.isManualMember == true;
    final meta = member.metadata;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: theme.colorScheme.outline.withOpacity(0.1),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Name + badges
          Row(
            children: [
              // Avatar
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: isManual
                      ? AppColors.warning.withOpacity(0.1)
                      : AppColors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  isManual ? Icons.person_outline : Icons.person_rounded,
                  size: 20,
                  color: isManual ? AppColors.warning : AppColors.primary,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            member.name ?? 'Unknown',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: theme.colorScheme.onSurface,
                            ),
                          ),
                        ),
                        if (isManual) ...[
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 5, vertical: 1),
                            decoration: BoxDecoration(
                              color: AppColors.warning.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Text(
                              'Manual',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w600,
                                color: AppColors.warning,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    Text(
                      isManual
                          ? 'Offline member'
                          : member.email ?? 'No email',
                      style: TextStyle(
                        fontSize: 12,
                        color: theme.colorScheme.onSurface.withOpacity(0.4),
                      ),
                    ),
                  ],
                ),
              ),
              // Overflow menu
              GestureDetector(
                onTap: () {
                  HapticFeedback.lightImpact();
                  // Phase 4: member actions bottom sheet
                },
                child: Icon(
                  Icons.more_vert_rounded,
                  size: 20,
                  color: theme.colorScheme.onSurface.withOpacity(0.3),
                ),
              ),
            ],
          ),

          // Tags row
          if (meta != null) ...[
            const SizedBox(height: 10),
            Wrap(
              spacing: 6,
              runSpacing: 4,
              children: [
                _TagPill(
                  label: meta.decisionTag,
                  color: _decisionColor(meta.decisionTag),
                ),
                _TagPill(
                  label: meta.contactTag,
                  color: _contactColor(meta.contactTag),
                ),
                _TagPill(
                  label: meta.engagementLevel,
                  color: _engagementColor(meta.engagementLevel),
                ),
                _TagPill(
                  label: meta.pvcStatus,
                  color: _pvcColor(meta.pvcStatus),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Color _decisionColor(String tag) {
    switch (tag.toLowerCase()) {
      case 'committed':
        return AppColors.success;
      case 'voted':
        return AppColors.primary;
      case 'not-interested':
        return AppColors.error;
      default:
        return AppColors.textMuted;
    }
  }

  Color _contactColor(String tag) {
    switch (tag.toLowerCase()) {
      case 'messaged recently':
      case 'called recently':
        return AppColors.info;
      case 'not reachable':
        return AppColors.error;
      default:
        return AppColors.textMuted;
    }
  }

  Color _engagementColor(String level) {
    switch (level.toLowerCase()) {
      case 'high':
        return AppColors.success;
      case 'medium':
        return AppColors.warning;
      default:
        return AppColors.textMuted;
    }
  }

  Color _pvcColor(String status) {
    if (status.toLowerCase().contains('with pvc')) return AppColors.success;
    if (status.toLowerCase().contains('no pvc')) return AppColors.warning;
    return AppColors.textMuted;
  }
}

class _TagPill extends StatelessWidget {
  final String label;
  final Color color;
  const _TagPill({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(5),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }
}

// ── Action Chip ──────────────────────────────────────────────

class _ActionChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _ActionChip({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: color.withOpacity(0.08),
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        onTap: () {
          HapticFeedback.lightImpact();
          onTap();
        },
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 16, color: color),
              const SizedBox(width: 5),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: color,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Skeleton ─────────────────────────────────────────────────

class _MembersSkeleton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final base = theme.colorScheme.onSurface.withOpacity(0.06);
    final highlight = theme.colorScheme.onSurface.withOpacity(0.02);

    return Shimmer.fromColors(
      baseColor: base,
      highlightColor: highlight,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 40),
        physics: const NeverScrollableScrollPhysics(),
        children: [
          for (int i = 0; i < 8; i++) ...[
            Container(
              height: 72,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            const SizedBox(height: 10),
          ],
        ],
      ),
    );
  }
}

// ── Empty + Error ────────────────────────────────────────────

class _EmptyView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.people_outline_rounded,
              size: 36,
              color: theme.colorScheme.onSurface.withOpacity(0.15),
            ),
            const SizedBox(height: 14),
            Text(
              'No members yet',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: theme.colorScheme.onSurface,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Invite people to join your bloc.',
              style: TextStyle(
                fontSize: 13,
                color: theme.colorScheme.onSurface.withOpacity(0.4),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  final VoidCallback onRetry;
  const _ErrorView({required this.onRetry});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.error_outline_rounded,
            size: 36,
            color: theme.colorScheme.onSurface.withOpacity(0.2),
          ),
          const SizedBox(height: 10),
          Text(
            'Could not load members',
            style: TextStyle(
              fontSize: 14,
              color: theme.colorScheme.onSurface.withOpacity(0.5),
            ),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: onRetry,
            icon: const Icon(Icons.refresh_rounded, size: 16),
            label: const Text('Retry'),
            style: OutlinedButton.styleFrom(
              foregroundColor: theme.colorScheme.onSurface.withOpacity(0.6),
              side: BorderSide(
                color: theme.colorScheme.outline.withOpacity(0.2),
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
