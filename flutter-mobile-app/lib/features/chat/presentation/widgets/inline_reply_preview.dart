import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

/// Inline reply preview inside a message bubble.
class InlineReplyPreview extends StatelessWidget {
  final String senderName;
  final String content;
  final bool isMe;
  final bool isDark;
  final VoidCallback? onTap;

  const InlineReplyPreview({
    super.key,
    required this.senderName,
    required this.content,
    required this.isMe,
    required this.isDark,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 4),
        padding: const EdgeInsets.fromLTRB(8, 6, 8, 6),
        decoration: BoxDecoration(
          color: isMe
              ? (isDark
                  ? Colors.black.withOpacity(0.15)
                  : Colors.black.withOpacity(0.05))
              : (isDark
                  ? Colors.white.withOpacity(0.06)
                  : Colors.black.withOpacity(0.04)),
          borderRadius: BorderRadius.circular(8),
          border: const Border(
            left: BorderSide(
              color: AppColors.primary,
              width: 3,
            ),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              senderName,
              style: const TextStyle(
                fontSize: 11.5,
                fontWeight: FontWeight.w700,
                color: AppColors.primary,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 1),
            Text(
              content,
              style: TextStyle(
                fontSize: 12,
                color: isDark
                    ? AppColors.textMuted
                    : AppColors.lightTextSecondary,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
