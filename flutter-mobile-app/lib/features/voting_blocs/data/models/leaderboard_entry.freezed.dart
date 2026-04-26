// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'leaderboard_entry.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

LeaderboardEntry _$LeaderboardEntryFromJson(Map<String, dynamic> json) {
  return _LeaderboardEntry.fromJson(json);
}

/// @nodoc
mixin _$LeaderboardEntry {
  @JsonKey(name: '_id')
  String get id => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  BlocCreator? get creator => throw _privateConstructorUsedError;
  BlocMetrics? get metrics => throw _privateConstructorUsedError;
  BlocLocation? get location => throw _privateConstructorUsedError;
  String get scope => throw _privateConstructorUsedError;
  String? get bannerImageUrl => throw _privateConstructorUsedError;
  String get status => throw _privateConstructorUsedError;
  String? get createdAt => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $LeaderboardEntryCopyWith<LeaderboardEntry> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $LeaderboardEntryCopyWith<$Res> {
  factory $LeaderboardEntryCopyWith(
          LeaderboardEntry value, $Res Function(LeaderboardEntry) then) =
      _$LeaderboardEntryCopyWithImpl<$Res, LeaderboardEntry>;
  @useResult
  $Res call(
      {@JsonKey(name: '_id') String id,
      String name,
      BlocCreator? creator,
      BlocMetrics? metrics,
      BlocLocation? location,
      String scope,
      String? bannerImageUrl,
      String status,
      String? createdAt});

  $BlocCreatorCopyWith<$Res>? get creator;
  $BlocMetricsCopyWith<$Res>? get metrics;
  $BlocLocationCopyWith<$Res>? get location;
}

/// @nodoc
class _$LeaderboardEntryCopyWithImpl<$Res, $Val extends LeaderboardEntry>
    implements $LeaderboardEntryCopyWith<$Res> {
  _$LeaderboardEntryCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? creator = freezed,
    Object? metrics = freezed,
    Object? location = freezed,
    Object? scope = null,
    Object? bannerImageUrl = freezed,
    Object? status = null,
    Object? createdAt = freezed,
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
      creator: freezed == creator
          ? _value.creator
          : creator // ignore: cast_nullable_to_non_nullable
              as BlocCreator?,
      metrics: freezed == metrics
          ? _value.metrics
          : metrics // ignore: cast_nullable_to_non_nullable
              as BlocMetrics?,
      location: freezed == location
          ? _value.location
          : location // ignore: cast_nullable_to_non_nullable
              as BlocLocation?,
      scope: null == scope
          ? _value.scope
          : scope // ignore: cast_nullable_to_non_nullable
              as String,
      bannerImageUrl: freezed == bannerImageUrl
          ? _value.bannerImageUrl
          : bannerImageUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      createdAt: freezed == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }

  @override
  @pragma('vm:prefer-inline')
  $BlocCreatorCopyWith<$Res>? get creator {
    if (_value.creator == null) {
      return null;
    }

    return $BlocCreatorCopyWith<$Res>(_value.creator!, (value) {
      return _then(_value.copyWith(creator: value) as $Val);
    });
  }

  @override
  @pragma('vm:prefer-inline')
  $BlocMetricsCopyWith<$Res>? get metrics {
    if (_value.metrics == null) {
      return null;
    }

    return $BlocMetricsCopyWith<$Res>(_value.metrics!, (value) {
      return _then(_value.copyWith(metrics: value) as $Val);
    });
  }

  @override
  @pragma('vm:prefer-inline')
  $BlocLocationCopyWith<$Res>? get location {
    if (_value.location == null) {
      return null;
    }

    return $BlocLocationCopyWith<$Res>(_value.location!, (value) {
      return _then(_value.copyWith(location: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$LeaderboardEntryImplCopyWith<$Res>
    implements $LeaderboardEntryCopyWith<$Res> {
  factory _$$LeaderboardEntryImplCopyWith(_$LeaderboardEntryImpl value,
          $Res Function(_$LeaderboardEntryImpl) then) =
      __$$LeaderboardEntryImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {@JsonKey(name: '_id') String id,
      String name,
      BlocCreator? creator,
      BlocMetrics? metrics,
      BlocLocation? location,
      String scope,
      String? bannerImageUrl,
      String status,
      String? createdAt});

  @override
  $BlocCreatorCopyWith<$Res>? get creator;
  @override
  $BlocMetricsCopyWith<$Res>? get metrics;
  @override
  $BlocLocationCopyWith<$Res>? get location;
}

/// @nodoc
class __$$LeaderboardEntryImplCopyWithImpl<$Res>
    extends _$LeaderboardEntryCopyWithImpl<$Res, _$LeaderboardEntryImpl>
    implements _$$LeaderboardEntryImplCopyWith<$Res> {
  __$$LeaderboardEntryImplCopyWithImpl(_$LeaderboardEntryImpl _value,
      $Res Function(_$LeaderboardEntryImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? creator = freezed,
    Object? metrics = freezed,
    Object? location = freezed,
    Object? scope = null,
    Object? bannerImageUrl = freezed,
    Object? status = null,
    Object? createdAt = freezed,
  }) {
    return _then(_$LeaderboardEntryImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      creator: freezed == creator
          ? _value.creator
          : creator // ignore: cast_nullable_to_non_nullable
              as BlocCreator?,
      metrics: freezed == metrics
          ? _value.metrics
          : metrics // ignore: cast_nullable_to_non_nullable
              as BlocMetrics?,
      location: freezed == location
          ? _value.location
          : location // ignore: cast_nullable_to_non_nullable
              as BlocLocation?,
      scope: null == scope
          ? _value.scope
          : scope // ignore: cast_nullable_to_non_nullable
              as String,
      bannerImageUrl: freezed == bannerImageUrl
          ? _value.bannerImageUrl
          : bannerImageUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      createdAt: freezed == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$LeaderboardEntryImpl implements _LeaderboardEntry {
  const _$LeaderboardEntryImpl(
      {@JsonKey(name: '_id') required this.id,
      required this.name,
      this.creator,
      this.metrics,
      this.location,
      this.scope = '',
      this.bannerImageUrl,
      this.status = 'active',
      this.createdAt});

  factory _$LeaderboardEntryImpl.fromJson(Map<String, dynamic> json) =>
      _$$LeaderboardEntryImplFromJson(json);

  @override
  @JsonKey(name: '_id')
  final String id;
  @override
  final String name;
  @override
  final BlocCreator? creator;
  @override
  final BlocMetrics? metrics;
  @override
  final BlocLocation? location;
  @override
  @JsonKey()
  final String scope;
  @override
  final String? bannerImageUrl;
  @override
  @JsonKey()
  final String status;
  @override
  final String? createdAt;

  @override
  String toString() {
    return 'LeaderboardEntry(id: $id, name: $name, creator: $creator, metrics: $metrics, location: $location, scope: $scope, bannerImageUrl: $bannerImageUrl, status: $status, createdAt: $createdAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$LeaderboardEntryImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.creator, creator) || other.creator == creator) &&
            (identical(other.metrics, metrics) || other.metrics == metrics) &&
            (identical(other.location, location) ||
                other.location == location) &&
            (identical(other.scope, scope) || other.scope == scope) &&
            (identical(other.bannerImageUrl, bannerImageUrl) ||
                other.bannerImageUrl == bannerImageUrl) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, id, name, creator, metrics,
      location, scope, bannerImageUrl, status, createdAt);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$LeaderboardEntryImplCopyWith<_$LeaderboardEntryImpl> get copyWith =>
      __$$LeaderboardEntryImplCopyWithImpl<_$LeaderboardEntryImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$LeaderboardEntryImplToJson(
      this,
    );
  }
}

abstract class _LeaderboardEntry implements LeaderboardEntry {
  const factory _LeaderboardEntry(
      {@JsonKey(name: '_id') required final String id,
      required final String name,
      final BlocCreator? creator,
      final BlocMetrics? metrics,
      final BlocLocation? location,
      final String scope,
      final String? bannerImageUrl,
      final String status,
      final String? createdAt}) = _$LeaderboardEntryImpl;

  factory _LeaderboardEntry.fromJson(Map<String, dynamic> json) =
      _$LeaderboardEntryImpl.fromJson;

  @override
  @JsonKey(name: '_id')
  String get id;
  @override
  String get name;
  @override
  BlocCreator? get creator;
  @override
  BlocMetrics? get metrics;
  @override
  BlocLocation? get location;
  @override
  String get scope;
  @override
  String? get bannerImageUrl;
  @override
  String get status;
  @override
  String? get createdAt;
  @override
  @JsonKey(ignore: true)
  _$$LeaderboardEntryImplCopyWith<_$LeaderboardEntryImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
