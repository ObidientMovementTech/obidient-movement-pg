// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'user.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

User _$UserFromJson(Map<String, dynamic> json) {
  return _User.fromJson(json);
}

/// @nodoc
mixin _$User {
  String get id => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String get email => throw _privateConstructorUsedError;
  String? get phone => throw _privateConstructorUsedError;
  bool get emailVerified => throw _privateConstructorUsedError;
  bool get twoFactorEnabled => throw _privateConstructorUsedError;
  String? get profileImage => throw _privateConstructorUsedError;
  String get role => throw _privateConstructorUsedError;
  String? get kycStatus => throw _privateConstructorUsedError;
  String? get adcStatus => throw _privateConstructorUsedError;
  String? get userName => throw _privateConstructorUsedError;
  String? get gender => throw _privateConstructorUsedError;
  String? get ageRange => throw _privateConstructorUsedError;
  String? get citizenship => throw _privateConstructorUsedError;
  String? get countryCode => throw _privateConstructorUsedError;
  String? get stateOfOrigin => throw _privateConstructorUsedError;
  String? get votingState => throw _privateConstructorUsedError;
  String? get votingLGA => throw _privateConstructorUsedError;
  String? get votingWard => throw _privateConstructorUsedError;
  String? get votingPU => throw _privateConstructorUsedError;
  String? get isVoter => throw _privateConstructorUsedError;
  String? get willVote => throw _privateConstructorUsedError;
  String? get designation => throw _privateConstructorUsedError;
  String? get assignedState => throw _privateConstructorUsedError;
  String? get assignedLGA => throw _privateConstructorUsedError;
  String? get assignedWard => throw _privateConstructorUsedError;
  String? get bankName => throw _privateConstructorUsedError;
  String? get bankAccountNumber => throw _privateConstructorUsedError;
  String? get bankAccountName => throw _privateConstructorUsedError;
  int get profileCompletionPercentage => throw _privateConstructorUsedError;
  @JsonKey(name: 'google_id')
  String? get googleId => throw _privateConstructorUsedError;
  @JsonKey(name: 'oauth_provider')
  String? get oauthProvider => throw _privateConstructorUsedError;
  DateTime? get createdAt => throw _privateConstructorUsedError;
  DateTime? get updatedAt => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $UserCopyWith<User> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UserCopyWith<$Res> {
  factory $UserCopyWith(User value, $Res Function(User) then) =
      _$UserCopyWithImpl<$Res, User>;
  @useResult
  $Res call(
      {String id,
      String name,
      String email,
      String? phone,
      bool emailVerified,
      bool twoFactorEnabled,
      String? profileImage,
      String role,
      String? kycStatus,
      String? adcStatus,
      String? userName,
      String? gender,
      String? ageRange,
      String? citizenship,
      String? countryCode,
      String? stateOfOrigin,
      String? votingState,
      String? votingLGA,
      String? votingWard,
      String? votingPU,
      String? isVoter,
      String? willVote,
      String? designation,
      String? assignedState,
      String? assignedLGA,
      String? assignedWard,
      String? bankName,
      String? bankAccountNumber,
      String? bankAccountName,
      int profileCompletionPercentage,
      @JsonKey(name: 'google_id') String? googleId,
      @JsonKey(name: 'oauth_provider') String? oauthProvider,
      DateTime? createdAt,
      DateTime? updatedAt});
}

/// @nodoc
class _$UserCopyWithImpl<$Res, $Val extends User>
    implements $UserCopyWith<$Res> {
  _$UserCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? email = null,
    Object? phone = freezed,
    Object? emailVerified = null,
    Object? twoFactorEnabled = null,
    Object? profileImage = freezed,
    Object? role = null,
    Object? kycStatus = freezed,
    Object? adcStatus = freezed,
    Object? userName = freezed,
    Object? gender = freezed,
    Object? ageRange = freezed,
    Object? citizenship = freezed,
    Object? countryCode = freezed,
    Object? stateOfOrigin = freezed,
    Object? votingState = freezed,
    Object? votingLGA = freezed,
    Object? votingWard = freezed,
    Object? votingPU = freezed,
    Object? isVoter = freezed,
    Object? willVote = freezed,
    Object? designation = freezed,
    Object? assignedState = freezed,
    Object? assignedLGA = freezed,
    Object? assignedWard = freezed,
    Object? bankName = freezed,
    Object? bankAccountNumber = freezed,
    Object? bankAccountName = freezed,
    Object? profileCompletionPercentage = null,
    Object? googleId = freezed,
    Object? oauthProvider = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
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
      email: null == email
          ? _value.email
          : email // ignore: cast_nullable_to_non_nullable
              as String,
      phone: freezed == phone
          ? _value.phone
          : phone // ignore: cast_nullable_to_non_nullable
              as String?,
      emailVerified: null == emailVerified
          ? _value.emailVerified
          : emailVerified // ignore: cast_nullable_to_non_nullable
              as bool,
      twoFactorEnabled: null == twoFactorEnabled
          ? _value.twoFactorEnabled
          : twoFactorEnabled // ignore: cast_nullable_to_non_nullable
              as bool,
      profileImage: freezed == profileImage
          ? _value.profileImage
          : profileImage // ignore: cast_nullable_to_non_nullable
              as String?,
      role: null == role
          ? _value.role
          : role // ignore: cast_nullable_to_non_nullable
              as String,
      kycStatus: freezed == kycStatus
          ? _value.kycStatus
          : kycStatus // ignore: cast_nullable_to_non_nullable
              as String?,
      adcStatus: freezed == adcStatus
          ? _value.adcStatus
          : adcStatus // ignore: cast_nullable_to_non_nullable
              as String?,
      userName: freezed == userName
          ? _value.userName
          : userName // ignore: cast_nullable_to_non_nullable
              as String?,
      gender: freezed == gender
          ? _value.gender
          : gender // ignore: cast_nullable_to_non_nullable
              as String?,
      ageRange: freezed == ageRange
          ? _value.ageRange
          : ageRange // ignore: cast_nullable_to_non_nullable
              as String?,
      citizenship: freezed == citizenship
          ? _value.citizenship
          : citizenship // ignore: cast_nullable_to_non_nullable
              as String?,
      countryCode: freezed == countryCode
          ? _value.countryCode
          : countryCode // ignore: cast_nullable_to_non_nullable
              as String?,
      stateOfOrigin: freezed == stateOfOrigin
          ? _value.stateOfOrigin
          : stateOfOrigin // ignore: cast_nullable_to_non_nullable
              as String?,
      votingState: freezed == votingState
          ? _value.votingState
          : votingState // ignore: cast_nullable_to_non_nullable
              as String?,
      votingLGA: freezed == votingLGA
          ? _value.votingLGA
          : votingLGA // ignore: cast_nullable_to_non_nullable
              as String?,
      votingWard: freezed == votingWard
          ? _value.votingWard
          : votingWard // ignore: cast_nullable_to_non_nullable
              as String?,
      votingPU: freezed == votingPU
          ? _value.votingPU
          : votingPU // ignore: cast_nullable_to_non_nullable
              as String?,
      isVoter: freezed == isVoter
          ? _value.isVoter
          : isVoter // ignore: cast_nullable_to_non_nullable
              as String?,
      willVote: freezed == willVote
          ? _value.willVote
          : willVote // ignore: cast_nullable_to_non_nullable
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
      bankName: freezed == bankName
          ? _value.bankName
          : bankName // ignore: cast_nullable_to_non_nullable
              as String?,
      bankAccountNumber: freezed == bankAccountNumber
          ? _value.bankAccountNumber
          : bankAccountNumber // ignore: cast_nullable_to_non_nullable
              as String?,
      bankAccountName: freezed == bankAccountName
          ? _value.bankAccountName
          : bankAccountName // ignore: cast_nullable_to_non_nullable
              as String?,
      profileCompletionPercentage: null == profileCompletionPercentage
          ? _value.profileCompletionPercentage
          : profileCompletionPercentage // ignore: cast_nullable_to_non_nullable
              as int,
      googleId: freezed == googleId
          ? _value.googleId
          : googleId // ignore: cast_nullable_to_non_nullable
              as String?,
      oauthProvider: freezed == oauthProvider
          ? _value.oauthProvider
          : oauthProvider // ignore: cast_nullable_to_non_nullable
              as String?,
      createdAt: freezed == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      updatedAt: freezed == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$UserImplCopyWith<$Res> implements $UserCopyWith<$Res> {
  factory _$$UserImplCopyWith(
          _$UserImpl value, $Res Function(_$UserImpl) then) =
      __$$UserImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String name,
      String email,
      String? phone,
      bool emailVerified,
      bool twoFactorEnabled,
      String? profileImage,
      String role,
      String? kycStatus,
      String? adcStatus,
      String? userName,
      String? gender,
      String? ageRange,
      String? citizenship,
      String? countryCode,
      String? stateOfOrigin,
      String? votingState,
      String? votingLGA,
      String? votingWard,
      String? votingPU,
      String? isVoter,
      String? willVote,
      String? designation,
      String? assignedState,
      String? assignedLGA,
      String? assignedWard,
      String? bankName,
      String? bankAccountNumber,
      String? bankAccountName,
      int profileCompletionPercentage,
      @JsonKey(name: 'google_id') String? googleId,
      @JsonKey(name: 'oauth_provider') String? oauthProvider,
      DateTime? createdAt,
      DateTime? updatedAt});
}

/// @nodoc
class __$$UserImplCopyWithImpl<$Res>
    extends _$UserCopyWithImpl<$Res, _$UserImpl>
    implements _$$UserImplCopyWith<$Res> {
  __$$UserImplCopyWithImpl(_$UserImpl _value, $Res Function(_$UserImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? email = null,
    Object? phone = freezed,
    Object? emailVerified = null,
    Object? twoFactorEnabled = null,
    Object? profileImage = freezed,
    Object? role = null,
    Object? kycStatus = freezed,
    Object? adcStatus = freezed,
    Object? userName = freezed,
    Object? gender = freezed,
    Object? ageRange = freezed,
    Object? citizenship = freezed,
    Object? countryCode = freezed,
    Object? stateOfOrigin = freezed,
    Object? votingState = freezed,
    Object? votingLGA = freezed,
    Object? votingWard = freezed,
    Object? votingPU = freezed,
    Object? isVoter = freezed,
    Object? willVote = freezed,
    Object? designation = freezed,
    Object? assignedState = freezed,
    Object? assignedLGA = freezed,
    Object? assignedWard = freezed,
    Object? bankName = freezed,
    Object? bankAccountNumber = freezed,
    Object? bankAccountName = freezed,
    Object? profileCompletionPercentage = null,
    Object? googleId = freezed,
    Object? oauthProvider = freezed,
    Object? createdAt = freezed,
    Object? updatedAt = freezed,
  }) {
    return _then(_$UserImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      email: null == email
          ? _value.email
          : email // ignore: cast_nullable_to_non_nullable
              as String,
      phone: freezed == phone
          ? _value.phone
          : phone // ignore: cast_nullable_to_non_nullable
              as String?,
      emailVerified: null == emailVerified
          ? _value.emailVerified
          : emailVerified // ignore: cast_nullable_to_non_nullable
              as bool,
      twoFactorEnabled: null == twoFactorEnabled
          ? _value.twoFactorEnabled
          : twoFactorEnabled // ignore: cast_nullable_to_non_nullable
              as bool,
      profileImage: freezed == profileImage
          ? _value.profileImage
          : profileImage // ignore: cast_nullable_to_non_nullable
              as String?,
      role: null == role
          ? _value.role
          : role // ignore: cast_nullable_to_non_nullable
              as String,
      kycStatus: freezed == kycStatus
          ? _value.kycStatus
          : kycStatus // ignore: cast_nullable_to_non_nullable
              as String?,
      adcStatus: freezed == adcStatus
          ? _value.adcStatus
          : adcStatus // ignore: cast_nullable_to_non_nullable
              as String?,
      userName: freezed == userName
          ? _value.userName
          : userName // ignore: cast_nullable_to_non_nullable
              as String?,
      gender: freezed == gender
          ? _value.gender
          : gender // ignore: cast_nullable_to_non_nullable
              as String?,
      ageRange: freezed == ageRange
          ? _value.ageRange
          : ageRange // ignore: cast_nullable_to_non_nullable
              as String?,
      citizenship: freezed == citizenship
          ? _value.citizenship
          : citizenship // ignore: cast_nullable_to_non_nullable
              as String?,
      countryCode: freezed == countryCode
          ? _value.countryCode
          : countryCode // ignore: cast_nullable_to_non_nullable
              as String?,
      stateOfOrigin: freezed == stateOfOrigin
          ? _value.stateOfOrigin
          : stateOfOrigin // ignore: cast_nullable_to_non_nullable
              as String?,
      votingState: freezed == votingState
          ? _value.votingState
          : votingState // ignore: cast_nullable_to_non_nullable
              as String?,
      votingLGA: freezed == votingLGA
          ? _value.votingLGA
          : votingLGA // ignore: cast_nullable_to_non_nullable
              as String?,
      votingWard: freezed == votingWard
          ? _value.votingWard
          : votingWard // ignore: cast_nullable_to_non_nullable
              as String?,
      votingPU: freezed == votingPU
          ? _value.votingPU
          : votingPU // ignore: cast_nullable_to_non_nullable
              as String?,
      isVoter: freezed == isVoter
          ? _value.isVoter
          : isVoter // ignore: cast_nullable_to_non_nullable
              as String?,
      willVote: freezed == willVote
          ? _value.willVote
          : willVote // ignore: cast_nullable_to_non_nullable
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
      bankName: freezed == bankName
          ? _value.bankName
          : bankName // ignore: cast_nullable_to_non_nullable
              as String?,
      bankAccountNumber: freezed == bankAccountNumber
          ? _value.bankAccountNumber
          : bankAccountNumber // ignore: cast_nullable_to_non_nullable
              as String?,
      bankAccountName: freezed == bankAccountName
          ? _value.bankAccountName
          : bankAccountName // ignore: cast_nullable_to_non_nullable
              as String?,
      profileCompletionPercentage: null == profileCompletionPercentage
          ? _value.profileCompletionPercentage
          : profileCompletionPercentage // ignore: cast_nullable_to_non_nullable
              as int,
      googleId: freezed == googleId
          ? _value.googleId
          : googleId // ignore: cast_nullable_to_non_nullable
              as String?,
      oauthProvider: freezed == oauthProvider
          ? _value.oauthProvider
          : oauthProvider // ignore: cast_nullable_to_non_nullable
              as String?,
      createdAt: freezed == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
      updatedAt: freezed == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as DateTime?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$UserImpl extends _User {
  const _$UserImpl(
      {required this.id,
      required this.name,
      required this.email,
      this.phone,
      this.emailVerified = false,
      this.twoFactorEnabled = false,
      this.profileImage,
      this.role = 'user',
      this.kycStatus,
      this.adcStatus,
      this.userName,
      this.gender,
      this.ageRange,
      this.citizenship,
      this.countryCode,
      this.stateOfOrigin,
      this.votingState,
      this.votingLGA,
      this.votingWard,
      this.votingPU,
      this.isVoter,
      this.willVote,
      this.designation,
      this.assignedState,
      this.assignedLGA,
      this.assignedWard,
      this.bankName,
      this.bankAccountNumber,
      this.bankAccountName,
      this.profileCompletionPercentage = 0,
      @JsonKey(name: 'google_id') this.googleId,
      @JsonKey(name: 'oauth_provider') this.oauthProvider,
      this.createdAt,
      this.updatedAt})
      : super._();

  factory _$UserImpl.fromJson(Map<String, dynamic> json) =>
      _$$UserImplFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  final String email;
  @override
  final String? phone;
  @override
  @JsonKey()
  final bool emailVerified;
  @override
  @JsonKey()
  final bool twoFactorEnabled;
  @override
  final String? profileImage;
  @override
  @JsonKey()
  final String role;
  @override
  final String? kycStatus;
  @override
  final String? adcStatus;
  @override
  final String? userName;
  @override
  final String? gender;
  @override
  final String? ageRange;
  @override
  final String? citizenship;
  @override
  final String? countryCode;
  @override
  final String? stateOfOrigin;
  @override
  final String? votingState;
  @override
  final String? votingLGA;
  @override
  final String? votingWard;
  @override
  final String? votingPU;
  @override
  final String? isVoter;
  @override
  final String? willVote;
  @override
  final String? designation;
  @override
  final String? assignedState;
  @override
  final String? assignedLGA;
  @override
  final String? assignedWard;
  @override
  final String? bankName;
  @override
  final String? bankAccountNumber;
  @override
  final String? bankAccountName;
  @override
  @JsonKey()
  final int profileCompletionPercentage;
  @override
  @JsonKey(name: 'google_id')
  final String? googleId;
  @override
  @JsonKey(name: 'oauth_provider')
  final String? oauthProvider;
  @override
  final DateTime? createdAt;
  @override
  final DateTime? updatedAt;

  @override
  String toString() {
    return 'User(id: $id, name: $name, email: $email, phone: $phone, emailVerified: $emailVerified, twoFactorEnabled: $twoFactorEnabled, profileImage: $profileImage, role: $role, kycStatus: $kycStatus, adcStatus: $adcStatus, userName: $userName, gender: $gender, ageRange: $ageRange, citizenship: $citizenship, countryCode: $countryCode, stateOfOrigin: $stateOfOrigin, votingState: $votingState, votingLGA: $votingLGA, votingWard: $votingWard, votingPU: $votingPU, isVoter: $isVoter, willVote: $willVote, designation: $designation, assignedState: $assignedState, assignedLGA: $assignedLGA, assignedWard: $assignedWard, bankName: $bankName, bankAccountNumber: $bankAccountNumber, bankAccountName: $bankAccountName, profileCompletionPercentage: $profileCompletionPercentage, googleId: $googleId, oauthProvider: $oauthProvider, createdAt: $createdAt, updatedAt: $updatedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$UserImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.email, email) || other.email == email) &&
            (identical(other.phone, phone) || other.phone == phone) &&
            (identical(other.emailVerified, emailVerified) ||
                other.emailVerified == emailVerified) &&
            (identical(other.twoFactorEnabled, twoFactorEnabled) ||
                other.twoFactorEnabled == twoFactorEnabled) &&
            (identical(other.profileImage, profileImage) ||
                other.profileImage == profileImage) &&
            (identical(other.role, role) || other.role == role) &&
            (identical(other.kycStatus, kycStatus) ||
                other.kycStatus == kycStatus) &&
            (identical(other.adcStatus, adcStatus) ||
                other.adcStatus == adcStatus) &&
            (identical(other.userName, userName) ||
                other.userName == userName) &&
            (identical(other.gender, gender) || other.gender == gender) &&
            (identical(other.ageRange, ageRange) ||
                other.ageRange == ageRange) &&
            (identical(other.citizenship, citizenship) ||
                other.citizenship == citizenship) &&
            (identical(other.countryCode, countryCode) ||
                other.countryCode == countryCode) &&
            (identical(other.stateOfOrigin, stateOfOrigin) ||
                other.stateOfOrigin == stateOfOrigin) &&
            (identical(other.votingState, votingState) ||
                other.votingState == votingState) &&
            (identical(other.votingLGA, votingLGA) ||
                other.votingLGA == votingLGA) &&
            (identical(other.votingWard, votingWard) ||
                other.votingWard == votingWard) &&
            (identical(other.votingPU, votingPU) ||
                other.votingPU == votingPU) &&
            (identical(other.isVoter, isVoter) || other.isVoter == isVoter) &&
            (identical(other.willVote, willVote) ||
                other.willVote == willVote) &&
            (identical(other.designation, designation) ||
                other.designation == designation) &&
            (identical(other.assignedState, assignedState) ||
                other.assignedState == assignedState) &&
            (identical(other.assignedLGA, assignedLGA) ||
                other.assignedLGA == assignedLGA) &&
            (identical(other.assignedWard, assignedWard) ||
                other.assignedWard == assignedWard) &&
            (identical(other.bankName, bankName) ||
                other.bankName == bankName) &&
            (identical(other.bankAccountNumber, bankAccountNumber) ||
                other.bankAccountNumber == bankAccountNumber) &&
            (identical(other.bankAccountName, bankAccountName) ||
                other.bankAccountName == bankAccountName) &&
            (identical(other.profileCompletionPercentage,
                    profileCompletionPercentage) ||
                other.profileCompletionPercentage ==
                    profileCompletionPercentage) &&
            (identical(other.googleId, googleId) ||
                other.googleId == googleId) &&
            (identical(other.oauthProvider, oauthProvider) ||
                other.oauthProvider == oauthProvider) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hashAll([
        runtimeType,
        id,
        name,
        email,
        phone,
        emailVerified,
        twoFactorEnabled,
        profileImage,
        role,
        kycStatus,
        adcStatus,
        userName,
        gender,
        ageRange,
        citizenship,
        countryCode,
        stateOfOrigin,
        votingState,
        votingLGA,
        votingWard,
        votingPU,
        isVoter,
        willVote,
        designation,
        assignedState,
        assignedLGA,
        assignedWard,
        bankName,
        bankAccountNumber,
        bankAccountName,
        profileCompletionPercentage,
        googleId,
        oauthProvider,
        createdAt,
        updatedAt
      ]);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$UserImplCopyWith<_$UserImpl> get copyWith =>
      __$$UserImplCopyWithImpl<_$UserImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$UserImplToJson(
      this,
    );
  }
}

abstract class _User extends User {
  const factory _User(
      {required final String id,
      required final String name,
      required final String email,
      final String? phone,
      final bool emailVerified,
      final bool twoFactorEnabled,
      final String? profileImage,
      final String role,
      final String? kycStatus,
      final String? adcStatus,
      final String? userName,
      final String? gender,
      final String? ageRange,
      final String? citizenship,
      final String? countryCode,
      final String? stateOfOrigin,
      final String? votingState,
      final String? votingLGA,
      final String? votingWard,
      final String? votingPU,
      final String? isVoter,
      final String? willVote,
      final String? designation,
      final String? assignedState,
      final String? assignedLGA,
      final String? assignedWard,
      final String? bankName,
      final String? bankAccountNumber,
      final String? bankAccountName,
      final int profileCompletionPercentage,
      @JsonKey(name: 'google_id') final String? googleId,
      @JsonKey(name: 'oauth_provider') final String? oauthProvider,
      final DateTime? createdAt,
      final DateTime? updatedAt}) = _$UserImpl;
  const _User._() : super._();

  factory _User.fromJson(Map<String, dynamic> json) = _$UserImpl.fromJson;

  @override
  String get id;
  @override
  String get name;
  @override
  String get email;
  @override
  String? get phone;
  @override
  bool get emailVerified;
  @override
  bool get twoFactorEnabled;
  @override
  String? get profileImage;
  @override
  String get role;
  @override
  String? get kycStatus;
  @override
  String? get adcStatus;
  @override
  String? get userName;
  @override
  String? get gender;
  @override
  String? get ageRange;
  @override
  String? get citizenship;
  @override
  String? get countryCode;
  @override
  String? get stateOfOrigin;
  @override
  String? get votingState;
  @override
  String? get votingLGA;
  @override
  String? get votingWard;
  @override
  String? get votingPU;
  @override
  String? get isVoter;
  @override
  String? get willVote;
  @override
  String? get designation;
  @override
  String? get assignedState;
  @override
  String? get assignedLGA;
  @override
  String? get assignedWard;
  @override
  String? get bankName;
  @override
  String? get bankAccountNumber;
  @override
  String? get bankAccountName;
  @override
  int get profileCompletionPercentage;
  @override
  @JsonKey(name: 'google_id')
  String? get googleId;
  @override
  @JsonKey(name: 'oauth_provider')
  String? get oauthProvider;
  @override
  DateTime? get createdAt;
  @override
  DateTime? get updatedAt;
  @override
  @JsonKey(ignore: true)
  _$$UserImplCopyWith<_$UserImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
