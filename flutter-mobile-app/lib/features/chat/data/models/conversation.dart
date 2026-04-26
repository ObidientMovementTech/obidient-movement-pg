import 'package:freezed_annotation/freezed_annotation.dart';

part 'conversation.freezed.dart';
part 'conversation.g.dart';

@freezed
class Conversation with _$Conversation {
  const factory Conversation({
    required String id,
    @Default('direct') String type,
    @JsonKey(name: 'last_message_at') String? lastMessageAt,
    @JsonKey(name: 'last_message_preview') String? lastMessagePreview,
    @JsonKey(name: 'created_at') String? createdAt,
    @JsonKey(name: 'unread_count') @Default(0) int unreadCount,
    @JsonKey(name: 'last_read_at') String? lastReadAt,
    // Other participant info (for direct chats)
    @JsonKey(name: 'participant_id') String? participantId,
    @JsonKey(name: 'participant_name') String? participantName,
    @JsonKey(name: 'participant_email') String? participantEmail,
    @JsonKey(name: 'participant_image') String? participantImage,
    @JsonKey(name: 'participant_designation') String? participantDesignation,
    @JsonKey(name: 'participant_assigned_state') String? participantAssignedState,
    @JsonKey(name: 'participant_assigned_lga') String? participantAssignedLga,
    @JsonKey(name: 'participant_assigned_ward') String? participantAssignedWard,
    @JsonKey(name: 'participant_voting_state') String? participantVotingState,
    @JsonKey(name: 'participant_voting_lga') String? participantVotingLga,
    @JsonKey(name: 'participant_voting_ward') String? participantVotingWard,
    @JsonKey(name: 'participant_voting_pu') String? participantVotingPu,
  }) = _Conversation;

  factory Conversation.fromJson(Map<String, dynamic> json) =>
      _$ConversationFromJson(json);
}
