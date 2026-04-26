import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/message_reaction.dart';

/// Compact row of reaction chips shown below a message bubble.
/// Designed to be placed inside a Positioned/Stack for overlap effect.
class ReactionDisplay extends StatelessWidget {
  final List<MessageReaction> reactions;
  final bool isDark;
  final void Function(String emoji) onTap;

  const ReactionDisplay({
    super.key,
    required this.reactions,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    if (reactions.isEmpty) return const SizedBox.shrink();

    return Wrap(
      spacing: 4,
      runSpacing: 2,
      children: reactions.map((r) {
            final highlighted = r.reacted;
            return GestureDetector(
              onTap: () => onTap(r.emoji),
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: highlighted
                      ? (isDark
                          ? AppColors.primary.withOpacity(0.2)
                          : AppColors.primary.withOpacity(0.1))
                      : (isDark
                          ? AppColors.elevated
                          : const Color(0xFFF0F0F0)),
                  borderRadius: BorderRadius.circular(10),
                  border: highlighted
                      ? Border.all(
                          color: AppColors.primary.withOpacity(0.4),
                          width: 1,
                        )
                      : null,
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(r.emoji, style: const TextStyle(fontSize: 13)),
                    if (r.count > 1) ...[
                      const SizedBox(width: 3),
                      Text(
                        '${r.count}',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: highlighted
                              ? AppColors.primary
                              : (isDark
                                  ? AppColors.textMuted
                                  : AppColors.lightTextSecondary),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            );
          }).toList(),
    );
  }
}
