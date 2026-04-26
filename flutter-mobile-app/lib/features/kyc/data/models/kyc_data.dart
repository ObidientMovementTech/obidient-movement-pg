import 'package:freezed_annotation/freezed_annotation.dart';

part 'kyc_data.freezed.dart';
part 'kyc_data.g.dart';

@freezed
class KycValidId with _$KycValidId {
  const factory KycValidId({
    String? idType,
    String? idNumber,
    String? idImageUrl,
  }) = _KycValidId;

  factory KycValidId.fromJson(Map<String, dynamic> json) =>
      _$KycValidIdFromJson(json);
}

@freezed
class KycData with _$KycData {
  const factory KycData({
    String? kycStatus,
    Map<String, dynamic>? personalInfo,
    KycValidId? validID,
    String? selfieImageUrl,
    String? kycRejectionReason,
  }) = _KycData;

  factory KycData.fromJson(Map<String, dynamic> json) =>
      _$KycDataFromJson(json);
}
