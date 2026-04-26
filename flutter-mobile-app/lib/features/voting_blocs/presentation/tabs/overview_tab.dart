import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/voting_bloc.dart';
import '../providers/voting_bloc_providers.dart';

class OverviewTab extends ConsumerWidget {
  final VotingBloc bloc;
  const OverviewTab({super.key, required this.bloc});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final members = bloc.totalMembers ?? bloc.memberCount ?? 0;
    final goalsCount = bloc.goals.length;
    final toolkitsCount = bloc.toolkits.length;
    final engagement = bloc.metrics?.engagementScore ?? 0;

    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: () async {
        HapticFeedback.mediumImpact();
        ref.invalidate(myBlocProvider);
      },
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 40),
        children: [
          // ── Quick Stats ────────────────────────────────────
          _SectionLabel('Quick Stats', theme),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _StatCard(
                  label: 'Total Members',
                  value: '$members',
                  icon: Icons.people_outline_rounded,
                  color: AppColors.info,
                  theme: theme,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _StatCard(
                  label: 'Engagement',
                  value: '$engagement',
                  icon: Icons.trending_up_rounded,
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
                  label: 'Active Goals',
                  value: '$goalsCount',
                  icon: Icons.flag_outlined,
                  color: const Color(0xFF8B5CF6),
                  theme: theme,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _StatCard(
                  label: 'Resources',
                  value: '$toolkitsCount',
                  icon: Icons.link_rounded,
                  color: AppColors.warning,
                  theme: theme,
                ),
              ),
            ],
          ),

          // ── Goals ──────────────────────────────────────────
          if (bloc.goals.isNotEmpty) ...[
            const SizedBox(height: 28),
            _SectionLabel('Current Goals', theme),
            const SizedBox(height: 10),
            ...bloc.goals.map((goal) => _GoalTile(goal: goal, theme: theme)),
          ],

          // ── Toolkits ───────────────────────────────────────
          if (bloc.toolkits.isNotEmpty) ...[
            const SizedBox(height: 28),
            _SectionLabel('Resources & Toolkits', theme),
            const SizedBox(height: 10),
            ...bloc.toolkits
                .map((tk) => _ToolkitTile(toolkit: tk, theme: theme)),
          ],

          // Empty state when nothing
          if ((bloc.goals.isEmpty) &&
              (bloc.toolkits.isEmpty)) ...[
            const SizedBox(height: 32),
            Center(
              child: Column(
                children: [
                  Icon(
                    Icons.info_outline_rounded,
                    size: 28,
                    color: theme.colorScheme.onSurface.withOpacity(0.15),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'No goals or resources added yet',
                    style: TextStyle(
                      fontSize: 13,
                      color:
                          theme.colorScheme.onSurface.withOpacity(0.35),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
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

class _GoalTile extends StatelessWidget {
  final String goal;
  final ThemeData theme;
  const _GoalTile({required this.goal, required this.theme});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: theme.colorScheme.outline.withOpacity(0.1),
          ),
        ),
        child: Row(
          children: [
            Icon(
              Icons.check_circle_outline_rounded,
              size: 18,
              color: AppColors.primary.withOpacity(0.6),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                goal,
                style: TextStyle(
                  fontSize: 14,
                  height: 1.4,
                  color: theme.colorScheme.onSurface.withOpacity(0.7),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ToolkitTile extends StatelessWidget {
  final BlocToolkit toolkit;
  final ThemeData theme;
  const _ToolkitTile({required this.toolkit, required this.theme});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: theme.colorScheme.outline.withOpacity(0.1),
          ),
        ),
        child: Row(
          children: [
            Icon(
              _toolkitIcon(toolkit.type),
              size: 18,
              color: AppColors.warning.withOpacity(0.7),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    toolkit.label,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: theme.colorScheme.onSurface.withOpacity(0.7),
                    ),
                  ),
                  if (toolkit.type.isNotEmpty)
                    Text(
                      toolkit.type,
                      style: TextStyle(
                        fontSize: 11,
                        color: theme.colorScheme.onSurface
                            .withOpacity(0.35),
                      ),
                    ),
                ],
              ),
            ),
            if (toolkit.url.isNotEmpty)
              Icon(
                Icons.open_in_new_rounded,
                size: 16,
                color: theme.colorScheme.onSurface.withOpacity(0.25),
              ),
          ],
        ),
      ),
    );
  }

  IconData _toolkitIcon(String? type) {
    switch (type?.toLowerCase()) {
      case 'document':
        return Icons.description_outlined;
      case 'video':
        return Icons.play_circle_outline;
      case 'link':
        return Icons.link_rounded;
      default:
        return Icons.folder_outlined;
    }
  }
}
