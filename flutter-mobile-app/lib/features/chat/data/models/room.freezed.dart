// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'room.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

Room _$RoomFromJson(Map<String, dynamic> json) {
  return _Room.fromJson(json);
}

/// @nodoc
mixin _$Room {
  String get id => throw _privateConstructorUsedError;
  String? get title => throw _privateConstructorUsedError;
  @JsonKey(name: 'room_level')
  String? get roomLevel => throw _privateConstructorUsedError;
  @JsonKey(name: 'room_state')
  String? get roomState => throw _privateConstructorUsedError;
  @JsonKey(name: 'room_lga')
  String? get roomLga => throw _privateConstructorUsedError;
  @JsonKey(name: 'room_ward')
  String? get roomWard => throw _privateConstructorUsedError;
  @JsonKey(name: 'room_pu')
  String? get roomPu => throw _privateConstructorUsedError;
  String? get icon => throw _privateConstructorUsedError;
  @JsonKey(name: 'member_count')
  int get memberCount => throw _privateConstructorUsedError;
  @JsonKey(name: 'unread_count')
  int get unreadCount => throw _privateConstructorUsedError;
  @JsonKey(name: 'last_read_at')
  String? get lastReadAt => throw _privateConstructorUsedError;
  @JsonKey(name: 'last_message_at')
  String? get lastMessageAt => throw _privateConstructorUsedError;
  @JsonKey(name: 'last_message_preview')
  String? get lastMessagePreview => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $RoomCopyWith<Room> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $RoomCopyWith<$Res> {
  factory $RoomCopyWith(Room value, $Res Function(Room) then) =
      _$RoomCopyWithImpl<$Res, Room>;
  @useResult
  $Res call(
      {String id,
      String? title,
      @JsonKey(name: 'room_level') String? roomLevel,
      @JsonKey(name: 'room_state') String? roomState,
      @JsonKey(name: 'room_lga') String? roomLga,
      @JsonKey(name: 'room_ward') String? roomWard,
      @JsonKey(name: 'room_pu') String? roomPu,
      String? icon,
      @JsonKey(name: 'member_count') int memberCount,
      @JsonKey(name: 'unread_count') int unreadCount,
      @JsonKey(name: 'last_read_at') String? lastReadAt,
      @JsonKey(name: 'last_message_at') String? lastMessageAt,
      @JsonKey(name: 'last_message_preview') String? lastMessagePreview});
}

/// @nodoc
class _$RoomCopyWithImpl<$Res, $Val extends Room>
    implements $RoomCopyWith<$Res> {
  _$RoomCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? title = freezed,
    Object? roomLevel = freezed,
    Object? roomState = freezed,
    Object? roomLga = freezed,
    Object? roomWard = freezed,
    Object? roomPu = freezed,
    Object? icon = freezed,
    Object? memberCount = null,
    Object? unreadCount = null,
    Object? lastReadAt = freezed,
    Object? lastMessageAt = freezed,
    Object? lastMessagePreview = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      title: freezed == title
          ? _value.title
          : title // ignore: cast_nullable_to_non_nullable
              as String?,
      roomLevel: freezed == roomLevel
          ? _value.roomLevel
          : roomLevel // ignore: cast_nullable_to_non_nullable
              as String?,
      roomState: freezed == roomState
          ? _value.roomState
          : roomState // ignore: cast_nullable_to_non_nullable
              as String?,
      roomLga: freezed == roomLga
          ? _value.roomLga
          : roomLga // ignore: cast_nullable_to_non_nullable
              as String?,
      roomWard: freezed == roomWard
          ? _value.roomWard
          : roomWard // ignore: cast_nullable_to_non_nullable
              as String?,
      roomPu: freezed == roomPu
          ? _value.roomPu
          : roomPu // ignore: cast_nullable_to_non_nullable
              as String?,
      icon: freezed == icon
          ? _value.icon
          : icon // ignore: cast_nullable_to_non_nullable
              as String?,
      memberCount: null == memberCount
          ? _value.memberCount
          : memberCount // ignore: cast_nullable_to_non_nullable
              as int,
      unreadCount: null == unreadCount
          ? _value.unreadCount
          : unreadCount // ignore: cast_nullable_to_non_nullable
              as int,
      lastReadAt: freezed == lastReadAt
          ? _value.lastReadAt
          : lastReadAt // ignore: cast_nullable_to_non_nullable
              as String?,
      lastMessageAt: freezed == lastMessageAt
          ? _value.lastMessageAt
          : lastMessageAt // ignore: cast_nullable_to_non_nullable
              as String?,
      lastMessagePreview: freezed == lastMessagePreview
          ? _value.lastMessagePreview
          : lastMessagePreview // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$RoomImplCopyWith<$Res> implements $RoomCopyWith<$Res> {
  factory _$$RoomImplCopyWith(
          _$RoomImpl value, $Res Function(_$RoomImpl) then) =
      __$$RoomImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String? title,
      @JsonKey(name: 'room_level') String? roomLevel,
      @JsonKey(name: 'room_state') String? roomState,
      @JsonKey(name: 'room_lga') String? roomLga,
      @JsonKey(name: 'room_ward') String? roomWard,
      @JsonKey(name: 'room_pu') String? roomPu,
      String? icon,
      @JsonKey(name: 'member_count') int memberCount,
      @JsonKey(name: 'unread_count') int unreadCount,
      @JsonKey(name: 'last_read_at') String? lastReadAt,
      @JsonKey(name: 'last_message_at') String? lastMessageAt,
      @JsonKey(name: 'last_message_preview') String? lastMessagePreview});
}

/// @nodoc
class __$$RoomImplCopyWithImpl<$Res>
    extends _$RoomCopyWithImpl<$Res, _$RoomImpl>
    implements _$$RoomImplCopyWith<$Res> {
  __$$RoomImplCopyWithImpl(_$RoomImpl _value, $Res Function(_$RoomImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? title = freezed,
    Object? roomLevel = freezed,
    Object? roomState = freezed,
    Object? roomLga = freezed,
    Object? roomWard = freezed,
    Object? roomPu = freezed,
    Object? icon = freezed,
    Object? memberCount = null,
    Object? unreadCount = null,
    Object? lastReadAt = freezed,
    Object? lastMessageAt = freezed,
    Object? lastMessagePreview = freezed,
  }) {
    return _then(_$RoomImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      title: freezed == title
          ? _value.title
          : title // ignore: cast_nullable_to_non_nullable
              as String?,
      roomLevel: freezed == roomLevel
          ? _value.roomLevel
          : roomLevel // ignore: cast_nullable_to_non_nullable
              as String?,
      roomState: freezed == roomState
          ? _value.roomState
          : roomState // ignore: cast_nullable_to_non_nullable
              as String?,
      roomLga: freezed == roomLga
          ? _value.roomLga
          : roomLga // ignore: cast_nullable_to_non_nullable
              as String?,
      roomWard: freezed == roomWard
          ? _value.roomWard
          : roomWard // ignore: cast_nullable_to_non_nullable
              as String?,
      roomPu: freezed == roomPu
          ? _value.roomPu
          : roomPu // ignore: cast_nullable_to_non_nullable
              as String?,
      icon: freezed == icon
          ? _value.icon
          : icon // ignore: cast_nullable_to_non_nullable
              as String?,
      memberCount: null == memberCount
          ? _value.memberCount
          : memberCount // ignore: cast_nullable_to_non_nullable
              as int,
      unreadCount: null == unreadCount
          ? _value.unreadCount
          : unreadCount // ignore: cast_nullable_to_non_nullable
              as int,
      lastReadAt: freezed == lastReadAt
          ? _value.lastReadAt
          : lastReadAt // ignore: cast_nullable_to_non_nullable
              as String?,
      lastMessageAt: freezed == lastMessageAt
          ? _value.lastMessageAt
          : lastMessageAt // ignore: cast_nullable_to_non_nullable
              as String?,
      lastMessagePreview: freezed == lastMessagePreview
          ? _value.lastMessagePreview
          : lastMessagePreview // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$RoomImpl implements _Room {
  const _$RoomImpl(
      {required this.id,
      this.title,
      @JsonKey(name: 'room_level') this.roomLevel,
      @JsonKey(name: 'room_state') this.roomState,
      @JsonKey(name: 'room_lga') this.roomLga,
      @JsonKey(name: 'room_ward') this.roomWard,
      @JsonKey(name: 'room_pu') this.roomPu,
      this.icon,
      @JsonKey(name: 'member_count') this.memberCount = 0,
      @JsonKey(name: 'unread_count') this.unreadCount = 0,
      @JsonKey(name: 'last_read_at') this.lastReadAt,
      @JsonKey(name: 'last_message_at') this.lastMessageAt,
      @JsonKey(name: 'last_message_preview') this.lastMessagePreview});

  factory _$RoomImpl.fromJson(Map<String, dynamic> json) =>
      _$$RoomImplFromJson(json);

  @override
  final String id;
  @override
  final String? title;
  @override
  @JsonKey(name: 'room_level')
  final String? roomLevel;
  @override
  @JsonKey(name: 'room_state')
  final String? roomState;
  @override
  @JsonKey(name: 'room_lga')
  final String? roomLga;
  @override
  @JsonKey(name: 'room_ward')
  final String? roomWard;
  @override
  @JsonKey(name: 'room_pu')
  final String? roomPu;
  @override
  final String? icon;
  @override
  @JsonKey(name: 'member_count')
  final int memberCount;
  @override
  @JsonKey(name: 'unread_count')
  final int unreadCount;
  @override
  @JsonKey(name: 'last_read_at')
  final String? lastReadAt;
  @override
  @JsonKey(name: 'last_message_at')
  final String? lastMessageAt;
  @override
  @JsonKey(name: 'last_message_preview')
  final String? lastMessagePreview;

  @override
  String toString() {
    return 'Room(id: $id, title: $title, roomLevel: $roomLevel, roomState: $roomState, roomLga: $roomLga, roomWard: $roomWard, roomPu: $roomPu, icon: $icon, memberCount: $memberCount, unreadCount: $unreadCount, lastReadAt: $lastReadAt, lastMessageAt: $lastMessageAt, lastMessagePreview: $lastMessagePreview)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$RoomImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.roomLevel, roomLevel) ||
                other.roomLevel == roomLevel) &&
            (identical(other.roomState, roomState) ||
                other.roomState == roomState) &&
            (identical(other.roomLga, roomLga) || other.roomLga == roomLga) &&
            (identical(other.roomWard, roomWard) ||
                other.roomWard == roomWard) &&
            (identical(other.roomPu, roomPu) || other.roomPu == roomPu) &&
            (identical(other.icon, icon) || other.icon == icon) &&
            (identical(other.memberCount, memberCount) ||
                other.memberCount == memberCount) &&
            (identical(other.unreadCount, unreadCount) ||
                other.unreadCount == unreadCount) &&
            (identical(other.lastReadAt, lastReadAt) ||
                other.lastReadAt == lastReadAt) &&
            (identical(other.lastMessageAt, lastMessageAt) ||
                other.lastMessageAt == lastMessageAt) &&
            (identical(other.lastMessagePreview, lastMessagePreview) ||
                other.lastMessagePreview == lastMessagePreview));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      title,
      roomLevel,
      roomState,
      roomLga,
      roomWard,
      roomPu,
      icon,
      memberCount,
      unreadCount,
      lastReadAt,
      lastMessageAt,
      lastMessagePreview);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$RoomImplCopyWith<_$RoomImpl> get copyWith =>
      __$$RoomImplCopyWithImpl<_$RoomImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$RoomImplToJson(
      this,
    );
  }
}

abstract class _Room implements Room {
  const factory _Room(
      {required final String id,
      final String? title,
      @JsonKey(name: 'room_level') final String? roomLevel,
      @JsonKey(name: 'room_state') final String? roomState,
      @JsonKey(name: 'room_lga') final String? roomLga,
      @JsonKey(name: 'room_ward') final String? roomWard,
      @JsonKey(name: 'room_pu') final String? roomPu,
      final String? icon,
      @JsonKey(name: 'member_count') final int memberCount,
      @JsonKey(name: 'unread_count') final int unreadCount,
      @JsonKey(name: 'last_read_at') final String? lastReadAt,
      @JsonKey(name: 'last_message_at') final String? lastMessageAt,
      @JsonKey(name: 'last_message_preview')
      final String? lastMessagePreview}) = _$RoomImpl;

  factory _Room.fromJson(Map<String, dynamic> json) = _$RoomImpl.fromJson;

  @override
  String get id;
  @override
  String? get title;
  @override
  @JsonKey(name: 'room_level')
  String? get roomLevel;
  @override
  @JsonKey(name: 'room_state')
  String? get roomState;
  @override
  @JsonKey(name: 'room_lga')
  String? get roomLga;
  @override
  @JsonKey(name: 'room_ward')
  String? get roomWard;
  @override
  @JsonKey(name: 'room_pu')
  String? get roomPu;
  @override
  String? get icon;
  @override
  @JsonKey(name: 'member_count')
  int get memberCount;
  @override
  @JsonKey(name: 'unread_count')
  int get unreadCount;
  @override
  @JsonKey(name: 'last_read_at')
  String? get lastReadAt;
  @override
  @JsonKey(name: 'last_message_at')
  String? get lastMessageAt;
  @override
  @JsonKey(name: 'last_message_preview')
  String? get lastMessagePreview;
  @override
  @JsonKey(ignore: true)
  _$$RoomImplCopyWith<_$RoomImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
