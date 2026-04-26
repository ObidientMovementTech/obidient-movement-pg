import 'package:freezed_annotation/freezed_annotation.dart';
import 'user.dart';

part 'auth_response.freezed.dart';
part 'auth_response.g.dart';

/// Standard login response.
@freezed
class LoginResponse with _$LoginResponse {
  const factory LoginResponse({
    required bool success,
    @Default('') String message,
    User? user,
    String? token,
    String? refreshToken,
    // 2FA fields
    @Default(false) bool requires2FA,
    String? tempToken,
    String? email,
  }) = _LoginResponse;

  factory LoginResponse.fromJson(Map<String, dynamic> json) =>
      _$LoginResponseFromJson(json);
}

/// Register response.
@freezed
class RegisterResponse with _$RegisterResponse {
  const factory RegisterResponse({
    required bool success,
    required String message,
    @Default(false) bool emailSent,
  }) = _RegisterResponse;

  factory RegisterResponse.fromJson(Map<String, dynamic> json) =>
      _$RegisterResponseFromJson(json);
}

/// Email confirmation response.
@freezed
class ConfirmEmailResponse with _$ConfirmEmailResponse {
  const factory ConfirmEmailResponse({
    required bool success,
    required String message,
    User? user,
  }) = _ConfirmEmailResponse;

  factory ConfirmEmailResponse.fromJson(Map<String, dynamic> json) =>
      _$ConfirmEmailResponseFromJson(json);
}
