// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'leaderboard_entry.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$LeaderboardEntryImpl _$$LeaderboardEntryImplFromJson(
        Map<String, dynamic> json) =>
    _$LeaderboardEntryImpl(
      id: json['_id'] as String,
      name: json['name'] as String,
      creator: json['creator'] == null
          ? null
          : BlocCreator.fromJson(json['creator'] as Map<String, dynamic>),
      metrics: json['metrics'] == null
          ? null
          : BlocMetrics.fromJson(json['metrics'] as Map<String, dynamic>),
      location: json['location'] == null
          ? null
          : BlocLocation.fromJson(json['location'] as Map<String, dynamic>),
      scope: json['scope'] as String? ?? '',
      bannerImageUrl: json['bannerImageUrl'] as String?,
      status: json['status'] as String? ?? 'active',
      createdAt: json['createdAt'] as String?,
    );

Map<String, dynamic> _$$LeaderboardEntryImplToJson(
        _$LeaderboardEntryImpl instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'name': instance.name,
      'creator': instance.creator,
      'metrics': instance.metrics,
      'location': instance.location,
      'scope': instance.scope,
      'bannerImageUrl': instance.bannerImageUrl,
      'status': instance.status,
      'createdAt': instance.createdAt,
    };
