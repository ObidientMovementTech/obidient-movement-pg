// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'room_member.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

RoomMember _$RoomMemberFromJson(Map<String, dynamic> json) {
  return _RoomMember.fromJson(json);
}

/// @nodoc
mixin _$RoomMember {
  String get id => throw _privateConstructorUsedError;
  String? get name => throw _privateConstructorUsedError;
  @JsonKey(name: 'profileImage')
  String? get profileImage => throw _privateConstructorUsedError;
  String? get designation => throw _privateConstructorUsedError;
  String get role => throw _privateConstructorUsedError;
  @JsonKey(name: 'is_muted')
  bool get isMuted => throw _privateConstructorUsedError;
  @JsonKey(name: 'muted_until')
  String? get mutedUntil => throw _privateConstructorUsedError;
  bool get online => throw _privateConstructorUsedError;
  @JsonKey(name: 'votingState')
  String? get votingState => throw _privateConstructorUsedError;
  @JsonKey(name: 'votingLGA')
  String? get votingLga => throw _privateConstructorUsedError;
  @JsonKey(name: 'votingWard')
  String? get votingWard => throw _privateConstructorUsedError;
  @JsonKey(name: 'votingPU')
  String? get votingPu => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $RoomMemberCopyWith<RoomMember> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $RoomMemberCopyWith<$Res> {
  factory $RoomMemberCopyWith(
          RoomMember value, $Res Function(RoomMember) then) =
      _$RoomMemberCopyWithImpl<$Res, RoomMember>;
  @useResult
  $Res call(
      {String id,
      String? name,
      @JsonKey(name: 'profileImage') String? profileImage,
      String? designation,
      String role,
      @JsonKey(name: 'is_muted') bool isMuted,
      @JsonKey(name: 'muted_until') String? mutedUntil,
      bool online,
      @JsonKey(name: 'votingState') String? votingState,
      @JsonKey(name: 'votingLGA') String? votingLga,
      @JsonKey(name: 'votingWard') String? votingWard,
      @JsonKey(name: 'votingPU') String? votingPu});
}

/// @nodoc
class _$RoomMemberCopyWithImpl<$Res, $Val extends RoomMember>
    implements $RoomMemberCopyWith<$Res> {
  _$RoomMemberCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = freezed,
    Object? profileImage = freezed,
    Object? designation = freezed,
    Object? role = null,
    Object? isMuted = null,
    Object? mutedUntil = freezed,
    Object? online = null,
    Object? votingState = freezed,
    Object? votingLga = freezed,
    Object? votingWard = freezed,
    Object? votingPu = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: freezed == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      profileImage: freezed == profileImage
          ? _value.profileImage
          : profileImage // ignore: cast_nullable_to_non_nullable
              as String?,
      designation: freezed == designation
          ? _value.designation
          : designation // ignore: cast_nullable_to_non_nullable
              as String?,
      role: null == role
          ? _value.role
          : role // ignore: cast_nullable_to_non_nullable
              as String,
      isMuted: null == isMuted
          ? _value.isMuted
          : isMuted // ignore: cast_nullable_to_non_nullable
              as bool,
      mutedUntil: freezed == mutedUntil
          ? _value.mutedUntil
          : mutedUntil // ignore: cast_nullable_to_non_nullable
              as String?,
      online: null == online
          ? _value.online
          : online // ignore: cast_nullable_to_non_nullable
              as bool,
      votingState: freezed == votingState
          ? _value.votingState
          : votingState // ignore: cast_nullable_to_non_nullable
              as String?,
      votingLga: freezed == votingLga
          ? _value.votingLga
          : votingLga // ignore: cast_nullable_to_non_nullable
              as String?,
      votingWard: freezed == votingWard
          ? _value.votingWard
          : votingWard // ignore: cast_nullable_to_non_nullable
              as String?,
      votingPu: freezed == votingPu
          ? _value.votingPu
          : votingPu // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$RoomMemberImplCopyWith<$Res>
    implements $RoomMemberCopyWith<$Res> {
  factory _$$RoomMemberImplCopyWith(
          _$RoomMemberImpl value, $Res Function(_$RoomMemberImpl) then) =
      __$$RoomMemberImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String? name,
      @JsonKey(name: 'profileImage') String? profileImage,
      String? designation,
      String role,
      @JsonKey(name: 'is_muted') bool isMuted,
      @JsonKey(name: 'muted_until') String? mutedUntil,
      bool online,
      @JsonKey(name: 'votingState') String? votingState,
      @JsonKey(name: 'votingLGA') String? votingLga,
      @JsonKey(name: 'votingWard') String? votingWard,
      @JsonKey(name: 'votingPU') String? votingPu});
}

/// @nodoc
class __$$RoomMemberImplCopyWithImpl<$Res>
    extends _$RoomMemberCopyWithImpl<$Res, _$RoomMemberImpl>
    implements _$$RoomMemberImplCopyWith<$Res> {
  __$$RoomMemberImplCopyWithImpl(
      _$RoomMemberImpl _value, $Res Function(_$RoomMemberImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = freezed,
    Object? profileImage = freezed,
    Object? designation = freezed,
    Object? role = null,
    Object? isMuted = null,
    Object? mutedUntil = freezed,
    Object? online = null,
    Object? votingState = freezed,
    Object? votingLga = freezed,
    Object? votingWard = freezed,
    Object? votingPu = freezed,
  }) {
    return _then(_$RoomMemberImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: freezed == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      profileImage: freezed == profileImage
          ? _value.profileImage
          : profileImage // ignore: cast_nullable_to_non_nullable
              as String?,
      designation: freezed == designation
          ? _value.designation
          : designation // ignore: cast_nullable_to_non_nullable
              as String?,
      role: null == role
          ? _value.role
          : role // ignore: cast_nullable_to_non_nullable
              as String,
      isMuted: null == isMuted
          ? _value.isMuted
          : isMuted // ignore: cast_nullable_to_non_nullable
              as bool,
      mutedUntil: freezed == mutedUntil
          ? _value.mutedUntil
          : mutedUntil // ignore: cast_nullable_to_non_nullable
              as String?,
      online: null == online
          ? _value.online
          : online // ignore: cast_nullable_to_non_nullable
              as bool,
      votingState: freezed == votingState
          ? _value.votingState
          : votingState // ignore: cast_nullable_to_non_nullable
              as String?,
      votingLga: freezed == votingLga
          ? _value.votingLga
          : votingLga // ignore: cast_nullable_to_non_nullable
              as String?,
      votingWard: freezed == votingWard
          ? _value.votingWard
          : votingWard // ignore: cast_nullable_to_non_nullable
              as String?,
      votingPu: freezed == votingPu
          ? _value.votingPu
          : votingPu // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$RoomMemberImpl implements _RoomMember {
  const _$RoomMemberImpl(
      {required this.id,
      this.name,
      @JsonKey(name: 'profileImage') this.profileImage,
      this.designation,
      this.role = 'member',
      @JsonKey(name: 'is_muted') this.isMuted = false,
      @JsonKey(name: 'muted_until') this.mutedUntil,
      this.online = false,
      @JsonKey(name: 'votingState') this.votingState,
      @JsonKey(name: 'votingLGA') this.votingLga,
      @JsonKey(name: 'votingWard') this.votingWard,
      @JsonKey(name: 'votingPU') this.votingPu});

  factory _$RoomMemberImpl.fromJson(Map<String, dynamic> json) =>
      _$$RoomMemberImplFromJson(json);

  @override
  final String id;
  @override
  final String? name;
  @override
  @JsonKey(name: 'profileImage')
  final String? profileImage;
  @override
  final String? designation;
  @override
  @JsonKey()
  final String role;
  @override
  @JsonKey(name: 'is_muted')
  final bool isMuted;
  @override
  @JsonKey(name: 'muted_until')
  final String? mutedUntil;
  @override
  @JsonKey()
  final bool online;
  @override
  @JsonKey(name: 'votingState')
  final String? votingState;
  @override
  @JsonKey(name: 'votingLGA')
  final String? votingLga;
  @override
  @JsonKey(name: 'votingWard')
  final String? votingWard;
  @override
  @JsonKey(name: 'votingPU')
  final String? votingPu;

  @override
  String toString() {
    return 'RoomMember(id: $id, name: $name, profileImage: $profileImage, designation: $designation, role: $role, isMuted: $isMuted, mutedUntil: $mutedUntil, online: $online, votingState: $votingState, votingLga: $votingLga, votingWard: $votingWard, votingPu: $votingPu)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$RoomMemberImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.profileImage, profileImage) ||
                other.profileImage == profileImage) &&
            (identical(other.designation, designation) ||
                other.designation == designation) &&
            (identical(other.role, role) || other.role == role) &&
            (identical(other.isMuted, isMuted) || other.isMuted == isMuted) &&
            (identical(other.mutedUntil, mutedUntil) ||
                other.mutedUntil == mutedUntil) &&
            (identical(other.online, online) || other.online == online) &&
            (identical(other.votingState, votingState) ||
                other.votingState == votingState) &&
            (identical(other.votingLga, votingLga) ||
                other.votingLga == votingLga) &&
            (identical(other.votingWard, votingWard) ||
                other.votingWard == votingWard) &&
            (identical(other.votingPu, votingPu) ||
                other.votingPu == votingPu));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      name,
      profileImage,
      designation,
      role,
      isMuted,
      mutedUntil,
      online,
      votingState,
      votingLga,
      votingWard,
      votingPu);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$RoomMemberImplCopyWith<_$RoomMemberImpl> get copyWith =>
      __$$RoomMemberImplCopyWithImpl<_$RoomMemberImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$RoomMemberImplToJson(
      this,
    );
  }
}

abstract class _RoomMember implements RoomMember {
  const factory _RoomMember(
      {required final String id,
      final String? name,
      @JsonKey(name: 'profileImage') final String? profileImage,
      final String? designation,
      final String role,
      @JsonKey(name: 'is_muted') final bool isMuted,
      @JsonKey(name: 'muted_until') final String? mutedUntil,
      final bool online,
      @JsonKey(name: 'votingState') final String? votingState,
      @JsonKey(name: 'votingLGA') final String? votingLga,
      @JsonKey(name: 'votingWard') final String? votingWard,
      @JsonKey(name: 'votingPU') final String? votingPu}) = _$RoomMemberImpl;

  factory _RoomMember.fromJson(Map<String, dynamic> json) =
      _$RoomMemberImpl.fromJson;

  @override
  String get id;
  @override
  String? get name;
  @override
  @JsonKey(name: 'profileImage')
  String? get profileImage;
  @override
  String? get designation;
  @override
  String get role;
  @override
  @JsonKey(name: 'is_muted')
  bool get isMuted;
  @override
  @JsonKey(name: 'muted_until')
  String? get mutedUntil;
  @override
  bool get online;
  @override
  @JsonKey(name: 'votingState')
  String? get votingState;
  @override
  @JsonKey(name: 'votingLGA')
  String? get votingLga;
  @override
  @JsonKey(name: 'votingWard')
  String? get votingWard;
  @override
  @JsonKey(name: 'votingPU')
  String? get votingPu;
  @override
  @JsonKey(ignore: true)
  _$$RoomMemberImplCopyWith<_$RoomMemberImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
