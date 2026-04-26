// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'message_reaction.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

MessageReaction _$MessageReactionFromJson(Map<String, dynamic> json) {
  return _MessageReaction.fromJson(json);
}

/// @nodoc
mixin _$MessageReaction {
  String get emoji => throw _privateConstructorUsedError;
  int get count => throw _privateConstructorUsedError;
  bool get reacted => throw _privateConstructorUsedError;
  @JsonKey(name: 'user_ids')
  List<String> get userIds => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $MessageReactionCopyWith<MessageReaction> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $MessageReactionCopyWith<$Res> {
  factory $MessageReactionCopyWith(
          MessageReaction value, $Res Function(MessageReaction) then) =
      _$MessageReactionCopyWithImpl<$Res, MessageReaction>;
  @useResult
  $Res call(
      {String emoji,
      int count,
      bool reacted,
      @JsonKey(name: 'user_ids') List<String> userIds});
}

/// @nodoc
class _$MessageReactionCopyWithImpl<$Res, $Val extends MessageReaction>
    implements $MessageReactionCopyWith<$Res> {
  _$MessageReactionCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? emoji = null,
    Object? count = null,
    Object? reacted = null,
    Object? userIds = null,
  }) {
    return _then(_value.copyWith(
      emoji: null == emoji
          ? _value.emoji
          : emoji // ignore: cast_nullable_to_non_nullable
              as String,
      count: null == count
          ? _value.count
          : count // ignore: cast_nullable_to_non_nullable
              as int,
      reacted: null == reacted
          ? _value.reacted
          : reacted // ignore: cast_nullable_to_non_nullable
              as bool,
      userIds: null == userIds
          ? _value.userIds
          : userIds // ignore: cast_nullable_to_non_nullable
              as List<String>,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$MessageReactionImplCopyWith<$Res>
    implements $MessageReactionCopyWith<$Res> {
  factory _$$MessageReactionImplCopyWith(_$MessageReactionImpl value,
          $Res Function(_$MessageReactionImpl) then) =
      __$$MessageReactionImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String emoji,
      int count,
      bool reacted,
      @JsonKey(name: 'user_ids') List<String> userIds});
}

/// @nodoc
class __$$MessageReactionImplCopyWithImpl<$Res>
    extends _$MessageReactionCopyWithImpl<$Res, _$MessageReactionImpl>
    implements _$$MessageReactionImplCopyWith<$Res> {
  __$$MessageReactionImplCopyWithImpl(
      _$MessageReactionImpl _value, $Res Function(_$MessageReactionImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? emoji = null,
    Object? count = null,
    Object? reacted = null,
    Object? userIds = null,
  }) {
    return _then(_$MessageReactionImpl(
      emoji: null == emoji
          ? _value.emoji
          : emoji // ignore: cast_nullable_to_non_nullable
              as String,
      count: null == count
          ? _value.count
          : count // ignore: cast_nullable_to_non_nullable
              as int,
      reacted: null == reacted
          ? _value.reacted
          : reacted // ignore: cast_nullable_to_non_nullable
              as bool,
      userIds: null == userIds
          ? _value._userIds
          : userIds // ignore: cast_nullable_to_non_nullable
              as List<String>,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$MessageReactionImpl implements _MessageReaction {
  const _$MessageReactionImpl(
      {required this.emoji,
      required this.count,
      this.reacted = false,
      @JsonKey(name: 'user_ids') final List<String> userIds = const []})
      : _userIds = userIds;

  factory _$MessageReactionImpl.fromJson(Map<String, dynamic> json) =>
      _$$MessageReactionImplFromJson(json);

  @override
  final String emoji;
  @override
  final int count;
  @override
  @JsonKey()
  final bool reacted;
  final List<String> _userIds;
  @override
  @JsonKey(name: 'user_ids')
  List<String> get userIds {
    if (_userIds is EqualUnmodifiableListView) return _userIds;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_userIds);
  }

  @override
  String toString() {
    return 'MessageReaction(emoji: $emoji, count: $count, reacted: $reacted, userIds: $userIds)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$MessageReactionImpl &&
            (identical(other.emoji, emoji) || other.emoji == emoji) &&
            (identical(other.count, count) || other.count == count) &&
            (identical(other.reacted, reacted) || other.reacted == reacted) &&
            const DeepCollectionEquality().equals(other._userIds, _userIds));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, emoji, count, reacted,
      const DeepCollectionEquality().hash(_userIds));

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$MessageReactionImplCopyWith<_$MessageReactionImpl> get copyWith =>
      __$$MessageReactionImplCopyWithImpl<_$MessageReactionImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$MessageReactionImplToJson(
      this,
    );
  }
}

abstract class _MessageReaction implements MessageReaction {
  const factory _MessageReaction(
          {required final String emoji,
          required final int count,
          final bool reacted,
          @JsonKey(name: 'user_ids') final List<String> userIds}) =
      _$MessageReactionImpl;

  factory _MessageReaction.fromJson(Map<String, dynamic> json) =
      _$MessageReactionImpl.fromJson;

  @override
  String get emoji;
  @override
  int get count;
  @override
  bool get reacted;
  @override
  @JsonKey(name: 'user_ids')
  List<String> get userIds;
  @override
  @JsonKey(ignore: true)
  _$$MessageReactionImplCopyWith<_$MessageReactionImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
