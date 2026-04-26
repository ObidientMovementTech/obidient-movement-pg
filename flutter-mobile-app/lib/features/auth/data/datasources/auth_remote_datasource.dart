import 'package:dio/dio.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_endpoints.dart';
import '../../../../core/network/api_exceptions.dart';
import '../models/auth_response.dart';
import '../models/user.dart';

class AuthDataSource {
  final ApiClient _api;

  AuthDataSource(this._api);

  Future<LoginResponse> login({
    required String email,
    required String password,
  }) async {
    try {
      final res = await _api.post(
        ApiEndpoints.login,
        data: {'email': email, 'password': password},
      );
      return LoginResponse.fromJson(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<RegisterResponse> register({
    required String name,
    required String email,
    required String phone,
    required String password,
    String? countryCode,
    String? votingState,
    String? votingLGA,
    String? votingWard,
  }) async {
    try {
      final res = await _api.post(
        ApiEndpoints.register,
        data: {
          'name': name,
          'email': email,
          'phone': phone,
          'password': password,
          if (countryCode != null) 'countryCode': countryCode,
          if (votingState != null) 'votingState': votingState,
          if (votingLGA != null) 'votingLGA': votingLGA,
          if (votingWard != null) 'votingWard': votingWard,
        },
      );
      return RegisterResponse.fromJson(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<LoginResponse> verify2FA({
    required String tempToken,
    required String code,
  }) async {
    try {
      final res = await _api.post(
        ApiEndpoints.verify2fa,
        data: {'tempToken': tempToken, 'code': code},
      );
      final data = res.data as Map<String, dynamic>;
      return LoginResponse(
        success: true,
        message: data['message'] as String? ?? '2FA verified',
        user: data['user'] != null
            ? User.fromJson(data['user'] as Map<String, dynamic>)
            : null,
        token: data['token'] as String?,
        refreshToken: data['refreshToken'] as String?,
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<ConfirmEmailResponse> confirmEmail(String token) async {
    try {
      final res = await _api.post(
        ApiEndpoints.confirmEmail,
        data: {'token': token},
      );
      return ConfirmEmailResponse.fromJson(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<void> forgotPassword(String email) async {
    try {
      await _api.post(
        ApiEndpoints.forgotPassword,
        data: {'email': email},
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<void> resetPassword({
    required String token,
    required String newPassword,
  }) async {
    try {
      await _api.post(
        '${ApiEndpoints.resetPassword}/$token',
        data: {'newPassword': newPassword},
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// OTP-based password reset (send OTP via forgotPassword, then call this).
  Future<void> resetPasswordWithOTP({
    required String email,
    required String code,
    required String newPassword,
  }) async {
    try {
      await _api.post(
        ApiEndpoints.resetPasswordOtp,
        data: {'email': email, 'code': code, 'newPassword': newPassword},
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<void> resendConfirmation(String email) async {
    try {
      await _api.post(
        ApiEndpoints.resendConfirmation,
        data: {'email': email},
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<LoginResponse> verifyEmailCode({
    required String email,
    required String code,
  }) async {
    try {
      final res = await _api.post(
        ApiEndpoints.verifyEmailCode,
        data: {'email': email, 'code': code},
      );
      return LoginResponse.fromJson(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<User> getCurrentUser() async {
    try {
      final res = await _api.get(ApiEndpoints.me);
      final data = res.data as Map<String, dynamic>;
      return User.fromJson(data['user'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<void> logout() async {
    try {
      await _api.post(ApiEndpoints.logout);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}
