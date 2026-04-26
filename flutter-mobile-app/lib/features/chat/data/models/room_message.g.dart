// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'room_message.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$RoomMessageImpl _$$RoomMessageImplFromJson(Map<String, dynamic> json) =>
    _$RoomMessageImpl(
      id: json['id'] as String,
      conversationId: json['conversation_id'] as String?,
      senderId: json['sender_id'] as String,
      senderName: json['sender_name'] as String?,
      senderImage: json['sender_image'] as String?,
      senderDesignation: json['sender_designation'] as String?,
      senderAssignedState: json['sender_assigned_state'] as String?,
      senderAssignedLga: json['sender_assigned_lga'] as String?,
      senderAssignedWard: json['sender_assigned_ward'] as String?,
      senderVotingState: json['sender_voting_state'] as String?,
      senderVotingLga: json['sender_voting_lga'] as String?,
      senderVotingWard: json['sender_voting_ward'] as String?,
      senderVotingPu: json['sender_voting_pu'] as String?,
      content: json['content'] as String,
      messageType: json['message_type'] as String? ?? 'text',
      createdAt: json['created_at'] as String,
      isPinned: json['is_pinned'] as bool? ?? false,
      isDeleted: json['is_deleted'] as bool? ?? false,
      replyToId: json['reply_to_id'] as String?,
      replyToContent: json['reply_to_content'] as String?,
      replyToSenderName: json['reply_to_sender_name'] as String?,
      replyToSenderId: json['reply_to_sender_id'] as String?,
      reactions: (json['reactions'] as List<dynamic>?)
              ?.map((e) => MessageReaction.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      deletedAt: json['deleted_at'] as String?,
    );

Map<String, dynamic> _$$RoomMessageImplToJson(_$RoomMessageImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'conversation_id': instance.conversationId,
      'sender_id': instance.senderId,
      'sender_name': instance.senderName,
      'sender_image': instance.senderImage,
      'sender_designation': instance.senderDesignation,
      'sender_assigned_state': instance.senderAssignedState,
      'sender_assigned_lga': instance.senderAssignedLga,
      'sender_assigned_ward': instance.senderAssignedWard,
      'sender_voting_state': instance.senderVotingState,
      'sender_voting_lga': instance.senderVotingLga,
      'sender_voting_ward': instance.senderVotingWard,
      'sender_voting_pu': instance.senderVotingPu,
      'content': instance.content,
      'message_type': instance.messageType,
      'created_at': instance.createdAt,
      'is_pinned': instance.isPinned,
      'is_deleted': instance.isDeleted,
      'reply_to_id': instance.replyToId,
      'reply_to_content': instance.replyToContent,
      'reply_to_sender_name': instance.replyToSenderName,
      'reply_to_sender_id': instance.replyToSenderId,
      'reactions': instance.reactions,
      'deleted_at': instance.deletedAt,
    };
