import 'package:freezed_annotation/freezed_annotation.dart';
import 'reaction_counts.dart';

part 'unified_feed_item.freezed.dart';
part 'unified_feed_item.g.dart';

/// Unified broadcast/alert item — union of mobile_feeds and broadcast notifications.
@freezed
class UnifiedFeedItem with _$UnifiedFeedItem {
  const factory UnifiedFeedItem({
    /// Prefixed id: "feed_<n>" or "notif_<n>".
    required String id,

    /// "feed" | "notification".
    required String source,

    /// Raw numeric id (without prefix) — use when calling source-specific APIs.
    required String rawId,

    required String title,
    required String message,

    /// Display-normalized type: urgent | announcement | general.
    @Default('general') String type,

    /// Original type from the server (adminBroadcast, votingBlocBroadcast, urgent, etc.).
    String? rawType,

    @Default('normal') String priority,

    String? imageUrl,

    @Default(true) bool read,

    String? publishedAt,

    ReactionCounts? reactions,
    String? userReaction,
  }) = _UnifiedFeedItem;

  factory UnifiedFeedItem.fromJson(Map<String, dynamic> json) =>
      _$UnifiedFeedItemFromJson(json);
}
