// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'bloc_engagement.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$BlocEngagementImpl _$$BlocEngagementImplFromJson(Map<String, dynamic> json) =>
    _$BlocEngagementImpl(
      totalMembers: (json['totalMembers'] as num?)?.toInt() ?? 0,
      recentMembers: (json['recentMembers'] as num?)?.toInt() ?? 0,
      pendingInvitations: (json['pendingInvitations'] as num?)?.toInt() ?? 0,
      acceptedInvitations: (json['acceptedInvitations'] as num?)?.toInt() ?? 0,
      declinedInvitations: (json['declinedInvitations'] as num?)?.toInt() ?? 0,
      conversionRate: json['conversionRate'] == null
          ? 0.0
          : _toDouble(json['conversionRate']),
      growthRate: (json['growthRate'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$$BlocEngagementImplToJson(
        _$BlocEngagementImpl instance) =>
    <String, dynamic>{
      'totalMembers': instance.totalMembers,
      'recentMembers': instance.recentMembers,
      'pendingInvitations': instance.pendingInvitations,
      'acceptedInvitations': instance.acceptedInvitations,
      'declinedInvitations': instance.declinedInvitations,
      'conversionRate': instance.conversionRate,
      'growthRate': instance.growthRate,
    };
