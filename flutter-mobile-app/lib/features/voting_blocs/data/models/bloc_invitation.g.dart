// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'bloc_invitation.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$BlocInvitationImpl _$$BlocInvitationImplFromJson(Map<String, dynamic> json) =>
    _$BlocInvitationImpl(
      id: json['_id'] as String?,
      invitedBy: json['invitedBy'] as String?,
      invitedUser: json['invitedUser'] as String?,
      invitedEmail: json['invitedEmail'] as String?,
      status: json['status'] as String? ?? 'pending',
      inviteType: json['inviteType'] as String?,
      message: json['message'] as String?,
      inviteDate: json['inviteDate'] as String?,
      responseDate: json['responseDate'] as String?,
    );

Map<String, dynamic> _$$BlocInvitationImplToJson(
        _$BlocInvitationImpl instance) =>
    <String, dynamic>{
      '_id': instance.id,
      'invitedBy': instance.invitedBy,
      'invitedUser': instance.invitedUser,
      'invitedEmail': instance.invitedEmail,
      'status': instance.status,
      'inviteType': instance.inviteType,
      'message': instance.message,
      'inviteDate': instance.inviteDate,
      'responseDate': instance.responseDate,
    };
