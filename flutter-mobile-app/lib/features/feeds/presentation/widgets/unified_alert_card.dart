import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../../data/models/unified_feed_item.dart';
import '../../../../core/theme/app_colors.dart';

/// Card for a unified feed item. Adapts layout when there's no image
/// (broadcast notifications) vs when there is (mobile feeds).
class UnifiedAlertCard extends StatelessWidget {
  final UnifiedFeedItem item;
  final VoidCallback? onTap;
  const UnifiedAlertCard({super.key, required this.item, this.onTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final borderColor = theme.colorScheme.outline.withOpacity(0.12);
    final unread = !item.read;
    final accentColor = _accentForType(item.type, item.priority, item.rawType);

    return GestureDetector(
      onTap: onTap != null
          ? () {
              HapticFeedback.lightImpact();
              onTap!();
            }
          : null,
      behavior: HitTestBehavior.opaque,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: unread
              ? AppColors.primary.withOpacity(0.03)
              : theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: unread
                ? AppColors.primary.withOpacity(0.15)
                : borderColor,
          ),
        ),
        clipBehavior: Clip.antiAlias,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Type pill + time + unread dot
              Row(
                children: [
                  _TypePill(
                    label: _labelForType(item.type, item.rawType),
                    color: accentColor,
                  ),
                  const Spacer(),
                  Text(
                    _timeAgo(item.publishedAt),
                    style: TextStyle(
                      fontSize: 11,
                      color: theme.colorScheme.onSurface.withOpacity(0.35),
                    ),
                  ),
                  if (unread) ...[
                    const SizedBox(width: 8),
                    Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ],
                ],
              ),
              const SizedBox(height: 10),
              // Title
              Text(
                item.title,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: unread ? FontWeight.w700 : FontWeight.w600,
                  height: 1.3,
                  color: theme.colorScheme.onSurface,
                ),
              ),
              const SizedBox(height: 4),
              // Message preview — longer when no image
              Text(
                item.message,
                maxLines: item.imageUrl != null ? 2 : 4,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 13,
                  height: 1.45,
                  color: theme.colorScheme.onSurface.withOpacity(0.55),
                ),
              ),
              // Image (if present)
              if (item.imageUrl != null) ...[
                const SizedBox(height: 10),
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: CachedNetworkImage(
                    imageUrl: item.imageUrl!,
                    height: 140,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    placeholder: (_, __) => Container(
                      height: 140,
                      color: theme.colorScheme.onSurface.withOpacity(0.05),
                    ),
                    errorWidget: (_, __, ___) => const SizedBox(),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _TypePill extends StatelessWidget {
  final String label;
  final Color color;
  const _TypePill({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.2,
          color: color,
        ),
      ),
    );
  }
}

Color _accentForType(String type, String priority, String? rawType) {
  if (priority == 'high' ||
      type == 'urgent' ||
      rawType == 'urgent') {
    return const Color(0xFFFF3B30);
  }
  if (rawType == 'adminBroadcast' ||
      rawType == 'broadcast' ||
      type == 'announcement') {
    return const Color(0xFF007AFF);
  }
  if (rawType == 'votingBlocBroadcast' ||
      rawType == 'votingBlocMessage') {
    return AppColors.primary;
  }
  return const Color(0xFF8E8E93);
}

String _labelForType(String type, String? rawType) {
  if (type == 'urgent' || rawType == 'urgent') return 'Urgent';
  if (rawType == 'adminBroadcast' || rawType == 'broadcast') {
    return 'Broadcast';
  }
  if (rawType == 'votingBlocBroadcast' ||
      rawType == 'votingBlocMessage') {
    return 'Voting Bloc';
  }
  if (type == 'announcement') return 'Announcement';
  return 'Update';
}

String _timeAgo(String? dateStr) {
  if (dateStr == null) return '';
  final dt = DateTime.tryParse(dateStr);
  if (dt == null) return '';
  return timeago.format(dt, allowFromNow: true);
}
