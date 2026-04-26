// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'blog_post.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$BlogPostImpl _$$BlogPostImplFromJson(Map<String, dynamic> json) =>
    _$BlogPostImpl(
      id: json['id'] as String,
      title: json['title'] as String,
      slug: json['slug'] as String,
      content: json['content'] as String?,
      excerpt: json['excerpt'] as String?,
      featuredImageUrl: json['featured_image_url'] as String?,
      authorId: json['author_id'] as String?,
      status: json['status'] as String? ?? 'published',
      category: json['category'] as String? ?? 'National Updates',
      tags:
          (json['tags'] as List<dynamic>?)?.map((e) => e as String).toList() ??
              const [],
      publishedAt: json['published_at'] as String?,
      createdAt: json['created_at'] as String?,
      updatedAt: json['updated_at'] as String?,
      authorName: json['author_name'] as String?,
      authorImage: json['author_image'] as String?,
      reactions: json['reactions'] == null
          ? null
          : ReactionCounts.fromJson(json['reactions'] as Map<String, dynamic>),
      userReaction: json['userReaction'] as String?,
    );

Map<String, dynamic> _$$BlogPostImplToJson(_$BlogPostImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'slug': instance.slug,
      'content': instance.content,
      'excerpt': instance.excerpt,
      'featured_image_url': instance.featuredImageUrl,
      'author_id': instance.authorId,
      'status': instance.status,
      'category': instance.category,
      'tags': instance.tags,
      'published_at': instance.publishedAt,
      'created_at': instance.createdAt,
      'updated_at': instance.updatedAt,
      'author_name': instance.authorName,
      'author_image': instance.authorImage,
      'reactions': instance.reactions,
      'userReaction': instance.userReaction,
    };
