// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'auth_response.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

LoginResponse _$LoginResponseFromJson(Map<String, dynamic> json) {
  return _LoginResponse.fromJson(json);
}

/// @nodoc
mixin _$LoginResponse {
  bool get success => throw _privateConstructorUsedError;
  String get message => throw _privateConstructorUsedError;
  User? get user => throw _privateConstructorUsedError;
  String? get token => throw _privateConstructorUsedError;
  String? get refreshToken => throw _privateConstructorUsedError; // 2FA fields
  bool get requires2FA => throw _privateConstructorUsedError;
  String? get tempToken => throw _privateConstructorUsedError;
  String? get email => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $LoginResponseCopyWith<LoginResponse> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $LoginResponseCopyWith<$Res> {
  factory $LoginResponseCopyWith(
          LoginResponse value, $Res Function(LoginResponse) then) =
      _$LoginResponseCopyWithImpl<$Res, LoginResponse>;
  @useResult
  $Res call(
      {bool success,
      String message,
      User? user,
      String? token,
      String? refreshToken,
      bool requires2FA,
      String? tempToken,
      String? email});

  $UserCopyWith<$Res>? get user;
}

/// @nodoc
class _$LoginResponseCopyWithImpl<$Res, $Val extends LoginResponse>
    implements $LoginResponseCopyWith<$Res> {
  _$LoginResponseCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? success = null,
    Object? message = null,
    Object? user = freezed,
    Object? token = freezed,
    Object? refreshToken = freezed,
    Object? requires2FA = null,
    Object? tempToken = freezed,
    Object? email = freezed,
  }) {
    return _then(_value.copyWith(
      success: null == success
          ? _value.success
          : success // ignore: cast_nullable_to_non_nullable
              as bool,
      message: null == message
          ? _value.message
          : message // ignore: cast_nullable_to_non_nullable
              as String,
      user: freezed == user
          ? _value.user
          : user // ignore: cast_nullable_to_non_nullable
              as User?,
      token: freezed == token
          ? _value.token
          : token // ignore: cast_nullable_to_non_nullable
              as String?,
      refreshToken: freezed == refreshToken
          ? _value.refreshToken
          : refreshToken // ignore: cast_nullable_to_non_nullable
              as String?,
      requires2FA: null == requires2FA
          ? _value.requires2FA
          : requires2FA // ignore: cast_nullable_to_non_nullable
              as bool,
      tempToken: freezed == tempToken
          ? _value.tempToken
          : tempToken // ignore: cast_nullable_to_non_nullable
              as String?,
      email: freezed == email
          ? _value.email
          : email // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }

  @override
  @pragma('vm:prefer-inline')
  $UserCopyWith<$Res>? get user {
    if (_value.user == null) {
      return null;
    }

    return $UserCopyWith<$Res>(_value.user!, (value) {
      return _then(_value.copyWith(user: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$LoginResponseImplCopyWith<$Res>
    implements $LoginResponseCopyWith<$Res> {
  factory _$$LoginResponseImplCopyWith(
          _$LoginResponseImpl value, $Res Function(_$LoginResponseImpl) then) =
      __$$LoginResponseImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {bool success,
      String message,
      User? user,
      String? token,
      String? refreshToken,
      bool requires2FA,
      String? tempToken,
      String? email});

  @override
  $UserCopyWith<$Res>? get user;
}

/// @nodoc
class __$$LoginResponseImplCopyWithImpl<$Res>
    extends _$LoginResponseCopyWithImpl<$Res, _$LoginResponseImpl>
    implements _$$LoginResponseImplCopyWith<$Res> {
  __$$LoginResponseImplCopyWithImpl(
      _$LoginResponseImpl _value, $Res Function(_$LoginResponseImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? success = null,
    Object? message = null,
    Object? user = freezed,
    Object? token = freezed,
    Object? refreshToken = freezed,
    Object? requires2FA = null,
    Object? tempToken = freezed,
    Object? email = freezed,
  }) {
    return _then(_$LoginResponseImpl(
      success: null == success
          ? _value.success
          : success // ignore: cast_nullable_to_non_nullable
              as bool,
      message: null == message
          ? _value.message
          : message // ignore: cast_nullable_to_non_nullable
              as String,
      user: freezed == user
          ? _value.user
          : user // ignore: cast_nullable_to_non_nullable
              as User?,
      token: freezed == token
          ? _value.token
          : token // ignore: cast_nullable_to_non_nullable
              as String?,
      refreshToken: freezed == refreshToken
          ? _value.refreshToken
          : refreshToken // ignore: cast_nullable_to_non_nullable
              as String?,
      requires2FA: null == requires2FA
          ? _value.requires2FA
          : requires2FA // ignore: cast_nullable_to_non_nullable
              as bool,
      tempToken: freezed == tempToken
          ? _value.tempToken
          : tempToken // ignore: cast_nullable_to_non_nullable
              as String?,
      email: freezed == email
          ? _value.email
          : email // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$LoginResponseImpl implements _LoginResponse {
  const _$LoginResponseImpl(
      {required this.success,
      this.message = '',
      this.user,
      this.token,
      this.refreshToken,
      this.requires2FA = false,
      this.tempToken,
      this.email});

  factory _$LoginResponseImpl.fromJson(Map<String, dynamic> json) =>
      _$$LoginResponseImplFromJson(json);

  @override
  final bool success;
  @override
  @JsonKey()
  final String message;
  @override
  final User? user;
  @override
  final String? token;
  @override
  final String? refreshToken;
// 2FA fields
  @override
  @JsonKey()
  final bool requires2FA;
  @override
  final String? tempToken;
  @override
  final String? email;

  @override
  String toString() {
    return 'LoginResponse(success: $success, message: $message, user: $user, token: $token, refreshToken: $refreshToken, requires2FA: $requires2FA, tempToken: $tempToken, email: $email)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$LoginResponseImpl &&
            (identical(other.success, success) || other.success == success) &&
            (identical(other.message, message) || other.message == message) &&
            (identical(other.user, user) || other.user == user) &&
            (identical(other.token, token) || other.token == token) &&
            (identical(other.refreshToken, refreshToken) ||
                other.refreshToken == refreshToken) &&
            (identical(other.requires2FA, requires2FA) ||
                other.requires2FA == requires2FA) &&
            (identical(other.tempToken, tempToken) ||
                other.tempToken == tempToken) &&
            (identical(other.email, email) || other.email == email));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, success, message, user, token,
      refreshToken, requires2FA, tempToken, email);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$LoginResponseImplCopyWith<_$LoginResponseImpl> get copyWith =>
      __$$LoginResponseImplCopyWithImpl<_$LoginResponseImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$LoginResponseImplToJson(
      this,
    );
  }
}

abstract class _LoginResponse implements LoginResponse {
  const factory _LoginResponse(
      {required final bool success,
      final String message,
      final User? user,
      final String? token,
      final String? refreshToken,
      final bool requires2FA,
      final String? tempToken,
      final String? email}) = _$LoginResponseImpl;

  factory _LoginResponse.fromJson(Map<String, dynamic> json) =
      _$LoginResponseImpl.fromJson;

  @override
  bool get success;
  @override
  String get message;
  @override
  User? get user;
  @override
  String? get token;
  @override
  String? get refreshToken;
  @override // 2FA fields
  bool get requires2FA;
  @override
  String? get tempToken;
  @override
  String? get email;
  @override
  @JsonKey(ignore: true)
  _$$LoginResponseImplCopyWith<_$LoginResponseImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

RegisterResponse _$RegisterResponseFromJson(Map<String, dynamic> json) {
  return _RegisterResponse.fromJson(json);
}

/// @nodoc
mixin _$RegisterResponse {
  bool get success => throw _privateConstructorUsedError;
  String get message => throw _privateConstructorUsedError;
  bool get emailSent => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $RegisterResponseCopyWith<RegisterResponse> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $RegisterResponseCopyWith<$Res> {
  factory $RegisterResponseCopyWith(
          RegisterResponse value, $Res Function(RegisterResponse) then) =
      _$RegisterResponseCopyWithImpl<$Res, RegisterResponse>;
  @useResult
  $Res call({bool success, String message, bool emailSent});
}

/// @nodoc
class _$RegisterResponseCopyWithImpl<$Res, $Val extends RegisterResponse>
    implements $RegisterResponseCopyWith<$Res> {
  _$RegisterResponseCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? success = null,
    Object? message = null,
    Object? emailSent = null,
  }) {
    return _then(_value.copyWith(
      success: null == success
          ? _value.success
          : success // ignore: cast_nullable_to_non_nullable
              as bool,
      message: null == message
          ? _value.message
          : message // ignore: cast_nullable_to_non_nullable
              as String,
      emailSent: null == emailSent
          ? _value.emailSent
          : emailSent // ignore: cast_nullable_to_non_nullable
              as bool,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$RegisterResponseImplCopyWith<$Res>
    implements $RegisterResponseCopyWith<$Res> {
  factory _$$RegisterResponseImplCopyWith(_$RegisterResponseImpl value,
          $Res Function(_$RegisterResponseImpl) then) =
      __$$RegisterResponseImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({bool success, String message, bool emailSent});
}

/// @nodoc
class __$$RegisterResponseImplCopyWithImpl<$Res>
    extends _$RegisterResponseCopyWithImpl<$Res, _$RegisterResponseImpl>
    implements _$$RegisterResponseImplCopyWith<$Res> {
  __$$RegisterResponseImplCopyWithImpl(_$RegisterResponseImpl _value,
      $Res Function(_$RegisterResponseImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? success = null,
    Object? message = null,
    Object? emailSent = null,
  }) {
    return _then(_$RegisterResponseImpl(
      success: null == success
          ? _value.success
          : success // ignore: cast_nullable_to_non_nullable
              as bool,
      message: null == message
          ? _value.message
          : message // ignore: cast_nullable_to_non_nullable
              as String,
      emailSent: null == emailSent
          ? _value.emailSent
          : emailSent // ignore: cast_nullable_to_non_nullable
              as bool,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$RegisterResponseImpl implements _RegisterResponse {
  const _$RegisterResponseImpl(
      {required this.success, required this.message, this.emailSent = false});

  factory _$RegisterResponseImpl.fromJson(Map<String, dynamic> json) =>
      _$$RegisterResponseImplFromJson(json);

  @override
  final bool success;
  @override
  final String message;
  @override
  @JsonKey()
  final bool emailSent;

  @override
  String toString() {
    return 'RegisterResponse(success: $success, message: $message, emailSent: $emailSent)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$RegisterResponseImpl &&
            (identical(other.success, success) || other.success == success) &&
            (identical(other.message, message) || other.message == message) &&
            (identical(other.emailSent, emailSent) ||
                other.emailSent == emailSent));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, success, message, emailSent);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$RegisterResponseImplCopyWith<_$RegisterResponseImpl> get copyWith =>
      __$$RegisterResponseImplCopyWithImpl<_$RegisterResponseImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$RegisterResponseImplToJson(
      this,
    );
  }
}

abstract class _RegisterResponse implements RegisterResponse {
  const factory _RegisterResponse(
      {required final bool success,
      required final String message,
      final bool emailSent}) = _$RegisterResponseImpl;

  factory _RegisterResponse.fromJson(Map<String, dynamic> json) =
      _$RegisterResponseImpl.fromJson;

  @override
  bool get success;
  @override
  String get message;
  @override
  bool get emailSent;
  @override
  @JsonKey(ignore: true)
  _$$RegisterResponseImplCopyWith<_$RegisterResponseImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

ConfirmEmailResponse _$ConfirmEmailResponseFromJson(Map<String, dynamic> json) {
  return _ConfirmEmailResponse.fromJson(json);
}

/// @nodoc
mixin _$ConfirmEmailResponse {
  bool get success => throw _privateConstructorUsedError;
  String get message => throw _privateConstructorUsedError;
  User? get user => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $ConfirmEmailResponseCopyWith<ConfirmEmailResponse> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ConfirmEmailResponseCopyWith<$Res> {
  factory $ConfirmEmailResponseCopyWith(ConfirmEmailResponse value,
          $Res Function(ConfirmEmailResponse) then) =
      _$ConfirmEmailResponseCopyWithImpl<$Res, ConfirmEmailResponse>;
  @useResult
  $Res call({bool success, String message, User? user});

  $UserCopyWith<$Res>? get user;
}

/// @nodoc
class _$ConfirmEmailResponseCopyWithImpl<$Res,
        $Val extends ConfirmEmailResponse>
    implements $ConfirmEmailResponseCopyWith<$Res> {
  _$ConfirmEmailResponseCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? success = null,
    Object? message = null,
    Object? user = freezed,
  }) {
    return _then(_value.copyWith(
      success: null == success
          ? _value.success
          : success // ignore: cast_nullable_to_non_nullable
              as bool,
      message: null == message
          ? _value.message
          : message // ignore: cast_nullable_to_non_nullable
              as String,
      user: freezed == user
          ? _value.user
          : user // ignore: cast_nullable_to_non_nullable
              as User?,
    ) as $Val);
  }

  @override
  @pragma('vm:prefer-inline')
  $UserCopyWith<$Res>? get user {
    if (_value.user == null) {
      return null;
    }

    return $UserCopyWith<$Res>(_value.user!, (value) {
      return _then(_value.copyWith(user: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$ConfirmEmailResponseImplCopyWith<$Res>
    implements $ConfirmEmailResponseCopyWith<$Res> {
  factory _$$ConfirmEmailResponseImplCopyWith(_$ConfirmEmailResponseImpl value,
          $Res Function(_$ConfirmEmailResponseImpl) then) =
      __$$ConfirmEmailResponseImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({bool success, String message, User? user});

  @override
  $UserCopyWith<$Res>? get user;
}

/// @nodoc
class __$$ConfirmEmailResponseImplCopyWithImpl<$Res>
    extends _$ConfirmEmailResponseCopyWithImpl<$Res, _$ConfirmEmailResponseImpl>
    implements _$$ConfirmEmailResponseImplCopyWith<$Res> {
  __$$ConfirmEmailResponseImplCopyWithImpl(_$ConfirmEmailResponseImpl _value,
      $Res Function(_$ConfirmEmailResponseImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? success = null,
    Object? message = null,
    Object? user = freezed,
  }) {
    return _then(_$ConfirmEmailResponseImpl(
      success: null == success
          ? _value.success
          : success // ignore: cast_nullable_to_non_nullable
              as bool,
      message: null == message
          ? _value.message
          : message // ignore: cast_nullable_to_non_nullable
              as String,
      user: freezed == user
          ? _value.user
          : user // ignore: cast_nullable_to_non_nullable
              as User?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$ConfirmEmailResponseImpl implements _ConfirmEmailResponse {
  const _$ConfirmEmailResponseImpl(
      {required this.success, required this.message, this.user});

  factory _$ConfirmEmailResponseImpl.fromJson(Map<String, dynamic> json) =>
      _$$ConfirmEmailResponseImplFromJson(json);

  @override
  final bool success;
  @override
  final String message;
  @override
  final User? user;

  @override
  String toString() {
    return 'ConfirmEmailResponse(success: $success, message: $message, user: $user)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ConfirmEmailResponseImpl &&
            (identical(other.success, success) || other.success == success) &&
            (identical(other.message, message) || other.message == message) &&
            (identical(other.user, user) || other.user == user));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, success, message, user);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$ConfirmEmailResponseImplCopyWith<_$ConfirmEmailResponseImpl>
      get copyWith =>
          __$$ConfirmEmailResponseImplCopyWithImpl<_$ConfirmEmailResponseImpl>(
              this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ConfirmEmailResponseImplToJson(
      this,
    );
  }
}

abstract class _ConfirmEmailResponse implements ConfirmEmailResponse {
  const factory _ConfirmEmailResponse(
      {required final bool success,
      required final String message,
      final User? user}) = _$ConfirmEmailResponseImpl;

  factory _ConfirmEmailResponse.fromJson(Map<String, dynamic> json) =
      _$ConfirmEmailResponseImpl.fromJson;

  @override
  bool get success;
  @override
  String get message;
  @override
  User? get user;
  @override
  @JsonKey(ignore: true)
  _$$ConfirmEmailResponseImplCopyWith<_$ConfirmEmailResponseImpl>
      get copyWith => throw _privateConstructorUsedError;
}
