// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'unified_feed_item.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

UnifiedFeedItem _$UnifiedFeedItemFromJson(Map<String, dynamic> json) {
  return _UnifiedFeedItem.fromJson(json);
}

/// @nodoc
mixin _$UnifiedFeedItem {
  /// Prefixed id: "feed_<n>" or "notif_<n>".
  String get id => throw _privateConstructorUsedError;

  /// "feed" | "notification".
  String get source => throw _privateConstructorUsedError;

  /// Raw numeric id (without prefix) — use when calling source-specific APIs.
  String get rawId => throw _privateConstructorUsedError;
  String get title => throw _privateConstructorUsedError;
  String get message => throw _privateConstructorUsedError;

  /// Display-normalized type: urgent | announcement | general.
  String get type => throw _privateConstructorUsedError;

  /// Original type from the server (adminBroadcast, votingBlocBroadcast, urgent, etc.).
  String? get rawType => throw _privateConstructorUsedError;
  String get priority => throw _privateConstructorUsedError;
  String? get imageUrl => throw _privateConstructorUsedError;
  bool get read => throw _privateConstructorUsedError;
  String? get publishedAt => throw _privateConstructorUsedError;
  ReactionCounts? get reactions => throw _privateConstructorUsedError;
  String? get userReaction => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $UnifiedFeedItemCopyWith<UnifiedFeedItem> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UnifiedFeedItemCopyWith<$Res> {
  factory $UnifiedFeedItemCopyWith(
          UnifiedFeedItem value, $Res Function(UnifiedFeedItem) then) =
      _$UnifiedFeedItemCopyWithImpl<$Res, UnifiedFeedItem>;
  @useResult
  $Res call(
      {String id,
      String source,
      String rawId,
      String title,
      String message,
      String type,
      String? rawType,
      String priority,
      String? imageUrl,
      bool read,
      String? publishedAt,
      ReactionCounts? reactions,
      String? userReaction});

  $ReactionCountsCopyWith<$Res>? get reactions;
}

/// @nodoc
class _$UnifiedFeedItemCopyWithImpl<$Res, $Val extends UnifiedFeedItem>
    implements $UnifiedFeedItemCopyWith<$Res> {
  _$UnifiedFeedItemCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? source = null,
    Object? rawId = null,
    Object? title = null,
    Object? message = null,
    Object? type = null,
    Object? rawType = freezed,
    Object? priority = null,
    Object? imageUrl = freezed,
    Object? read = null,
    Object? publishedAt = freezed,
    Object? reactions = freezed,
    Object? userReaction = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      source: null == source
          ? _value.source
          : source // ignore: cast_nullable_to_non_nullable
              as String,
      rawId: null == rawId
          ? _value.rawId
          : rawId // ignore: cast_nullable_to_non_nullable
              as String,
      title: null == title
          ? _value.title
          : title // ignore: cast_nullable_to_non_nullable
              as String,
      message: null == message
          ? _value.message
          : message // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _value.type
          : type // ignore: cast_nullable_to_non_nullable
              as String,
      rawType: freezed == rawType
          ? _value.rawType
          : rawType // ignore: cast_nullable_to_non_nullable
              as String?,
      priority: null == priority
          ? _value.priority
          : priority // ignore: cast_nullable_to_non_nullable
              as String,
      imageUrl: freezed == imageUrl
          ? _value.imageUrl
          : imageUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      read: null == read
          ? _value.read
          : read // ignore: cast_nullable_to_non_nullable
              as bool,
      publishedAt: freezed == publishedAt
          ? _value.publishedAt
          : publishedAt // ignore: cast_nullable_to_non_nullable
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
abstract class _$$UnifiedFeedItemImplCopyWith<$Res>
    implements $UnifiedFeedItemCopyWith<$Res> {
  factory _$$UnifiedFeedItemImplCopyWith(_$UnifiedFeedItemImpl value,
          $Res Function(_$UnifiedFeedItemImpl) then) =
      __$$UnifiedFeedItemImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String source,
      String rawId,
      String title,
      String message,
      String type,
      String? rawType,
      String priority,
      String? imageUrl,
      bool read,
      String? publishedAt,
      ReactionCounts? reactions,
      String? userReaction});

  @override
  $ReactionCountsCopyWith<$Res>? get reactions;
}

/// @nodoc
class __$$UnifiedFeedItemImplCopyWithImpl<$Res>
    extends _$UnifiedFeedItemCopyWithImpl<$Res, _$UnifiedFeedItemImpl>
    implements _$$UnifiedFeedItemImplCopyWith<$Res> {
  __$$UnifiedFeedItemImplCopyWithImpl(
      _$UnifiedFeedItemImpl _value, $Res Function(_$UnifiedFeedItemImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? source = null,
    Object? rawId = null,
    Object? title = null,
    Object? message = null,
    Object? type = null,
    Object? rawType = freezed,
    Object? priority = null,
    Object? imageUrl = freezed,
    Object? read = null,
    Object? publishedAt = freezed,
    Object? reactions = freezed,
    Object? userReaction = freezed,
  }) {
    return _then(_$UnifiedFeedItemImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      source: null == source
          ? _value.source
          : source // ignore: cast_nullable_to_non_nullable
              as String,
      rawId: null == rawId
          ? _value.rawId
          : rawId // ignore: cast_nullable_to_non_nullable
              as String,
      title: null == title
          ? _value.title
          : title // ignore: cast_nullable_to_non_nullable
              as String,
      message: null == message
          ? _value.message
          : message // ignore: cast_nullable_to_non_nullable
              as String,
      type: null == type
          ? _value.type
          : type // ignore: cast_nullable_to_non_nullable
              as String,
      rawType: freezed == rawType
          ? _value.rawType
          : rawType // ignore: cast_nullable_to_non_nullable
              as String?,
      priority: null == priority
          ? _value.priority
          : priority // ignore: cast_nullable_to_non_nullable
              as String,
      imageUrl: freezed == imageUrl
          ? _value.imageUrl
          : imageUrl // ignore: cast_nullable_to_non_nullable
              as String?,
      read: null == read
          ? _value.read
          : read // ignore: cast_nullable_to_non_nullable
              as bool,
      publishedAt: freezed == publishedAt
          ? _value.publishedAt
          : publishedAt // ignore: cast_nullable_to_non_nullable
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
class _$UnifiedFeedItemImpl implements _UnifiedFeedItem {
  const _$UnifiedFeedItemImpl(
      {required this.id,
      required this.source,
      required this.rawId,
      required this.title,
      required this.message,
      this.type = 'general',
      this.rawType,
      this.priority = 'normal',
      this.imageUrl,
      this.read = true,
      this.publishedAt,
      this.reactions,
      this.userReaction});

  factory _$UnifiedFeedItemImpl.fromJson(Map<String, dynamic> json) =>
      _$$UnifiedFeedItemImplFromJson(json);

  /// Prefixed id: "feed_<n>" or "notif_<n>".
  @override
  final String id;

  /// "feed" | "notification".
  @override
  final String source;

  /// Raw numeric id (without prefix) — use when calling source-specific APIs.
  @override
  final String rawId;
  @override
  final String title;
  @override
  final String message;

  /// Display-normalized type: urgent | announcement | general.
  @override
  @JsonKey()
  final String type;

  /// Original type from the server (adminBroadcast, votingBlocBroadcast, urgent, etc.).
  @override
  final String? rawType;
  @override
  @JsonKey()
  final String priority;
  @override
  final String? imageUrl;
  @override
  @JsonKey()
  final bool read;
  @override
  final String? publishedAt;
  @override
  final ReactionCounts? reactions;
  @override
  final String? userReaction;

  @override
  String toString() {
    return 'UnifiedFeedItem(id: $id, source: $source, rawId: $rawId, title: $title, message: $message, type: $type, rawType: $rawType, priority: $priority, imageUrl: $imageUrl, read: $read, publishedAt: $publishedAt, reactions: $reactions, userReaction: $userReaction)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$UnifiedFeedItemImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.source, source) || other.source == source) &&
            (identical(other.rawId, rawId) || other.rawId == rawId) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.message, message) || other.message == message) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.rawType, rawType) || other.rawType == rawType) &&
            (identical(other.priority, priority) ||
                other.priority == priority) &&
            (identical(other.imageUrl, imageUrl) ||
                other.imageUrl == imageUrl) &&
            (identical(other.read, read) || other.read == read) &&
            (identical(other.publishedAt, publishedAt) ||
                other.publishedAt == publishedAt) &&
            (identical(other.reactions, reactions) ||
                other.reactions == reactions) &&
            (identical(other.userReaction, userReaction) ||
                other.userReaction == userReaction));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      source,
      rawId,
      title,
      message,
      type,
      rawType,
      priority,
      imageUrl,
      read,
      publishedAt,
      reactions,
      userReaction);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$UnifiedFeedItemImplCopyWith<_$UnifiedFeedItemImpl> get copyWith =>
      __$$UnifiedFeedItemImplCopyWithImpl<_$UnifiedFeedItemImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$UnifiedFeedItemImplToJson(
      this,
    );
  }
}

abstract class _UnifiedFeedItem implements UnifiedFeedItem {
  const factory _UnifiedFeedItem(
      {required final String id,
      required final String source,
      required final String rawId,
      required final String title,
      required final String message,
      final String type,
      final String? rawType,
      final String priority,
      final String? imageUrl,
      final bool read,
      final String? publishedAt,
      final ReactionCounts? reactions,
      final String? userReaction}) = _$UnifiedFeedItemImpl;

  factory _UnifiedFeedItem.fromJson(Map<String, dynamic> json) =
      _$UnifiedFeedItemImpl.fromJson;

  @override

  /// Prefixed id: "feed_<n>" or "notif_<n>".
  String get id;
  @override

  /// "feed" | "notification".
  String get source;
  @override

  /// Raw numeric id (without prefix) — use when calling source-specific APIs.
  String get rawId;
  @override
  String get title;
  @override
  String get message;
  @override

  /// Display-normalized type: urgent | announcement | general.
  String get type;
  @override

  /// Original type from the server (adminBroadcast, votingBlocBroadcast, urgent, etc.).
  String? get rawType;
  @override
  String get priority;
  @override
  String? get imageUrl;
  @override
  bool get read;
  @override
  String? get publishedAt;
  @override
  ReactionCounts? get reactions;
  @override
  String? get userReaction;
  @override
  @JsonKey(ignore: true)
  _$$UnifiedFeedItemImplCopyWith<_$UnifiedFeedItemImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
