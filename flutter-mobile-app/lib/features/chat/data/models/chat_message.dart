import 'package:freezed_annotation/freezed_annotation.dart';
import 'message_reaction.dart';

part 'chat_message.freezed.dart';
part 'chat_message.g.dart';

@freezed
class ChatMessage with _$ChatMessage {
  const factory ChatMessage({
    required String id,
    @JsonKey(name: 'conversation_id') String? conversationId,
    @JsonKey(name: 'sender_id') required String senderId,
    @JsonKey(name: 'sender_name') String? senderName,
    @JsonKey(name: 'sender_image') String? senderImage,
    required String content,
    @JsonKey(name: 'message_type') @Default('text') String messageType,
    @JsonKey(name: 'created_at') required String createdAt,
    @JsonKey(name: 'edited_at') String? editedAt,
    // Reply support
    @JsonKey(name: 'reply_to_id') String? replyToId,
    @JsonKey(name: 'reply_to_content') String? replyToContent,
    @JsonKey(name: 'reply_to_sender_name') String? replyToSenderName,
    @JsonKey(name: 'reply_to_sender_id') String? replyToSenderId,
    // Reactions
    @Default([]) List<MessageReaction> reactions,
    // Deletion
    @JsonKey(name: 'deleted_at') String? deletedAt,
  }) = _ChatMessage;

  factory ChatMessage.fromJson(Map<String, dynamic> json) =>
      _$ChatMessageFromJson(json);
}
