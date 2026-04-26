import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../shared/widgets/empty_state.dart';
import '../../../../shared/widgets/skeleton_loader.dart';
import '../../data/models/leaderboard_entry.dart';
import '../providers/leaderboard_providers.dart';

class LeaderboardScreen extends ConsumerStatefulWidget {
  const LeaderboardScreen({super.key});

  @override
  ConsumerState<LeaderboardScreen> createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends ConsumerState<LeaderboardScreen> {
  String _period = 'all';
  final String _level = 'national';

  static const _periods = [
    ('week', 'This Week'),
    ('month', 'This Month'),
    ('all', 'All Time'),
  ];

  LeaderboardParams get _params => (level: _level, period: _period);

  void _setPeriod(String period) {
    if (period == _period) return;
    HapticFeedback.lightImpact();
    setState(() => _period = period);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final leaderboardAsync = ref.watch(leaderboardProvider(_params));

    return Scaffold(
      appBar: AppBar(
        title: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.emoji_events_rounded,
                color: AppColors.warning, size: 24),
            SizedBox(width: 8),
            Text('Leaderboard'),
          ],
        ),
      ),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: () async {
          ref.invalidate(leaderboardProvider(_params));
        },
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            // ── Time Period Toggle ──
            SliverToBoxAdapter(
              child: Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: _PeriodToggle(
                  selected: _period,
                  onChanged: _setPeriod,
                  isDark: isDark,
                ),
              ),
            ),

            // ── Content ──
            leaderboardAsync.when(
              loading: () => const SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.only(top: 16),
                  child: SkeletonList(itemCount: 8, itemHeight: 80),
                ),
              ),
              error: (err, _) => const SliverFillRemaining(
                child: EmptyStateWidget(
                  icon: Icons.error_outline_rounded,
                  title: 'Failed to load leaderboard',
                  subtitle: 'Pull down to retry',
                ),
              ),
              data: (entries) {
                if (entries.isEmpty) {
                  return SliverFillRemaining(
                    child: EmptyStateWidget(
                      icon: Icons.emoji_events_outlined,
                      title: 'No voting blocs found',
                      subtitle: _period == 'all'
                          ? 'No voting blocs match your filters'
                          : 'No activity in this time period',
                    ),
                  );
                }

                // Top 3 podium + rest of list
                final hasTop3 = entries.length >= 3;
                final top3 = hasTop3 ? entries.sublist(0, 3) : <LeaderboardEntry>[];
                final rest = hasTop3 ? entries.sublist(3) : entries;

                return SliverList(
                  delegate: SliverChildListDelegate([
                    if (hasTop3) ...[
                      const SizedBox(height: 8),
                      _Top3Podium(entries: top3, isDark: isDark),
                      const SizedBox(height: 8),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Divider(
                          color: isDark
                              ? AppColors.border
                              : AppColors.lightBorder,
                          height: 1,
                        ),
                      ),
                    ],
                    ...List.generate(rest.length, (i) {
                      final rank = hasTop3 ? i + 4 : i + 1;
                      return _LeaderboardTile(
                        entry: rest[i],
                        rank: rank,
                        isDark: isDark,
                      );
                    }),
                    const SizedBox(height: 32),
                  ]),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

// ── Period Toggle ──────────────────────────────────────────────────

class _PeriodToggle extends StatelessWidget {
  final String selected;
  final ValueChanged<String> onChanged;
  final bool isDark;

  const _PeriodToggle({
    required this.selected,
    required this.onChanged,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: isDark ? AppColors.surface : const Color(0xFFF3F4F6),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDark ? AppColors.border : AppColors.lightBorder,
          width: 0.5,
        ),
      ),
      child: Row(
        children: _LeaderboardScreenState._periods.map((p) {
          final isSelected = p.$1 == selected;
          return Expanded(
            child: GestureDetector(
              onTap: () => onChanged(p.$1),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                curve: Curves.easeOut,
                padding:
                    const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
                decoration: BoxDecoration(
                  color: isSelected
                      ? AppColors.primary
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  p.$2,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight:
                        isSelected ? FontWeight.w700 : FontWeight.w500,
                    color: isSelected
                        ? Colors.white
                        : (isDark
                            ? AppColors.textSecondary
                            : AppColors.lightTextSecondary),
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

// ── Top 3 Podium ──────────────────────────────────────────────────

class _Top3Podium extends StatelessWidget {
  final List<LeaderboardEntry> entries;
  final bool isDark;

  const _Top3Podium({required this.entries, required this.isDark});

  @override
  Widget build(BuildContext context) {
    // Display order: 2nd, 1st, 3rd — classic podium layout
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Expanded(child: _PodiumItem(entry: entries[1], rank: 2, isDark: isDark)),
          Expanded(child: _PodiumItem(entry: entries[0], rank: 1, isDark: isDark)),
          Expanded(child: _PodiumItem(entry: entries[2], rank: 3, isDark: isDark)),
        ],
      ),
    );
  }
}

class _PodiumItem extends StatelessWidget {
  final LeaderboardEntry entry;
  final int rank;
  final bool isDark;

  const _PodiumItem({
    required this.entry,
    required this.rank,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final isFirst = rank == 1;
    final imageSize = isFirst ? 64.0 : 52.0;
    final iconSize = isFirst ? 28.0 : 22.0;

    final Color borderColor;
    final Color badgeColor;
    final IconData icon;
    switch (rank) {
      case 1:
        borderColor = const Color(0xFFFFD700);
        badgeColor = const Color(0xFFFFD700);
        icon = Icons.workspace_premium_rounded;
        break;
      case 2:
        borderColor = const Color(0xFFC0C0C0);
        badgeColor = const Color(0xFFA0A0A0);
        icon = Icons.military_tech_rounded;
        break;
      default:
        borderColor = const Color(0xFFCD7F32);
        badgeColor = const Color(0xFFCD7F32);
        icon = Icons.stars_rounded;
    }

    final profileImage = entry.creator?.profileImage;
    final creatorName = entry.creator?.name ?? 'Unknown';

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: badgeColor, size: iconSize),
        const SizedBox(height: 6),
        // Profile image
        Stack(
          clipBehavior: Clip.none,
          children: [
            Container(
              width: imageSize,
              height: imageSize,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: borderColor, width: 3),
              ),
              child: ClipOval(
                child: profileImage != null && profileImage.isNotEmpty
                    ? CachedNetworkImage(
                        imageUrl: profileImage,
                        fit: BoxFit.cover,
                        placeholder: (_, __) => Container(
                          color: isDark
                              ? AppColors.elevated
                              : const Color(0xFFF3F4F6),
                        ),
                        errorWidget: (_, __, ___) => _InitialAvatar(
                          name: creatorName,
                          isDark: isDark,
                        ),
                      )
                    : _InitialAvatar(name: creatorName, isDark: isDark),
              ),
            ),
            Positioned(
              bottom: -4,
              right: -4,
              child: Container(
                width: 22,
                height: 22,
                decoration: BoxDecoration(
                  color: badgeColor,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: isDark ? AppColors.background : Colors.white,
                    width: 2,
                  ),
                ),
                child: Center(
                  child: Text(
                    '$rank',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        // Name
        Text(
          creatorName,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: isDark ? AppColors.textSecondary : AppColors.lightTextSecondary,
          ),
        ),
        const SizedBox(height: 2),
        // Bloc name
        Text(
          entry.name,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: isDark ? AppColors.textPrimary : AppColors.lightTextPrimary,
          ),
        ),
        const SizedBox(height: 4),
        // Members count
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
          decoration: BoxDecoration(
            color: AppColors.primary.withOpacity(0.12),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            '${entry.metrics?.totalMembers ?? 0}',
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: AppColors.primary,
            ),
          ),
        ),
      ],
    );
  }
}

// ── Leaderboard Tile (rank 4+) ─────────────────────────────────────

class _LeaderboardTile extends StatelessWidget {
  final LeaderboardEntry entry;
  final int rank;
  final bool isDark;

  const _LeaderboardTile({
    required this.entry,
    required this.rank,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final profileImage = entry.creator?.profileImage;
    final creatorName = entry.creator?.name ?? 'Unknown';
    final location = entry.location;
    final locationText = [
      if (location?.state.isNotEmpty == true) location!.state,
      if (location?.lga.isNotEmpty == true) location!.lga,
    ].join(' · ');

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      decoration: BoxDecoration(
        color: isDark ? AppColors.card : Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isDark ? AppColors.border : AppColors.lightBorder,
          width: 0.5,
        ),
      ),
      child: Row(
        children: [
          // Rank number
          SizedBox(
            width: 32,
            child: Text(
              '#$rank',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: isDark ? AppColors.textMuted : AppColors.lightTextSecondary,
              ),
            ),
          ),
          const SizedBox(width: 8),
          // Profile image
          SizedBox(
            width: 40,
            height: 40,
            child: ClipOval(
              child: profileImage != null && profileImage.isNotEmpty
                  ? CachedNetworkImage(
                      imageUrl: profileImage,
                      fit: BoxFit.cover,
                      placeholder: (_, __) => Container(
                        color: isDark
                            ? AppColors.elevated
                            : const Color(0xFFF3F4F6),
                      ),
                      errorWidget: (_, __, ___) =>
                          _InitialAvatar(name: creatorName, isDark: isDark),
                    )
                  : _InitialAvatar(name: creatorName, isDark: isDark),
            ),
          ),
          const SizedBox(width: 12),
          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  entry.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: isDark
                        ? AppColors.textPrimary
                        : AppColors.lightTextPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  creatorName,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 12,
                    color: isDark
                        ? AppColors.textMuted
                        : AppColors.lightTextSecondary,
                  ),
                ),
                if (locationText.isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      Icon(
                        Icons.location_on_outlined,
                        size: 12,
                        color: isDark
                            ? AppColors.textMuted
                            : AppColors.lightTextSecondary,
                      ),
                      const SizedBox(width: 2),
                      Expanded(
                        child: Text(
                          locationText,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 11,
                            color: isDark
                                ? AppColors.textMuted
                                : AppColors.lightTextSecondary,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(width: 8),
          // Stats
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '${entry.metrics?.totalMembers ?? 0}',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                'members',
                style: TextStyle(
                  fontSize: 10,
                  color: isDark
                      ? AppColors.textMuted
                      : AppColors.lightTextSecondary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ── Initial Avatar ──────────────────────────────────────────────────

class _InitialAvatar extends StatelessWidget {
  final String name;
  final bool isDark;

  const _InitialAvatar({required this.name, required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: isDark ? AppColors.elevated : const Color(0xFFF3F4F6),
      child: Center(
        child: Text(
          name.isNotEmpty ? name[0].toUpperCase() : '?',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: isDark ? AppColors.textSecondary : AppColors.lightTextSecondary,
          ),
        ),
      ),
    );
  }
}
