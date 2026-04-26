// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'bloc_engagement.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

BlocEngagement _$BlocEngagementFromJson(Map<String, dynamic> json) {
  return _BlocEngagement.fromJson(json);
}

/// @nodoc
mixin _$BlocEngagement {
  int get totalMembers => throw _privateConstructorUsedError;
  int get recentMembers => throw _privateConstructorUsedError;
  int get pendingInvitations => throw _privateConstructorUsedError;
  int get acceptedInvitations => throw _privateConstructorUsedError;
  int get declinedInvitations => throw _privateConstructorUsedError;
  @JsonKey(fromJson: _toDouble)
  double get conversionRate => throw _privateConstructorUsedError;
  int get growthRate => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $BlocEngagementCopyWith<BlocEngagement> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $BlocEngagementCopyWith<$Res> {
  factory $BlocEngagementCopyWith(
          BlocEngagement value, $Res Function(BlocEngagement) then) =
      _$BlocEngagementCopyWithImpl<$Res, BlocEngagement>;
  @useResult
  $Res call(
      {int totalMembers,
      int recentMembers,
      int pendingInvitations,
      int acceptedInvitations,
      int declinedInvitations,
      @JsonKey(fromJson: _toDouble) double conversionRate,
      int growthRate});
}

/// @nodoc
class _$BlocEngagementCopyWithImpl<$Res, $Val extends BlocEngagement>
    implements $BlocEngagementCopyWith<$Res> {
  _$BlocEngagementCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? totalMembers = null,
    Object? recentMembers = null,
    Object? pendingInvitations = null,
    Object? acceptedInvitations = null,
    Object? declinedInvitations = null,
    Object? conversionRate = null,
    Object? growthRate = null,
  }) {
    return _then(_value.copyWith(
      totalMembers: null == totalMembers
          ? _value.totalMembers
          : totalMembers // ignore: cast_nullable_to_non_nullable
              as int,
      recentMembers: null == recentMembers
          ? _value.recentMembers
          : recentMembers // ignore: cast_nullable_to_non_nullable
              as int,
      pendingInvitations: null == pendingInvitations
          ? _value.pendingInvitations
          : pendingInvitations // ignore: cast_nullable_to_non_nullable
              as int,
      acceptedInvitations: null == acceptedInvitations
          ? _value.acceptedInvitations
          : acceptedInvitations // ignore: cast_nullable_to_non_nullable
              as int,
      declinedInvitations: null == declinedInvitations
          ? _value.declinedInvitations
          : declinedInvitations // ignore: cast_nullable_to_non_nullable
              as int,
      conversionRate: null == conversionRate
          ? _value.conversionRate
          : conversionRate // ignore: cast_nullable_to_non_nullable
              as double,
      growthRate: null == growthRate
          ? _value.growthRate
          : growthRate // ignore: cast_nullable_to_non_nullable
              as int,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$BlocEngagementImplCopyWith<$Res>
    implements $BlocEngagementCopyWith<$Res> {
  factory _$$BlocEngagementImplCopyWith(_$BlocEngagementImpl value,
          $Res Function(_$BlocEngagementImpl) then) =
      __$$BlocEngagementImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {int totalMembers,
      int recentMembers,
      int pendingInvitations,
      int acceptedInvitations,
      int declinedInvitations,
      @JsonKey(fromJson: _toDouble) double conversionRate,
      int growthRate});
}

/// @nodoc
class __$$BlocEngagementImplCopyWithImpl<$Res>
    extends _$BlocEngagementCopyWithImpl<$Res, _$BlocEngagementImpl>
    implements _$$BlocEngagementImplCopyWith<$Res> {
  __$$BlocEngagementImplCopyWithImpl(
      _$BlocEngagementImpl _value, $Res Function(_$BlocEngagementImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? totalMembers = null,
    Object? recentMembers = null,
    Object? pendingInvitations = null,
    Object? acceptedInvitations = null,
    Object? declinedInvitations = null,
    Object? conversionRate = null,
    Object? growthRate = null,
  }) {
    return _then(_$BlocEngagementImpl(
      totalMembers: null == totalMembers
          ? _value.totalMembers
          : totalMembers // ignore: cast_nullable_to_non_nullable
              as int,
      recentMembers: null == recentMembers
          ? _value.recentMembers
          : recentMembers // ignore: cast_nullable_to_non_nullable
              as int,
      pendingInvitations: null == pendingInvitations
          ? _value.pendingInvitations
          : pendingInvitations // ignore: cast_nullable_to_non_nullable
              as int,
      acceptedInvitations: null == acceptedInvitations
          ? _value.acceptedInvitations
          : acceptedInvitations // ignore: cast_nullable_to_non_nullable
              as int,
      declinedInvitations: null == declinedInvitations
          ? _value.declinedInvitations
          : declinedInvitations // ignore: cast_nullable_to_non_nullable
              as int,
      conversionRate: null == conversionRate
          ? _value.conversionRate
          : conversionRate // ignore: cast_nullable_to_non_nullable
              as double,
      growthRate: null == growthRate
          ? _value.growthRate
          : growthRate // ignore: cast_nullable_to_non_nullable
              as int,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$BlocEngagementImpl implements _BlocEngagement {
  const _$BlocEngagementImpl(
      {this.totalMembers = 0,
      this.recentMembers = 0,
      this.pendingInvitations = 0,
      this.acceptedInvitations = 0,
      this.declinedInvitations = 0,
      @JsonKey(fromJson: _toDouble) this.conversionRate = 0.0,
      this.growthRate = 0});

  factory _$BlocEngagementImpl.fromJson(Map<String, dynamic> json) =>
      _$$BlocEngagementImplFromJson(json);

  @override
  @JsonKey()
  final int totalMembers;
  @override
  @JsonKey()
  final int recentMembers;
  @override
  @JsonKey()
  final int pendingInvitations;
  @override
  @JsonKey()
  final int acceptedInvitations;
  @override
  @JsonKey()
  final int declinedInvitations;
  @override
  @JsonKey(fromJson: _toDouble)
  final double conversionRate;
  @override
  @JsonKey()
  final int growthRate;

  @override
  String toString() {
    return 'BlocEngagement(totalMembers: $totalMembers, recentMembers: $recentMembers, pendingInvitations: $pendingInvitations, acceptedInvitations: $acceptedInvitations, declinedInvitations: $declinedInvitations, conversionRate: $conversionRate, growthRate: $growthRate)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$BlocEngagementImpl &&
            (identical(other.totalMembers, totalMembers) ||
                other.totalMembers == totalMembers) &&
            (identical(other.recentMembers, recentMembers) ||
                other.recentMembers == recentMembers) &&
            (identical(other.pendingInvitations, pendingInvitations) ||
                other.pendingInvitations == pendingInvitations) &&
            (identical(other.acceptedInvitations, acceptedInvitations) ||
                other.acceptedInvitations == acceptedInvitations) &&
            (identical(other.declinedInvitations, declinedInvitations) ||
                other.declinedInvitations == declinedInvitations) &&
            (identical(other.conversionRate, conversionRate) ||
                other.conversionRate == conversionRate) &&
            (identical(other.growthRate, growthRate) ||
                other.growthRate == growthRate));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      totalMembers,
      recentMembers,
      pendingInvitations,
      acceptedInvitations,
      declinedInvitations,
      conversionRate,
      growthRate);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$BlocEngagementImplCopyWith<_$BlocEngagementImpl> get copyWith =>
      __$$BlocEngagementImplCopyWithImpl<_$BlocEngagementImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$BlocEngagementImplToJson(
      this,
    );
  }
}

abstract class _BlocEngagement implements BlocEngagement {
  const factory _BlocEngagement(
      {final int totalMembers,
      final int recentMembers,
      final int pendingInvitations,
      final int acceptedInvitations,
      final int declinedInvitations,
      @JsonKey(fromJson: _toDouble) final double conversionRate,
      final int growthRate}) = _$BlocEngagementImpl;

  factory _BlocEngagement.fromJson(Map<String, dynamic> json) =
      _$BlocEngagementImpl.fromJson;

  @override
  int get totalMembers;
  @override
  int get recentMembers;
  @override
  int get pendingInvitations;
  @override
  int get acceptedInvitations;
  @override
  int get declinedInvitations;
  @override
  @JsonKey(fromJson: _toDouble)
  double get conversionRate;
  @override
  int get growthRate;
  @override
  @JsonKey(ignore: true)
  _$$BlocEngagementImplCopyWith<_$BlocEngagementImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
