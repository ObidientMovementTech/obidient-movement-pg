import 'package:dio/dio.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_endpoints.dart';
import '../../../../core/network/api_exceptions.dart';
import '../models/dashboard_data.dart';

class DashboardRemoteDataSource {
  final ApiClient _api;
  DashboardRemoteDataSource(this._api);

  Future<UserLevelInfo> getUserLevel() async {
    try {
      final res = await _api.get(ApiEndpoints.mobiliseDashboardUserLevel);
      final body = res.data as Map<String, dynamic>;
      return UserLevelInfo.fromJson(body['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<DashboardResponse> getNationalData() async {
    try {
      final res = await _api.get(ApiEndpoints.mobiliseDashboardNational);
      final body = res.data as Map<String, dynamic>;
      return DashboardResponse.fromJson(body['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<DashboardResponse> getStateData(String stateId) async {
    try {
      final res =
          await _api.get(ApiEndpoints.mobiliseDashboardState(stateId));
      final body = res.data as Map<String, dynamic>;
      return DashboardResponse.fromJson(body['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<DashboardResponse> getLGAData(String lgaId) async {
    try {
      final res = await _api.get(ApiEndpoints.mobiliseDashboardLGA(lgaId));
      final body = res.data as Map<String, dynamic>;
      return DashboardResponse.fromJson(body['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<DashboardResponse> getWardData(String wardId) async {
    try {
      final res = await _api.get(ApiEndpoints.mobiliseDashboardWard(wardId));
      final body = res.data as Map<String, dynamic>;
      return DashboardResponse.fromJson(body['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<DashboardResponse> getPollingUnitData(String puId) async {
    try {
      final res = await _api.get(ApiEndpoints.mobiliseDashboardPU(puId));
      final body = res.data as Map<String, dynamic>;
      return DashboardResponse.fromJson(body['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}
