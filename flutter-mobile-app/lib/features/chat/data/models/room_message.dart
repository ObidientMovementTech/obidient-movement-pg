import 'package:freezed_annotation/freezed_annotation.dart';
import 'message_reaction.dart';

part 'room_message.freezed.dart';
part 'room_message.g.dart';

@freezed
class RoomMessage with _$RoomMessage {
  const factory RoomMessage({
    required String id,
    @JsonKey(name: 'conversation_id') String? conversationId,
    @JsonKey(name: 'sender_id') required String senderId,
    @JsonKey(name: 'sender_name') String? senderName,
    @JsonKey(name: 'sender_image') String? senderImage,
    @JsonKey(name: 'sender_designation') String? senderDesignation,
    @JsonKey(name: 'sender_assigned_state') String? senderAssignedState,
    @JsonKey(name: 'sender_assigned_lga') String? senderAssignedLga,
    @JsonKey(name: 'sender_assigned_ward') String? senderAssignedWard,
    @JsonKey(name: 'sender_voting_state') String? senderVotingState,
    @JsonKey(name: 'sender_voting_lga') String? senderVotingLga,
    @JsonKey(name: 'sender_voting_ward') String? senderVotingWard,
    @JsonKey(name: 'sender_voting_pu') String? senderVotingPu,
    required String content,
    @JsonKey(name: 'message_type') @Default('text') String messageType,
    @JsonKey(name: 'created_at') required String createdAt,
    @JsonKey(name: 'is_pinned') @Default(false) bool isPinned,
    @JsonKey(name: 'is_deleted') @Default(false) bool isDeleted,
    // Reply support
    @JsonKey(name: 'reply_to_id') String? replyToId,
    @JsonKey(name: 'reply_to_content') String? replyToContent,
    @JsonKey(name: 'reply_to_sender_name') String? replyToSenderName,
    @JsonKey(name: 'reply_to_sender_id') String? replyToSenderId,
    // Reactions
    @Default([]) List<MessageReaction> reactions,
    // Deletion
    @JsonKey(name: 'deleted_at') String? deletedAt,
  }) = _RoomMessage;

  factory RoomMessage.fromJson(Map<String, dynamic> json) =>
      _$RoomMessageFromJson(json);
}
