// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'dashboard_data.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

DashboardStats _$DashboardStatsFromJson(Map<String, dynamic> json) {
  return _DashboardStats.fromJson(json);
}

/// @nodoc
mixin _$DashboardStats {
  int get obidientRegisteredVoters => throw _privateConstructorUsedError;
  int get obidientVotersWithPVC => throw _privateConstructorUsedError;
  int get obidientVotersWithoutPVC => throw _privateConstructorUsedError;
  int get pvcWithStatus => throw _privateConstructorUsedError;
  int get pvcWithoutStatus => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $DashboardStatsCopyWith<DashboardStats> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $DashboardStatsCopyWith<$Res> {
  factory $DashboardStatsCopyWith(
          DashboardStats value, $Res Function(DashboardStats) then) =
      _$DashboardStatsCopyWithImpl<$Res, DashboardStats>;
  @useResult
  $Res call(
      {int obidientRegisteredVoters,
      int obidientVotersWithPVC,
      int obidientVotersWithoutPVC,
      int pvcWithStatus,
      int pvcWithoutStatus});
}

/// @nodoc
class _$DashboardStatsCopyWithImpl<$Res, $Val extends DashboardStats>
    implements $DashboardStatsCopyWith<$Res> {
  _$DashboardStatsCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? obidientRegisteredVoters = null,
    Object? obidientVotersWithPVC = null,
    Object? obidientVotersWithoutPVC = null,
    Object? pvcWithStatus = null,
    Object? pvcWithoutStatus = null,
  }) {
    return _then(_value.copyWith(
      obidientRegisteredVoters: null == obidientRegisteredVoters
          ? _value.obidientRegisteredVoters
          : obidientRegisteredVoters // ignore: cast_nullable_to_non_nullable
              as int,
      obidientVotersWithPVC: null == obidientVotersWithPVC
          ? _value.obidientVotersWithPVC
          : obidientVotersWithPVC // ignore: cast_nullable_to_non_nullable
              as int,
      obidientVotersWithoutPVC: null == obidientVotersWithoutPVC
          ? _value.obidientVotersWithoutPVC
          : obidientVotersWithoutPVC // ignore: cast_nullable_to_non_nullable
              as int,
      pvcWithStatus: null == pvcWithStatus
          ? _value.pvcWithStatus
          : pvcWithStatus // ignore: cast_nullable_to_non_nullable
              as int,
      pvcWithoutStatus: null == pvcWithoutStatus
          ? _value.pvcWithoutStatus
          : pvcWithoutStatus // ignore: cast_nullable_to_non_nullable
              as int,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$DashboardStatsImplCopyWith<$Res>
    implements $DashboardStatsCopyWith<$Res> {
  factory _$$DashboardStatsImplCopyWith(_$DashboardStatsImpl value,
          $Res Function(_$DashboardStatsImpl) then) =
      __$$DashboardStatsImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {int obidientRegisteredVoters,
      int obidientVotersWithPVC,
      int obidientVotersWithoutPVC,
      int pvcWithStatus,
      int pvcWithoutStatus});
}

/// @nodoc
class __$$DashboardStatsImplCopyWithImpl<$Res>
    extends _$DashboardStatsCopyWithImpl<$Res, _$DashboardStatsImpl>
    implements _$$DashboardStatsImplCopyWith<$Res> {
  __$$DashboardStatsImplCopyWithImpl(
      _$DashboardStatsImpl _value, $Res Function(_$DashboardStatsImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? obidientRegisteredVoters = null,
    Object? obidientVotersWithPVC = null,
    Object? obidientVotersWithoutPVC = null,
    Object? pvcWithStatus = null,
    Object? pvcWithoutStatus = null,
  }) {
    return _then(_$DashboardStatsImpl(
      obidientRegisteredVoters: null == obidientRegisteredVoters
          ? _value.obidientRegisteredVoters
          : obidientRegisteredVoters // ignore: cast_nullable_to_non_nullable
              as int,
      obidientVotersWithPVC: null == obidientVotersWithPVC
          ? _value.obidientVotersWithPVC
          : obidientVotersWithPVC // ignore: cast_nullable_to_non_nullable
              as int,
      obidientVotersWithoutPVC: null == obidientVotersWithoutPVC
          ? _value.obidientVotersWithoutPVC
          : obidientVotersWithoutPVC // ignore: cast_nullable_to_non_nullable
              as int,
      pvcWithStatus: null == pvcWithStatus
          ? _value.pvcWithStatus
          : pvcWithStatus // ignore: cast_nullable_to_non_nullable
              as int,
      pvcWithoutStatus: null == pvcWithoutStatus
          ? _value.pvcWithoutStatus
          : pvcWithoutStatus // ignore: cast_nullable_to_non_nullable
              as int,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$DashboardStatsImpl implements _DashboardStats {
  const _$DashboardStatsImpl(
      {this.obidientRegisteredVoters = 0,
      this.obidientVotersWithPVC = 0,
      this.obidientVotersWithoutPVC = 0,
      this.pvcWithStatus = 0,
      this.pvcWithoutStatus = 0});

  factory _$DashboardStatsImpl.fromJson(Map<String, dynamic> json) =>
      _$$DashboardStatsImplFromJson(json);

  @override
  @JsonKey()
  final int obidientRegisteredVoters;
  @override
  @JsonKey()
  final int obidientVotersWithPVC;
  @override
  @JsonKey()
  final int obidientVotersWithoutPVC;
  @override
  @JsonKey()
  final int pvcWithStatus;
  @override
  @JsonKey()
  final int pvcWithoutStatus;

  @override
  String toString() {
    return 'DashboardStats(obidientRegisteredVoters: $obidientRegisteredVoters, obidientVotersWithPVC: $obidientVotersWithPVC, obidientVotersWithoutPVC: $obidientVotersWithoutPVC, pvcWithStatus: $pvcWithStatus, pvcWithoutStatus: $pvcWithoutStatus)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$DashboardStatsImpl &&
            (identical(
                    other.obidientRegisteredVoters, obidientRegisteredVoters) ||
                other.obidientRegisteredVoters == obidientRegisteredVoters) &&
            (identical(other.obidientVotersWithPVC, obidientVotersWithPVC) ||
                other.obidientVotersWithPVC == obidientVotersWithPVC) &&
            (identical(
                    other.obidientVotersWithoutPVC, obidientVotersWithoutPVC) ||
                other.obidientVotersWithoutPVC == obidientVotersWithoutPVC) &&
            (identical(other.pvcWithStatus, pvcWithStatus) ||
                other.pvcWithStatus == pvcWithStatus) &&
            (identical(other.pvcWithoutStatus, pvcWithoutStatus) ||
                other.pvcWithoutStatus == pvcWithoutStatus));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      obidientRegisteredVoters,
      obidientVotersWithPVC,
      obidientVotersWithoutPVC,
      pvcWithStatus,
      pvcWithoutStatus);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$DashboardStatsImplCopyWith<_$DashboardStatsImpl> get copyWith =>
      __$$DashboardStatsImplCopyWithImpl<_$DashboardStatsImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$DashboardStatsImplToJson(
      this,
    );
  }
}

abstract class _DashboardStats implements DashboardStats {
  const factory _DashboardStats(
      {final int obidientRegisteredVoters,
      final int obidientVotersWithPVC,
      final int obidientVotersWithoutPVC,
      final int pvcWithStatus,
      final int pvcWithoutStatus}) = _$DashboardStatsImpl;

  factory _DashboardStats.fromJson(Map<String, dynamic> json) =
      _$DashboardStatsImpl.fromJson;

  @override
  int get obidientRegisteredVoters;
  @override
  int get obidientVotersWithPVC;
  @override
  int get obidientVotersWithoutPVC;
  @override
  int get pvcWithStatus;
  @override
  int get pvcWithoutStatus;
  @override
  @JsonKey(ignore: true)
  _$$DashboardStatsImplCopyWith<_$DashboardStatsImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

DashboardItem _$DashboardItemFromJson(Map<String, dynamic> json) {
  return _DashboardItem.fromJson(json);
}

/// @nodoc
mixin _$DashboardItem {
  String get id => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String? get code => throw _privateConstructorUsedError;
  String? get level => throw _privateConstructorUsedError;
  int get obidientRegisteredVoters => throw _privateConstructorUsedError;
  int get obidientVotersWithPVC => throw _privateConstructorUsedError;
  int get obidientVotersWithoutPVC => throw _privateConstructorUsedError;
  int get pvcWithStatus => throw _privateConstructorUsedError;
  int get pvcWithoutStatus => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $DashboardItemCopyWith<DashboardItem> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $DashboardItemCopyWith<$Res> {
  factory $DashboardItemCopyWith(
          DashboardItem value, $Res Function(DashboardItem) then) =
      _$DashboardItemCopyWithImpl<$Res, DashboardItem>;
  @useResult
  $Res call(
      {String id,
      String name,
      String? code,
      String? level,
      int obidientRegisteredVoters,
      int obidientVotersWithPVC,
      int obidientVotersWithoutPVC,
      int pvcWithStatus,
      int pvcWithoutStatus});
}

/// @nodoc
class _$DashboardItemCopyWithImpl<$Res, $Val extends DashboardItem>
    implements $DashboardItemCopyWith<$Res> {
  _$DashboardItemCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? code = freezed,
    Object? level = freezed,
    Object? obidientRegisteredVoters = null,
    Object? obidientVotersWithPVC = null,
    Object? obidientVotersWithoutPVC = null,
    Object? pvcWithStatus = null,
    Object? pvcWithoutStatus = null,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      code: freezed == code
          ? _value.code
          : code // ignore: cast_nullable_to_non_nullable
              as String?,
      level: freezed == level
          ? _value.level
          : level // ignore: cast_nullable_to_non_nullable
              as String?,
      obidientRegisteredVoters: null == obidientRegisteredVoters
          ? _value.obidientRegisteredVoters
          : obidientRegisteredVoters // ignore: cast_nullable_to_non_nullable
              as int,
      obidientVotersWithPVC: null == obidientVotersWithPVC
          ? _value.obidientVotersWithPVC
          : obidientVotersWithPVC // ignore: cast_nullable_to_non_nullable
              as int,
      obidientVotersWithoutPVC: null == obidientVotersWithoutPVC
          ? _value.obidientVotersWithoutPVC
          : obidientVotersWithoutPVC // ignore: cast_nullable_to_non_nullable
              as int,
      pvcWithStatus: null == pvcWithStatus
          ? _value.pvcWithStatus
          : pvcWithStatus // ignore: cast_nullable_to_non_nullable
              as int,
      pvcWithoutStatus: null == pvcWithoutStatus
          ? _value.pvcWithoutStatus
          : pvcWithoutStatus // ignore: cast_nullable_to_non_nullable
              as int,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$DashboardItemImplCopyWith<$Res>
    implements $DashboardItemCopyWith<$Res> {
  factory _$$DashboardItemImplCopyWith(
          _$DashboardItemImpl value, $Res Function(_$DashboardItemImpl) then) =
      __$$DashboardItemImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String name,
      String? code,
      String? level,
      int obidientRegisteredVoters,
      int obidientVotersWithPVC,
      int obidientVotersWithoutPVC,
      int pvcWithStatus,
      int pvcWithoutStatus});
}

/// @nodoc
class __$$DashboardItemImplCopyWithImpl<$Res>
    extends _$DashboardItemCopyWithImpl<$Res, _$DashboardItemImpl>
    implements _$$DashboardItemImplCopyWith<$Res> {
  __$$DashboardItemImplCopyWithImpl(
      _$DashboardItemImpl _value, $Res Function(_$DashboardItemImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? code = freezed,
    Object? level = freezed,
    Object? obidientRegisteredVoters = null,
    Object? obidientVotersWithPVC = null,
    Object? obidientVotersWithoutPVC = null,
    Object? pvcWithStatus = null,
    Object? pvcWithoutStatus = null,
  }) {
    return _then(_$DashboardItemImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      code: freezed == code
          ? _value.code
          : code // ignore: cast_nullable_to_non_nullable
              as String?,
      level: freezed == level
          ? _value.level
          : level // ignore: cast_nullable_to_non_nullable
              as String?,
      obidientRegisteredVoters: null == obidientRegisteredVoters
          ? _value.obidientRegisteredVoters
          : obidientRegisteredVoters // ignore: cast_nullable_to_non_nullable
              as int,
      obidientVotersWithPVC: null == obidientVotersWithPVC
          ? _value.obidientVotersWithPVC
          : obidientVotersWithPVC // ignore: cast_nullable_to_non_nullable
              as int,
      obidientVotersWithoutPVC: null == obidientVotersWithoutPVC
          ? _value.obidientVotersWithoutPVC
          : obidientVotersWithoutPVC // ignore: cast_nullable_to_non_nullable
              as int,
      pvcWithStatus: null == pvcWithStatus
          ? _value.pvcWithStatus
          : pvcWithStatus // ignore: cast_nullable_to_non_nullable
              as int,
      pvcWithoutStatus: null == pvcWithoutStatus
          ? _value.pvcWithoutStatus
          : pvcWithoutStatus // ignore: cast_nullable_to_non_nullable
              as int,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$DashboardItemImpl implements _DashboardItem {
  const _$DashboardItemImpl(
      {required this.id,
      required this.name,
      this.code,
      this.level,
      this.obidientRegisteredVoters = 0,
      this.obidientVotersWithPVC = 0,
      this.obidientVotersWithoutPVC = 0,
      this.pvcWithStatus = 0,
      this.pvcWithoutStatus = 0});

  factory _$DashboardItemImpl.fromJson(Map<String, dynamic> json) =>
      _$$DashboardItemImplFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  final String? code;
  @override
  final String? level;
  @override
  @JsonKey()
  final int obidientRegisteredVoters;
  @override
  @JsonKey()
  final int obidientVotersWithPVC;
  @override
  @JsonKey()
  final int obidientVotersWithoutPVC;
  @override
  @JsonKey()
  final int pvcWithStatus;
  @override
  @JsonKey()
  final int pvcWithoutStatus;

  @override
  String toString() {
    return 'DashboardItem(id: $id, name: $name, code: $code, level: $level, obidientRegisteredVoters: $obidientRegisteredVoters, obidientVotersWithPVC: $obidientVotersWithPVC, obidientVotersWithoutPVC: $obidientVotersWithoutPVC, pvcWithStatus: $pvcWithStatus, pvcWithoutStatus: $pvcWithoutStatus)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$DashboardItemImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.code, code) || other.code == code) &&
            (identical(other.level, level) || other.level == level) &&
            (identical(
                    other.obidientRegisteredVoters, obidientRegisteredVoters) ||
                other.obidientRegisteredVoters == obidientRegisteredVoters) &&
            (identical(other.obidientVotersWithPVC, obidientVotersWithPVC) ||
                other.obidientVotersWithPVC == obidientVotersWithPVC) &&
            (identical(
                    other.obidientVotersWithoutPVC, obidientVotersWithoutPVC) ||
                other.obidientVotersWithoutPVC == obidientVotersWithoutPVC) &&
            (identical(other.pvcWithStatus, pvcWithStatus) ||
                other.pvcWithStatus == pvcWithStatus) &&
            (identical(other.pvcWithoutStatus, pvcWithoutStatus) ||
                other.pvcWithoutStatus == pvcWithoutStatus));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      name,
      code,
      level,
      obidientRegisteredVoters,
      obidientVotersWithPVC,
      obidientVotersWithoutPVC,
      pvcWithStatus,
      pvcWithoutStatus);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$DashboardItemImplCopyWith<_$DashboardItemImpl> get copyWith =>
      __$$DashboardItemImplCopyWithImpl<_$DashboardItemImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$DashboardItemImplToJson(
      this,
    );
  }
}

abstract class _DashboardItem implements DashboardItem {
  const factory _DashboardItem(
      {required final String id,
      required final String name,
      final String? code,
      final String? level,
      final int obidientRegisteredVoters,
      final int obidientVotersWithPVC,
      final int obidientVotersWithoutPVC,
      final int pvcWithStatus,
      final int pvcWithoutStatus}) = _$DashboardItemImpl;

  factory _DashboardItem.fromJson(Map<String, dynamic> json) =
      _$DashboardItemImpl.fromJson;

  @override
  String get id;
  @override
  String get name;
  @override
  String? get code;
  @override
  String? get level;
  @override
  int get obidientRegisteredVoters;
  @override
  int get obidientVotersWithPVC;
  @override
  int get obidientVotersWithoutPVC;
  @override
  int get pvcWithStatus;
  @override
  int get pvcWithoutStatus;
  @override
  @JsonKey(ignore: true)
  _$$DashboardItemImplCopyWith<_$DashboardItemImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

BreadcrumbItem _$BreadcrumbItemFromJson(Map<String, dynamic> json) {
  return _BreadcrumbItem.fromJson(json);
}

/// @nodoc
mixin _$BreadcrumbItem {
  String get level => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String? get id => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $BreadcrumbItemCopyWith<BreadcrumbItem> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $BreadcrumbItemCopyWith<$Res> {
  factory $BreadcrumbItemCopyWith(
          BreadcrumbItem value, $Res Function(BreadcrumbItem) then) =
      _$BreadcrumbItemCopyWithImpl<$Res, BreadcrumbItem>;
  @useResult
  $Res call({String level, String name, String? id});
}

/// @nodoc
class _$BreadcrumbItemCopyWithImpl<$Res, $Val extends BreadcrumbItem>
    implements $BreadcrumbItemCopyWith<$Res> {
  _$BreadcrumbItemCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? level = null,
    Object? name = null,
    Object? id = freezed,
  }) {
    return _then(_value.copyWith(
      level: null == level
          ? _value.level
          : level // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      id: freezed == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$BreadcrumbItemImplCopyWith<$Res>
    implements $BreadcrumbItemCopyWith<$Res> {
  factory _$$BreadcrumbItemImplCopyWith(_$BreadcrumbItemImpl value,
          $Res Function(_$BreadcrumbItemImpl) then) =
      __$$BreadcrumbItemImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String level, String name, String? id});
}

/// @nodoc
class __$$BreadcrumbItemImplCopyWithImpl<$Res>
    extends _$BreadcrumbItemCopyWithImpl<$Res, _$BreadcrumbItemImpl>
    implements _$$BreadcrumbItemImplCopyWith<$Res> {
  __$$BreadcrumbItemImplCopyWithImpl(
      _$BreadcrumbItemImpl _value, $Res Function(_$BreadcrumbItemImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? level = null,
    Object? name = null,
    Object? id = freezed,
  }) {
    return _then(_$BreadcrumbItemImpl(
      level: null == level
          ? _value.level
          : level // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      id: freezed == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$BreadcrumbItemImpl implements _BreadcrumbItem {
  const _$BreadcrumbItemImpl(
      {required this.level, required this.name, this.id});

  factory _$BreadcrumbItemImpl.fromJson(Map<String, dynamic> json) =>
      _$$BreadcrumbItemImplFromJson(json);

  @override
  final String level;
  @override
  final String name;
  @override
  final String? id;

  @override
  String toString() {
    return 'BreadcrumbItem(level: $level, name: $name, id: $id)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$BreadcrumbItemImpl &&
            (identical(other.level, level) || other.level == level) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.id, id) || other.id == id));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, level, name, id);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$BreadcrumbItemImplCopyWith<_$BreadcrumbItemImpl> get copyWith =>
      __$$BreadcrumbItemImplCopyWithImpl<_$BreadcrumbItemImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$BreadcrumbItemImplToJson(
      this,
    );
  }
}

abstract class _BreadcrumbItem implements BreadcrumbItem {
  const factory _BreadcrumbItem(
      {required final String level,
      required final String name,
      final String? id}) = _$BreadcrumbItemImpl;

  factory _BreadcrumbItem.fromJson(Map<String, dynamic> json) =
      _$BreadcrumbItemImpl.fromJson;

  @override
  String get level;
  @override
  String get name;
  @override
  String? get id;
  @override
  @JsonKey(ignore: true)
  _$$BreadcrumbItemImplCopyWith<_$BreadcrumbItemImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

UserLevelInfo _$UserLevelInfoFromJson(Map<String, dynamic> json) {
  return _UserLevelInfo.fromJson(json);
}

/// @nodoc
mixin _$UserLevelInfo {
  String get userLevel => throw _privateConstructorUsedError;
  Map<String, dynamic>? get assignedLocation =>
      throw _privateConstructorUsedError;
  List<String> get allowedLevels => throw _privateConstructorUsedError;
  String? get designation => throw _privateConstructorUsedError;
  String? get role => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $UserLevelInfoCopyWith<UserLevelInfo> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UserLevelInfoCopyWith<$Res> {
  factory $UserLevelInfoCopyWith(
          UserLevelInfo value, $Res Function(UserLevelInfo) then) =
      _$UserLevelInfoCopyWithImpl<$Res, UserLevelInfo>;
  @useResult
  $Res call(
      {String userLevel,
      Map<String, dynamic>? assignedLocation,
      List<String> allowedLevels,
      String? designation,
      String? role});
}

/// @nodoc
class _$UserLevelInfoCopyWithImpl<$Res, $Val extends UserLevelInfo>
    implements $UserLevelInfoCopyWith<$Res> {
  _$UserLevelInfoCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? userLevel = null,
    Object? assignedLocation = freezed,
    Object? allowedLevels = null,
    Object? designation = freezed,
    Object? role = freezed,
  }) {
    return _then(_value.copyWith(
      userLevel: null == userLevel
          ? _value.userLevel
          : userLevel // ignore: cast_nullable_to_non_nullable
              as String,
      assignedLocation: freezed == assignedLocation
          ? _value.assignedLocation
          : assignedLocation // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>?,
      allowedLevels: null == allowedLevels
          ? _value.allowedLevels
          : allowedLevels // ignore: cast_nullable_to_non_nullable
              as List<String>,
      designation: freezed == designation
          ? _value.designation
          : designation // ignore: cast_nullable_to_non_nullable
              as String?,
      role: freezed == role
          ? _value.role
          : role // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$UserLevelInfoImplCopyWith<$Res>
    implements $UserLevelInfoCopyWith<$Res> {
  factory _$$UserLevelInfoImplCopyWith(
          _$UserLevelInfoImpl value, $Res Function(_$UserLevelInfoImpl) then) =
      __$$UserLevelInfoImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String userLevel,
      Map<String, dynamic>? assignedLocation,
      List<String> allowedLevels,
      String? designation,
      String? role});
}

/// @nodoc
class __$$UserLevelInfoImplCopyWithImpl<$Res>
    extends _$UserLevelInfoCopyWithImpl<$Res, _$UserLevelInfoImpl>
    implements _$$UserLevelInfoImplCopyWith<$Res> {
  __$$UserLevelInfoImplCopyWithImpl(
      _$UserLevelInfoImpl _value, $Res Function(_$UserLevelInfoImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? userLevel = null,
    Object? assignedLocation = freezed,
    Object? allowedLevels = null,
    Object? designation = freezed,
    Object? role = freezed,
  }) {
    return _then(_$UserLevelInfoImpl(
      userLevel: null == userLevel
          ? _value.userLevel
          : userLevel // ignore: cast_nullable_to_non_nullable
              as String,
      assignedLocation: freezed == assignedLocation
          ? _value._assignedLocation
          : assignedLocation // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>?,
      allowedLevels: null == allowedLevels
          ? _value._allowedLevels
          : allowedLevels // ignore: cast_nullable_to_non_nullable
              as List<String>,
      designation: freezed == designation
          ? _value.designation
          : designation // ignore: cast_nullable_to_non_nullable
              as String?,
      role: freezed == role
          ? _value.role
          : role // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$UserLevelInfoImpl implements _UserLevelInfo {
  const _$UserLevelInfoImpl(
      {required this.userLevel,
      final Map<String, dynamic>? assignedLocation,
      final List<String> allowedLevels = const [],
      this.designation,
      this.role})
      : _assignedLocation = assignedLocation,
        _allowedLevels = allowedLevels;

  factory _$UserLevelInfoImpl.fromJson(Map<String, dynamic> json) =>
      _$$UserLevelInfoImplFromJson(json);

  @override
  final String userLevel;
  final Map<String, dynamic>? _assignedLocation;
  @override
  Map<String, dynamic>? get assignedLocation {
    final value = _assignedLocation;
    if (value == null) return null;
    if (_assignedLocation is EqualUnmodifiableMapView) return _assignedLocation;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  final List<String> _allowedLevels;
  @override
  @JsonKey()
  List<String> get allowedLevels {
    if (_allowedLevels is EqualUnmodifiableListView) return _allowedLevels;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_allowedLevels);
  }

  @override
  final String? designation;
  @override
  final String? role;

  @override
  String toString() {
    return 'UserLevelInfo(userLevel: $userLevel, assignedLocation: $assignedLocation, allowedLevels: $allowedLevels, designation: $designation, role: $role)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$UserLevelInfoImpl &&
            (identical(other.userLevel, userLevel) ||
                other.userLevel == userLevel) &&
            const DeepCollectionEquality()
                .equals(other._assignedLocation, _assignedLocation) &&
            const DeepCollectionEquality()
                .equals(other._allowedLevels, _allowedLevels) &&
            (identical(other.designation, designation) ||
                other.designation == designation) &&
            (identical(other.role, role) || other.role == role));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      userLevel,
      const DeepCollectionEquality().hash(_assignedLocation),
      const DeepCollectionEquality().hash(_allowedLevels),
      designation,
      role);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$UserLevelInfoImplCopyWith<_$UserLevelInfoImpl> get copyWith =>
      __$$UserLevelInfoImplCopyWithImpl<_$UserLevelInfoImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$UserLevelInfoImplToJson(
      this,
    );
  }
}

abstract class _UserLevelInfo implements UserLevelInfo {
  const factory _UserLevelInfo(
      {required final String userLevel,
      final Map<String, dynamic>? assignedLocation,
      final List<String> allowedLevels,
      final String? designation,
      final String? role}) = _$UserLevelInfoImpl;

  factory _UserLevelInfo.fromJson(Map<String, dynamic> json) =
      _$UserLevelInfoImpl.fromJson;

  @override
  String get userLevel;
  @override
  Map<String, dynamic>? get assignedLocation;
  @override
  List<String> get allowedLevels;
  @override
  String? get designation;
  @override
  String? get role;
  @override
  @JsonKey(ignore: true)
  _$$UserLevelInfoImplCopyWith<_$UserLevelInfoImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

DashboardResponse _$DashboardResponseFromJson(Map<String, dynamic> json) {
  return _DashboardResponse.fromJson(json);
}

/// @nodoc
mixin _$DashboardResponse {
  String get level => throw _privateConstructorUsedError;
  DashboardStats get stats => throw _privateConstructorUsedError;
  List<DashboardItem> get items => throw _privateConstructorUsedError;
  List<BreadcrumbItem> get breadcrumbs => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $DashboardResponseCopyWith<DashboardResponse> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $DashboardResponseCopyWith<$Res> {
  factory $DashboardResponseCopyWith(
          DashboardResponse value, $Res Function(DashboardResponse) then) =
      _$DashboardResponseCopyWithImpl<$Res, DashboardResponse>;
  @useResult
  $Res call(
      {String level,
      DashboardStats stats,
      List<DashboardItem> items,
      List<BreadcrumbItem> breadcrumbs});

  $DashboardStatsCopyWith<$Res> get stats;
}

/// @nodoc
class _$DashboardResponseCopyWithImpl<$Res, $Val extends DashboardResponse>
    implements $DashboardResponseCopyWith<$Res> {
  _$DashboardResponseCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? level = null,
    Object? stats = null,
    Object? items = null,
    Object? breadcrumbs = null,
  }) {
    return _then(_value.copyWith(
      level: null == level
          ? _value.level
          : level // ignore: cast_nullable_to_non_nullable
              as String,
      stats: null == stats
          ? _value.stats
          : stats // ignore: cast_nullable_to_non_nullable
              as DashboardStats,
      items: null == items
          ? _value.items
          : items // ignore: cast_nullable_to_non_nullable
              as List<DashboardItem>,
      breadcrumbs: null == breadcrumbs
          ? _value.breadcrumbs
          : breadcrumbs // ignore: cast_nullable_to_non_nullable
              as List<BreadcrumbItem>,
    ) as $Val);
  }

  @override
  @pragma('vm:prefer-inline')
  $DashboardStatsCopyWith<$Res> get stats {
    return $DashboardStatsCopyWith<$Res>(_value.stats, (value) {
      return _then(_value.copyWith(stats: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$DashboardResponseImplCopyWith<$Res>
    implements $DashboardResponseCopyWith<$Res> {
  factory _$$DashboardResponseImplCopyWith(_$DashboardResponseImpl value,
          $Res Function(_$DashboardResponseImpl) then) =
      __$$DashboardResponseImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String level,
      DashboardStats stats,
      List<DashboardItem> items,
      List<BreadcrumbItem> breadcrumbs});

  @override
  $DashboardStatsCopyWith<$Res> get stats;
}

/// @nodoc
class __$$DashboardResponseImplCopyWithImpl<$Res>
    extends _$DashboardResponseCopyWithImpl<$Res, _$DashboardResponseImpl>
    implements _$$DashboardResponseImplCopyWith<$Res> {
  __$$DashboardResponseImplCopyWithImpl(_$DashboardResponseImpl _value,
      $Res Function(_$DashboardResponseImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? level = null,
    Object? stats = null,
    Object? items = null,
    Object? breadcrumbs = null,
  }) {
    return _then(_$DashboardResponseImpl(
      level: null == level
          ? _value.level
          : level // ignore: cast_nullable_to_non_nullable
              as String,
      stats: null == stats
          ? _value.stats
          : stats // ignore: cast_nullable_to_non_nullable
              as DashboardStats,
      items: null == items
          ? _value._items
          : items // ignore: cast_nullable_to_non_nullable
              as List<DashboardItem>,
      breadcrumbs: null == breadcrumbs
          ? _value._breadcrumbs
          : breadcrumbs // ignore: cast_nullable_to_non_nullable
              as List<BreadcrumbItem>,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$DashboardResponseImpl implements _DashboardResponse {
  const _$DashboardResponseImpl(
      {required this.level,
      required this.stats,
      final List<DashboardItem> items = const [],
      final List<BreadcrumbItem> breadcrumbs = const []})
      : _items = items,
        _breadcrumbs = breadcrumbs;

  factory _$DashboardResponseImpl.fromJson(Map<String, dynamic> json) =>
      _$$DashboardResponseImplFromJson(json);

  @override
  final String level;
  @override
  final DashboardStats stats;
  final List<DashboardItem> _items;
  @override
  @JsonKey()
  List<DashboardItem> get items {
    if (_items is EqualUnmodifiableListView) return _items;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_items);
  }

  final List<BreadcrumbItem> _breadcrumbs;
  @override
  @JsonKey()
  List<BreadcrumbItem> get breadcrumbs {
    if (_breadcrumbs is EqualUnmodifiableListView) return _breadcrumbs;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_breadcrumbs);
  }

  @override
  String toString() {
    return 'DashboardResponse(level: $level, stats: $stats, items: $items, breadcrumbs: $breadcrumbs)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$DashboardResponseImpl &&
            (identical(other.level, level) || other.level == level) &&
            (identical(other.stats, stats) || other.stats == stats) &&
            const DeepCollectionEquality().equals(other._items, _items) &&
            const DeepCollectionEquality()
                .equals(other._breadcrumbs, _breadcrumbs));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      level,
      stats,
      const DeepCollectionEquality().hash(_items),
      const DeepCollectionEquality().hash(_breadcrumbs));

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$DashboardResponseImplCopyWith<_$DashboardResponseImpl> get copyWith =>
      __$$DashboardResponseImplCopyWithImpl<_$DashboardResponseImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$DashboardResponseImplToJson(
      this,
    );
  }
}

abstract class _DashboardResponse implements DashboardResponse {
  const factory _DashboardResponse(
      {required final String level,
      required final DashboardStats stats,
      final List<DashboardItem> items,
      final List<BreadcrumbItem> breadcrumbs}) = _$DashboardResponseImpl;

  factory _DashboardResponse.fromJson(Map<String, dynamic> json) =
      _$DashboardResponseImpl.fromJson;

  @override
  String get level;
  @override
  DashboardStats get stats;
  @override
  List<DashboardItem> get items;
  @override
  List<BreadcrumbItem> get breadcrumbs;
  @override
  @JsonKey(ignore: true)
  _$$DashboardResponseImplCopyWith<_$DashboardResponseImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
