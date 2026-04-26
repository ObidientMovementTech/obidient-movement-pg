// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'bloc_member.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$BlocMemberImpl _$$BlocMemberImplFromJson(Map<String, dynamic> json) =>
    _$BlocMemberImpl(
      id: json['_id'] as String,
      name: json['name'] as String?,
      email: json['email'] as String?,
      phone: json['phone'] as String?,
      countryCode: json['countryCode'] as String?,
      isManualMember: json['isManualMember'] as bool? ?? false,
      metadata: json['metadata'] == null
          ? null
          : MemberMetadata.fromJson(json['metadata'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$$BlocMemberImplToJson(_$BlocMemberImpl instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'name': instance.name,
      'email': instance.email,
      'phone': instance.phone,
      'countryCode': instance.countryCode,
      'isManualMember': instance.isManualMember,
      'metadata': instance.metadata,
    };

_$MemberMetadataImpl _$$MemberMetadataImplFromJson(Map<String, dynamic> json) =>
    _$MemberMetadataImpl(
      joinDate: json['joinDate'] as String?,
      decisionTag: json['decisionTag'] as String? ?? 'Undecided',
      contactTag: json['contactTag'] as String? ?? 'No Response',
      engagementLevel: json['engagementLevel'] as String? ?? 'Medium',
      pvcStatus: json['pvcStatus'] as String? ?? 'Unregistered',
      notes: json['notes'] as String? ?? '',
      lastContactDate: json['lastContactDate'] as String?,
      location: json['location'] == null
          ? null
          : MemberLocation.fromJson(json['location'] as Map<String, dynamic>),
      memberType: json['memberType'] as String?,
    );

Map<String, dynamic> _$$MemberMetadataImplToJson(
        _$MemberMetadataImpl instance) =>
    <String, dynamic>{
      'joinDate': instance.joinDate,
      'decisionTag': instance.decisionTag,
      'contactTag': instance.contactTag,
      'engagementLevel': instance.engagementLevel,
      'pvcStatus': instance.pvcStatus,
      'notes': instance.notes,
      'lastContactDate': instance.lastContactDate,
      'location': instance.location,
      'memberType': instance.memberType,
    };

_$MemberLocationImpl _$$MemberLocationImplFromJson(Map<String, dynamic> json) =>
    _$MemberLocationImpl(
      state: json['state'] as String?,
      lga: json['lga'] as String?,
      ward: json['ward'] as String?,
    );

Map<String, dynamic> _$$MemberLocationImplToJson(
        _$MemberLocationImpl instance) =>
    <String, dynamic>{
      'state': instance.state,
      'lga': instance.lga,
      'ward': instance.ward,
    };
