import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/voting_bloc.dart';
import '../providers/voting_bloc_providers.dart';
import '../widgets/bloc_header.dart';
import '../widgets/bloc_skeleton.dart';
import '../tabs/overview_tab.dart';
import '../tabs/members_tab.dart';
import '../tabs/polling_unit_tab.dart';
import '../tabs/analytics_tab.dart';

class BlocsScreen extends ConsumerStatefulWidget {
  const BlocsScreen({super.key});

  @override
  ConsumerState<BlocsScreen> createState() => _BlocsScreenState();
}

class _BlocsScreenState extends ConsumerState<BlocsScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final blocAsync = ref.watch(myBlocProvider);

    return Scaffold(
      body: blocAsync.when(
        loading: () => const BlocSkeleton(),
        error: (err, _) => _ErrorState(
          onRetry: () => ref.invalidate(myBlocProvider),
        ),
        data: (bloc) {
          if (bloc == null) {
            return _EmptyState();
          }
          return _BlocContent(
            bloc: bloc,
            tabController: _tabController,
            onRefresh: () async {
              HapticFeedback.mediumImpact();
              ref.invalidate(myBlocProvider);
            },
          );
        },
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// MAIN CONTENT — scrollable with sticky tabs
// ═══════════════════════════════════════════════════════════════════

class _BlocContent extends StatelessWidget {
  final VotingBloc bloc;
  final TabController tabController;
  final Future<void> Function() onRefresh;

  const _BlocContent({
    required this.bloc,
    required this.tabController,
    required this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return SafeArea(
      child: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: onRefresh,
        child: NestedScrollView(
          headerSliverBuilder: (context, innerBoxIsScrolled) => [
            // ── Header ──────────────────────────────────────
            SliverToBoxAdapter(
              child: BlocHeader(bloc: bloc),
            ),
            // ── Sticky tab bar ──────────────────────────────
            SliverPersistentHeader(
              pinned: true,
              delegate: _StickyTabBarDelegate(
                tabController: tabController,
                theme: theme,
              ),
            ),
          ],
          body: TabBarView(
            controller: tabController,
            children: [
              OverviewTab(bloc: bloc),
              MembersTab(bloc: bloc),
              PollingUnitTab(bloc: bloc),
              AnalyticsTab(bloc: bloc),
            ],
          ),
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// STICKY TAB BAR DELEGATE
// ═══════════════════════════════════════════════════════════════════

class _StickyTabBarDelegate extends SliverPersistentHeaderDelegate {
  final TabController tabController;
  final ThemeData theme;

  _StickyTabBarDelegate({
    required this.tabController,
    required this.theme,
  });

  @override
  double get minExtent => 48;
  @override
  double get maxExtent => 48;

  @override
  Widget build(
      BuildContext context, double shrinkOffset, bool overlapsContent) {
    return Container(
      color: theme.scaffoldBackgroundColor,
      child: TabBar(
        controller: tabController,
        isScrollable: true,
        tabAlignment: TabAlignment.start,
        labelColor: theme.colorScheme.onSurface,
        unselectedLabelColor: theme.colorScheme.onSurface.withOpacity(0.4),
        indicatorColor: AppColors.primary,
        indicatorWeight: 2,
        indicatorSize: TabBarIndicatorSize.label,
        labelStyle: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.2,
        ),
        unselectedLabelStyle: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w500,
        ),
        dividerColor: theme.colorScheme.outline.withOpacity(0.15),
        labelPadding: const EdgeInsets.symmetric(horizontal: 16),
        tabs: const [
          Tab(text: 'Overview'),
          Tab(text: 'Members'),
          Tab(text: 'Polling Unit'),
          Tab(text: 'Analytics'),
        ],
      ),
    );
  }

  @override
  bool shouldRebuild(covariant _StickyTabBarDelegate oldDelegate) =>
      tabController != oldDelegate.tabController;
}

// ═══════════════════════════════════════════════════════════════════
// EMPTY + ERROR STATES
// ═══════════════════════════════════════════════════════════════════

class _EmptyState extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                color: theme.colorScheme.onSurface.withOpacity(0.05),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(
                Icons.groups_outlined,
                size: 32,
                color: theme.colorScheme.onSurface.withOpacity(0.2),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'No Voting Bloc',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: theme.colorScheme.onSurface,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Your voting bloc hasn\'t been generated yet.\nCheck back soon.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                height: 1.5,
                color: theme.colorScheme.onSurface.withOpacity(0.4),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  final VoidCallback onRetry;
  const _ErrorState({required this.onRetry});

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
              Icons.error_outline_rounded,
              size: 40,
              color: theme.colorScheme.onSurface.withOpacity(0.2),
            ),
            const SizedBox(height: 14),
            Text(
              'Could not load your bloc',
              style: TextStyle(
                fontSize: 14,
                color: theme.colorScheme.onSurface.withOpacity(0.5),
              ),
            ),
            const SizedBox(height: 16),
            OutlinedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh_rounded, size: 16),
              label: const Text('Try again'),
              style: OutlinedButton.styleFrom(
                foregroundColor:
                    theme.colorScheme.onSurface.withOpacity(0.6),
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
      ),
    );
  }
}
