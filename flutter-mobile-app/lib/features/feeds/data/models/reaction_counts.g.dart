// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'reaction_counts.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$ReactionCountsImpl _$$ReactionCountsImplFromJson(Map<String, dynamic> json) =>
    _$ReactionCountsImpl(
      like: (json['like'] as num?)?.toInt() ?? 0,
      love: (json['love'] as num?)?.toInt() ?? 0,
      smile: (json['smile'] as num?)?.toInt() ?? 0,
      meh: (json['meh'] as num?)?.toInt() ?? 0,
      total: (json['total'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$$ReactionCountsImplToJson(
        _$ReactionCountsImpl instance) =>
    <String, dynamic>{
      'like': instance.like,
      'love': instance.love,
      'smile': instance.smile,
      'meh': instance.meh,
      'total': instance.total,
    };
