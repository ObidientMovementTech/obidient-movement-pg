import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/analytics_models.dart';

class KpiStrip extends StatelessWidget {
  final DemographicsKpis kpis;
  final ValueChanged<Map<String, String>> onKpiTap;

  const KpiStrip({super.key, required this.kpis, required this.onKpiTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cards = [
      _KpiData('Total', kpis.total, Icons.people_outlined, const Color(0xFF3b82f6), {}),
      _KpiData('Has PVC', kpis.hasPvc, Icons.credit_card_outlined, AppColors.primary, {'pvc': 'Yes'}),
      _KpiData('No PVC', kpis.noPvc, Icons.credit_card_off_outlined, const Color(0xFFef4444), {'pvc': 'No'}),
      _KpiData('Will Vote', kpis.willVote, Icons.how_to_vote_outlined, const Color(0xFF8b5cf6), {'willVote': 'Yes'}),
      _KpiData('Complete', kpis.profileComplete, Icons.check_circle_outline, const Color(0xFF10b981), {'profileHealth': 'complete'}),
      _KpiData('Active 30d', kpis.active30d, Icons.bolt_outlined, const Color(0xFFf59e0b), {'activity': 'active'}),
    ];

    return SizedBox(
      height: 96,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: cards.length,
        separatorBuilder: (_, __) => const SizedBox(width: 10),
        itemBuilder: (_, i) {
          final c = cards[i];
          return GestureDetector(
            onTap: () {
              HapticFeedback.lightImpact();
              onKpiTap(c.filter);
            },
            child: Container(
              width: 100,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: theme.colorScheme.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: theme.colorScheme.outline.withOpacity(0.08)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 28,
                    height: 28,
                    decoration: BoxDecoration(
                      color: c.color.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(c.icon, size: 15, color: c.color),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    _fmt(c.value),
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: theme.colorScheme.onSurface,
                      letterSpacing: -0.5,
                    ),
                  ),
                  Text(
                    c.label,
                    style: TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.w600,
                      color: theme.colorScheme.onSurface.withOpacity(0.4),
                      letterSpacing: 0.3,
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
    if (n >= 1000000) return '${(n / 1000000).toStringAsFixed(1)}M';
    if (n >= 1000) return '${(n / 1000).toStringAsFixed(1)}K';
    return n.toString();
  }
}

class _KpiData {
  final String label;
  final int value;
  final IconData icon;
  final Color color;
  final Map<String, String> filter;
  _KpiData(this.label, this.value, this.icon, this.color, this.filter);
}
