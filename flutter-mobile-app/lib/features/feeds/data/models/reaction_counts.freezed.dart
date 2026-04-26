// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'reaction_counts.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

ReactionCounts _$ReactionCountsFromJson(Map<String, dynamic> json) {
  return _ReactionCounts.fromJson(json);
}

/// @nodoc
mixin _$ReactionCounts {
  int get like => throw _privateConstructorUsedError;
  int get love => throw _privateConstructorUsedError;
  int get smile => throw _privateConstructorUsedError;
  int get meh => throw _privateConstructorUsedError;
  int get total => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $ReactionCountsCopyWith<ReactionCounts> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ReactionCountsCopyWith<$Res> {
  factory $ReactionCountsCopyWith(
          ReactionCounts value, $Res Function(ReactionCounts) then) =
      _$ReactionCountsCopyWithImpl<$Res, ReactionCounts>;
  @useResult
  $Res call({int like, int love, int smile, int meh, int total});
}

/// @nodoc
class _$ReactionCountsCopyWithImpl<$Res, $Val extends ReactionCounts>
    implements $ReactionCountsCopyWith<$Res> {
  _$ReactionCountsCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? like = null,
    Object? love = null,
    Object? smile = null,
    Object? meh = null,
    Object? total = null,
  }) {
    return _then(_value.copyWith(
      like: null == like
          ? _value.like
          : like // ignore: cast_nullable_to_non_nullable
              as int,
      love: null == love
          ? _value.love
          : love // ignore: cast_nullable_to_non_nullable
              as int,
      smile: null == smile
          ? _value.smile
          : smile // ignore: cast_nullable_to_non_nullable
              as int,
      meh: null == meh
          ? _value.meh
          : meh // ignore: cast_nullable_to_non_nullable
              as int,
      total: null == total
          ? _value.total
          : total // ignore: cast_nullable_to_non_nullable
              as int,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$ReactionCountsImplCopyWith<$Res>
    implements $ReactionCountsCopyWith<$Res> {
  factory _$$ReactionCountsImplCopyWith(_$ReactionCountsImpl value,
          $Res Function(_$ReactionCountsImpl) then) =
      __$$ReactionCountsImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({int like, int love, int smile, int meh, int total});
}

/// @nodoc
class __$$ReactionCountsImplCopyWithImpl<$Res>
    extends _$ReactionCountsCopyWithImpl<$Res, _$ReactionCountsImpl>
    implements _$$ReactionCountsImplCopyWith<$Res> {
  __$$ReactionCountsImplCopyWithImpl(
      _$ReactionCountsImpl _value, $Res Function(_$ReactionCountsImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? like = null,
    Object? love = null,
    Object? smile = null,
    Object? meh = null,
    Object? total = null,
  }) {
    return _then(_$ReactionCountsImpl(
      like: null == like
          ? _value.like
          : like // ignore: cast_nullable_to_non_nullable
              as int,
      love: null == love
          ? _value.love
          : love // ignore: cast_nullable_to_non_nullable
              as int,
      smile: null == smile
          ? _value.smile
          : smile // ignore: cast_nullable_to_non_nullable
              as int,
      meh: null == meh
          ? _value.meh
          : meh // ignore: cast_nullable_to_non_nullable
              as int,
      total: null == total
          ? _value.total
          : total // ignore: cast_nullable_to_non_nullable
              as int,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$ReactionCountsImpl implements _ReactionCounts {
  const _$ReactionCountsImpl(
      {this.like = 0,
      this.love = 0,
      this.smile = 0,
      this.meh = 0,
      this.total = 0});

  factory _$ReactionCountsImpl.fromJson(Map<String, dynamic> json) =>
      _$$ReactionCountsImplFromJson(json);

  @override
  @JsonKey()
  final int like;
  @override
  @JsonKey()
  final int love;
  @override
  @JsonKey()
  final int smile;
  @override
  @JsonKey()
  final int meh;
  @override
  @JsonKey()
  final int total;

  @override
  String toString() {
    return 'ReactionCounts(like: $like, love: $love, smile: $smile, meh: $meh, total: $total)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ReactionCountsImpl &&
            (identical(other.like, like) || other.like == like) &&
            (identical(other.love, love) || other.love == love) &&
            (identical(other.smile, smile) || other.smile == smile) &&
            (identical(other.meh, meh) || other.meh == meh) &&
            (identical(other.total, total) || other.total == total));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, like, love, smile, meh, total);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$ReactionCountsImplCopyWith<_$ReactionCountsImpl> get copyWith =>
      __$$ReactionCountsImplCopyWithImpl<_$ReactionCountsImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ReactionCountsImplToJson(
      this,
    );
  }
}

abstract class _ReactionCounts implements ReactionCounts {
  const factory _ReactionCounts(
      {final int like,
      final int love,
      final int smile,
      final int meh,
      final int total}) = _$ReactionCountsImpl;

  factory _ReactionCounts.fromJson(Map<String, dynamic> json) =
      _$ReactionCountsImpl.fromJson;

  @override
  int get like;
  @override
  int get love;
  @override
  int get smile;
  @override
  int get meh;
  @override
  int get total;
  @override
  @JsonKey(ignore: true)
  _$$ReactionCountsImplCopyWith<_$ReactionCountsImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
