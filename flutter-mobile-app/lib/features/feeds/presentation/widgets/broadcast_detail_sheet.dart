import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:timeago/timeago.dart' as timeago;

import '../../../../core/theme/app_colors.dart';
import '../../../common/presentation/utils/linkify_text.dart';
import '../../data/models/unified_feed_item.dart';
import '../../../dashboard/presentation/providers/dashboard_providers.dart';
import '../providers/feeds_providers.dart';
import 'reaction_bar.dart';

/// Opens a bottom-sheet detail for a unified feed item.
/// Auto-marks as read on open (for notification-sourced items).
Future<void> showBroadcastDetailSheet(
  BuildContext context,
  UnifiedFeedItem item, {
  required WidgetRef ref,
}) async {
  HapticFeedback.lightImpact();

  // Fire-and-forget mark as read for notification-sourced items
  if (item.source == 'notification' && !item.read) {
    final ds = ref.read(feedsDataSourceProvider);
    ds.markNotificationRead(item.rawId).then((_) {
      // Refresh recent list on home so dot disappears
      ref.invalidate(recentNotificationsProvider);
      ref.invalidate(unifiedFeedProvider);
    }).catchError((_) {});
  }

  final theme = Theme.of(context);
  await showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: theme.colorScheme.surface,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
    ),
    builder: (ctx) => _BroadcastDetailSheet(item: item),
  );
}

class _BroadcastDetailSheet extends StatelessWidget {
  final UnifiedFeedItem item;
  const _BroadcastDetailSheet({required this.item});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final accent = _accentForType(item.type, item.priority);

    return DraggableScrollableSheet(
      initialChildSize: 0.65,
      minChildSize: 0.35,
      maxChildSize: 0.92,
      expand: false,
      builder: (_, scrollController) => SingleChildScrollView(
        controller: scrollController,
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 40),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Drag handle
            Center(
              child: Container(
                width: 36,
                height: 4,
                decoration: BoxDecoration(
                  color: theme.colorScheme.onSurface.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Type pill + time
            Row(
              children: [
                _TypePill(label: _labelForType(item.type), color: accent),
                const Spacer(),
                Text(
                  _timeAgo(item.publishedAt),
                  style: TextStyle(
                    fontSize: 11,
                    color: theme.colorScheme.onSurface.withOpacity(0.45),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Title
            Text(
              item.title,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                letterSpacing: -0.3,
                height: 1.3,
                color: theme.colorScheme.onSurface,
              ),
            ),
            const SizedBox(height: 14),

            // Image (if present)
            if (item.imageUrl != null) ...[
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: CachedNetworkImage(
                  imageUrl: item.imageUrl!,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  placeholder: (_, __) => Container(
                    height: 180,
                    color: theme.colorScheme.onSurface.withOpacity(0.05),
                  ),
                  errorWidget: (_, __, ___) => const SizedBox.shrink(),
                ),
              ),
              const SizedBox(height: 14),
            ],

            // Message (linkified, tappable URLs → in-app webview)
            Builder(builder: (ctx) {
              final baseStyle = TextStyle(
                fontSize: 15,
                height: 1.6,
                color: theme.colorScheme.onSurface.withOpacity(0.82),
              );
              return Text.rich(
                TextSpan(
                  children: buildLinkifiedSpans(
                    ctx,
                    item.message,
                    baseStyle: baseStyle,
                    linkColor: AppColors.primary,
                  ),
                ),
              );
            }),

            // Reactions — only for feed-sourced items
            if (item.source == 'feed') ...[
              const SizedBox(height: 20),
              ReactionBar(
                targetType: 'mobile_feed',
                targetId: item.rawId,
                initialCounts: item.reactions,
                initialUserReaction: item.userReaction,
              ),
            ],
          ],
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

Color _accentForType(String type, String priority) {
  if (priority == 'high' || type == 'urgent') {
    return const Color(0xFFFF3B30); // red
  }
  if (type == 'announcement') {
    return const Color(0xFF007AFF); // blue
  }
  return const Color(0xFF8E8E93); // grey
}

String _labelForType(String type) {
  return switch (type) {
    'urgent' => 'Urgent',
    'announcement' => 'Announcement',
    _ => 'Update',
  };
}

String _timeAgo(String? dateStr) {
  if (dateStr == null) return '';
  final dt = DateTime.tryParse(dateStr);
  if (dt == null) return '';
  return timeago.format(dt, allowFromNow: true);
}
