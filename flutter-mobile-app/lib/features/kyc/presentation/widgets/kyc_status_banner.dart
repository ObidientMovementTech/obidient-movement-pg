import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

class KycStatusBanner extends StatelessWidget {
  final String status;
  final String? rejectionReason;

  const KycStatusBanner({
    super.key,
    required this.status,
    this.rejectionReason,
  });

  @override
  Widget build(BuildContext context) {
    final s = status.toLowerCase();

    Color bg;
    Color fg;
    IconData icon;
    String label;
    String? subtitle;

    switch (s) {
      case 'approved':
        bg = AppColors.success.withOpacity(0.1);
        fg = AppColors.success;
        icon = Icons.check_circle_rounded;
        label = 'KYC Verified';
        subtitle = 'Your identity has been verified.';
      case 'pending':
        bg = AppColors.warning.withOpacity(0.1);
        fg = AppColors.warning;
        icon = Icons.hourglass_top_rounded;
        label = 'Pending Review';
        subtitle = 'Your documents are being reviewed.';
      case 'rejected':
        bg = AppColors.error.withOpacity(0.1);
        fg = AppColors.error;
        icon = Icons.error_rounded;
        label = 'Rejected';
        subtitle = rejectionReason ?? 'Your submission was not approved.';
      case 'draft':
        bg = AppColors.info.withOpacity(0.1);
        fg = AppColors.info;
        icon = Icons.edit_note_rounded;
        label = 'Draft';
        subtitle = 'You have an incomplete submission.';
      default:
        return const SizedBox.shrink();
    }

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: fg.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          Icon(icon, color: fg, size: 22),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: fg,
                  ),
                ),
                // ignore: unnecessary_null_comparison
                if (subtitle != null) ...[
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 12,
                      color: fg.withOpacity(0.8),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
