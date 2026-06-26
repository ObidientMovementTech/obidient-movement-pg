import 'package:dio/dio.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_endpoints.dart';
import '../../../../core/network/api_exceptions.dart';
import '../models/analytics_models.dart';

class AnalyticsRemoteDataSource {
  final ApiClient _api;
  AnalyticsRemoteDataSource(this._api);

  Future<DemographicsData> getDemographics({
    required String level,
    required String locationId,
    String? locationName,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      if (locationName != null && locationName.isNotEmpty) {
        queryParams['name'] = locationName;
      }
      final res = await _api.get(
        ApiEndpoints.mobiliseDashboardDemographics(level, locationId),
        queryParameters: queryParams,
      );
      final body = res.data as Map<String, dynamic>;
      return DemographicsData.fromJson(body['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<PeopleResponse> getPeople({
    required String level,
    required String locationId,
    String? locationName,
    int page = 1,
    int limit = 30,
    PeopleFilters filters = const PeopleFilters(),
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'limit': limit,
      };
      if (locationName != null && locationName.isNotEmpty) {
        queryParams['name'] = locationName;
      }
      if (filters.gender != null) queryParams['gender'] = filters.gender;
      if (filters.ageRange != null) queryParams['ageRange'] = filters.ageRange;
      if (filters.pvc != null) queryParams['pvc'] = filters.pvc;
      if (filters.willVote != null) queryParams['willVote'] = filters.willVote;
      if (filters.profileHealth != null) {
        queryParams['profileHealth'] = filters.profileHealth;
      }
      if (filters.activity != null) queryParams['activity'] = filters.activity;
      if (filters.lga != null) queryParams['lga'] = filters.lga;
      if (filters.search != null && filters.search!.isNotEmpty) {
        queryParams['search'] = filters.search;
      }
      queryParams['sortBy'] = filters.sortBy;
      queryParams['sortDir'] = filters.sortDir;

      final res = await _api.get(
        ApiEndpoints.mobiliseDashboardPeople(level, locationId),
        queryParameters: queryParams,
      );
      final body = res.data as Map<String, dynamic>;
      return PeopleResponse(
        data: (body['data'] as List)
            .map((e) => PersonRow.fromJson(e as Map<String, dynamic>))
            .toList(),
        pagination: PeoplePagination.fromJson(
            body['pagination'] as Map<String, dynamic>),
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}
