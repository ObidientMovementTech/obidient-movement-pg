import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../../data/models/mobile_feed.dart';
import 'reaction_bar.dart';

class AlertCard extends StatelessWidget {
  final MobileFeed feed;
  final VoidCallback? onTap;
  const AlertCard({super.key, required this.feed, this.onTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final borderColor = theme.colorScheme.outline.withOpacity(0.12);
    final accentColor = _accentForType(feed.feedType, feed.priority);

    return GestureDetector(
      onTap: onTap != null
          ? () {
              HapticFeedback.lightImpact();
              onTap!();
            }
          : null,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: borderColor),
        ),
        clipBehavior: Clip.antiAlias,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Type pill + time
              Row(
                children: [
                  _TypePill(
                    type: feed.feedType,
                    color: accentColor,
                    theme: theme,
                  ),
                  const Spacer(),
                  Text(
                    _timeAgo(feed.publishedAt ?? feed.createdAt),
                    style: TextStyle(
                      fontSize: 11,
                      color: theme.colorScheme.onSurface.withOpacity(0.3),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              // Title
              Text(
                feed.title,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  height: 1.3,
                  color: theme.colorScheme.onSurface,
                ),
              ),
              const SizedBox(height: 4),
              // Message
              Text(
                feed.message,
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 13,
                  height: 1.4,
                  color: theme.colorScheme.onSurface.withOpacity(0.5),
                ),
              ),
              // Optional image
              if (feed.imageUrl != null) ...[
                const SizedBox(height: 10),
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: CachedNetworkImage(
                    imageUrl: feed.imageUrl!,
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
              // Reactions
              const SizedBox(height: 10),
              ReactionBar(
                targetType: 'mobile_feed',
                targetId: feed.id.toString(),
                initialCounts: feed.reactions,
                initialUserReaction: feed.userReaction,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _accentForType(String type, String priority) {
    if (priority == 'high' || type == 'urgent') {
      return const Color(0xFFFF3B30); // red
    }
    if (type == 'announcement') {
      return const Color(0xFF007AFF); // blue
    }
    return const Color(0xFF8E8E93); // grey for general
  }
}

class _TypePill extends StatelessWidget {
  final String type;
  final Color color;
  final ThemeData theme;
  const _TypePill({
    required this.type,
    required this.color,
    required this.theme,
  });

  @override
  Widget build(BuildContext context) {
    final label = switch (type) {
      'urgent' => 'Urgent',
      'announcement' => 'Announcement',
      _ => 'Update',
    };
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

String _timeAgo(String? dateStr) {
  if (dateStr == null) return '';
  final dt = DateTime.tryParse(dateStr);
  if (dt == null) return '';
  return timeago.format(dt, allowFromNow: true);
}
