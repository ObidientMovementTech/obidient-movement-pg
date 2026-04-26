import 'package:freezed_annotation/freezed_annotation.dart';

part 'kyc_personal_info.freezed.dart';
part 'kyc_personal_info.g.dart';

@freezed
class KycPersonalInfo with _$KycPersonalInfo {
  const factory KycPersonalInfo({
    String? firstName,
    String? lastName,
    String? userName,
    String? phoneNumber,
    String? gender,
    String? lga,
    String? ward,
    String? ageRange,
    String? stateOfOrigin,
    String? votingEngagementState,
    String? citizenship,
    String? isVoter,
    String? willVote,
  }) = _KycPersonalInfo;

  factory KycPersonalInfo.fromJson(Map<String, dynamic> json) =>
      _$KycPersonalInfoFromJson(json);
}
