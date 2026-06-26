import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/analytics_models.dart';

class AnalyticsChartsWidget extends StatelessWidget {
  final DemographicsData data;
  final ValueChanged<Map<String, String>> onSegmentTap;

  const AnalyticsChartsWidget({super.key, required this.data, required this.onSegmentTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: [
          // Row 1: Gender + PVC
          Row(
            children: [
              Expanded(child: _DonutCard(
                theme: theme,
                title: 'Gender',
                segments: [
                  _Seg('Male', data.gender.male, const Color(0xFF3b82f6), {'gender': 'Male'}),
                  _Seg('Female', data.gender.female, const Color(0xFFec4899), {'gender': 'Female'}),
                  _Seg('N/A', data.gender.unknown, const Color(0xFFd1d5db), {'gender': 'unknown'}),
                ],
                onSegmentTap: onSegmentTap,
              )),
              const SizedBox(width: 10),
              Expanded(child: _DonutCard(
                theme: theme,
                title: 'PVC Status',
                segments: [
                  _Seg('Has PVC', data.pvcStatus.yes, AppColors.primary, {'pvc': 'Yes'}),
                  _Seg('No PVC', data.pvcStatus.no, const Color(0xFFef4444), {'pvc': 'No'}),
                ],
                onSegmentTap: onSegmentTap,
              )),
            ],
          ),
          const SizedBox(height: 10),
          // Row 2: Voting Intent + Profile Health
          Row(
            children: [
              Expanded(child: _DonutCard(
                theme: theme,
                title: 'Voting Intent',
                segments: [
                  _Seg('Will vote', data.votingIntent.yes, const Color(0xFF8b5cf6), {'willVote': 'Yes'}),
                  _Seg("Won't", data.votingIntent.no, const Color(0xFFef4444), {'willVote': 'No'}),
                  _Seg('Unknown', data.votingIntent.unknown, const Color(0xFFd1d5db), {'willVote': 'unknown'}),
                ],
                onSegmentTap: onSegmentTap,
              )),
              const SizedBox(width: 10),
              Expanded(child: _ProfileHealthCard(
                theme: theme,
                health: data.profileHealth,
                onSegmentTap: onSegmentTap,
              )),
            ],
          ),
          const SizedBox(height: 10),
          // Age Distribution (full width)
          _AgeBarCard(
            theme: theme,
            ageRanges: data.ageRanges,
            onSegmentTap: onSegmentTap,
          ),
        ],
      ),
    );
  }
}

// ── Donut Card ──────────────────────────────────────────────

class _DonutCard extends StatelessWidget {
  final ThemeData theme;
  final String title;
  final List<_Seg> segments;
  final ValueChanged<Map<String, String>> onSegmentTap;

  const _DonutCard({
    required this.theme,
    required this.title,
    required this.segments,
    required this.onSegmentTap,
  });

  @override
  Widget build(BuildContext context) {
    final total = segments.fold<int>(0, (s, seg) => s + seg.value);
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: theme.colorScheme.outline.withOpacity(0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.5,
            color: theme.colorScheme.onSurface.withOpacity(0.4),
          )),
          const SizedBox(height: 10),
          SizedBox(
            height: 80,
            child: Row(
              children: [
                SizedBox(
                  width: 64,
                  height: 64,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      PieChart(PieChartData(
                        sectionsSpace: 1,
                        centerSpaceRadius: 22,
                        startDegreeOffset: -90,
                        sections: segments.map((s) => PieChartSectionData(
                          value: s.value.toDouble().clamp(0.01, double.infinity),
                          color: s.color,
                          radius: 8,
                          showTitle: false,
                        )).toList(),
                        pieTouchData: PieTouchData(
                          touchCallback: (event, response) {
                            if (event is FlTapUpEvent && response?.touchedSection != null) {
                              final idx = response!.touchedSection!.touchedSectionIndex;
                              if (idx >= 0 && idx < segments.length) {
                                HapticFeedback.lightImpact();
                                onSegmentTap(segments[idx].filter);
                              }
                            }
                          },
                        ),
                      )),
                      Text(
                        total.toString(),
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: theme.colorScheme.onSurface,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: segments.map((s) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 2),
                      child: Row(
                        children: [
                          Container(width: 8, height: 8, decoration: BoxDecoration(
                            color: s.color, borderRadius: BorderRadius.circular(2),
                          )),
                          const SizedBox(width: 6),
                          Expanded(child: Text(s.label, style: TextStyle(
                            fontSize: 10, color: theme.colorScheme.onSurface.withOpacity(0.6),
                          ))),
                          Text(_fmt(s.value), style: TextStyle(
                            fontSize: 10, fontWeight: FontWeight.w700,
                            color: theme.colorScheme.onSurface,
                          )),
                        ],
                      ),
                    )).toList(),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _fmt(int n) {
    if (n >= 1000) return '${(n / 1000).toStringAsFixed(1)}K';
    return n.toString();
  }
}

// ── Profile Health Card ─────────────────────────────────────

class _ProfileHealthCard extends StatelessWidget {
  final ThemeData theme;
  final ProfileHealth health;
  final ValueChanged<Map<String, String>> onSegmentTap;

  const _ProfileHealthCard({required this.theme, required this.health, required this.onSegmentTap});

  @override
  Widget build(BuildContext context) {
    final bars = [
      _Bar('100%', health.complete, AppColors.primary, {'profileHealth': 'complete'}),
      _Bar('80%+', health.high, const Color(0xFF22c55e), {'profileHealth': 'high'}),
      _Bar('50%+', health.medium, const Color(0xFFf59e0b), {'profileHealth': 'medium'}),
      _Bar('<50%', health.low, const Color(0xFFef4444), {'profileHealth': 'low'}),
    ];
    final max = bars.map((b) => b.value).fold<int>(1, (a, b) => a > b ? a : b);

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: theme.colorScheme.outline.withOpacity(0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Profile Health', style: TextStyle(
            fontSize: 10, fontWeight: FontWeight.w600, letterSpacing: 0.5,
            color: theme.colorScheme.onSurface.withOpacity(0.4),
          )),
          const SizedBox(height: 10),
          ...bars.map((b) => GestureDetector(
            onTap: () {
              HapticFeedback.lightImpact();
              onSegmentTap(b.filter);
            },
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 3),
              child: Row(
                children: [
                  SizedBox(width: 28, child: Text(b.label, style: TextStyle(
                    fontSize: 9, color: theme.colorScheme.onSurface.withOpacity(0.5),
                  ))),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Container(
                      height: 12,
                      decoration: BoxDecoration(
                        color: theme.colorScheme.onSurface.withOpacity(0.04),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: FractionallySizedBox(
                        alignment: Alignment.centerLeft,
                        widthFactor: (b.value / max).clamp(0.0, 1.0),
                        child: Container(
                          decoration: BoxDecoration(
                            color: b.color,
                            borderRadius: BorderRadius.circular(6),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  SizedBox(width: 30, child: Text(
                    _fmt(b.value),
                    textAlign: TextAlign.right,
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700,
                      color: theme.colorScheme.onSurface),
                  )),
                ],
              ),
            ),
          )),
        ],
      ),
    );
  }

  String _fmt(int n) {
    if (n >= 1000) return '${(n / 1000).toStringAsFixed(1)}K';
    return n.toString();
  }
}

// ── Age Bar Card ────────────────────────────────────────────

class _AgeBarCard extends StatelessWidget {
  final ThemeData theme;
  final List<AgeRangeEntry> ageRanges;
  final ValueChanged<Map<String, String>> onSegmentTap;

  const _AgeBarCard({required this.theme, required this.ageRanges, required this.onSegmentTap});

  @override
  Widget build(BuildContext context) {
    final filtered = ageRanges.where((a) => a.label != 'Unknown').toList();
    final max = filtered.map((a) => a.count).fold<int>(1, (a, b) => a > b ? a : b);

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: theme.colorScheme.outline.withOpacity(0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Age Distribution', style: TextStyle(
            fontSize: 10, fontWeight: FontWeight.w600, letterSpacing: 0.5,
            color: theme.colorScheme.onSurface.withOpacity(0.4),
          )),
          const SizedBox(height: 10),
          ...filtered.map((a) => GestureDetector(
            onTap: () {
              HapticFeedback.lightImpact();
              onSegmentTap({'ageRange': a.label});
            },
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 3),
              child: Row(
                children: [
                  SizedBox(width: 36, child: Text(a.label, style: TextStyle(
                    fontSize: 10, color: theme.colorScheme.onSurface.withOpacity(0.5),
                  ))),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Container(
                      height: 14,
                      decoration: BoxDecoration(
                        color: theme.colorScheme.onSurface.withOpacity(0.04),
                        borderRadius: BorderRadius.circular(7),
                      ),
                      child: FractionallySizedBox(
                        alignment: Alignment.centerLeft,
                        widthFactor: (a.count / max).clamp(0.0, 1.0),
                        child: Container(
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(7),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  SizedBox(width: 36, child: Text(
                    _fmt(a.count),
                    textAlign: TextAlign.right,
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700,
                      color: theme.colorScheme.onSurface),
                  )),
                ],
              ),
            ),
          )),
        ],
      ),
    );
  }

  String _fmt(int n) {
    if (n >= 1000) return '${(n / 1000).toStringAsFixed(1)}K';
    return n.toString();
  }
}

// ── Helpers ─────────────────────────────────────────────────

class _Seg {
  final String label;
  final int value;
  final Color color;
  final Map<String, String> filter;
  _Seg(this.label, this.value, this.color, this.filter);
}

class _Bar {
  final String label;
  final int value;
  final Color color;
  final Map<String, String> filter;
  _Bar(this.label, this.value, this.color, this.filter);
}
