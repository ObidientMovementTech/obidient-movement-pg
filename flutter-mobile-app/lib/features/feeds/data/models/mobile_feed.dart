import 'package:freezed_annotation/freezed_annotation.dart';
import 'reaction_counts.dart';

part 'mobile_feed.freezed.dart';
part 'mobile_feed.g.dart';

@freezed
class MobileFeed with _$MobileFeed {
  const factory MobileFeed({
    required int id,
    required String title,
    required String message,
    @JsonKey(name: 'feed_type') @Default('general') String feedType,
    @Default('normal') String priority,
    @JsonKey(name: 'image_url') String? imageUrl,
    @JsonKey(name: 'published_at') String? publishedAt,
    @JsonKey(name: 'created_at') String? createdAt,
    ReactionCounts? reactions,
    String? userReaction,
  }) = _MobileFeed;

  factory MobileFeed.fromJson(Map<String, dynamic> json) =>
      _$MobileFeedFromJson(json);
}
