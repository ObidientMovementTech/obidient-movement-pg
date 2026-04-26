// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'dashboard_data.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$DashboardStatsImpl _$$DashboardStatsImplFromJson(Map<String, dynamic> json) =>
    _$DashboardStatsImpl(
      obidientRegisteredVoters:
          (json['obidientRegisteredVoters'] as num?)?.toInt() ?? 0,
      obidientVotersWithPVC:
          (json['obidientVotersWithPVC'] as num?)?.toInt() ?? 0,
      obidientVotersWithoutPVC:
          (json['obidientVotersWithoutPVC'] as num?)?.toInt() ?? 0,
      pvcWithStatus: (json['pvcWithStatus'] as num?)?.toInt() ?? 0,
      pvcWithoutStatus: (json['pvcWithoutStatus'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$$DashboardStatsImplToJson(
        _$DashboardStatsImpl instance) =>
    <String, dynamic>{
      'obidientRegisteredVoters': instance.obidientRegisteredVoters,
      'obidientVotersWithPVC': instance.obidientVotersWithPVC,
      'obidientVotersWithoutPVC': instance.obidientVotersWithoutPVC,
      'pvcWithStatus': instance.pvcWithStatus,
      'pvcWithoutStatus': instance.pvcWithoutStatus,
    };

_$DashboardItemImpl _$$DashboardItemImplFromJson(Map<String, dynamic> json) =>
    _$DashboardItemImpl(
      id: json['id'] as String,
      name: json['name'] as String,
      code: json['code'] as String?,
      level: json['level'] as String?,
      obidientRegisteredVoters:
          (json['obidientRegisteredVoters'] as num?)?.toInt() ?? 0,
      obidientVotersWithPVC:
          (json['obidientVotersWithPVC'] as num?)?.toInt() ?? 0,
      obidientVotersWithoutPVC:
          (json['obidientVotersWithoutPVC'] as num?)?.toInt() ?? 0,
      pvcWithStatus: (json['pvcWithStatus'] as num?)?.toInt() ?? 0,
      pvcWithoutStatus: (json['pvcWithoutStatus'] as num?)?.toInt() ?? 0,
    );

Map<String, dynamic> _$$DashboardItemImplToJson(_$DashboardItemImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'code': instance.code,
      'level': instance.level,
      'obidientRegisteredVoters': instance.obidientRegisteredVoters,
      'obidientVotersWithPVC': instance.obidientVotersWithPVC,
      'obidientVotersWithoutPVC': instance.obidientVotersWithoutPVC,
      'pvcWithStatus': instance.pvcWithStatus,
      'pvcWithoutStatus': instance.pvcWithoutStatus,
    };

_$BreadcrumbItemImpl _$$BreadcrumbItemImplFromJson(Map<String, dynamic> json) =>
    _$BreadcrumbItemImpl(
      level: json['level'] as String,
      name: json['name'] as String,
      id: json['id'] as String?,
    );

Map<String, dynamic> _$$BreadcrumbItemImplToJson(
        _$BreadcrumbItemImpl instance) =>
    <String, dynamic>{
      'level': instance.level,
      'name': instance.name,
      'id': instance.id,
    };

_$UserLevelInfoImpl _$$UserLevelInfoImplFromJson(Map<String, dynamic> json) =>
    _$UserLevelInfoImpl(
      userLevel: json['userLevel'] as String,
      assignedLocation: json['assignedLocation'] as Map<String, dynamic>?,
      allowedLevels: (json['allowedLevels'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      designation: json['designation'] as String?,
      role: json['role'] as String?,
    );

Map<String, dynamic> _$$UserLevelInfoImplToJson(_$UserLevelInfoImpl instance) =>
    <String, dynamic>{
      'userLevel': instance.userLevel,
      'assignedLocation': instance.assignedLocation,
      'allowedLevels': instance.allowedLevels,
      'designation': instance.designation,
      'role': instance.role,
    };

_$DashboardResponseImpl _$$DashboardResponseImplFromJson(
        Map<String, dynamic> json) =>
    _$DashboardResponseImpl(
      level: json['level'] as String,
      stats: DashboardStats.fromJson(json['stats'] as Map<String, dynamic>),
      items: (json['items'] as List<dynamic>?)
              ?.map((e) => DashboardItem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      breadcrumbs: (json['breadcrumbs'] as List<dynamic>?)
              ?.map((e) => BreadcrumbItem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
    );

Map<String, dynamic> _$$DashboardResponseImplToJson(
        _$DashboardResponseImpl instance) =>
    <String, dynamic>{
      'level': instance.level,
      'stats': instance.stats,
      'items': instance.items,
      'breadcrumbs': instance.breadcrumbs,
    };
