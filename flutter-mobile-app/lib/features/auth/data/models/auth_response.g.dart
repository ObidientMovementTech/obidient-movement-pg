// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_response.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$LoginResponseImpl _$$LoginResponseImplFromJson(Map<String, dynamic> json) =>
    _$LoginResponseImpl(
      success: json['success'] as bool,
      message: json['message'] as String? ?? '',
      user: json['user'] == null
          ? null
          : User.fromJson(json['user'] as Map<String, dynamic>),
      token: json['token'] as String?,
      refreshToken: json['refreshToken'] as String?,
      requires2FA: json['requires2FA'] as bool? ?? false,
      tempToken: json['tempToken'] as String?,
      email: json['email'] as String?,
    );

Map<String, dynamic> _$$LoginResponseImplToJson(_$LoginResponseImpl instance) =>
    <String, dynamic>{
      'success': instance.success,
      'message': instance.message,
      'user': instance.user,
      'token': instance.token,
      'refreshToken': instance.refreshToken,
      'requires2FA': instance.requires2FA,
      'tempToken': instance.tempToken,
      'email': instance.email,
    };

_$RegisterResponseImpl _$$RegisterResponseImplFromJson(
        Map<String, dynamic> json) =>
    _$RegisterResponseImpl(
      success: json['success'] as bool,
      message: json['message'] as String,
      emailSent: json['emailSent'] as bool? ?? false,
    );

Map<String, dynamic> _$$RegisterResponseImplToJson(
        _$RegisterResponseImpl instance) =>
    <String, dynamic>{
      'success': instance.success,
      'message': instance.message,
      'emailSent': instance.emailSent,
    };

_$ConfirmEmailResponseImpl _$$ConfirmEmailResponseImplFromJson(
        Map<String, dynamic> json) =>
    _$ConfirmEmailResponseImpl(
      success: json['success'] as bool,
      message: json['message'] as String,
      user: json['user'] == null
          ? null
          : User.fromJson(json['user'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$$ConfirmEmailResponseImplToJson(
        _$ConfirmEmailResponseImpl instance) =>
    <String, dynamic>{
      'success': instance.success,
      'message': instance.message,
      'user': instance.user,
    };
