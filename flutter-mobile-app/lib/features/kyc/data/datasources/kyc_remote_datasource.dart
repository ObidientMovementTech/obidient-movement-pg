import 'package:dio/dio.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_endpoints.dart';
import '../../../../core/network/api_exceptions.dart';
import '../models/kyc_data.dart';
import '../models/kyc_personal_info.dart';

class KycRemoteDataSource {
  final ApiClient _api;
  KycRemoteDataSource(this._api);

  /// GET /kyc/me — fetch the current user's KYC data.
  Future<KycData> getMyKyc() async {
    try {
      final res = await _api.get(ApiEndpoints.kycMe);
      final body = res.data as Map<String, dynamic>;
      return KycData.fromJson(body);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// PATCH /kyc/save-step/personal-info
  Future<void> savePersonalInfo(KycPersonalInfo info) async {
    try {
      await _api.patch(
        ApiEndpoints.kycSavePersonalInfo,
        data: info.toJson()..removeWhere((_, v) => v == null),
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// PATCH /kyc/save-step/valid-id
  /// Returns the uploaded [idImageUrl] from S3.
  Future<KycValidId> saveValidId({
    required String idType,
    required String idNumber,
    String? idImageBase64,
  }) async {
    try {
      final res = await _api.patch(
        ApiEndpoints.kycSaveValidId,
        data: {
          'validIDType': idType,
          'validIDNumber': idNumber,
          if (idImageBase64 != null) 'validIDBase64': idImageBase64,
        },
      );
      final body = res.data as Map<String, dynamic>;
      return KycValidId.fromJson(body['validID'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// PATCH /kyc/save-step/selfie
  /// Returns the uploaded [selfieImageUrl] from S3.
  Future<String> saveSelfie(String selfieBase64) async {
    try {
      final res = await _api.patch(
        ApiEndpoints.kycSaveSelfie,
        data: {'selfieBase64': selfieBase64},
      );
      final body = res.data as Map<String, dynamic>;
      return body['selfieImageUrl'] as String;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// POST /kyc/submit — final submission.
  Future<void> submitKyc({
    required String validIDType,
    required String validIDNumber,
    String? validIDBase64,
    String? selfieBase64,
  }) async {
    try {
      await _api.post(
        ApiEndpoints.kycSubmit,
        data: {
          'validIDType': validIDType,
          'validIDNumber': validIDNumber,
          if (validIDBase64 != null) 'validIDBase64': validIDBase64,
          if (selfieBase64 != null) 'selfieBase64': selfieBase64,
        },
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}
