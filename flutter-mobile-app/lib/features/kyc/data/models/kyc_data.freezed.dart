// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'kyc_data.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

KycValidId _$KycValidIdFromJson(Map<String, dynamic> json) {
  return _KycValidId.fromJson(json);
}

/// @nodoc
mixin _$KycValidId {
  String? get idType => throw _privateConstructorUsedError;
  String? get idNumber => throw _privateConstructorUsedError;
  String? get idImageUrl => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $KycValidIdCopyWith<KycValidId> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $KycValidIdCopyWith<$Res> {
  factory $KycValidIdCopyWith(
          KycValidId value, $Res Function(KycValidId) then) =
      _$KycValidIdCopyWithImpl<$Res, KycValidId>;
  @useResult
  $Res call({String? idType, String? idNumber, String? idImageUrl});
}

/// @nodoc
class _$KycValidIdCopyWithImpl<$Res, $Val extends KycValidId>
    implements $KycValidIdCopyWith<$Res> {
  _$KycValidIdCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? idType = freezed,
    Object? idNumber = freezed,
    Object? idImageUrl = freezed,
  }) {
    return _then(_value.copyWith(
      idType: freezed == idType
          ? _value.idType
          : idType // ignore: cast_nullable_to_non_nullable
              as String?,
      idNumber: freezed == idNumber
          ? _value.idNumber
          : idNumber // ignore: cast_nullable_to_non_nullable
              as String?,
      idImageUrl: freezed == idImageUrl
          ? _value.idImageUrl
          : idImageUrl // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$KycValidIdImplCopyWith<$Res>
    implements $KycValidIdCopyWith<$Res> {
  factory _$$KycValidIdImplCopyWith(
          _$KycValidIdImpl value, $Res Function(_$KycValidIdImpl) then) =
      __$$KycValidIdImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String? idType, String? idNumber, String? idImageUrl});
}

/// @nodoc
class __$$KycValidIdImplCopyWithImpl<$Res>
    extends _$KycValidIdCopyWithImpl<$Res, _$KycValidIdImpl>
    implements _$$KycValidIdImplCopyWith<$Res> {
  __$$KycValidIdImplCopyWithImpl(
      _$KycValidIdImpl _value, $Res Function(_$KycValidIdImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? idType = freezed,
    Object? idNumber = freezed,
    Object? idImageUrl = freezed,
  }) {
    return _then(_$KycValidIdImpl(
      idType: freezed == idType
          ? _value.idType
          : idType // ignore: cast_nullable_to_non_nullable
              as String?,
      idNumber: freezed == idNumber
          ? _value.idNumber
          : idNumber // ignore: cast_nullable_to_non_nullable
              as String?,
      idImageUrl: freezed == idImageUrl
          ? _value.idImageUrl
          : idImageUrl // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$KycValidIdImpl implements _KycValidId {
  const _$KycValidIdImpl({this.idType, this.idNumber, this.idImageUrl});

  factory _$KycValidIdImpl.fromJson(Map<String, dynamic> json) =>
      _$$KycValidIdImplFromJson(json);

  @override
  final String? idType;
  @override
  final String? idNumber;
  @override
  final String? idImageUrl;

  @override
  String toString() {
    return 'KycValidId(idType: $idType, idNumber: $idNumber, idImageUrl: $idImageUrl)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$KycValidIdImpl &&
            (identical(other.idType, idType) || other.idType == idType) &&
            (identical(other.idNumber, idNumber) ||
                other.idNumber == idNumber) &&
            (identical(other.idImageUrl, idImageUrl) ||
                other.idImageUrl == idImageUrl));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, idType, idNumber, idImageUrl);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$KycValidIdImplCopyWith<_$KycValidIdImpl> get copyWith =>
      __$$KycValidIdImplCopyWithImpl<_$KycValidIdImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$KycValidIdImplToJson(
      this,
    );
  }
}

abstract class _KycValidId implements KycValidId {
  const factory _KycValidId(
      {final String? idType,
      final String? idNumber,
      final String? idImageUrl}) = _$KycValidIdImpl;

  factory _KycValidId.fromJson(Map<String, dynamic> json) =
      _$KycValidIdImpl.fromJson;

  @override
  String? get idType;
  @override
  String? get idNumber;
  @override
  String? get idImageUrl;
  @override
  @JsonKey(ignore: true)
  _$$KycValidIdImplCopyWith<_$KycValidIdImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

KycData _$KycDataFromJson(Map<String, dynamic> json) {
  return _KycData.fromJson(json);
}

/// @nodoc
mixin _$KycData {
  String? get kycStatus => throw _privateConstructorUsedError;
  Map<String, dynamic>? get personalInfo => throw _privateConstructorUsedError;
  KycValidId? get validID => throw _privateConstructorUsedError;
  String? get selfieImageUrl => throw _privateConstructorUsedError;
  String? get kycRejectionReason => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $KycDataCopyWith<KycData> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $KycDataCopyWith<$Res> {
  factory $KycDataCopyWith(KycData value, $Res Function(KycData) then) =
      _$KycDataCopyWithImpl<$Res, KycData>;
  @useResult
  $Res call(
      {String? kycStatus,
      Map<String, dynamic>? personalInfo,
      KycValidId? validID,
      String? selfieImageUrl,
      String? kycRejectionReason});

  $KycValidIdCopyWith<$Res>? get validID;
}

/// @nodoc
class _$KycDataCopyWithImpl<$Res, $Val extends KycData>
    implements $KycDataCopyWith<$Res> {
  _$KycDataCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? kycStatus = freezed,
    Object? personalInfo = freezed,
    Object? validID = freezed,
    Object? selfieImageUrl = freezed,
    Object? kycRejectionReason = freezed,
  }) {
    return _then(_value.copyWith(
      kycStatus: freezed == kycStatus
          ? _value.kycStatus
          : kycStatus // ignore: cast_nullable_to_non_nullable
              as String?,
      personalInfo: freezed == personalInfo
          ? _value.personalInfo
          : personalInfo // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>?,
      validID: freezed == validID
          ? _value.validID
          : validID // ignore: cast_nullable_to_non_nullable
              as KycValidId?,
      selfieImageUrl: freezed == selfieImageUrl
          ? _value.selfieImageUrl
          : selfieImageUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      kycRejectionReason: freezed == kycRejectionReason
          ? _value.kycRejectionReason
          : kycRejectionReason // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }

  @override
  @pragma('vm:prefer-inline')
  $KycValidIdCopyWith<$Res>? get validID {
    if (_value.validID == null) {
      return null;
    }

    return $KycValidIdCopyWith<$Res>(_value.validID!, (value) {
      return _then(_value.copyWith(validID: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$KycDataImplCopyWith<$Res> implements $KycDataCopyWith<$Res> {
  factory _$$KycDataImplCopyWith(
          _$KycDataImpl value, $Res Function(_$KycDataImpl) then) =
      __$$KycDataImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String? kycStatus,
      Map<String, dynamic>? personalInfo,
      KycValidId? validID,
      String? selfieImageUrl,
      String? kycRejectionReason});

  @override
  $KycValidIdCopyWith<$Res>? get validID;
}

/// @nodoc
class __$$KycDataImplCopyWithImpl<$Res>
    extends _$KycDataCopyWithImpl<$Res, _$KycDataImpl>
    implements _$$KycDataImplCopyWith<$Res> {
  __$$KycDataImplCopyWithImpl(
      _$KycDataImpl _value, $Res Function(_$KycDataImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? kycStatus = freezed,
    Object? personalInfo = freezed,
    Object? validID = freezed,
    Object? selfieImageUrl = freezed,
    Object? kycRejectionReason = freezed,
  }) {
    return _then(_$KycDataImpl(
      kycStatus: freezed == kycStatus
          ? _value.kycStatus
          : kycStatus // ignore: cast_nullable_to_non_nullable
              as String?,
      personalInfo: freezed == personalInfo
          ? _value._personalInfo
          : personalInfo // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>?,
      validID: freezed == validID
          ? _value.validID
          : validID // ignore: cast_nullable_to_non_nullable
              as KycValidId?,
      selfieImageUrl: freezed == selfieImageUrl
          ? _value.selfieImageUrl
          : selfieImageUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      kycRejectionReason: freezed == kycRejectionReason
          ? _value.kycRejectionReason
          : kycRejectionReason // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$KycDataImpl implements _KycData {
  const _$KycDataImpl(
      {this.kycStatus,
      final Map<String, dynamic>? personalInfo,
      this.validID,
      this.selfieImageUrl,
      this.kycRejectionReason})
      : _personalInfo = personalInfo;

  factory _$KycDataImpl.fromJson(Map<String, dynamic> json) =>
      _$$KycDataImplFromJson(json);

  @override
  final String? kycStatus;
  final Map<String, dynamic>? _personalInfo;
  @override
  Map<String, dynamic>? get personalInfo {
    final value = _personalInfo;
    if (value == null) return null;
    if (_personalInfo is EqualUnmodifiableMapView) return _personalInfo;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  @override
  final KycValidId? validID;
  @override
  final String? selfieImageUrl;
  @override
  final String? kycRejectionReason;

  @override
  String toString() {
    return 'KycData(kycStatus: $kycStatus, personalInfo: $personalInfo, validID: $validID, selfieImageUrl: $selfieImageUrl, kycRejectionReason: $kycRejectionReason)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$KycDataImpl &&
            (identical(other.kycStatus, kycStatus) ||
                other.kycStatus == kycStatus) &&
            const DeepCollectionEquality()
                .equals(other._personalInfo, _personalInfo) &&
            (identical(other.validID, validID) || other.validID == validID) &&
            (identical(other.selfieImageUrl, selfieImageUrl) ||
                other.selfieImageUrl == selfieImageUrl) &&
            (identical(other.kycRejectionReason, kycRejectionReason) ||
                other.kycRejectionReason == kycRejectionReason));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      kycStatus,
      const DeepCollectionEquality().hash(_personalInfo),
      validID,
      selfieImageUrl,
      kycRejectionReason);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$KycDataImplCopyWith<_$KycDataImpl> get copyWith =>
      __$$KycDataImplCopyWithImpl<_$KycDataImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$KycDataImplToJson(
      this,
    );
  }
}

abstract class _KycData implements KycData {
  const factory _KycData(
      {final String? kycStatus,
      final Map<String, dynamic>? personalInfo,
      final KycValidId? validID,
      final String? selfieImageUrl,
      final String? kycRejectionReason}) = _$KycDataImpl;

  factory _KycData.fromJson(Map<String, dynamic> json) = _$KycDataImpl.fromJson;

  @override
  String? get kycStatus;
  @override
  Map<String, dynamic>? get personalInfo;
  @override
  KycValidId? get validID;
  @override
  String? get selfieImageUrl;
  @override
  String? get kycRejectionReason;
  @override
  @JsonKey(ignore: true)
  _$$KycDataImplCopyWith<_$KycDataImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
