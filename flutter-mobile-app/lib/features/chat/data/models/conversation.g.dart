// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'conversation.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$ConversationImpl _$$ConversationImplFromJson(Map<String, dynamic> json) =>
    _$ConversationImpl(
      id: json['id'] as String,
      type: json['type'] as String? ?? 'direct',
      lastMessageAt: json['last_message_at'] as String?,
      lastMessagePreview: json['last_message_preview'] as String?,
      createdAt: json['created_at'] as String?,
      unreadCount: (json['unread_count'] as num?)?.toInt() ?? 0,
      lastReadAt: json['last_read_at'] as String?,
      participantId: json['participant_id'] as String?,
      participantName: json['participant_name'] as String?,
      participantEmail: json['participant_email'] as String?,
      participantImage: json['participant_image'] as String?,
      participantDesignation: json['participant_designation'] as String?,
      participantAssignedState: json['participant_assigned_state'] as String?,
      participantAssignedLga: json['participant_assigned_lga'] as String?,
      participantAssignedWard: json['participant_assigned_ward'] as String?,
      participantVotingState: json['participant_voting_state'] as String?,
      participantVotingLga: json['participant_voting_lga'] as String?,
      participantVotingWard: json['participant_voting_ward'] as String?,
      participantVotingPu: json['participant_voting_pu'] as String?,
    );

Map<String, dynamic> _$$ConversationImplToJson(_$ConversationImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': instance.type,
      'last_message_at': instance.lastMessageAt,
      'last_message_preview': instance.lastMessagePreview,
      'created_at': instance.createdAt,
      'unread_count': instance.unreadCount,
      'last_read_at': instance.lastReadAt,
      'participant_id': instance.participantId,
      'participant_name': instance.participantName,
      'participant_email': instance.participantEmail,
      'participant_image': instance.participantImage,
      'participant_designation': instance.participantDesignation,
      'participant_assigned_state': instance.participantAssignedState,
      'participant_assigned_lga': instance.participantAssignedLga,
      'participant_assigned_ward': instance.participantAssignedWard,
      'participant_voting_state': instance.participantVotingState,
      'participant_voting_lga': instance.participantVotingLga,
      'participant_voting_ward': instance.participantVotingWard,
      'participant_voting_pu': instance.participantVotingPu,
    };
