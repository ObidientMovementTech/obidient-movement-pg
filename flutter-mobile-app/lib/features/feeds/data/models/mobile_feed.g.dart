// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'mobile_feed.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$MobileFeedImpl _$$MobileFeedImplFromJson(Map<String, dynamic> json) =>
    _$MobileFeedImpl(
      id: (json['id'] as num).toInt(),
      title: json['title'] as String,
      message: json['message'] as String,
      feedType: json['feed_type'] as String? ?? 'general',
      priority: json['priority'] as String? ?? 'normal',
      imageUrl: json['image_url'] as String?,
      publishedAt: json['published_at'] as String?,
      createdAt: json['created_at'] as String?,
      reactions: json['reactions'] == null
          ? null
          : ReactionCounts.fromJson(json['reactions'] as Map<String, dynamic>),
      userReaction: json['userReaction'] as String?,
    );

Map<String, dynamic> _$$MobileFeedImplToJson(_$MobileFeedImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'message': instance.message,
      'feed_type': instance.feedType,
      'priority': instance.priority,
      'image_url': instance.imageUrl,
      'published_at': instance.publishedAt,
      'created_at': instance.createdAt,
      'reactions': instance.reactions,
      'userReaction': instance.userReaction,
    };
