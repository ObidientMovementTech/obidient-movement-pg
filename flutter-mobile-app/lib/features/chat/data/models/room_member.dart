import 'package:freezed_annotation/freezed_annotation.dart';

part 'room_member.freezed.dart';
part 'room_member.g.dart';

@freezed
class RoomMember with _$RoomMember {
  const factory RoomMember({
    required String id,
    String? name,
    @JsonKey(name: 'profileImage') String? profileImage,
    String? designation,
    @Default('member') String role,
    @JsonKey(name: 'is_muted') @Default(false) bool isMuted,
    @JsonKey(name: 'muted_until') String? mutedUntil,
    @Default(false) bool online,
    @JsonKey(name: 'votingState') String? votingState,
    @JsonKey(name: 'votingLGA') String? votingLga,
    @JsonKey(name: 'votingWard') String? votingWard,
    @JsonKey(name: 'votingPU') String? votingPu,
  }) = _RoomMember;

  factory RoomMember.fromJson(Map<String, dynamic> json) =>
      _$RoomMemberFromJson(json);
}
