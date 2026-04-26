// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'chat_contact.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

ChatContact _$ChatContactFromJson(Map<String, dynamic> json) {
  return _ChatContact.fromJson(json);
}

/// @nodoc
mixin _$ChatContact {
  String get id => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String? get email => throw _privateConstructorUsedError;
  String? get phone => throw _privateConstructorUsedError;
  @JsonKey(name: 'profileImage')
  String? get profileImage => throw _privateConstructorUsedError;
  String? get designation => throw _privateConstructorUsedError;
  String? get level => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $ChatContactCopyWith<ChatContact> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ChatContactCopyWith<$Res> {
  factory $ChatContactCopyWith(
          ChatContact value, $Res Function(ChatContact) then) =
      _$ChatContactCopyWithImpl<$Res, ChatContact>;
  @useResult
  $Res call(
      {String id,
      String name,
      String? email,
      String? phone,
      @JsonKey(name: 'profileImage') String? profileImage,
      String? designation,
      String? level});
}

/// @nodoc
class _$ChatContactCopyWithImpl<$Res, $Val extends ChatContact>
    implements $ChatContactCopyWith<$Res> {
  _$ChatContactCopyWithImpl(this._value, this._then);

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
    Object? level = freezed,
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
      level: freezed == level
          ? _value.level
          : level // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$ChatContactImplCopyWith<$Res>
    implements $ChatContactCopyWith<$Res> {
  factory _$$ChatContactImplCopyWith(
          _$ChatContactImpl value, $Res Function(_$ChatContactImpl) then) =
      __$$ChatContactImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String name,
      String? email,
      String? phone,
      @JsonKey(name: 'profileImage') String? profileImage,
      String? designation,
      String? level});
}

/// @nodoc
class __$$ChatContactImplCopyWithImpl<$Res>
    extends _$ChatContactCopyWithImpl<$Res, _$ChatContactImpl>
    implements _$$ChatContactImplCopyWith<$Res> {
  __$$ChatContactImplCopyWithImpl(
      _$ChatContactImpl _value, $Res Function(_$ChatContactImpl) _then)
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
    Object? level = freezed,
  }) {
    return _then(_$ChatContactImpl(
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
      level: freezed == level
          ? _value.level
          : level // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$ChatContactImpl implements _ChatContact {
  const _$ChatContactImpl(
      {required this.id,
      required this.name,
      this.email,
      this.phone,
      @JsonKey(name: 'profileImage') this.profileImage,
      this.designation,
      this.level});

  factory _$ChatContactImpl.fromJson(Map<String, dynamic> json) =>
      _$$ChatContactImplFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  final String? email;
  @override
  final String? phone;
  @override
  @JsonKey(name: 'profileImage')
  final String? profileImage;
  @override
  final String? designation;
  @override
  final String? level;

  @override
  String toString() {
    return 'ChatContact(id: $id, name: $name, email: $email, phone: $phone, profileImage: $profileImage, designation: $designation, level: $level)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ChatContactImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.email, email) || other.email == email) &&
            (identical(other.phone, phone) || other.phone == phone) &&
            (identical(other.profileImage, profileImage) ||
                other.profileImage == profileImage) &&
            (identical(other.designation, designation) ||
                other.designation == designation) &&
            (identical(other.level, level) || other.level == level));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType, id, name, email, phone, profileImage, designation, level);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$ChatContactImplCopyWith<_$ChatContactImpl> get copyWith =>
      __$$ChatContactImplCopyWithImpl<_$ChatContactImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ChatContactImplToJson(
      this,
    );
  }
}

abstract class _ChatContact implements ChatContact {
  const factory _ChatContact(
      {required final String id,
      required final String name,
      final String? email,
      final String? phone,
      @JsonKey(name: 'profileImage') final String? profileImage,
      final String? designation,
      final String? level}) = _$ChatContactImpl;

  factory _ChatContact.fromJson(Map<String, dynamic> json) =
      _$ChatContactImpl.fromJson;

  @override
  String get id;
  @override
  String get name;
  @override
  String? get email;
  @override
  String? get phone;
  @override
  @JsonKey(name: 'profileImage')
  String? get profileImage;
  @override
  String? get designation;
  @override
  String? get level;
  @override
  @JsonKey(ignore: true)
  _$$ChatContactImplCopyWith<_$ChatContactImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

ChatContacts _$ChatContactsFromJson(Map<String, dynamic> json) {
  return _ChatContacts.fromJson(json);
}

/// @nodoc
mixin _$ChatContacts {
  List<ChatContact> get coordinators => throw _privateConstructorUsedError;
  List<ChatContact> get subordinates => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $ChatContactsCopyWith<ChatContacts> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ChatContactsCopyWith<$Res> {
  factory $ChatContactsCopyWith(
          ChatContacts value, $Res Function(ChatContacts) then) =
      _$ChatContactsCopyWithImpl<$Res, ChatContacts>;
  @useResult
  $Res call({List<ChatContact> coordinators, List<ChatContact> subordinates});
}

/// @nodoc
class _$ChatContactsCopyWithImpl<$Res, $Val extends ChatContacts>
    implements $ChatContactsCopyWith<$Res> {
  _$ChatContactsCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? coordinators = null,
    Object? subordinates = null,
  }) {
    return _then(_value.copyWith(
      coordinators: null == coordinators
          ? _value.coordinators
          : coordinators // ignore: cast_nullable_to_non_nullable
              as List<ChatContact>,
      subordinates: null == subordinates
          ? _value.subordinates
          : subordinates // ignore: cast_nullable_to_non_nullable
              as List<ChatContact>,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$ChatContactsImplCopyWith<$Res>
    implements $ChatContactsCopyWith<$Res> {
  factory _$$ChatContactsImplCopyWith(
          _$ChatContactsImpl value, $Res Function(_$ChatContactsImpl) then) =
      __$$ChatContactsImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({List<ChatContact> coordinators, List<ChatContact> subordinates});
}

/// @nodoc
class __$$ChatContactsImplCopyWithImpl<$Res>
    extends _$ChatContactsCopyWithImpl<$Res, _$ChatContactsImpl>
    implements _$$ChatContactsImplCopyWith<$Res> {
  __$$ChatContactsImplCopyWithImpl(
      _$ChatContactsImpl _value, $Res Function(_$ChatContactsImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? coordinators = null,
    Object? subordinates = null,
  }) {
    return _then(_$ChatContactsImpl(
      coordinators: null == coordinators
          ? _value._coordinators
          : coordinators // ignore: cast_nullable_to_non_nullable
              as List<ChatContact>,
      subordinates: null == subordinates
          ? _value._subordinates
          : subordinates // ignore: cast_nullable_to_non_nullable
              as List<ChatContact>,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$ChatContactsImpl implements _ChatContacts {
  const _$ChatContactsImpl(
      {final List<ChatContact> coordinators = const [],
      final List<ChatContact> subordinates = const []})
      : _coordinators = coordinators,
        _subordinates = subordinates;

  factory _$ChatContactsImpl.fromJson(Map<String, dynamic> json) =>
      _$$ChatContactsImplFromJson(json);

  final List<ChatContact> _coordinators;
  @override
  @JsonKey()
  List<ChatContact> get coordinators {
    if (_coordinators is EqualUnmodifiableListView) return _coordinators;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_coordinators);
  }

  final List<ChatContact> _subordinates;
  @override
  @JsonKey()
  List<ChatContact> get subordinates {
    if (_subordinates is EqualUnmodifiableListView) return _subordinates;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_subordinates);
  }

  @override
  String toString() {
    return 'ChatContacts(coordinators: $coordinators, subordinates: $subordinates)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ChatContactsImpl &&
            const DeepCollectionEquality()
                .equals(other._coordinators, _coordinators) &&
            const DeepCollectionEquality()
                .equals(other._subordinates, _subordinates));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      const DeepCollectionEquality().hash(_coordinators),
      const DeepCollectionEquality().hash(_subordinates));

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$ChatContactsImplCopyWith<_$ChatContactsImpl> get copyWith =>
      __$$ChatContactsImplCopyWithImpl<_$ChatContactsImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ChatContactsImplToJson(
      this,
    );
  }
}

abstract class _ChatContacts implements ChatContacts {
  const factory _ChatContacts(
      {final List<ChatContact> coordinators,
      final List<ChatContact> subordinates}) = _$ChatContactsImpl;

  factory _ChatContacts.fromJson(Map<String, dynamic> json) =
      _$ChatContactsImpl.fromJson;

  @override
  List<ChatContact> get coordinators;
  @override
  List<ChatContact> get subordinates;
  @override
  @JsonKey(ignore: true)
  _$$ChatContactsImplCopyWith<_$ChatContactsImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
