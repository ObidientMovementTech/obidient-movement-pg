import 'package:freezed_annotation/freezed_annotation.dart';

part 'bloc_member.freezed.dart';
part 'bloc_member.g.dart';

/// A member with full metadata — from GET /:id/member-metadata
@freezed
class BlocMember with _$BlocMember {
  const factory BlocMember({
    @JsonKey(name: '_id') required String id,
    String? name,
    String? email,
    String? phone,
    String? countryCode,
    @Default(false) bool isManualMember,
    MemberMetadata? metadata,
  }) = _BlocMember;

  factory BlocMember.fromJson(Map<String, dynamic> json) =>
      _$BlocMemberFromJson(json);
}

@freezed
class MemberMetadata with _$MemberMetadata {
  const factory MemberMetadata({
    String? joinDate,
    @Default('Undecided') String decisionTag,
    @Default('No Response') String contactTag,
    @Default('Medium') String engagementLevel,
    @Default('Unregistered') String pvcStatus,
    @Default('') String notes,
    String? lastContactDate,
    MemberLocation? location,
    String? memberType,
  }) = _MemberMetadata;

  factory MemberMetadata.fromJson(Map<String, dynamic> json) =>
      _$MemberMetadataFromJson(json);
}

@freezed
class MemberLocation with _$MemberLocation {
  const factory MemberLocation({
    String? state,
    String? lga,
    String? ward,
  }) = _MemberLocation;

  factory MemberLocation.fromJson(Map<String, dynamic> json) =>
      _$MemberLocationFromJson(json);
}
