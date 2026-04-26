import 'package:freezed_annotation/freezed_annotation.dart';
import 'reaction_counts.dart';

part 'blog_post.freezed.dart';
part 'blog_post.g.dart';

@freezed
class BlogPost with _$BlogPost {
  const factory BlogPost({
    required String id,
    required String title,
    required String slug,
    String? content,
    String? excerpt,
    @JsonKey(name: 'featured_image_url') String? featuredImageUrl,
    @JsonKey(name: 'author_id') String? authorId,
    @Default('published') String status,
    @Default('National Updates') String category,
    @Default([]) List<String> tags,
    @JsonKey(name: 'published_at') String? publishedAt,
    @JsonKey(name: 'created_at') String? createdAt,
    @JsonKey(name: 'updated_at') String? updatedAt,
    @JsonKey(name: 'author_name') String? authorName,
    @JsonKey(name: 'author_image') String? authorImage,
    ReactionCounts? reactions,
    String? userReaction,
  }) = _BlogPost;

  factory BlogPost.fromJson(Map<String, dynamic> json) =>
      _$BlogPostFromJson(json);
}
