import 'package:freezed_annotation/freezed_annotation.dart';

part 'room.freezed.dart';
part 'room.g.dart';

@freezed
class Room with _$Room {
  const factory Room({
    required String id,
    String? title,
    @JsonKey(name: 'room_level') String? roomLevel,
    @JsonKey(name: 'room_state') String? roomState,
    @JsonKey(name: 'room_lga') String? roomLga,
    @JsonKey(name: 'room_ward') String? roomWard,
    @JsonKey(name: 'room_pu') String? roomPu,
    String? icon,
    @JsonKey(name: 'member_count') @Default(0) int memberCount,
    @JsonKey(name: 'unread_count') @Default(0) int unreadCount,
    @JsonKey(name: 'last_read_at') String? lastReadAt,
    @JsonKey(name: 'last_message_at') String? lastMessageAt,
    @JsonKey(name: 'last_message_preview') String? lastMessagePreview,
  }) = _Room;

  factory Room.fromJson(Map<String, dynamic> json) => _$RoomFromJson(json);
}
