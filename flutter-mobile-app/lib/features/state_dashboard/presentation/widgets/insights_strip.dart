import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../data/models/analytics_models.dart';

class InsightsStrip extends StatelessWidget {
  final DemographicsInsights insights;
  final ValueChanged<Map<String, String>> onInsightTap;

  const InsightsStrip({super.key, required this.insights, required this.onInsightTap});

  @override
  Widget build(BuildContext context) {
    final items = <_InsightItem>[
      if (insights.needsAttention > 0)
        _InsightItem(
          icon: Icons.warning_amber_rounded,
          label: '${insights.needsAttention} need outreach',
          color: const Color(0xFFd97706),
          bg: const Color(0xFFFEF3C7),
          filter: {'pvc': 'No', 'profileHealth': 'low'},
        ),
      if (insights.ghosts > 0)
        _InsightItem(
          icon: Icons.visibility_off_outlined,
          label: '${_fmt(insights.ghosts)} dormant',
          color: const Color(0xFF6b7280),
          bg: const Color(0xFFF3F4F6),
          filter: {'activity': 'dormant'},
        ),
      if (insights.champions > 0)
        _InsightItem(
          icon: Icons.emoji_events_outlined,
          label: '${_fmt(insights.champions)} champions',
          color: const Color(0xFF059669),
          bg: const Color(0xFFD1FAE5),
          filter: {'pvc': 'Yes', 'willVote': 'Yes', 'profileHealth': 'complete'},
        ),
      if (insights.noLocation > 0)
        _InsightItem(
          icon: Icons.location_off_outlined,
          label: '${insights.noLocation} missing LGA',
          color: const Color(0xFFdc2626),
          bg: const Color(0xFFFEE2E2),
          filter: {'profileHealth': 'low'},
        ),
      if (insights.genderGapAlert)
        _InsightItem(
          icon: Icons.people_outline,
          label: 'Low female (<15%)',
          color: const Color(0xFFdb2777),
          bg: const Color(0xFFFCE7F3),
          filter: {'gender': 'Female'},
        ),
      if (insights.youthGapAlert)
        _InsightItem(
          icon: Icons.child_care_outlined,
          label: 'Low youth (<8%)',
          color: const Color(0xFF2563eb),
          bg: const Color(0xFFDBEAFE),
          filter: {'ageRange': '18-24'},
        ),
    ];

    if (items.isEmpty) return const SizedBox.shrink();

    return SizedBox(
      height: 34,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: items.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (_, i) {
          final item = items[i];
          return GestureDetector(
            onTap: () {
              HapticFeedback.lightImpact();
              onInsightTap(item.filter);
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: item.bg,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(item.icon, size: 14, color: item.color),
                  const SizedBox(width: 5),
                  Text(
                    item.label,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: item.color,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  String _fmt(int n) {
    if (n >= 1000) return '${(n / 1000).toStringAsFixed(1)}K';
    return n.toString();
  }
}

class _InsightItem {
  final IconData icon;
  final String label;
  final Color color;
  final Color bg;
  final Map<String, String> filter;
  _InsightItem({
    required this.icon,
    required this.label,
    required this.color,
    required this.bg,
    required this.filter,
  });
}
