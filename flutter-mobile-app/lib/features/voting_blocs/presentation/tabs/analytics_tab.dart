import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shimmer/shimmer.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/voting_bloc.dart';
import '../providers/voting_bloc_providers.dart';

class AnalyticsTab extends ConsumerWidget {
  final VotingBloc bloc;
  const AnalyticsTab({super.key, required this.bloc});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final engagementAsync = ref.watch(blocEngagementProvider(bloc.id));

    return engagementAsync.when(
      loading: () => _AnalyticsSkeleton(),
      error: (err, _) => _ErrorView(
        onRetry: () => ref.invalidate(blocEngagementProvider(bloc.id)),
      ),
      data: (engagement) {
        return RefreshIndicator(
          color: AppColors.primary,
          onRefresh: () async {
            HapticFeedback.mediumImpact();
            ref.invalidate(blocEngagementProvider(bloc.id));
          },
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 40),
            children: [
              // ── Engagement Overview ────────────────────────
              _SectionLabel('Engagement Overview', theme),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: _StatCard(
                      label: 'Total Members',
                      value: '${engagement.totalMembers}',
                      icon: Icons.people_outline_rounded,
                      color: AppColors.info,
                      theme: theme,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _StatCard(
                      label: 'Recent Members',
                      value: '${engagement.recentMembers}',
                      icon: Icons.person_add_outlined,
                      color: AppColors.success,
                      theme: theme,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _StatCard(
                      label: 'Pending Invites',
                      value: '${engagement.pendingInvitations}',
                      icon: Icons.mail_outline_rounded,
                      color: const Color(0xFF8B5CF6),
                      theme: theme,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _StatCard(
                      label: 'Conversion Rate',
                      value: '${engagement.conversionRate.toStringAsFixed(0)}%',
                      icon: Icons.trending_up_rounded,
                      color: AppColors.warning,
                      theme: theme,
                    ),
                  ),
                ],
              ),

              // ── Invitation Breakdown ───────────────────────
              const SizedBox(height: 28),
              _SectionLabel('Invitation Breakdown', theme),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: _CompactStat(
                      label: 'Accepted',
                      value: '${engagement.acceptedInvitations}',
                      color: AppColors.success,
                      theme: theme,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _CompactStat(
                      label: 'Pending',
                      value: '${engagement.pendingInvitations}',
                      color: AppColors.warning,
                      theme: theme,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _CompactStat(
                      label: 'Declined',
                      value: '${engagement.declinedInvitations}',
                      color: AppColors.error,
                      theme: theme,
                    ),
                  ),
                ],
              ),

              // ── Growth ─────────────────────────────────────
              const SizedBox(height: 28),
              _SectionLabel('Growth', theme),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: theme.colorScheme.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: theme.colorScheme.outline.withOpacity(0.1),
                  ),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: _GrowthRow(
                        label: 'Growth Rate',
                        value: engagement.growthRate,
                        theme: theme,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

// ── Widgets ──────────────────────────────────────────────────

class _SectionLabel extends StatelessWidget {
  final String text;
  final ThemeData theme;
  const _SectionLabel(this.text, this.theme);

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: TextStyle(
        fontSize: 15,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.2,
        color: theme.colorScheme.onSurface.withOpacity(0.55),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  final ThemeData theme;

  const _StatCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
    required this.theme,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
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
          Text(
            value,
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.5,
              color: theme.colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: theme.colorScheme.onSurface.withOpacity(0.45),
            ),
          ),
        ],
      ),
    );
  }
}

class _CompactStat extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  final ThemeData theme;

  const _CompactStat({
    required this.label,
    required this.value,
    required this.color,
    required this.theme,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: color.withOpacity(0.06),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withOpacity(0.12)),
      ),
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: color,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: color.withOpacity(0.8),
            ),
          ),
        ],
      ),
    );
  }
}

class _GrowthRow extends StatelessWidget {
  final String label;
  final int? value;
  final ThemeData theme;

  const _GrowthRow({
    required this.label,
    required this.value,
    required this.theme,
  });

  @override
  Widget build(BuildContext context) {
    final v = (value ?? 0).toDouble();
    final isPositive = v >= 0;

    return Row(
      children: [
        Icon(
          isPositive
              ? Icons.trending_up_rounded
              : Icons.trending_down_rounded,
          size: 20,
          color: isPositive ? AppColors.success : AppColors.error,
        ),
        const SizedBox(width: 8),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: theme.colorScheme.onSurface.withOpacity(0.45),
              ),
            ),
            Text(
              '${isPositive ? '+' : ''}${v.toStringAsFixed(1)}%',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: isPositive ? AppColors.success : AppColors.error,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

// ── Skeleton ─────────────────────────────────────────────────

class _AnalyticsSkeleton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final base = theme.colorScheme.onSurface.withOpacity(0.06);
    final highlight = theme.colorScheme.onSurface.withOpacity(0.02);

    return Shimmer.fromColors(
      baseColor: base,
      highlightColor: highlight,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 40),
        physics: const NeverScrollableScrollPhysics(),
        children: [
          Container(
              height: 14, width: 140,
              decoration: BoxDecoration(
                  color: Colors.white, borderRadius: BorderRadius.circular(4))),
          const SizedBox(height: 10),
          Row(children: [
            Expanded(
                child: Container(
                    height: 90,
                    decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12)))),
            const SizedBox(width: 12),
            Expanded(
                child: Container(
                    height: 90,
                    decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12)))),
          ]),
          const SizedBox(height: 12),
          Row(children: [
            Expanded(
                child: Container(
                    height: 90,
                    decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12)))),
            const SizedBox(width: 12),
            Expanded(
                child: Container(
                    height: 90,
                    decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12)))),
          ]),
          const SizedBox(height: 28),
          Container(
              height: 14, width: 140,
              decoration: BoxDecoration(
                  color: Colors.white, borderRadius: BorderRadius.circular(4))),
          const SizedBox(height: 10),
          Row(children: [
            for (int i = 0; i < 3; i++) ...[
              Expanded(
                  child: Container(
                      height: 60,
                      decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(10)))),
              if (i < 2) const SizedBox(width: 8),
            ],
          ]),
        ],
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
            'Could not load analytics',
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
