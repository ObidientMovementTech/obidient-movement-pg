import 'package:dio/dio.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_endpoints.dart';
import '../../../../core/network/api_exceptions.dart';
import '../../../auth/data/models/user.dart';

class UserDataSource {
  final ApiClient _api;

  UserDataSource(this._api);

  /// Update user profile fields.
  Future<User> updateProfile(Map<String, dynamic> data) async {
    try {
      final res = await _api.patch(ApiEndpoints.userMe, data: data);
      final body = res.data as Map<String, dynamic>;
      return User.fromJson(body['user'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Get profile completion percentage + missing fields.
  Future<Map<String, dynamic>> getProfileCompletion() async {
    try {
      final res = await _api.get(ApiEndpoints.profileCompletion);
      final body = res.data as Map<String, dynamic>;
      return body['data'] as Map<String, dynamic>? ?? body;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Check username availability.
  Future<bool> checkUsername(String username) async {
    try {
      final res = await _api.get(
        ApiEndpoints.checkUsername,
        queryParameters: {'username': username},
      );
      final body = res.data as Map<String, dynamic>;
      return body['available'] as bool? ?? false;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Upload profile image (multipart).
  Future<String> uploadProfileImage(String filePath) async {
    try {
      final formData = FormData.fromMap({
        'profileImage': await MultipartFile.fromFile(filePath),
      });
      final res = await _api.upload(
        ApiEndpoints.uploadProfileImage,
        formData: formData,
      );
      final body = res.data as Map<String, dynamic>;
      return body['imageUrl'] as String? ?? body['profileImage'] as String? ?? '';
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Get notifications list.
  Future<List<Map<String, dynamic>>> getNotifications({
    int limit = 20,
    int offset = 0,
  }) async {
    try {
      final res = await _api.get(
        ApiEndpoints.notifications,
        queryParameters: {'limit': limit, 'offset': offset},
      );
      // API may return raw array or {notifications: [...]}
      final data = res.data;
      List<dynamic> list;
      if (data is List) {
        list = data;
      } else if (data is Map<String, dynamic>) {
        list = data['notifications'] as List<dynamic>? ?? [];
      } else {
        list = [];
      }
      return list.cast<Map<String, dynamic>>();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Get leadership coordinators for user's voting location.
  Future<List<Map<String, dynamic>>> getLeaders() async {
    try {
      final res = await _api.get(ApiEndpoints.contacts);
      final body = res.data as Map<String, dynamic>;
      final list = body['coordinators'] as List<dynamic>? ?? [];
      // Sort: national → state → lga → ward
      const levelOrder = {'national': 0, 'state': 1, 'lga': 2, 'ward': 3};
      final sorted = list.cast<Map<String, dynamic>>().toList()
        ..sort((a, b) {
          final aLevel = levelOrder[a['level'] ?? ''] ?? 99;
          final bLevel = levelOrder[b['level'] ?? ''] ?? 99;
          return aLevel.compareTo(bLevel);
        });
      return sorted;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Get voting blocs owned by user.
  Future<List<Map<String, dynamic>>> getOwnedBlocs() async {
    try {
      final res = await _api.get(ApiEndpoints.votingBlocsOwned);
      final body = res.data as Map<String, dynamic>;
      final list = body['votingBlocs'] as List<dynamic>? ?? [];
      return list.cast<Map<String, dynamic>>();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Get voting blocs user has joined.
  Future<List<Map<String, dynamic>>> getJoinedBlocs() async {
    try {
      final res = await _api.get(ApiEndpoints.votingBlocsJoined);
      final body = res.data as Map<String, dynamic>;
      final list = body['votingBlocs'] as List<dynamic>? ?? [];
      return list.cast<Map<String, dynamic>>();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Update notification preferences.
  Future<void> updateNotificationPreferences(
      Map<String, dynamic> prefs) async {
    try {
      await _api.patch(ApiEndpoints.notificationPreferences, data: prefs);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Request password change (sends OTP).
  Future<Map<String, dynamic>> changePasswordRequest(String currentPassword) async {
    try {
      final res = await _api.post(
        ApiEndpoints.changePasswordRequest,
        data: {'currentPassword': currentPassword},
      );
      return res.data as Map<String, dynamic>? ?? {};
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Verify OTP.
  Future<void> verifyOtp(String otp) async {
    try {
      await _api.post(ApiEndpoints.verifyOtp, data: {'otp': otp});
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Complete password change (after OTP verification).
  Future<void> changePassword(String newPassword) async {
    try {
      await _api.post(
        ApiEndpoints.changePassword,
        data: {'newPassword': newPassword, 'otpVerified': true},
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Setup 2FA — returns QR code and secret.
  Future<Map<String, dynamic>> setup2FA() async {
    try {
      final res = await _api.post(ApiEndpoints.setup2fa);
      return res.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Verify 2FA setup with TOTP token (6-digit code from authenticator app).
  Future<void> verify2FASetup(String code) async {
    try {
      await _api.post(ApiEndpoints.verify2faSetup, data: {'token': code});
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Disable 2FA.
  Future<void> disable2FA(String code) async {
    try {
      await _api.post(ApiEndpoints.disable2fa, data: {'token': code});
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Delete account.
  Future<void> deleteAccount(String password) async {
    try {
      await _api.post(
        ApiEndpoints.deleteAccount,
        data: {'password': password},
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Request email change. Returns `{ requires2FA?: bool, message }`.
  Future<Map<String, dynamic>> requestEmailChange({
    required String newEmail,
    required String currentPassword,
  }) async {
    try {
      final res = await _api.post(
        ApiEndpoints.changeEmailRequest,
        data: {'newEmail': newEmail, 'currentPassword': currentPassword},
      );
      return res.data as Map<String, dynamic>? ?? {};
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Verify email change with OTP (email code OR TOTP when 2FA enabled).
  Future<void> verifyEmailChange(String otp) async {
    try {
      await _api.post(ApiEndpoints.verifyEmailChange, data: {'otp': otp});
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Mark a notification as read (mobile path).
  Future<void> markNotificationRead(String id) async {
    try {
      await _api.put(ApiEndpoints.mobileNotificationRead(id));
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Register an FCM device token with the backend.
  /// Platform must be `'android'` or `'ios'`.
  Future<void> registerPushToken({
    required String token,
    required String platform,
    String? appVersion,
  }) async {
    try {
      await _api.post(
        ApiEndpoints.mobilePushRegister,
        data: {
          'token': token,
          'platform': platform,
          if (appVersion != null) 'appVersion': appVersion,
        },
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Toggle push notifications enabled/disabled (maps to
  /// `users.push_notifications_enabled`).
  Future<void> updatePushSettings({required bool enabled}) async {
    try {
      await _api.put(
        ApiEndpoints.mobilePushSettings,
        data: {'pushNotificationsEnabled': enabled},
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// DEV ONLY — ask the server to send a test push to the current user.
  Future<void> sendTestPush() async {
    try {
      await _api.post(ApiEndpoints.mobilePushTest);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}
