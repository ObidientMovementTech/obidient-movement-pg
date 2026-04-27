import 'package:dio/dio.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_endpoints.dart';
import '../../../../core/network/api_exceptions.dart';
import '../models/coordinator_models.dart';

class CoordinatorRemoteDataSource {
  final ApiClient _api;
  CoordinatorRemoteDataSource(this._api);

  // ── User search ─────────────────────────────────────────────

  Future<List<SearchedUser>> searchUsers(String query,
      {int limit = 20}) async {
    try {
      final res = await _api.get(
        ApiEndpoints.coordinatorSearch,
        queryParameters: {'q': query, 'limit': limit},
      );
      final body = res.data as Map<String, dynamic>;
      final data = body['data'] as Map<String, dynamic>;
      return (data['users'] as List)
          .map((e) => SearchedUser.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  // ── Assign designation ──────────────────────────────────────

  Future<SearchedUser> assignDesignation({
    required String userId,
    required String designation,
    String? assignedState,
    String? assignedLGA,
    String? assignedWard,
    bool override = false,
  }) async {
    try {
      final res = await _api.post(
        ApiEndpoints.coordinatorAssign,
        data: {
          'userId': userId,
          'designation': designation,
          if (assignedState != null) 'assignedState': assignedState,
          if (assignedLGA != null) 'assignedLGA': assignedLGA,
          if (assignedWard != null) 'assignedWard': assignedWard,
          if (override) 'override': true,
        },
      );
      final body = res.data as Map<String, dynamic>;
      final data = body['data'] as Map<String, dynamic>;
      return SearchedUser.fromJson(data['user'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  // ── Subordinates ────────────────────────────────────────────

  Future<({List<SearchedUser> subordinates, int total, int pages})>
      getSubordinates({
    int page = 1,
    int limit = 20,
    String? designation,
    String? q,
  }) async {
    try {
      final params = <String, dynamic>{'page': page, 'limit': limit};
      if (designation != null) params['designation'] = designation;
      if (q != null && q.isNotEmpty) params['q'] = q;

      final res = await _api.get(
        ApiEndpoints.coordinatorSubordinates,
        queryParameters: params,
      );
      final body = res.data as Map<String, dynamic>;
      final data = body['data'] as Map<String, dynamic>;
      final list = (data['subordinates'] as List)
          .map((e) => SearchedUser.fromJson(e as Map<String, dynamic>))
          .toList();
      return (
        subordinates: list,
        total: data['total'] as int? ?? 0,
        pages: data['pages'] as int? ?? 1,
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  // ── Remove designation ──────────────────────────────────────

  Future<void> removeDesignation(String userId) async {
    try {
      await _api.post(
        ApiEndpoints.coordinatorRemove,
        data: {'userId': userId},
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  // ── Nigeria location lookups ────────────────────────────────

  Future<List<NigeriaLocation>> getStates() async {
    try {
      final res = await _api.get(ApiEndpoints.nigeriaStates);
      final body = res.data as Map<String, dynamic>;
      return (body['data'] as List)
          .map((e) => NigeriaLocation.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<List<NigeriaLocation>> getLGAs(int stateId) async {
    try {
      final res = await _api.get(ApiEndpoints.nigeriaLGAs(stateId));
      final body = res.data as Map<String, dynamic>;
      return (body['data'] as List)
          .map((e) => NigeriaLocation.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<List<NigeriaLocation>> getWards(int lgaId) async {
    try {
      final res = await _api.get(ApiEndpoints.nigeriaWards(lgaId));
      final body = res.data as Map<String, dynamic>;
      return (body['data'] as List)
          .map((e) => NigeriaLocation.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<List<NigeriaLocation>> getPollingUnits(int wardId) async {
    try {
      final res = await _api.get(ApiEndpoints.nigeriaPollingUnits(wardId));
      final body = res.data as Map<String, dynamic>;
      return (body['data'] as List)
          .map((e) => NigeriaLocation.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}
