// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'kyc_data.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$KycValidIdImpl _$$KycValidIdImplFromJson(Map<String, dynamic> json) =>
    _$KycValidIdImpl(
      idType: json['idType'] as String?,
      idNumber: json['idNumber'] as String?,
      idImageUrl: json['idImageUrl'] as String?,
    );

Map<String, dynamic> _$$KycValidIdImplToJson(_$KycValidIdImpl instance) =>
    <String, dynamic>{
      'idType': instance.idType,
      'idNumber': instance.idNumber,
      'idImageUrl': instance.idImageUrl,
    };

_$KycDataImpl _$$KycDataImplFromJson(Map<String, dynamic> json) =>
    _$KycDataImpl(
      kycStatus: json['kycStatus'] as String?,
      personalInfo: json['personalInfo'] as Map<String, dynamic>?,
      validID: json['validID'] == null
          ? null
          : KycValidId.fromJson(json['validID'] as Map<String, dynamic>),
      selfieImageUrl: json['selfieImageUrl'] as String?,
      kycRejectionReason: json['kycRejectionReason'] as String?,
    );

Map<String, dynamic> _$$KycDataImplToJson(_$KycDataImpl instance) =>
    <String, dynamic>{
      'kycStatus': instance.kycStatus,
      'personalInfo': instance.personalInfo,
      'validID': instance.validID,
      'selfieImageUrl': instance.selfieImageUrl,
      'kycRejectionReason': instance.kycRejectionReason,
    };
