// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'chat_contact.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$ChatContactImpl _$$ChatContactImplFromJson(Map<String, dynamic> json) =>
    _$ChatContactImpl(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String?,
      phone: json['phone'] as String?,
      profileImage: json['profileImage'] as String?,
      designation: json['designation'] as String?,
      level: json['level'] as String?,
    );

Map<String, dynamic> _$$ChatContactImplToJson(_$ChatContactImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'email': instance.email,
      'phone': instance.phone,
      'profileImage': instance.profileImage,
      'designation': instance.designation,
      'level': instance.level,
    };

_$ChatContactsImpl _$$ChatContactsImplFromJson(Map<String, dynamic> json) =>
    _$ChatContactsImpl(
      coordinators: (json['coordinators'] as List<dynamic>?)
              ?.map((e) => ChatContact.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      subordinates: (json['subordinates'] as List<dynamic>?)
              ?.map((e) => ChatContact.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
    );

Map<String, dynamic> _$$ChatContactsImplToJson(_$ChatContactsImpl instance) =>
    <String, dynamic>{
      'coordinators': instance.coordinators,
      'subordinates': instance.subordinates,
    };
