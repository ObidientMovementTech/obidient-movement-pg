import 'package:freezed_annotation/freezed_annotation.dart';

part 'bloc_invitation.freezed.dart';
part 'bloc_invitation.g.dart';

/// From GET /:id/invitations
@freezed
class BlocInvitation with _$BlocInvitation {
  const factory BlocInvitation({
    @JsonKey(name: '_id') String? id,
    String? invitedBy,
    String? invitedUser,
    String? invitedEmail,
    @Default('pending') String status,
    String? inviteType,
    String? message,
    String? inviteDate,
    String? responseDate,
  }) = _BlocInvitation;

  factory BlocInvitation.fromJson(Map<String, dynamic> json) =>
      _$BlocInvitationFromJson(json);
}
