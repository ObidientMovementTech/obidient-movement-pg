// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'mobile_feed.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

MobileFeed _$MobileFeedFromJson(Map<String, dynamic> json) {
  return _MobileFeed.fromJson(json);
}

/// @nodoc
mixin _$MobileFeed {
  int get id => throw _privateConstructorUsedError;
  String get title => throw _privateConstructorUsedError;
  String get message => throw _privateConstructorUsedError;
  @JsonKey(name: 'feed_type')
  String get feedType => throw _privateConstructorUsedError;
  String get priority => throw _privateConstructorUsedError;
  @JsonKey(name: 'image_url')
  String? get imageUrl => throw _privateConstructorUsedError;
  @JsonKey(name: 'published_at')
  String? get publishedAt => throw _privateConstructorUsedError;
  @JsonKey(name: 'created_at')
  String? get createdAt => throw _privateConstructorUsedError;
  ReactionCounts? get reactions => throw _privateConstructorUsedError;
  String? get userReaction => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $MobileFeedCopyWith<MobileFeed> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $MobileFeedCopyWith<$Res> {
  factory $MobileFeedCopyWith(
          MobileFeed value, $Res Function(MobileFeed) then) =
      _$MobileFeedCopyWithImpl<$Res, MobileFeed>;
  @useResult
  $Res call(
      {int id,
      String title,
      String message,
      @JsonKey(name: 'feed_type') String feedType,
      String priority,
      @JsonKey(name: 'image_url') String? imageUrl,
      @JsonKey(name: 'published_at') String? publishedAt,
      @JsonKey(name: 'created_at') String? createdAt,
      ReactionCounts? reactions,
      String? userReaction});

  $ReactionCountsCopyWith<$Res>? get reactions;
}

/// @nodoc
class _$MobileFeedCopyWithImpl<$Res, $Val extends MobileFeed>
    implements $MobileFeedCopyWith<$Res> {
  _$MobileFeedCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? title = null,
    Object? message = null,
    Object? feedType = null,
    Object? priority = null,
    Object? imageUrl = freezed,
    Object? publishedAt = freezed,
    Object? createdAt = freezed,
    Object? reactions = freezed,
    Object? userReaction = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as int,
      title: null == title
          ? _value.title
          : title // ignore: cast_nullable_to_non_nullable
              as String,
      message: null == message
          ? _value.message
          : message // ignore: cast_nullable_to_non_nullable
              as String,
      feedType: null == feedType
          ? _value.feedType
          : feedType // ignore: cast_nullable_to_non_nullable
              as String,
      priority: null == priority
          ? _value.priority
          : priority // ignore: cast_nullable_to_non_nullable
              as String,
      imageUrl: freezed == imageUrl
          ? _value.imageUrl
          : imageUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      publishedAt: freezed == publishedAt
          ? _value.publishedAt
          : publishedAt // ignore: cast_nullable_to_non_nullable
              as String?,
      createdAt: freezed == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as String?,
      reactions: freezed == reactions
          ? _value.reactions
          : reactions // ignore: cast_nullable_to_non_nullable
              as ReactionCounts?,
      userReaction: freezed == userReaction
          ? _value.userReaction
          : userReaction // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }

  @override
  @pragma('vm:prefer-inline')
  $ReactionCountsCopyWith<$Res>? get reactions {
    if (_value.reactions == null) {
      return null;
    }

    return $ReactionCountsCopyWith<$Res>(_value.reactions!, (value) {
      return _then(_value.copyWith(reactions: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$MobileFeedImplCopyWith<$Res>
    implements $MobileFeedCopyWith<$Res> {
  factory _$$MobileFeedImplCopyWith(
          _$MobileFeedImpl value, $Res Function(_$MobileFeedImpl) then) =
      __$$MobileFeedImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {int id,
      String title,
      String message,
      @JsonKey(name: 'feed_type') String feedType,
      String priority,
      @JsonKey(name: 'image_url') String? imageUrl,
      @JsonKey(name: 'published_at') String? publishedAt,
      @JsonKey(name: 'created_at') String? createdAt,
      ReactionCounts? reactions,
      String? userReaction});

  @override
  $ReactionCountsCopyWith<$Res>? get reactions;
}

/// @nodoc
class __$$MobileFeedImplCopyWithImpl<$Res>
    extends _$MobileFeedCopyWithImpl<$Res, _$MobileFeedImpl>
    implements _$$MobileFeedImplCopyWith<$Res> {
  __$$MobileFeedImplCopyWithImpl(
      _$MobileFeedImpl _value, $Res Function(_$MobileFeedImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? title = null,
    Object? message = null,
    Object? feedType = null,
    Object? priority = null,
    Object? imageUrl = freezed,
    Object? publishedAt = freezed,
    Object? createdAt = freezed,
    Object? reactions = freezed,
    Object? userReaction = freezed,
  }) {
    return _then(_$MobileFeedImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as int,
      title: null == title
          ? _value.title
          : title // ignore: cast_nullable_to_non_nullable
              as String,
      message: null == message
          ? _value.message
          : message // ignore: cast_nullable_to_non_nullable
              as String,
      feedType: null == feedType
          ? _value.feedType
          : feedType // ignore: cast_nullable_to_non_nullable
              as String,
      priority: null == priority
          ? _value.priority
          : priority // ignore: cast_nullable_to_non_nullable
              as String,
      imageUrl: freezed == imageUrl
          ? _value.imageUrl
          : imageUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      publishedAt: freezed == publishedAt
          ? _value.publishedAt
          : publishedAt // ignore: cast_nullable_to_non_nullable
              as String?,
      createdAt: freezed == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as String?,
      reactions: freezed == reactions
          ? _value.reactions
          : reactions // ignore: cast_nullable_to_non_nullable
              as ReactionCounts?,
      userReaction: freezed == userReaction
          ? _value.userReaction
          : userReaction // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$MobileFeedImpl implements _MobileFeed {
  const _$MobileFeedImpl(
      {required this.id,
      required this.title,
      required this.message,
      @JsonKey(name: 'feed_type') this.feedType = 'general',
      this.priority = 'normal',
      @JsonKey(name: 'image_url') this.imageUrl,
      @JsonKey(name: 'published_at') this.publishedAt,
      @JsonKey(name: 'created_at') this.createdAt,
      this.reactions,
      this.userReaction});

  factory _$MobileFeedImpl.fromJson(Map<String, dynamic> json) =>
      _$$MobileFeedImplFromJson(json);

  @override
  final int id;
  @override
  final String title;
  @override
  final String message;
  @override
  @JsonKey(name: 'feed_type')
  final String feedType;
  @override
  @JsonKey()
  final String priority;
  @override
  @JsonKey(name: 'image_url')
  final String? imageUrl;
  @override
  @JsonKey(name: 'published_at')
  final String? publishedAt;
  @override
  @JsonKey(name: 'created_at')
  final String? createdAt;
  @override
  final ReactionCounts? reactions;
  @override
  final String? userReaction;

  @override
  String toString() {
    return 'MobileFeed(id: $id, title: $title, message: $message, feedType: $feedType, priority: $priority, imageUrl: $imageUrl, publishedAt: $publishedAt, createdAt: $createdAt, reactions: $reactions, userReaction: $userReaction)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$MobileFeedImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.message, message) || other.message == message) &&
            (identical(other.feedType, feedType) ||
                other.feedType == feedType) &&
            (identical(other.priority, priority) ||
                other.priority == priority) &&
            (identical(other.imageUrl, imageUrl) ||
                other.imageUrl == imageUrl) &&
            (identical(other.publishedAt, publishedAt) ||
                other.publishedAt == publishedAt) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.reactions, reactions) ||
                other.reactions == reactions) &&
            (identical(other.userReaction, userReaction) ||
                other.userReaction == userReaction));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, id, title, message, feedType,
      priority, imageUrl, publishedAt, createdAt, reactions, userReaction);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$MobileFeedImplCopyWith<_$MobileFeedImpl> get copyWith =>
      __$$MobileFeedImplCopyWithImpl<_$MobileFeedImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$MobileFeedImplToJson(
      this,
    );
  }
}

abstract class _MobileFeed implements MobileFeed {
  const factory _MobileFeed(
      {required final int id,
      required final String title,
      required final String message,
      @JsonKey(name: 'feed_type') final String feedType,
      final String priority,
      @JsonKey(name: 'image_url') final String? imageUrl,
      @JsonKey(name: 'published_at') final String? publishedAt,
      @JsonKey(name: 'created_at') final String? createdAt,
      final ReactionCounts? reactions,
      final String? userReaction}) = _$MobileFeedImpl;

  factory _MobileFeed.fromJson(Map<String, dynamic> json) =
      _$MobileFeedImpl.fromJson;

  @override
  int get id;
  @override
  String get title;
  @override
  String get message;
  @override
  @JsonKey(name: 'feed_type')
  String get feedType;
  @override
  String get priority;
  @override
  @JsonKey(name: 'image_url')
  String? get imageUrl;
  @override
  @JsonKey(name: 'published_at')
  String? get publishedAt;
  @override
  @JsonKey(name: 'created_at')
  String? get createdAt;
  @override
  ReactionCounts? get reactions;
  @override
  String? get userReaction;
  @override
  @JsonKey(ignore: true)
  _$$MobileFeedImplCopyWith<_$MobileFeedImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
