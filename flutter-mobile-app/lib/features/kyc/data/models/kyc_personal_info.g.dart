// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'kyc_personal_info.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$KycPersonalInfoImpl _$$KycPersonalInfoImplFromJson(
        Map<String, dynamic> json) =>
    _$KycPersonalInfoImpl(
      firstName: json['firstName'] as String?,
      lastName: json['lastName'] as String?,
      userName: json['userName'] as String?,
      phoneNumber: json['phoneNumber'] as String?,
      gender: json['gender'] as String?,
      lga: json['lga'] as String?,
      ward: json['ward'] as String?,
      ageRange: json['ageRange'] as String?,
      stateOfOrigin: json['stateOfOrigin'] as String?,
      votingEngagementState: json['votingEngagementState'] as String?,
      citizenship: json['citizenship'] as String?,
      isVoter: json['isVoter'] as String?,
      willVote: json['willVote'] as String?,
    );

Map<String, dynamic> _$$KycPersonalInfoImplToJson(
        _$KycPersonalInfoImpl instance) =>
    <String, dynamic>{
      'firstName': instance.firstName,
      'lastName': instance.lastName,
      'userName': instance.userName,
      'phoneNumber': instance.phoneNumber,
      'gender': instance.gender,
      'lga': instance.lga,
      'ward': instance.ward,
      'ageRange': instance.ageRange,
      'stateOfOrigin': instance.stateOfOrigin,
      'votingEngagementState': instance.votingEngagementState,
      'citizenship': instance.citizenship,
      'isVoter': instance.isVoter,
      'willVote': instance.willVote,
    };
