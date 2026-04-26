import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/dashboard_data.dart';
import '../providers/dashboard_providers.dart';

class StateDashboardScreen extends ConsumerStatefulWidget {
  const StateDashboardScreen({super.key});

  @override
  ConsumerState<StateDashboardScreen> createState() =>
      _StateDashboardScreenState();
}

class _StateDashboardScreenState extends ConsumerState<StateDashboardScreen> {
  String _search = '';

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final userLevel = await ref.read(userLevelProvider.future);
    ref.read(dashboardProvider.notifier).loadInitial(userLevel);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final dashState = ref.watch(dashboardProvider);
    final userLevelAsync = ref.watch(userLevelProvider);

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // ── Header ──────────────────────────────────
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
                  Expanded(
                    child: Text(
                      'State Dashboard',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -0.4,
                        color: theme.colorScheme.onSurface,
                      ),
                    ),
                  ),
                  // Assign button for coordinators
                  userLevelAsync.whenOrNull(
                        data: (info) {
                          final isCoord = info.role == 'admin' ||
                              [
                                'National Coordinator',
                                'State Coordinator',
                                'LGA Coordinator',
                                'Ward Coordinator'
                              ].contains(info.designation);
                          if (!isCoord) return const SizedBox();
                          return Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              _IconBtn(
                                icon: Icons.group_outlined,
                                theme: theme,
                                onTap: () => context.push('/my-team'),
                              ),
                              const SizedBox(width: 8),
                              _IconBtn(
                                icon: Icons.person_add_outlined,
                                theme: theme,
                                onTap: () => context.push('/assign-coordinator'),
                              ),
                            ],
                          );
                        },
                      ) ??
                      const SizedBox(),
                ],
              ),
            ),

            const SizedBox(height: 12),

            // ── Breadcrumbs ─────────────────────────────
            if (dashState.response != null &&
                dashState.response!.breadcrumbs.isNotEmpty)
              _BreadcrumbBar(
                breadcrumbs: dashState.response!.breadcrumbs,
                userLevel: userLevelAsync.valueOrNull,
                onTap: (bc) => _navigateToBreadcrumb(bc),
              ),

            // ── Stats cards ─────────────────────────────
            if (dashState.response != null && !dashState.loading)
              _StatsRow(stats: dashState.response!.stats, theme: theme),

            // ── Search ──────────────────────────────────
            if (dashState.response != null && !dashState.loading)
              Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: TextField(
                  onChanged: (v) => setState(() => _search = v),
                  style: TextStyle(
                      fontSize: 14, color: theme.colorScheme.onSurface),
                  decoration: InputDecoration(
                    hintText: 'Search by name…',
                    hintStyle: TextStyle(
                        color:
                            theme.colorScheme.onSurface.withOpacity(0.3)),
                    prefixIcon: Icon(Icons.search_rounded,
                        size: 18,
                        color:
                            theme.colorScheme.onSurface.withOpacity(0.3)),
                    filled: true,
                    fillColor: theme.colorScheme.onSurface.withOpacity(0.05),
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 10),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
              ),

            // ── Content ─────────────────────────────────
            Expanded(
              child: dashState.loading
                  ? _buildSkeleton(theme)
                  : dashState.error != null
                      ? _buildError(theme, dashState.error!)
                      : dashState.response == null
                          ? _buildSkeleton(theme)
                          : _buildList(
                              theme, dashState.response!, userLevelAsync),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildList(ThemeData theme, DashboardResponse data,
      AsyncValue<UserLevelInfo> userLevelAsync) {
    var items = data.items;
    if (_search.isNotEmpty) {
      final q = _search.toLowerCase();
      items = items.where((i) => i.name.toLowerCase().contains(q)).toList();
    }

    if (items.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.location_off_outlined,
                size: 40,
                color: theme.colorScheme.onSurface.withOpacity(0.15)),
            const SizedBox(height: 12),
            Text('No results',
                style: TextStyle(
                    fontSize: 14,
                    color: theme.colorScheme.onSurface.withOpacity(0.4))),
          ],
        ),
      );
    }

    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: () async {
        HapticFeedback.mediumImpact();
        _loadData();
      },
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(16, 4, 16, 40),
        itemCount: items.length,
        itemBuilder: (context, index) {
          final item = items[index];
          final canDrillDown =
              data.level != 'pu' && data.level != 'polling_unit';
          return _LocationCard(
            item: item,
            theme: theme,
            onTap: canDrillDown ? () => _navigateToItem(item) : null,
          );
        },
      ),
    );
  }

  Widget _buildSkeleton(ThemeData theme) {
    return Shimmer.fromColors(
      baseColor: theme.colorScheme.onSurface.withOpacity(0.06),
      highlightColor: theme.colorScheme.onSurface.withOpacity(0.02),
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 40),
        itemCount: 8,
        itemBuilder: (_, __) => Container(
          height: 72,
          margin: const EdgeInsets.only(bottom: 10),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
    );
  }

  Widget _buildError(ThemeData theme, String error) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.error_outline_rounded,
                size: 40,
                color: theme.colorScheme.onSurface.withOpacity(0.2)),
            const SizedBox(height: 14),
            Text('Could not load data',
                style: TextStyle(
                    fontSize: 14,
                    color: theme.colorScheme.onSurface.withOpacity(0.5))),
            const SizedBox(height: 16),
            OutlinedButton.icon(
              onPressed: _loadData,
              icon: const Icon(Icons.refresh_rounded, size: 16),
              label: const Text('Try again'),
              style: OutlinedButton.styleFrom(
                foregroundColor:
                    theme.colorScheme.onSurface.withOpacity(0.6),
                side: BorderSide(
                    color: theme.colorScheme.outline.withOpacity(0.2)),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _navigateToItem(DashboardItem item) {
    HapticFeedback.lightImpact();
    final notifier = ref.read(dashboardProvider.notifier);
    final currentLevel =
        ref.read(dashboardProvider).response?.level ?? 'national';

    switch (currentLevel) {
      case 'national':
        notifier.loadState(item.id);
      case 'state':
        notifier.loadLGA(item.id);
      case 'lga':
        notifier.loadWard(item.id);
      case 'ward':
        notifier.loadPollingUnit(item.id);
    }
  }

  void _navigateToBreadcrumb(BreadcrumbItem bc) {
    HapticFeedback.lightImpact();
    final notifier = ref.read(dashboardProvider.notifier);
    switch (bc.level) {
      case 'national':
        notifier.loadNational();
      case 'state':
        if (bc.id != null) notifier.loadState(bc.id!);
      case 'lga':
        if (bc.id != null) notifier.loadLGA(bc.id!);
      case 'ward':
        if (bc.id != null) notifier.loadWard(bc.id!);
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// WIDGETS
// ═══════════════════════════════════════════════════════════════

class _IconBtn extends StatelessWidget {
  final IconData icon;
  final ThemeData theme;
  final VoidCallback onTap;
  const _IconBtn(
      {required this.icon, required this.theme, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        onTap();
      },
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: theme.colorScheme.onSurface.withOpacity(0.05),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, size: 20, color: theme.colorScheme.onSurface),
      ),
    );
  }
}

// ── Breadcrumbs ─────────────────────────────────────────────

class _BreadcrumbBar extends StatelessWidget {
  final List<BreadcrumbItem> breadcrumbs;
  final UserLevelInfo? userLevel;
  final ValueChanged<BreadcrumbItem> onTap;
  const _BreadcrumbBar(
      {required this.breadcrumbs, this.userLevel, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    // Filter breadcrumbs by user's permissions
    final allowed = userLevel?.allowedLevels ?? [];
    final visible = breadcrumbs
        .where((b) => allowed.isEmpty || allowed.contains(b.level))
        .toList();

    return SizedBox(
      height: 36,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: visible.length,
        separatorBuilder: (_, __) => Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4),
          child: Icon(Icons.chevron_right_rounded,
              size: 16,
              color: theme.colorScheme.onSurface.withOpacity(0.2)),
        ),
        itemBuilder: (_, i) {
          final bc = visible[i];
          final isLast = i == visible.length - 1;
          return GestureDetector(
            onTap: isLast ? null : () => onTap(bc),
            child: Chip(
              materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              visualDensity: VisualDensity.compact,
              padding: const EdgeInsets.symmetric(horizontal: 4),
              backgroundColor: isLast
                  ? AppColors.primary.withOpacity(0.12)
                  : theme.colorScheme.onSurface.withOpacity(0.05),
              side: BorderSide.none,
              label: Text(
                bc.name,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: isLast ? FontWeight.w700 : FontWeight.w500,
                  color: isLast
                      ? AppColors.primary
                      : theme.colorScheme.onSurface.withOpacity(0.5),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

// ── Stats section with donut chart ──────────────────────────

class _StatsRow extends StatelessWidget {
  final DashboardStats stats;
  final ThemeData theme;
  const _StatsRow({required this.stats, required this.theme});

  @override
  Widget build(BuildContext context) {
    final total = stats.obidientRegisteredVoters;
    final withPvc = stats.obidientVotersWithPVC;
    final withoutPvc = stats.obidientVotersWithoutPVC;
    final pvcRate = total > 0 ? (withPvc / total * 100) : 0.0;

    final onSurface = theme.colorScheme.onSurface;
    final muted = onSurface.withOpacity(0.5);
    final subtle = onSurface.withOpacity(0.35);
    final trackColor = onSurface.withOpacity(0.06);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: theme.colorScheme.outline.withOpacity(0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: label + big number
          Text(
            'TOTAL OBIDIENTS',
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              letterSpacing: 1.2,
              color: subtle,
            ),
          ),
          const SizedBox(height: 6),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                _fmt(total),
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -1.2,
                  height: 1,
                  color: onSurface,
                ),
              ),
              const SizedBox(width: 8),
              Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Text(
                  'registered',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: muted,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          // Divider
          Container(height: 1, color: trackColor),
          const SizedBox(height: 16),
          // PVC breakdown with donut
          Row(
            children: [
              // Small donut — only filled portion is brand color
              SizedBox(
                width: 56,
                height: 56,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    PieChart(
                      PieChartData(
                        sectionsSpace: 0,
                        centerSpaceRadius: 20,
                        startDegreeOffset: -90,
                        sections: [
                          PieChartSectionData(
                            value: withPvc.toDouble().clamp(0.01, double.infinity),
                            color: AppColors.primary,
                            radius: 8,
                            showTitle: false,
                          ),
                          PieChartSectionData(
                            value: withoutPvc.toDouble().clamp(0.01, double.infinity),
                            color: trackColor,
                            radius: 8,
                            showTitle: false,
                          ),
                        ],
                      ),
                    ),
                    Text(
                      '${pvcRate.toStringAsFixed(0)}%',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: onSurface,
                        letterSpacing: -0.3,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              // Two rows: With PVC / Without PVC
              Expanded(
                child: Column(
                  children: [
                    _BreakdownRow(
                      dotColor: AppColors.primary,
                      label: 'With PVC',
                      value: _fmt(withPvc),
                      theme: theme,
                    ),
                    const SizedBox(height: 10),
                    _BreakdownRow(
                      dotColor: trackColor,
                      label: 'Without PVC',
                      value: _fmt(withoutPvc),
                      theme: theme,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _fmt(int n) {
    if (n >= 1000000) return '${(n / 1000000).toStringAsFixed(1)}M';
    if (n >= 1000) return '${(n / 1000).toStringAsFixed(1)}K';
    return n.toString();
  }
}

class _BreakdownRow extends StatelessWidget {
  final Color dotColor;
  final String label;
  final String value;
  final ThemeData theme;
  const _BreakdownRow({
    required this.dotColor,
    required this.label,
    required this.value,
    required this.theme,
  });

  @override
  Widget build(BuildContext context) {
    final onSurface = theme.colorScheme.onSurface;
    return Row(
      children: [
        Container(
          width: 6,
          height: 6,
          decoration: BoxDecoration(color: dotColor, shape: BoxShape.circle),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: onSurface.withOpacity(0.6),
            ),
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: onSurface,
            letterSpacing: -0.2,
          ),
        ),
      ],
    );
  }
}

// ── Location list card ──────────────────────────────────────

class _LocationCard extends StatelessWidget {
  final DashboardItem item;
  final ThemeData theme;
  final VoidCallback? onTap;
  const _LocationCard(
      {required this.item, required this.theme, this.onTap});

  @override
  Widget build(BuildContext context) {
    final pvcRate = item.obidientRegisteredVoters > 0
        ? item.obidientVotersWithPVC / item.obidientRegisteredVoters
        : 0.0;

    final onSurface = theme.colorScheme.onSurface;
    final muted = onSurface.withOpacity(0.5);
    final subtle = onSurface.withOpacity(0.35);
    final trackColor = onSurface.withOpacity(0.06);

    return GestureDetector(
      onTap: onTap != null
          ? () {
              HapticFeedback.lightImpact();
              onTap!();
            }
          : null,
      behavior: HitTestBehavior.opaque,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
              color: theme.colorScheme.outline.withOpacity(0.08)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top row: name + percentage
            Row(
              children: [
                Expanded(
                  child: Text(
                    item.name,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: onSurface,
                      letterSpacing: -0.2,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  '${(pvcRate * 100).toStringAsFixed(0)}%',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: onSurface,
                    letterSpacing: -0.3,
                  ),
                ),
                if (onTap != null) ...[
                  const SizedBox(width: 6),
                  Icon(Icons.chevron_right_rounded,
                      size: 16, color: subtle),
                ],
              ],
            ),
            const SizedBox(height: 8),
            // Thin progress bar
            ClipRRect(
              borderRadius: BorderRadius.circular(100),
              child: Stack(
                children: [
                  Container(height: 3, color: trackColor),
                  FractionallySizedBox(
                    widthFactor: pvcRate.clamp(0.0, 1.0),
                    child: Container(
                      height: 3,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),
            // Bottom meta row
            Row(
              children: [
                Text(
                  _fmt(item.obidientRegisteredVoters),
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: onSurface,
                  ),
                ),
                const SizedBox(width: 4),
                Text(
                  'Obidients',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w400,
                    color: muted,
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: Container(
                    width: 3,
                    height: 3,
                    decoration: BoxDecoration(
                      color: subtle,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
                Text(
                  _fmt(item.obidientVotersWithPVC),
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: onSurface,
                  ),
                ),
                const SizedBox(width: 4),
                Text(
                  'with PVC',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w400,
                    color: muted,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _fmt(int n) {
    if (n >= 1000000) return '${(n / 1000000).toStringAsFixed(1)}M';
    if (n >= 1000) return '${(n / 1000).toStringAsFixed(1)}K';
    return n.toString();
  }
}
