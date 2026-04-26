import 'package:dio/dio.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_endpoints.dart';
import '../../../../core/network/api_exceptions.dart';

class BlockedUser {
  final String id;
  final String? name;
  final String? profileImage;
  final String? designation;
  final String? reason;
  final String? blockedAt;

  const BlockedUser({
    required this.id,
    this.name,
    this.profileImage,
    this.designation,
    this.reason,
    this.blockedAt,
  });

  factory BlockedUser.fromJson(Map<String, dynamic> json) => BlockedUser(
        id: json['id'] as String,
        name: json['name'] as String?,
        profileImage: json['profile_image'] as String?,
        designation: json['designation'] as String?,
        reason: json['reason'] as String?,
        blockedAt: json['blocked_at'] as String?,
      );
}

class BlockRemoteDataSource {
  final ApiClient _api;

  BlockRemoteDataSource(this._api);

  /// Block a user.
  Future<void> blockUser(String userId, {String? reason}) async {
    try {
      await _api.post(
        ApiEndpoints.blockUser(userId),
        data: reason != null ? {'reason': reason} : null,
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Unblock a user.
  Future<void> unblockUser(String userId) async {
    try {
      await _api.delete(ApiEndpoints.unblockUser(userId));
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Get list of blocked users.
  Future<({List<BlockedUser> users, int total})> getBlockedUsers({
    int page = 1,
    int limit = 30,
  }) async {
    try {
      final res = await _api.get(
        ApiEndpoints.blockedUsers,
        queryParameters: {'page': page, 'limit': limit},
      );
      final body = res.data as Map<String, dynamic>;
      final list = body['blockedUsers'] as List<dynamic>? ?? [];
      final pagination = body['pagination'] as Map<String, dynamic>? ?? {};
      return (
        users: list
            .map((e) => BlockedUser.fromJson(e as Map<String, dynamic>))
            .toList(),
        total: pagination['total'] as int? ?? list.length,
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}
