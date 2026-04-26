import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

/// Reply preview bar shown above the input when replying to a message.
class ReplyPreviewBar extends StatelessWidget {
  final String senderName;
  final String content;
  final bool isDark;
  final VoidCallback onDismiss;

  const ReplyPreviewBar({
    super.key,
    required this.senderName,
    required this.content,
    required this.isDark,
    required this.onDismiss,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 8, 8, 8),
      decoration: BoxDecoration(
        color: isDark ? AppColors.surface : Colors.white,
        border: Border(
          top: BorderSide(
            color: isDark ? AppColors.border : const Color(0xFFE5E5E5),
            width: 0.5,
          ),
        ),
      ),
      child: Row(
        children: [
          // Green accent bar
          Container(
            width: 3,
            height: 36,
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(width: 10),
          // Reply content
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  senderName,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  content,
                  style: TextStyle(
                    fontSize: 12.5,
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
          // Close button
          IconButton(
            icon: Icon(
              Icons.close_rounded,
              size: 18,
              color: isDark ? AppColors.textMuted : AppColors.lightTextSecondary,
            ),
            onPressed: onDismiss,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
          ),
        ],
      ),
    );
  }
}
