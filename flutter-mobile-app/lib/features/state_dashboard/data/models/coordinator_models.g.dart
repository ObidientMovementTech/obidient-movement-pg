// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'coordinator_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$SearchedUserImpl _$$SearchedUserImplFromJson(Map<String, dynamic> json) =>
    _$SearchedUserImpl(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String?,
      phone: json['phone'] as String?,
      profileImage: json['profileImage'] as String?,
      designation: json['designation'] as String?,
      assignedState: json['assignedState'] as String?,
      assignedLGA: json['assignedLGA'] as String?,
      assignedWard: json['assignedWard'] as String?,
    );

Map<String, dynamic> _$$SearchedUserImplToJson(_$SearchedUserImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'email': instance.email,
      'phone': instance.phone,
      'profileImage': instance.profileImage,
      'designation': instance.designation,
      'assignedState': instance.assignedState,
      'assignedLGA': instance.assignedLGA,
      'assignedWard': instance.assignedWard,
    };

_$NigeriaLocationImpl _$$NigeriaLocationImplFromJson(
        Map<String, dynamic> json) =>
    _$NigeriaLocationImpl(
      id: (json['id'] as num).toInt(),
      name: json['name'] as String,
      abbreviation: json['abbreviation'] as String?,
      level: json['level'] as String?,
      parentId: (json['parent_id'] as num?)?.toInt(),
      sourceId: json['source_id'] as String?,
      parentName: json['parent_name'] as String?,
    );

Map<String, dynamic> _$$NigeriaLocationImplToJson(
        _$NigeriaLocationImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'abbreviation': instance.abbreviation,
      'level': instance.level,
      'parent_id': instance.parentId,
      'source_id': instance.sourceId,
      'parent_name': instance.parentName,
    };
