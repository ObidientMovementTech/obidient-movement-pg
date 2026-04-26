// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'message_reaction.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$MessageReactionImpl _$$MessageReactionImplFromJson(
        Map<String, dynamic> json) =>
    _$MessageReactionImpl(
      emoji: json['emoji'] as String,
      count: (json['count'] as num).toInt(),
      reacted: json['reacted'] as bool? ?? false,
      userIds: (json['user_ids'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
    );

Map<String, dynamic> _$$MessageReactionImplToJson(
        _$MessageReactionImpl instance) =>
    <String, dynamic>{
      'emoji': instance.emoji,
      'count': instance.count,
      'reacted': instance.reacted,
      'user_ids': instance.userIds,
    };
