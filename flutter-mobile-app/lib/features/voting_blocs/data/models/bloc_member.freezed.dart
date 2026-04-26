// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'bloc_member.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

BlocMember _$BlocMemberFromJson(Map<String, dynamic> json) {
  return _BlocMember.fromJson(json);
}

/// @nodoc
mixin _$BlocMember {
  @JsonKey(name: '_id')
  String get id => throw _privateConstructorUsedError;
  String? get name => throw _privateConstructorUsedError;
  String? get email => throw _privateConstructorUsedError;
  String? get phone => throw _privateConstructorUsedError;
  String? get countryCode => throw _privateConstructorUsedError;
  bool get isManualMember => throw _privateConstructorUsedError;
  MemberMetadata? get metadata => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $BlocMemberCopyWith<BlocMember> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $BlocMemberCopyWith<$Res> {
  factory $BlocMemberCopyWith(
          BlocMember value, $Res Function(BlocMember) then) =
      _$BlocMemberCopyWithImpl<$Res, BlocMember>;
  @useResult
  $Res call(
      {@JsonKey(name: '_id') String id,
      String? name,
      String? email,
      String? phone,
      String? countryCode,
      bool isManualMember,
      MemberMetadata? metadata});

  $MemberMetadataCopyWith<$Res>? get metadata;
}

/// @nodoc
class _$BlocMemberCopyWithImpl<$Res, $Val extends BlocMember>
    implements $BlocMemberCopyWith<$Res> {
  _$BlocMemberCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = freezed,
    Object? email = freezed,
    Object? phone = freezed,
    Object? countryCode = freezed,
    Object? isManualMember = null,
    Object? metadata = freezed,
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
      email: freezed == email
          ? _value.email
          : email // ignore: cast_nullable_to_non_nullable
              as String?,
      phone: freezed == phone
          ? _value.phone
          : phone // ignore: cast_nullable_to_non_nullable
              as String?,
      countryCode: freezed == countryCode
          ? _value.countryCode
          : countryCode // ignore: cast_nullable_to_non_nullable
              as String?,
      isManualMember: null == isManualMember
          ? _value.isManualMember
          : isManualMember // ignore: cast_nullable_to_non_nullable
              as bool,
      metadata: freezed == metadata
          ? _value.metadata
          : metadata // ignore: cast_nullable_to_non_nullable
              as MemberMetadata?,
    ) as $Val);
  }

  @override
  @pragma('vm:prefer-inline')
  $MemberMetadataCopyWith<$Res>? get metadata {
    if (_value.metadata == null) {
      return null;
    }

    return $MemberMetadataCopyWith<$Res>(_value.metadata!, (value) {
      return _then(_value.copyWith(metadata: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$BlocMemberImplCopyWith<$Res>
    implements $BlocMemberCopyWith<$Res> {
  factory _$$BlocMemberImplCopyWith(
          _$BlocMemberImpl value, $Res Function(_$BlocMemberImpl) then) =
      __$$BlocMemberImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {@JsonKey(name: '_id') String id,
      String? name,
      String? email,
      String? phone,
      String? countryCode,
      bool isManualMember,
      MemberMetadata? metadata});

  @override
  $MemberMetadataCopyWith<$Res>? get metadata;
}

/// @nodoc
class __$$BlocMemberImplCopyWithImpl<$Res>
    extends _$BlocMemberCopyWithImpl<$Res, _$BlocMemberImpl>
    implements _$$BlocMemberImplCopyWith<$Res> {
  __$$BlocMemberImplCopyWithImpl(
      _$BlocMemberImpl _value, $Res Function(_$BlocMemberImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = freezed,
    Object? email = freezed,
    Object? phone = freezed,
    Object? countryCode = freezed,
    Object? isManualMember = null,
    Object? metadata = freezed,
  }) {
    return _then(_$BlocMemberImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: freezed == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      email: freezed == email
          ? _value.email
          : email // ignore: cast_nullable_to_non_nullable
              as String?,
      phone: freezed == phone
          ? _value.phone
          : phone // ignore: cast_nullable_to_non_nullable
              as String?,
      countryCode: freezed == countryCode
          ? _value.countryCode
          : countryCode // ignore: cast_nullable_to_non_nullable
              as String?,
      isManualMember: null == isManualMember
          ? _value.isManualMember
          : isManualMember // ignore: cast_nullable_to_non_nullable
              as bool,
      metadata: freezed == metadata
          ? _value.metadata
          : metadata // ignore: cast_nullable_to_non_nullable
              as MemberMetadata?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$BlocMemberImpl implements _BlocMember {
  const _$BlocMemberImpl(
      {@JsonKey(name: '_id') required this.id,
      this.name,
      this.email,
      this.phone,
      this.countryCode,
      this.isManualMember = false,
      this.metadata});

  factory _$BlocMemberImpl.fromJson(Map<String, dynamic> json) =>
      _$$BlocMemberImplFromJson(json);

  @override
  @JsonKey(name: '_id')
  final String id;
  @override
  final String? name;
  @override
  final String? email;
  @override
  final String? phone;
  @override
  final String? countryCode;
  @override
  @JsonKey()
  final bool isManualMember;
  @override
  final MemberMetadata? metadata;

  @override
  String toString() {
    return 'BlocMember(id: $id, name: $name, email: $email, phone: $phone, countryCode: $countryCode, isManualMember: $isManualMember, metadata: $metadata)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$BlocMemberImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.email, email) || other.email == email) &&
            (identical(other.phone, phone) || other.phone == phone) &&
            (identical(other.countryCode, countryCode) ||
                other.countryCode == countryCode) &&
            (identical(other.isManualMember, isManualMember) ||
                other.isManualMember == isManualMember) &&
            (identical(other.metadata, metadata) ||
                other.metadata == metadata));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, id, name, email, phone,
      countryCode, isManualMember, metadata);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$BlocMemberImplCopyWith<_$BlocMemberImpl> get copyWith =>
      __$$BlocMemberImplCopyWithImpl<_$BlocMemberImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$BlocMemberImplToJson(
      this,
    );
  }
}

abstract class _BlocMember implements BlocMember {
  const factory _BlocMember(
      {@JsonKey(name: '_id') required final String id,
      final String? name,
      final String? email,
      final String? phone,
      final String? countryCode,
      final bool isManualMember,
      final MemberMetadata? metadata}) = _$BlocMemberImpl;

  factory _BlocMember.fromJson(Map<String, dynamic> json) =
      _$BlocMemberImpl.fromJson;

  @override
  @JsonKey(name: '_id')
  String get id;
  @override
  String? get name;
  @override
  String? get email;
  @override
  String? get phone;
  @override
  String? get countryCode;
  @override
  bool get isManualMember;
  @override
  MemberMetadata? get metadata;
  @override
  @JsonKey(ignore: true)
  _$$BlocMemberImplCopyWith<_$BlocMemberImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

MemberMetadata _$MemberMetadataFromJson(Map<String, dynamic> json) {
  return _MemberMetadata.fromJson(json);
}

/// @nodoc
mixin _$MemberMetadata {
  String? get joinDate => throw _privateConstructorUsedError;
  String get decisionTag => throw _privateConstructorUsedError;
  String get contactTag => throw _privateConstructorUsedError;
  String get engagementLevel => throw _privateConstructorUsedError;
  String get pvcStatus => throw _privateConstructorUsedError;
  String get notes => throw _privateConstructorUsedError;
  String? get lastContactDate => throw _privateConstructorUsedError;
  MemberLocation? get location => throw _privateConstructorUsedError;
  String? get memberType => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $MemberMetadataCopyWith<MemberMetadata> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $MemberMetadataCopyWith<$Res> {
  factory $MemberMetadataCopyWith(
          MemberMetadata value, $Res Function(MemberMetadata) then) =
      _$MemberMetadataCopyWithImpl<$Res, MemberMetadata>;
  @useResult
  $Res call(
      {String? joinDate,
      String decisionTag,
      String contactTag,
      String engagementLevel,
      String pvcStatus,
      String notes,
      String? lastContactDate,
      MemberLocation? location,
      String? memberType});

  $MemberLocationCopyWith<$Res>? get location;
}

/// @nodoc
class _$MemberMetadataCopyWithImpl<$Res, $Val extends MemberMetadata>
    implements $MemberMetadataCopyWith<$Res> {
  _$MemberMetadataCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? joinDate = freezed,
    Object? decisionTag = null,
    Object? contactTag = null,
    Object? engagementLevel = null,
    Object? pvcStatus = null,
    Object? notes = null,
    Object? lastContactDate = freezed,
    Object? location = freezed,
    Object? memberType = freezed,
  }) {
    return _then(_value.copyWith(
      joinDate: freezed == joinDate
          ? _value.joinDate
          : joinDate // ignore: cast_nullable_to_non_nullable
              as String?,
      decisionTag: null == decisionTag
          ? _value.decisionTag
          : decisionTag // ignore: cast_nullable_to_non_nullable
              as String,
      contactTag: null == contactTag
          ? _value.contactTag
          : contactTag // ignore: cast_nullable_to_non_nullable
              as String,
      engagementLevel: null == engagementLevel
          ? _value.engagementLevel
          : engagementLevel // ignore: cast_nullable_to_non_nullable
              as String,
      pvcStatus: null == pvcStatus
          ? _value.pvcStatus
          : pvcStatus // ignore: cast_nullable_to_non_nullable
              as String,
      notes: null == notes
          ? _value.notes
          : notes // ignore: cast_nullable_to_non_nullable
              as String,
      lastContactDate: freezed == lastContactDate
          ? _value.lastContactDate
          : lastContactDate // ignore: cast_nullable_to_non_nullable
              as String?,
      location: freezed == location
          ? _value.location
          : location // ignore: cast_nullable_to_non_nullable
              as MemberLocation?,
      memberType: freezed == memberType
          ? _value.memberType
          : memberType // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }

  @override
  @pragma('vm:prefer-inline')
  $MemberLocationCopyWith<$Res>? get location {
    if (_value.location == null) {
      return null;
    }

    return $MemberLocationCopyWith<$Res>(_value.location!, (value) {
      return _then(_value.copyWith(location: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$MemberMetadataImplCopyWith<$Res>
    implements $MemberMetadataCopyWith<$Res> {
  factory _$$MemberMetadataImplCopyWith(_$MemberMetadataImpl value,
          $Res Function(_$MemberMetadataImpl) then) =
      __$$MemberMetadataImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String? joinDate,
      String decisionTag,
      String contactTag,
      String engagementLevel,
      String pvcStatus,
      String notes,
      String? lastContactDate,
      MemberLocation? location,
      String? memberType});

  @override
  $MemberLocationCopyWith<$Res>? get location;
}

/// @nodoc
class __$$MemberMetadataImplCopyWithImpl<$Res>
    extends _$MemberMetadataCopyWithImpl<$Res, _$MemberMetadataImpl>
    implements _$$MemberMetadataImplCopyWith<$Res> {
  __$$MemberMetadataImplCopyWithImpl(
      _$MemberMetadataImpl _value, $Res Function(_$MemberMetadataImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? joinDate = freezed,
    Object? decisionTag = null,
    Object? contactTag = null,
    Object? engagementLevel = null,
    Object? pvcStatus = null,
    Object? notes = null,
    Object? lastContactDate = freezed,
    Object? location = freezed,
    Object? memberType = freezed,
  }) {
    return _then(_$MemberMetadataImpl(
      joinDate: freezed == joinDate
          ? _value.joinDate
          : joinDate // ignore: cast_nullable_to_non_nullable
              as String?,
      decisionTag: null == decisionTag
          ? _value.decisionTag
          : decisionTag // ignore: cast_nullable_to_non_nullable
              as String,
      contactTag: null == contactTag
          ? _value.contactTag
          : contactTag // ignore: cast_nullable_to_non_nullable
              as String,
      engagementLevel: null == engagementLevel
          ? _value.engagementLevel
          : engagementLevel // ignore: cast_nullable_to_non_nullable
              as String,
      pvcStatus: null == pvcStatus
          ? _value.pvcStatus
          : pvcStatus // ignore: cast_nullable_to_non_nullable
              as String,
      notes: null == notes
          ? _value.notes
          : notes // ignore: cast_nullable_to_non_nullable
              as String,
      lastContactDate: freezed == lastContactDate
          ? _value.lastContactDate
          : lastContactDate // ignore: cast_nullable_to_non_nullable
              as String?,
      location: freezed == location
          ? _value.location
          : location // ignore: cast_nullable_to_non_nullable
              as MemberLocation?,
      memberType: freezed == memberType
          ? _value.memberType
          : memberType // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$MemberMetadataImpl implements _MemberMetadata {
  const _$MemberMetadataImpl(
      {this.joinDate,
      this.decisionTag = 'Undecided',
      this.contactTag = 'No Response',
      this.engagementLevel = 'Medium',
      this.pvcStatus = 'Unregistered',
      this.notes = '',
      this.lastContactDate,
      this.location,
      this.memberType});

  factory _$MemberMetadataImpl.fromJson(Map<String, dynamic> json) =>
      _$$MemberMetadataImplFromJson(json);

  @override
  final String? joinDate;
  @override
  @JsonKey()
  final String decisionTag;
  @override
  @JsonKey()
  final String contactTag;
  @override
  @JsonKey()
  final String engagementLevel;
  @override
  @JsonKey()
  final String pvcStatus;
  @override
  @JsonKey()
  final String notes;
  @override
  final String? lastContactDate;
  @override
  final MemberLocation? location;
  @override
  final String? memberType;

  @override
  String toString() {
    return 'MemberMetadata(joinDate: $joinDate, decisionTag: $decisionTag, contactTag: $contactTag, engagementLevel: $engagementLevel, pvcStatus: $pvcStatus, notes: $notes, lastContactDate: $lastContactDate, location: $location, memberType: $memberType)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$MemberMetadataImpl &&
            (identical(other.joinDate, joinDate) ||
                other.joinDate == joinDate) &&
            (identical(other.decisionTag, decisionTag) ||
                other.decisionTag == decisionTag) &&
            (identical(other.contactTag, contactTag) ||
                other.contactTag == contactTag) &&
            (identical(other.engagementLevel, engagementLevel) ||
                other.engagementLevel == engagementLevel) &&
            (identical(other.pvcStatus, pvcStatus) ||
                other.pvcStatus == pvcStatus) &&
            (identical(other.notes, notes) || other.notes == notes) &&
            (identical(other.lastContactDate, lastContactDate) ||
                other.lastContactDate == lastContactDate) &&
            (identical(other.location, location) ||
                other.location == location) &&
            (identical(other.memberType, memberType) ||
                other.memberType == memberType));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      joinDate,
      decisionTag,
      contactTag,
      engagementLevel,
      pvcStatus,
      notes,
      lastContactDate,
      location,
      memberType);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$MemberMetadataImplCopyWith<_$MemberMetadataImpl> get copyWith =>
      __$$MemberMetadataImplCopyWithImpl<_$MemberMetadataImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$MemberMetadataImplToJson(
      this,
    );
  }
}

abstract class _MemberMetadata implements MemberMetadata {
  const factory _MemberMetadata(
      {final String? joinDate,
      final String decisionTag,
      final String contactTag,
      final String engagementLevel,
      final String pvcStatus,
      final String notes,
      final String? lastContactDate,
      final MemberLocation? location,
      final String? memberType}) = _$MemberMetadataImpl;

  factory _MemberMetadata.fromJson(Map<String, dynamic> json) =
      _$MemberMetadataImpl.fromJson;

  @override
  String? get joinDate;
  @override
  String get decisionTag;
  @override
  String get contactTag;
  @override
  String get engagementLevel;
  @override
  String get pvcStatus;
  @override
  String get notes;
  @override
  String? get lastContactDate;
  @override
  MemberLocation? get location;
  @override
  String? get memberType;
  @override
  @JsonKey(ignore: true)
  _$$MemberMetadataImplCopyWith<_$MemberMetadataImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

MemberLocation _$MemberLocationFromJson(Map<String, dynamic> json) {
  return _MemberLocation.fromJson(json);
}

/// @nodoc
mixin _$MemberLocation {
  String? get state => throw _privateConstructorUsedError;
  String? get lga => throw _privateConstructorUsedError;
  String? get ward => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $MemberLocationCopyWith<MemberLocation> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $MemberLocationCopyWith<$Res> {
  factory $MemberLocationCopyWith(
          MemberLocation value, $Res Function(MemberLocation) then) =
      _$MemberLocationCopyWithImpl<$Res, MemberLocation>;
  @useResult
  $Res call({String? state, String? lga, String? ward});
}

/// @nodoc
class _$MemberLocationCopyWithImpl<$Res, $Val extends MemberLocation>
    implements $MemberLocationCopyWith<$Res> {
  _$MemberLocationCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? state = freezed,
    Object? lga = freezed,
    Object? ward = freezed,
  }) {
    return _then(_value.copyWith(
      state: freezed == state
          ? _value.state
          : state // ignore: cast_nullable_to_non_nullable
              as String?,
      lga: freezed == lga
          ? _value.lga
          : lga // ignore: cast_nullable_to_non_nullable
              as String?,
      ward: freezed == ward
          ? _value.ward
          : ward // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$MemberLocationImplCopyWith<$Res>
    implements $MemberLocationCopyWith<$Res> {
  factory _$$MemberLocationImplCopyWith(_$MemberLocationImpl value,
          $Res Function(_$MemberLocationImpl) then) =
      __$$MemberLocationImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String? state, String? lga, String? ward});
}

/// @nodoc
class __$$MemberLocationImplCopyWithImpl<$Res>
    extends _$MemberLocationCopyWithImpl<$Res, _$MemberLocationImpl>
    implements _$$MemberLocationImplCopyWith<$Res> {
  __$$MemberLocationImplCopyWithImpl(
      _$MemberLocationImpl _value, $Res Function(_$MemberLocationImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? state = freezed,
    Object? lga = freezed,
    Object? ward = freezed,
  }) {
    return _then(_$MemberLocationImpl(
      state: freezed == state
          ? _value.state
          : state // ignore: cast_nullable_to_non_nullable
              as String?,
      lga: freezed == lga
          ? _value.lga
          : lga // ignore: cast_nullable_to_non_nullable
              as String?,
      ward: freezed == ward
          ? _value.ward
          : ward // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$MemberLocationImpl implements _MemberLocation {
  const _$MemberLocationImpl({this.state, this.lga, this.ward});

  factory _$MemberLocationImpl.fromJson(Map<String, dynamic> json) =>
      _$$MemberLocationImplFromJson(json);

  @override
  final String? state;
  @override
  final String? lga;
  @override
  final String? ward;

  @override
  String toString() {
    return 'MemberLocation(state: $state, lga: $lga, ward: $ward)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$MemberLocationImpl &&
            (identical(other.state, state) || other.state == state) &&
            (identical(other.lga, lga) || other.lga == lga) &&
            (identical(other.ward, ward) || other.ward == ward));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, state, lga, ward);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$MemberLocationImplCopyWith<_$MemberLocationImpl> get copyWith =>
      __$$MemberLocationImplCopyWithImpl<_$MemberLocationImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$MemberLocationImplToJson(
      this,
    );
  }
}

abstract class _MemberLocation implements MemberLocation {
  const factory _MemberLocation(
      {final String? state,
      final String? lga,
      final String? ward}) = _$MemberLocationImpl;

  factory _MemberLocation.fromJson(Map<String, dynamic> json) =
      _$MemberLocationImpl.fromJson;

  @override
  String? get state;
  @override
  String? get lga;
  @override
  String? get ward;
  @override
  @JsonKey(ignore: true)
  _$$MemberLocationImplCopyWith<_$MemberLocationImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
