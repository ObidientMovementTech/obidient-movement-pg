import 'package:freezed_annotation/freezed_annotation.dart';

part 'user.freezed.dart';
part 'user.g.dart';

@freezed
class User with _$User {
  const User._();

  const factory User({
    required String id,
    required String name,
    required String email,
    String? phone,
    @Default(false) bool emailVerified,
    @Default(false) bool twoFactorEnabled,
    String? profileImage,
    @Default('user') String role,
    String? kycStatus,
    String? adcStatus,
    String? userName,
    String? gender,
    String? ageRange,
    String? citizenship,
    String? countryCode,
    String? stateOfOrigin,
    String? votingState,
    String? votingLGA,
    String? votingWard,
    String? votingPU,
    String? isVoter,
    String? willVote,
    String? designation,
    String? assignedState,
    String? assignedLGA,
    String? assignedWard,
    String? bankName,
    String? bankAccountNumber,
    String? bankAccountName,
    @Default(0) int profileCompletionPercentage,
    @JsonKey(name: 'google_id') String? googleId,
    @JsonKey(name: 'oauth_provider') String? oauthProvider,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) = _User;

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);

  /// True when all required profile-completion fields are filled.
  /// Server-side `profileCompletionPercentage` uses legacy columns, so we
  /// do the check client-side against the actual required fields.
  bool get isProfileComplete => missingProfileFields.isEmpty;

  /// Human-readable labels of required profile fields that are still missing.
  /// Used to tell the user exactly what to fill in.
  List<String> get missingProfileFields {
    bool has(String? s) => s != null && s.trim().isNotEmpty;
    final missing = <String>[];
    if (!has(profileImage)) missing.add('Profile Photo');
    if (!has(name)) missing.add('Legal Name');
    if (!has(phone)) missing.add('Phone Number');
    if (!has(gender)) missing.add('Gender');
    if (!has(ageRange)) missing.add('Age Range');
    if (!has(stateOfOrigin)) missing.add('State of Origin');
    if (!has(votingState)) missing.add('Voting State');
    if (!has(votingLGA)) missing.add('Voting LGA');
    if (!has(votingWard)) missing.add('Voting Ward');
    if (!has(votingPU)) missing.add('Polling Unit');
    if (!has(isVoter)) missing.add('Registered voter status');
    if (!has(willVote)) missing.add('Will vote answer');
    return missing;
  }
}
