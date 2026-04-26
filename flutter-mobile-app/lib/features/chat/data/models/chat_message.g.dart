// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'chat_message.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$ChatMessageImpl _$$ChatMessageImplFromJson(Map<String, dynamic> json) =>
    _$ChatMessageImpl(
      id: json['id'] as String,
      conversationId: json['conversation_id'] as String?,
      senderId: json['sender_id'] as String,
      senderName: json['sender_name'] as String?,
      senderImage: json['sender_image'] as String?,
      content: json['content'] as String,
      messageType: json['message_type'] as String? ?? 'text',
      createdAt: json['created_at'] as String,
      editedAt: json['edited_at'] as String?,
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

Map<String, dynamic> _$$ChatMessageImplToJson(_$ChatMessageImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'conversation_id': instance.conversationId,
      'sender_id': instance.senderId,
      'sender_name': instance.senderName,
      'sender_image': instance.senderImage,
      'content': instance.content,
      'message_type': instance.messageType,
      'created_at': instance.createdAt,
      'edited_at': instance.editedAt,
      'reply_to_id': instance.replyToId,
      'reply_to_content': instance.replyToContent,
      'reply_to_sender_name': instance.replyToSenderName,
      'reply_to_sender_id': instance.replyToSenderId,
      'reactions': instance.reactions,
      'deleted_at': instance.deletedAt,
    };
