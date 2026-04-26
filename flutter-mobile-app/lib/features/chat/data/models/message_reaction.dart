import 'package:freezed_annotation/freezed_annotation.dart';

part 'message_reaction.freezed.dart';
part 'message_reaction.g.dart';

@freezed
class MessageReaction with _$MessageReaction {
  const factory MessageReaction({
    required String emoji,
    required int count,
    @Default(false) bool reacted,
    @JsonKey(name: 'user_ids') @Default([]) List<String> userIds,
  }) = _MessageReaction;

  factory MessageReaction.fromJson(Map<String, dynamic> json) =>
      _$MessageReactionFromJson(json);
}
