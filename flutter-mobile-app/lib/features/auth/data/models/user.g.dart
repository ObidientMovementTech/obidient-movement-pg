// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$UserImpl _$$UserImplFromJson(Map<String, dynamic> json) => _$UserImpl(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      phone: json['phone'] as String?,
      emailVerified: json['emailVerified'] as bool? ?? false,
      twoFactorEnabled: json['twoFactorEnabled'] as bool? ?? false,
      profileImage: json['profileImage'] as String?,
      role: json['role'] as String? ?? 'user',
      kycStatus: json['kycStatus'] as String?,
      adcStatus: json['adcStatus'] as String?,
      userName: json['userName'] as String?,
      gender: json['gender'] as String?,
      ageRange: json['ageRange'] as String?,
      citizenship: json['citizenship'] as String?,
      countryCode: json['countryCode'] as String?,
      stateOfOrigin: json['stateOfOrigin'] as String?,
      votingState: json['votingState'] as String?,
      votingLGA: json['votingLGA'] as String?,
      votingWard: json['votingWard'] as String?,
      votingPU: json['votingPU'] as String?,
      isVoter: json['isVoter'] as String?,
      willVote: json['willVote'] as String?,
      designation: json['designation'] as String?,
      assignedState: json['assignedState'] as String?,
      assignedLGA: json['assignedLGA'] as String?,
      assignedWard: json['assignedWard'] as String?,
      bankName: json['bankName'] as String?,
      bankAccountNumber: json['bankAccountNumber'] as String?,
      bankAccountName: json['bankAccountName'] as String?,
      profileCompletionPercentage:
          (json['profileCompletionPercentage'] as num?)?.toInt() ?? 0,
      googleId: json['google_id'] as String?,
      oauthProvider: json['oauth_provider'] as String?,
      createdAt: json['createdAt'] == null
          ? null
          : DateTime.parse(json['createdAt'] as String),
      updatedAt: json['updatedAt'] == null
          ? null
          : DateTime.parse(json['updatedAt'] as String),
    );

Map<String, dynamic> _$$UserImplToJson(_$UserImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'email': instance.email,
      'phone': instance.phone,
      'emailVerified': instance.emailVerified,
      'twoFactorEnabled': instance.twoFactorEnabled,
      'profileImage': instance.profileImage,
      'role': instance.role,
      'kycStatus': instance.kycStatus,
      'adcStatus': instance.adcStatus,
      'userName': instance.userName,
      'gender': instance.gender,
      'ageRange': instance.ageRange,
      'citizenship': instance.citizenship,
      'countryCode': instance.countryCode,
      'stateOfOrigin': instance.stateOfOrigin,
      'votingState': instance.votingState,
      'votingLGA': instance.votingLGA,
      'votingWard': instance.votingWard,
      'votingPU': instance.votingPU,
      'isVoter': instance.isVoter,
      'willVote': instance.willVote,
      'designation': instance.designation,
      'assignedState': instance.assignedState,
      'assignedLGA': instance.assignedLGA,
      'assignedWard': instance.assignedWard,
      'bankName': instance.bankName,
      'bankAccountNumber': instance.bankAccountNumber,
      'bankAccountName': instance.bankAccountName,
      'profileCompletionPercentage': instance.profileCompletionPercentage,
      'google_id': instance.googleId,
      'oauth_provider': instance.oauthProvider,
      'createdAt': instance.createdAt?.toIso8601String(),
      'updatedAt': instance.updatedAt?.toIso8601String(),
    };
