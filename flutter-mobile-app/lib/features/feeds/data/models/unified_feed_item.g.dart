// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'unified_feed_item.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$UnifiedFeedItemImpl _$$UnifiedFeedItemImplFromJson(
        Map<String, dynamic> json) =>
    _$UnifiedFeedItemImpl(
      id: json['id'] as String,
      source: json['source'] as String,
      rawId: json['rawId'] as String,
      title: json['title'] as String,
      message: json['message'] as String,
      type: json['type'] as String? ?? 'general',
      rawType: json['rawType'] as String?,
      priority: json['priority'] as String? ?? 'normal',
      imageUrl: json['imageUrl'] as String?,
      read: json['read'] as bool? ?? true,
      publishedAt: json['publishedAt'] as String?,
      reactions: json['reactions'] == null
          ? null
          : ReactionCounts.fromJson(json['reactions'] as Map<String, dynamic>),
      userReaction: json['userReaction'] as String?,
    );

Map<String, dynamic> _$$UnifiedFeedItemImplToJson(
        _$UnifiedFeedItemImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'source': instance.source,
      'rawId': instance.rawId,
      'title': instance.title,
      'message': instance.message,
      'type': instance.type,
      'rawType': instance.rawType,
      'priority': instance.priority,
      'imageUrl': instance.imageUrl,
      'read': instance.read,
      'publishedAt': instance.publishedAt,
      'reactions': instance.reactions,
      'userReaction': instance.userReaction,
    };
