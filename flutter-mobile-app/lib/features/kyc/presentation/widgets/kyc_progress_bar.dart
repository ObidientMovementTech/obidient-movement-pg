import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

class KycProgressBar extends StatelessWidget {
  final int currentStep;
  final int totalSteps;
  final ValueChanged<int>? onStepTap;

  const KycProgressBar({
    super.key,
    required this.currentStep,
    this.totalSteps = 2,
    this.onStepTap,
  });

  static const _labels = ['Valid ID', 'Selfie'];

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final appC = context.appColors;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Row(
        children: List.generate(totalSteps, (i) {
          final isCompleted = i < currentStep;
          final isActive = i == currentStep;
          final canTap = i < currentStep; // only back-nav

          return Expanded(
            child: GestureDetector(
              onTap: canTap ? () => onStepTap?.call(i) : null,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    children: [
                      if (i > 0)
                        Expanded(
                          child: Container(
                            height: 2,
                            color: isCompleted || isActive
                                ? cs.primary
                                : cs.outline,
                          ),
                        ),
                      Container(
                        width: 28,
                        height: 28,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: isCompleted
                              ? cs.primary
                              : isActive
                                  ? cs.primary.withOpacity(0.15)
                                  : appC.elevated,
                          border: Border.all(
                            color: isCompleted || isActive
                                ? cs.primary
                                : cs.outline,
                            width: 2,
                          ),
                        ),
                        child: Center(
                          child: isCompleted
                              ? const Icon(Icons.check,
                                  size: 14, color: Colors.white)
                              : Text(
                                  '${i + 1}',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                    color: isActive
                                        ? cs.primary
                                        : appC.textMuted,
                                  ),
                                ),
                        ),
                      ),
                      if (i < totalSteps - 1)
                        Expanded(
                          child: Container(
                            height: 2,
                            color: isCompleted
                                ? cs.primary
                                : cs.outline,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    _labels[i],
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight:
                          isActive ? FontWeight.w700 : FontWeight.w500,
                      color: isActive || isCompleted
                          ? cs.onSurface
                          : appC.textMuted,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          );
        }),
      ),
    );
  }
}
