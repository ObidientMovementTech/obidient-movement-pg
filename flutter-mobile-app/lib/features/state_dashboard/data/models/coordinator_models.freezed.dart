// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'coordinator_models.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

SearchedUser _$SearchedUserFromJson(Map<String, dynamic> json) {
  return _SearchedUser.fromJson(json);
}

/// @nodoc
mixin _$SearchedUser {
  String get id => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String? get email => throw _privateConstructorUsedError;
  String? get phone => throw _privateConstructorUsedError;
  String? get profileImage => throw _privateConstructorUsedError;
  String? get designation => throw _privateConstructorUsedError;
  String? get assignedState => throw _privateConstructorUsedError;
  String? get assignedLGA => throw _privateConstructorUsedError;
  String? get assignedWard => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $SearchedUserCopyWith<SearchedUser> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $SearchedUserCopyWith<$Res> {
  factory $SearchedUserCopyWith(
          SearchedUser value, $Res Function(SearchedUser) then) =
      _$SearchedUserCopyWithImpl<$Res, SearchedUser>;
  @useResult
  $Res call(
      {String id,
      String name,
      String? email,
      String? phone,
      String? profileImage,
      String? designation,
      String? assignedState,
      String? assignedLGA,
      String? assignedWard});
}

/// @nodoc
class _$SearchedUserCopyWithImpl<$Res, $Val extends SearchedUser>
    implements $SearchedUserCopyWith<$Res> {
  _$SearchedUserCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? email = freezed,
    Object? phone = freezed,
    Object? profileImage = freezed,
    Object? designation = freezed,
    Object? assignedState = freezed,
    Object? assignedLGA = freezed,
    Object? assignedWard = freezed,
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
      email: freezed == email
          ? _value.email
          : email // ignore: cast_nullable_to_non_nullable
              as String?,
      phone: freezed == phone
          ? _value.phone
          : phone // ignore: cast_nullable_to_non_nullable
              as String?,
      profileImage: freezed == profileImage
          ? _value.profileImage
          : profileImage // ignore: cast_nullable_to_non_nullable
              as String?,
      designation: freezed == designation
          ? _value.designation
          : designation // ignore: cast_nullable_to_non_nullable
              as String?,
      assignedState: freezed == assignedState
          ? _value.assignedState
          : assignedState // ignore: cast_nullable_to_non_nullable
              as String?,
      assignedLGA: freezed == assignedLGA
          ? _value.assignedLGA
          : assignedLGA // ignore: cast_nullable_to_non_nullable
              as String?,
      assignedWard: freezed == assignedWard
          ? _value.assignedWard
          : assignedWard // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$SearchedUserImplCopyWith<$Res>
    implements $SearchedUserCopyWith<$Res> {
  factory _$$SearchedUserImplCopyWith(
          _$SearchedUserImpl value, $Res Function(_$SearchedUserImpl) then) =
      __$$SearchedUserImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String name,
      String? email,
      String? phone,
      String? profileImage,
      String? designation,
      String? assignedState,
      String? assignedLGA,
      String? assignedWard});
}

/// @nodoc
class __$$SearchedUserImplCopyWithImpl<$Res>
    extends _$SearchedUserCopyWithImpl<$Res, _$SearchedUserImpl>
    implements _$$SearchedUserImplCopyWith<$Res> {
  __$$SearchedUserImplCopyWithImpl(
      _$SearchedUserImpl _value, $Res Function(_$SearchedUserImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? email = freezed,
    Object? phone = freezed,
    Object? profileImage = freezed,
    Object? designation = freezed,
    Object? assignedState = freezed,
    Object? assignedLGA = freezed,
    Object? assignedWard = freezed,
  }) {
    return _then(_$SearchedUserImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      email: freezed == email
          ? _value.email
          : email // ignore: cast_nullable_to_non_nullable
              as String?,
      phone: freezed == phone
          ? _value.phone
          : phone // ignore: cast_nullable_to_non_nullable
              as String?,
      profileImage: freezed == profileImage
          ? _value.profileImage
          : profileImage // ignore: cast_nullable_to_non_nullable
              as String?,
      designation: freezed == designation
          ? _value.designation
          : designation // ignore: cast_nullable_to_non_nullable
              as String?,
      assignedState: freezed == assignedState
          ? _value.assignedState
          : assignedState // ignore: cast_nullable_to_non_nullable
              as String?,
      assignedLGA: freezed == assignedLGA
          ? _value.assignedLGA
          : assignedLGA // ignore: cast_nullable_to_non_nullable
              as String?,
      assignedWard: freezed == assignedWard
          ? _value.assignedWard
          : assignedWard // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$SearchedUserImpl implements _SearchedUser {
  const _$SearchedUserImpl(
      {required this.id,
      required this.name,
      this.email,
      this.phone,
      this.profileImage,
      this.designation,
      this.assignedState,
      this.assignedLGA,
      this.assignedWard});

  factory _$SearchedUserImpl.fromJson(Map<String, dynamic> json) =>
      _$$SearchedUserImplFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  final String? email;
  @override
  final String? phone;
  @override
  final String? profileImage;
  @override
  final String? designation;
  @override
  final String? assignedState;
  @override
  final String? assignedLGA;
  @override
  final String? assignedWard;

  @override
  String toString() {
    return 'SearchedUser(id: $id, name: $name, email: $email, phone: $phone, profileImage: $profileImage, designation: $designation, assignedState: $assignedState, assignedLGA: $assignedLGA, assignedWard: $assignedWard)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$SearchedUserImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.email, email) || other.email == email) &&
            (identical(other.phone, phone) || other.phone == phone) &&
            (identical(other.profileImage, profileImage) ||
                other.profileImage == profileImage) &&
            (identical(other.designation, designation) ||
                other.designation == designation) &&
            (identical(other.assignedState, assignedState) ||
                other.assignedState == assignedState) &&
            (identical(other.assignedLGA, assignedLGA) ||
                other.assignedLGA == assignedLGA) &&
            (identical(other.assignedWard, assignedWard) ||
                other.assignedWard == assignedWard));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, id, name, email, phone,
      profileImage, designation, assignedState, assignedLGA, assignedWard);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$SearchedUserImplCopyWith<_$SearchedUserImpl> get copyWith =>
      __$$SearchedUserImplCopyWithImpl<_$SearchedUserImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$SearchedUserImplToJson(
      this,
    );
  }
}

abstract class _SearchedUser implements SearchedUser {
  const factory _SearchedUser(
      {required final String id,
      required final String name,
      final String? email,
      final String? phone,
      final String? profileImage,
      final String? designation,
      final String? assignedState,
      final String? assignedLGA,
      final String? assignedWard}) = _$SearchedUserImpl;

  factory _SearchedUser.fromJson(Map<String, dynamic> json) =
      _$SearchedUserImpl.fromJson;

  @override
  String get id;
  @override
  String get name;
  @override
  String? get email;
  @override
  String? get phone;
  @override
  String? get profileImage;
  @override
  String? get designation;
  @override
  String? get assignedState;
  @override
  String? get assignedLGA;
  @override
  String? get assignedWard;
  @override
  @JsonKey(ignore: true)
  _$$SearchedUserImplCopyWith<_$SearchedUserImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

NigeriaLocation _$NigeriaLocationFromJson(Map<String, dynamic> json) {
  return _NigeriaLocation.fromJson(json);
}

/// @nodoc
mixin _$NigeriaLocation {
  int get id => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String? get abbreviation => throw _privateConstructorUsedError;
  String? get level => throw _privateConstructorUsedError;
  @JsonKey(name: 'parent_id')
  int? get parentId => throw _privateConstructorUsedError;
  @JsonKey(name: 'source_id')
  String? get sourceId => throw _privateConstructorUsedError;
  @JsonKey(name: 'parent_name')
  String? get parentName => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $NigeriaLocationCopyWith<NigeriaLocation> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $NigeriaLocationCopyWith<$Res> {
  factory $NigeriaLocationCopyWith(
          NigeriaLocation value, $Res Function(NigeriaLocation) then) =
      _$NigeriaLocationCopyWithImpl<$Res, NigeriaLocation>;
  @useResult
  $Res call(
      {int id,
      String name,
      String? abbreviation,
      String? level,
      @JsonKey(name: 'parent_id') int? parentId,
      @JsonKey(name: 'source_id') String? sourceId,
      @JsonKey(name: 'parent_name') String? parentName});
}

/// @nodoc
class _$NigeriaLocationCopyWithImpl<$Res, $Val extends NigeriaLocation>
    implements $NigeriaLocationCopyWith<$Res> {
  _$NigeriaLocationCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? abbreviation = freezed,
    Object? level = freezed,
    Object? parentId = freezed,
    Object? sourceId = freezed,
    Object? parentName = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as int,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      abbreviation: freezed == abbreviation
          ? _value.abbreviation
          : abbreviation // ignore: cast_nullable_to_non_nullable
              as String?,
      level: freezed == level
          ? _value.level
          : level // ignore: cast_nullable_to_non_nullable
              as String?,
      parentId: freezed == parentId
          ? _value.parentId
          : parentId // ignore: cast_nullable_to_non_nullable
              as int?,
      sourceId: freezed == sourceId
          ? _value.sourceId
          : sourceId // ignore: cast_nullable_to_non_nullable
              as String?,
      parentName: freezed == parentName
          ? _value.parentName
          : parentName // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$NigeriaLocationImplCopyWith<$Res>
    implements $NigeriaLocationCopyWith<$Res> {
  factory _$$NigeriaLocationImplCopyWith(_$NigeriaLocationImpl value,
          $Res Function(_$NigeriaLocationImpl) then) =
      __$$NigeriaLocationImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {int id,
      String name,
      String? abbreviation,
      String? level,
      @JsonKey(name: 'parent_id') int? parentId,
      @JsonKey(name: 'source_id') String? sourceId,
      @JsonKey(name: 'parent_name') String? parentName});
}

/// @nodoc
class __$$NigeriaLocationImplCopyWithImpl<$Res>
    extends _$NigeriaLocationCopyWithImpl<$Res, _$NigeriaLocationImpl>
    implements _$$NigeriaLocationImplCopyWith<$Res> {
  __$$NigeriaLocationImplCopyWithImpl(
      _$NigeriaLocationImpl _value, $Res Function(_$NigeriaLocationImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? abbreviation = freezed,
    Object? level = freezed,
    Object? parentId = freezed,
    Object? sourceId = freezed,
    Object? parentName = freezed,
  }) {
    return _then(_$NigeriaLocationImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as int,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      abbreviation: freezed == abbreviation
          ? _value.abbreviation
          : abbreviation // ignore: cast_nullable_to_non_nullable
              as String?,
      level: freezed == level
          ? _value.level
          : level // ignore: cast_nullable_to_non_nullable
              as String?,
      parentId: freezed == parentId
          ? _value.parentId
          : parentId // ignore: cast_nullable_to_non_nullable
              as int?,
      sourceId: freezed == sourceId
          ? _value.sourceId
          : sourceId // ignore: cast_nullable_to_non_nullable
              as String?,
      parentName: freezed == parentName
          ? _value.parentName
          : parentName // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$NigeriaLocationImpl implements _NigeriaLocation {
  const _$NigeriaLocationImpl(
      {required this.id,
      required this.name,
      this.abbreviation,
      this.level,
      @JsonKey(name: 'parent_id') this.parentId,
      @JsonKey(name: 'source_id') this.sourceId,
      @JsonKey(name: 'parent_name') this.parentName});

  factory _$NigeriaLocationImpl.fromJson(Map<String, dynamic> json) =>
      _$$NigeriaLocationImplFromJson(json);

  @override
  final int id;
  @override
  final String name;
  @override
  final String? abbreviation;
  @override
  final String? level;
  @override
  @JsonKey(name: 'parent_id')
  final int? parentId;
  @override
  @JsonKey(name: 'source_id')
  final String? sourceId;
  @override
  @JsonKey(name: 'parent_name')
  final String? parentName;

  @override
  String toString() {
    return 'NigeriaLocation(id: $id, name: $name, abbreviation: $abbreviation, level: $level, parentId: $parentId, sourceId: $sourceId, parentName: $parentName)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$NigeriaLocationImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.abbreviation, abbreviation) ||
                other.abbreviation == abbreviation) &&
            (identical(other.level, level) || other.level == level) &&
            (identical(other.parentId, parentId) ||
                other.parentId == parentId) &&
            (identical(other.sourceId, sourceId) ||
                other.sourceId == sourceId) &&
            (identical(other.parentName, parentName) ||
                other.parentName == parentName));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, id, name, abbreviation, level,
      parentId, sourceId, parentName);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$NigeriaLocationImplCopyWith<_$NigeriaLocationImpl> get copyWith =>
      __$$NigeriaLocationImplCopyWithImpl<_$NigeriaLocationImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$NigeriaLocationImplToJson(
      this,
    );
  }
}

abstract class _NigeriaLocation implements NigeriaLocation {
  const factory _NigeriaLocation(
          {required final int id,
          required final String name,
          final String? abbreviation,
          final String? level,
          @JsonKey(name: 'parent_id') final int? parentId,
          @JsonKey(name: 'source_id') final String? sourceId,
          @JsonKey(name: 'parent_name') final String? parentName}) =
      _$NigeriaLocationImpl;

  factory _NigeriaLocation.fromJson(Map<String, dynamic> json) =
      _$NigeriaLocationImpl.fromJson;

  @override
  int get id;
  @override
  String get name;
  @override
  String? get abbreviation;
  @override
  String? get level;
  @override
  @JsonKey(name: 'parent_id')
  int? get parentId;
  @override
  @JsonKey(name: 'source_id')
  String? get sourceId;
  @override
  @JsonKey(name: 'parent_name')
  String? get parentName;
  @override
  @JsonKey(ignore: true)
  _$$NigeriaLocationImplCopyWith<_$NigeriaLocationImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
