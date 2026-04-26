// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'room_member.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$RoomMemberImpl _$$RoomMemberImplFromJson(Map<String, dynamic> json) =>
    _$RoomMemberImpl(
      id: json['id'] as String,
      name: json['name'] as String?,
      profileImage: json['profileImage'] as String?,
      designation: json['designation'] as String?,
      role: json['role'] as String? ?? 'member',
      isMuted: json['is_muted'] as bool? ?? false,
      mutedUntil: json['muted_until'] as String?,
      online: json['online'] as bool? ?? false,
      votingState: json['votingState'] as String?,
      votingLga: json['votingLGA'] as String?,
      votingWard: json['votingWard'] as String?,
      votingPu: json['votingPU'] as String?,
    );

Map<String, dynamic> _$$RoomMemberImplToJson(_$RoomMemberImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'profileImage': instance.profileImage,
      'designation': instance.designation,
      'role': instance.role,
      'is_muted': instance.isMuted,
      'muted_until': instance.mutedUntil,
      'online': instance.online,
      'votingState': instance.votingState,
      'votingLGA': instance.votingLga,
      'votingWard': instance.votingWard,
      'votingPU': instance.votingPu,
    };
