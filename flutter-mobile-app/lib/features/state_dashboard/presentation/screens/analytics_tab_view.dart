import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shimmer/shimmer.dart';
import '../../data/models/analytics_models.dart';
import '../providers/analytics_providers.dart';
import '../widgets/kpi_strip.dart';
import '../widgets/insights_strip.dart';
import '../widgets/analytics_charts.dart';
import '../widgets/people_list.dart';

class AnalyticsTabView extends ConsumerStatefulWidget {
  final String level;
  final String locationId;
  final String? locationName;

  const AnalyticsTabView({
    super.key,
    required this.level,
    required this.locationId,
    this.locationName,
  });

  @override
  ConsumerState<AnalyticsTabView> createState() => _AnalyticsTabViewState();
}

class _AnalyticsTabViewState extends ConsumerState<AnalyticsTabView> {
  PeopleFilters _appliedFilters = const PeopleFilters();

  DemographicsParams get _demoParams => (
    level: widget.level,
    locationId: widget.locationId,
    locationName: widget.locationName,
  );

  void _applyFilter(Map<String, String> filter) {
    setState(() {
      _appliedFilters = PeopleFilters(
        gender: filter['gender'],
        ageRange: filter['ageRange'],
        pvc: filter['pvc'],
        willVote: filter['willVote'],
        profileHealth: filter['profileHealth'],
        activity: filter['activity'],
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final demoAsync = ref.watch(demographicsProvider(_demoParams));

    return demoAsync.when(
      loading: () => _buildSkeleton(theme),
      error: (e, _) => Center(child: Text('Error: $e', style: TextStyle(
        fontSize: 13, color: theme.colorScheme.onSurface.withOpacity(0.5)))),
      data: (data) => SingleChildScrollView(
        padding: const EdgeInsets.only(bottom: 40),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 8),
            // KPI Strip
            KpiStrip(kpis: data.kpis, onKpiTap: _applyFilter),
            const SizedBox(height: 12),
            // Insights
            InsightsStrip(insights: data.insights, onInsightTap: _applyFilter),
            const SizedBox(height: 12),
            // Charts
            AnalyticsChartsWidget(data: data, onSegmentTap: _applyFilter),
            const SizedBox(height: 20),
            // People section header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Text('Members', style: TextStyle(
                fontSize: 14, fontWeight: FontWeight.w800,
                color: theme.colorScheme.onSurface, letterSpacing: -0.3)),
            ),
            const SizedBox(height: 8),
            // People list
            PeopleListWidget(
              level: widget.level,
              locationId: widget.locationId,
              locationName: widget.locationName,
              initialFilters: _appliedFilters,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSkeleton(ThemeData theme) {
    return Shimmer.fromColors(
      baseColor: theme.colorScheme.onSurface.withOpacity(0.06),
      highlightColor: theme.colorScheme.onSurface.withOpacity(0.02),
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // KPI skeleton
            SizedBox(
              height: 88,
              child: Row(children: List.generate(3, (_) => Expanded(
                child: Container(
                  margin: const EdgeInsets.only(right: 10),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ))),
            ),
            const SizedBox(height: 16),
            // Chart skeleton
            Container(height: 140, decoration: BoxDecoration(
              color: Colors.white, borderRadius: BorderRadius.circular(12))),
            const SizedBox(height: 12),
            Container(height: 140, decoration: BoxDecoration(
              color: Colors.white, borderRadius: BorderRadius.circular(12))),
          ],
        ),
      ),
    );
  }
}
