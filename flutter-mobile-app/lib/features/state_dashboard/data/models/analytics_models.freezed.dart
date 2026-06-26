// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'analytics_models.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

DemographicsKpis _$DemographicsKpisFromJson(Map<String, dynamic> json) {
  return _DemographicsKpis.fromJson(json);
}

/// @nodoc
mixin _$DemographicsKpis {
  int get total => throw _privateConstructorUsedError;
  int get hasPvc => throw _privateConstructorUsedError;
  int get noPvc => throw _privateConstructorUsedError;
  int get willVote => throw _privateConstructorUsedError;
  int get profileComplete => throw _privateConstructorUsedError;
  int get active30d => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $DemographicsKpisCopyWith<DemographicsKpis> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $DemographicsKpisCopyWith<$Res> {
  factory $DemographicsKpisCopyWith(
          DemographicsKpis value, $Res Function(DemographicsKpis) then) =
      _$DemographicsKpisCopyWithImpl<$Res, DemographicsKpis>;
  @useResult
  $Res call(
      {int total,
      int hasPvc,
      int noPvc,
      int willVote,
      int profileComplete,
      int active30d});
}

/// @nodoc
class _$DemographicsKpisCopyWithImpl<$Res, $Val extends DemographicsKpis>
    implements $DemographicsKpisCopyWith<$Res> {
  _$DemographicsKpisCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? total = null,
    Object? hasPvc = null,
    Object? noPvc = null,
    Object? willVote = null,
    Object? profileComplete = null,
    Object? active30d = null,
  }) {
    return _then(_value.copyWith(
      total: null == total
          ? _value.total
          : total // ignore: cast_nullable_to_non_nullable
              as int,
      hasPvc: null == hasPvc
          ? _value.hasPvc
          : hasPvc // ignore: cast_nullable_to_non_nullable
              as int,
      noPvc: null == noPvc
          ? _value.noPvc
          : noPvc // ignore: cast_nullable_to_non_nullable
              as int,
      willVote: null == willVote
          ? _value.willVote
          : willVote // ignore: cast_nullable_to_non_nullable
              as int,
      profileComplete: null == profileComplete
          ? _value.profileComplete
          : profileComplete // ignore: cast_nullable_to_non_nullable
              as int,
      active30d: null == active30d
          ? _value.active30d
          : active30d // ignore: cast_nullable_to_non_nullable
              as int,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$DemographicsKpisImplCopyWith<$Res>
    implements $DemographicsKpisCopyWith<$Res> {
  factory _$$DemographicsKpisImplCopyWith(_$DemographicsKpisImpl value,
          $Res Function(_$DemographicsKpisImpl) then) =
      __$$DemographicsKpisImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {int total,
      int hasPvc,
      int noPvc,
      int willVote,
      int profileComplete,
      int active30d});
}

/// @nodoc
class __$$DemographicsKpisImplCopyWithImpl<$Res>
    extends _$DemographicsKpisCopyWithImpl<$Res, _$DemographicsKpisImpl>
    implements _$$DemographicsKpisImplCopyWith<$Res> {
  __$$DemographicsKpisImplCopyWithImpl(_$DemographicsKpisImpl _value,
      $Res Function(_$DemographicsKpisImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? total = null,
    Object? hasPvc = null,
    Object? noPvc = null,
    Object? willVote = null,
    Object? profileComplete = null,
    Object? active30d = null,
  }) {
    return _then(_$DemographicsKpisImpl(
      total: null == total
          ? _value.total
          : total // ignore: cast_nullable_to_non_nullable
              as int,
      hasPvc: null == hasPvc
          ? _value.hasPvc
          : hasPvc // ignore: cast_nullable_to_non_nullable
              as int,
      noPvc: null == noPvc
          ? _value.noPvc
          : noPvc // ignore: cast_nullable_to_non_nullable
              as int,
      willVote: null == willVote
          ? _value.willVote
          : willVote // ignore: cast_nullable_to_non_nullable
              as int,
      profileComplete: null == profileComplete
          ? _value.profileComplete
          : profileComplete // ignore: cast_nullable_to_non_nullable
              as int,
      active30d: null == active30d
          ? _value.active30d
          : active30d // ignore: cast_nullable_to_non_nullable
              as int,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$DemographicsKpisImpl implements _DemographicsKpis {
  const _$DemographicsKpisImpl(
      {this.total = 0,
      this.hasPvc = 0,
      this.noPvc = 0,
      this.willVote = 0,
      this.profileComplete = 0,
      this.active30d = 0});

  factory _$DemographicsKpisImpl.fromJson(Map<String, dynamic> json) =>
      _$$DemographicsKpisImplFromJson(json);

  @override
  @JsonKey()
  final int total;
  @override
  @JsonKey()
  final int hasPvc;
  @override
  @JsonKey()
  final int noPvc;
  @override
  @JsonKey()
  final int willVote;
  @override
  @JsonKey()
  final int profileComplete;
  @override
  @JsonKey()
  final int active30d;

  @override
  String toString() {
    return 'DemographicsKpis(total: $total, hasPvc: $hasPvc, noPvc: $noPvc, willVote: $willVote, profileComplete: $profileComplete, active30d: $active30d)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$DemographicsKpisImpl &&
            (identical(other.total, total) || other.total == total) &&
            (identical(other.hasPvc, hasPvc) || other.hasPvc == hasPvc) &&
            (identical(other.noPvc, noPvc) || other.noPvc == noPvc) &&
            (identical(other.willVote, willVote) ||
                other.willVote == willVote) &&
            (identical(other.profileComplete, profileComplete) ||
                other.profileComplete == profileComplete) &&
            (identical(other.active30d, active30d) ||
                other.active30d == active30d));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType, total, hasPvc, noPvc, willVote, profileComplete, active30d);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$DemographicsKpisImplCopyWith<_$DemographicsKpisImpl> get copyWith =>
      __$$DemographicsKpisImplCopyWithImpl<_$DemographicsKpisImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$DemographicsKpisImplToJson(
      this,
    );
  }
}

abstract class _DemographicsKpis implements DemographicsKpis {
  const factory _DemographicsKpis(
      {final int total,
      final int hasPvc,
      final int noPvc,
      final int willVote,
      final int profileComplete,
      final int active30d}) = _$DemographicsKpisImpl;

  factory _DemographicsKpis.fromJson(Map<String, dynamic> json) =
      _$DemographicsKpisImpl.fromJson;

  @override
  int get total;
  @override
  int get hasPvc;
  @override
  int get noPvc;
  @override
  int get willVote;
  @override
  int get profileComplete;
  @override
  int get active30d;
  @override
  @JsonKey(ignore: true)
  _$$DemographicsKpisImplCopyWith<_$DemographicsKpisImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

GenderBreakdown _$GenderBreakdownFromJson(Map<String, dynamic> json) {
  return _GenderBreakdown.fromJson(json);
}

/// @nodoc
mixin _$GenderBreakdown {
  int get male => throw _privateConstructorUsedError;
  int get female => throw _privateConstructorUsedError;
  int get unknown => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $GenderBreakdownCopyWith<GenderBreakdown> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $GenderBreakdownCopyWith<$Res> {
  factory $GenderBreakdownCopyWith(
          GenderBreakdown value, $Res Function(GenderBreakdown) then) =
      _$GenderBreakdownCopyWithImpl<$Res, GenderBreakdown>;
  @useResult
  $Res call({int male, int female, int unknown});
}

/// @nodoc
class _$GenderBreakdownCopyWithImpl<$Res, $Val extends GenderBreakdown>
    implements $GenderBreakdownCopyWith<$Res> {
  _$GenderBreakdownCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? male = null,
    Object? female = null,
    Object? unknown = null,
  }) {
    return _then(_value.copyWith(
      male: null == male
          ? _value.male
          : male // ignore: cast_nullable_to_non_nullable
              as int,
      female: null == female
          ? _value.female
          : female // ignore: cast_nullable_to_non_nullable
              as int,
      unknown: null == unknown
          ? _value.unknown
          : unknown // ignore: cast_nullable_to_non_nullable
              as int,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$GenderBreakdownImplCopyWith<$Res>
    implements $GenderBreakdownCopyWith<$Res> {
  factory _$$GenderBreakdownImplCopyWith(_$GenderBreakdownImpl value,
          $Res Function(_$GenderBreakdownImpl) then) =
      __$$GenderBreakdownImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({int male, int female, int unknown});
}

/// @nodoc
class __$$GenderBreakdownImplCopyWithImpl<$Res>
    extends _$GenderBreakdownCopyWithImpl<$Res, _$GenderBreakdownImpl>
    implements _$$GenderBreakdownImplCopyWith<$Res> {
  __$$GenderBreakdownImplCopyWithImpl(
      _$GenderBreakdownImpl _value, $Res Function(_$GenderBreakdownImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? male = null,
    Object? female = null,
    Object? unknown = null,
  }) {
    return _then(_$GenderBreakdownImpl(
      male: null == male
          ? _value.male
          : male // ignore: cast_nullable_to_non_nullable
              as int,
      female: null == female
          ? _value.female
          : female // ignore: cast_nullable_to_non_nullable
              as int,
      unknown: null == unknown
          ? _value.unknown
          : unknown // ignore: cast_nullable_to_non_nullable
              as int,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$GenderBreakdownImpl implements _GenderBreakdown {
  const _$GenderBreakdownImpl(
      {this.male = 0, this.female = 0, this.unknown = 0});

  factory _$GenderBreakdownImpl.fromJson(Map<String, dynamic> json) =>
      _$$GenderBreakdownImplFromJson(json);

  @override
  @JsonKey()
  final int male;
  @override
  @JsonKey()
  final int female;
  @override
  @JsonKey()
  final int unknown;

  @override
  String toString() {
    return 'GenderBreakdown(male: $male, female: $female, unknown: $unknown)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$GenderBreakdownImpl &&
            (identical(other.male, male) || other.male == male) &&
            (identical(other.female, female) || other.female == female) &&
            (identical(other.unknown, unknown) || other.unknown == unknown));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, male, female, unknown);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$GenderBreakdownImplCopyWith<_$GenderBreakdownImpl> get copyWith =>
      __$$GenderBreakdownImplCopyWithImpl<_$GenderBreakdownImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$GenderBreakdownImplToJson(
      this,
    );
  }
}

abstract class _GenderBreakdown implements GenderBreakdown {
  const factory _GenderBreakdown(
      {final int male,
      final int female,
      final int unknown}) = _$GenderBreakdownImpl;

  factory _GenderBreakdown.fromJson(Map<String, dynamic> json) =
      _$GenderBreakdownImpl.fromJson;

  @override
  int get male;
  @override
  int get female;
  @override
  int get unknown;
  @override
  @JsonKey(ignore: true)
  _$$GenderBreakdownImplCopyWith<_$GenderBreakdownImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

AgeRangeEntry _$AgeRangeEntryFromJson(Map<String, dynamic> json) {
  return _AgeRangeEntry.fromJson(json);
}

/// @nodoc
mixin _$AgeRangeEntry {
  String get label => throw _privateConstructorUsedError;
  int get count => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $AgeRangeEntryCopyWith<AgeRangeEntry> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $AgeRangeEntryCopyWith<$Res> {
  factory $AgeRangeEntryCopyWith(
          AgeRangeEntry value, $Res Function(AgeRangeEntry) then) =
      _$AgeRangeEntryCopyWithImpl<$Res, AgeRangeEntry>;
  @useResult
  $Res call({String label, int count});
}

/// @nodoc
class _$AgeRangeEntryCopyWithImpl<$Res, $Val extends AgeRangeEntry>
    implements $AgeRangeEntryCopyWith<$Res> {
  _$AgeRangeEntryCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? label = null,
    Object? count = null,
  }) {
    return _then(_value.copyWith(
      label: null == label
          ? _value.label
          : label // ignore: cast_nullable_to_non_nullable
              as String,
      count: null == count
          ? _value.count
          : count // ignore: cast_nullable_to_non_nullable
              as int,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$AgeRangeEntryImplCopyWith<$Res>
    implements $AgeRangeEntryCopyWith<$Res> {
  factory _$$AgeRangeEntryImplCopyWith(
          _$AgeRangeEntryImpl value, $Res Function(_$AgeRangeEntryImpl) then) =
      __$$AgeRangeEntryImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String label, int count});
}

/// @nodoc
class __$$AgeRangeEntryImplCopyWithImpl<$Res>
    extends _$AgeRangeEntryCopyWithImpl<$Res, _$AgeRangeEntryImpl>
    implements _$$AgeRangeEntryImplCopyWith<$Res> {
  __$$AgeRangeEntryImplCopyWithImpl(
      _$AgeRangeEntryImpl _value, $Res Function(_$AgeRangeEntryImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? label = null,
    Object? count = null,
  }) {
    return _then(_$AgeRangeEntryImpl(
      label: null == label
          ? _value.label
          : label // ignore: cast_nullable_to_non_nullable
              as String,
      count: null == count
          ? _value.count
          : count // ignore: cast_nullable_to_non_nullable
              as int,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$AgeRangeEntryImpl implements _AgeRangeEntry {
  const _$AgeRangeEntryImpl({required this.label, this.count = 0});

  factory _$AgeRangeEntryImpl.fromJson(Map<String, dynamic> json) =>
      _$$AgeRangeEntryImplFromJson(json);

  @override
  final String label;
  @override
  @JsonKey()
  final int count;

  @override
  String toString() {
    return 'AgeRangeEntry(label: $label, count: $count)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$AgeRangeEntryImpl &&
            (identical(other.label, label) || other.label == label) &&
            (identical(other.count, count) || other.count == count));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, label, count);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$AgeRangeEntryImplCopyWith<_$AgeRangeEntryImpl> get copyWith =>
      __$$AgeRangeEntryImplCopyWithImpl<_$AgeRangeEntryImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$AgeRangeEntryImplToJson(
      this,
    );
  }
}

abstract class _AgeRangeEntry implements AgeRangeEntry {
  const factory _AgeRangeEntry({required final String label, final int count}) =
      _$AgeRangeEntryImpl;

  factory _AgeRangeEntry.fromJson(Map<String, dynamic> json) =
      _$AgeRangeEntryImpl.fromJson;

  @override
  String get label;
  @override
  int get count;
  @override
  @JsonKey(ignore: true)
  _$$AgeRangeEntryImplCopyWith<_$AgeRangeEntryImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

PvcStatus _$PvcStatusFromJson(Map<String, dynamic> json) {
  return _PvcStatus.fromJson(json);
}

/// @nodoc
mixin _$PvcStatus {
  int get yes => throw _privateConstructorUsedError;
  int get no => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $PvcStatusCopyWith<PvcStatus> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $PvcStatusCopyWith<$Res> {
  factory $PvcStatusCopyWith(PvcStatus value, $Res Function(PvcStatus) then) =
      _$PvcStatusCopyWithImpl<$Res, PvcStatus>;
  @useResult
  $Res call({int yes, int no});
}

/// @nodoc
class _$PvcStatusCopyWithImpl<$Res, $Val extends PvcStatus>
    implements $PvcStatusCopyWith<$Res> {
  _$PvcStatusCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? yes = null,
    Object? no = null,
  }) {
    return _then(_value.copyWith(
      yes: null == yes
          ? _value.yes
          : yes // ignore: cast_nullable_to_non_nullable
              as int,
      no: null == no
          ? _value.no
          : no // ignore: cast_nullable_to_non_nullable
              as int,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$PvcStatusImplCopyWith<$Res>
    implements $PvcStatusCopyWith<$Res> {
  factory _$$PvcStatusImplCopyWith(
          _$PvcStatusImpl value, $Res Function(_$PvcStatusImpl) then) =
      __$$PvcStatusImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({int yes, int no});
}

/// @nodoc
class __$$PvcStatusImplCopyWithImpl<$Res>
    extends _$PvcStatusCopyWithImpl<$Res, _$PvcStatusImpl>
    implements _$$PvcStatusImplCopyWith<$Res> {
  __$$PvcStatusImplCopyWithImpl(
      _$PvcStatusImpl _value, $Res Function(_$PvcStatusImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? yes = null,
    Object? no = null,
  }) {
    return _then(_$PvcStatusImpl(
      yes: null == yes
          ? _value.yes
          : yes // ignore: cast_nullable_to_non_nullable
              as int,
      no: null == no
          ? _value.no
          : no // ignore: cast_nullable_to_non_nullable
              as int,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$PvcStatusImpl implements _PvcStatus {
  const _$PvcStatusImpl({this.yes = 0, this.no = 0});

  factory _$PvcStatusImpl.fromJson(Map<String, dynamic> json) =>
      _$$PvcStatusImplFromJson(json);

  @override
  @JsonKey()
  final int yes;
  @override
  @JsonKey()
  final int no;

  @override
  String toString() {
    return 'PvcStatus(yes: $yes, no: $no)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$PvcStatusImpl &&
            (identical(other.yes, yes) || other.yes == yes) &&
            (identical(other.no, no) || other.no == no));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, yes, no);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$PvcStatusImplCopyWith<_$PvcStatusImpl> get copyWith =>
      __$$PvcStatusImplCopyWithImpl<_$PvcStatusImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$PvcStatusImplToJson(
      this,
    );
  }
}

abstract class _PvcStatus implements PvcStatus {
  const factory _PvcStatus({final int yes, final int no}) = _$PvcStatusImpl;

  factory _PvcStatus.fromJson(Map<String, dynamic> json) =
      _$PvcStatusImpl.fromJson;

  @override
  int get yes;
  @override
  int get no;
  @override
  @JsonKey(ignore: true)
  _$$PvcStatusImplCopyWith<_$PvcStatusImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

VotingIntent _$VotingIntentFromJson(Map<String, dynamic> json) {
  return _VotingIntent.fromJson(json);
}

/// @nodoc
mixin _$VotingIntent {
  int get yes => throw _privateConstructorUsedError;
  int get no => throw _privateConstructorUsedError;
  int get unknown => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $VotingIntentCopyWith<VotingIntent> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $VotingIntentCopyWith<$Res> {
  factory $VotingIntentCopyWith(
          VotingIntent value, $Res Function(VotingIntent) then) =
      _$VotingIntentCopyWithImpl<$Res, VotingIntent>;
  @useResult
  $Res call({int yes, int no, int unknown});
}

/// @nodoc
class _$VotingIntentCopyWithImpl<$Res, $Val extends VotingIntent>
    implements $VotingIntentCopyWith<$Res> {
  _$VotingIntentCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? yes = null,
    Object? no = null,
    Object? unknown = null,
  }) {
    return _then(_value.copyWith(
      yes: null == yes
          ? _value.yes
          : yes // ignore: cast_nullable_to_non_nullable
              as int,
      no: null == no
          ? _value.no
          : no // ignore: cast_nullable_to_non_nullable
              as int,
      unknown: null == unknown
          ? _value.unknown
          : unknown // ignore: cast_nullable_to_non_nullable
              as int,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$VotingIntentImplCopyWith<$Res>
    implements $VotingIntentCopyWith<$Res> {
  factory _$$VotingIntentImplCopyWith(
          _$VotingIntentImpl value, $Res Function(_$VotingIntentImpl) then) =
      __$$VotingIntentImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({int yes, int no, int unknown});
}

/// @nodoc
class __$$VotingIntentImplCopyWithImpl<$Res>
    extends _$VotingIntentCopyWithImpl<$Res, _$VotingIntentImpl>
    implements _$$VotingIntentImplCopyWith<$Res> {
  __$$VotingIntentImplCopyWithImpl(
      _$VotingIntentImpl _value, $Res Function(_$VotingIntentImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? yes = null,
    Object? no = null,
    Object? unknown = null,
  }) {
    return _then(_$VotingIntentImpl(
      yes: null == yes
          ? _value.yes
          : yes // ignore: cast_nullable_to_non_nullable
              as int,
      no: null == no
          ? _value.no
          : no // ignore: cast_nullable_to_non_nullable
              as int,
      unknown: null == unknown
          ? _value.unknown
          : unknown // ignore: cast_nullable_to_non_nullable
              as int,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$VotingIntentImpl implements _VotingIntent {
  const _$VotingIntentImpl({this.yes = 0, this.no = 0, this.unknown = 0});

  factory _$VotingIntentImpl.fromJson(Map<String, dynamic> json) =>
      _$$VotingIntentImplFromJson(json);

  @override
  @JsonKey()
  final int yes;
  @override
  @JsonKey()
  final int no;
  @override
  @JsonKey()
  final int unknown;

  @override
  String toString() {
    return 'VotingIntent(yes: $yes, no: $no, unknown: $unknown)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$VotingIntentImpl &&
            (identical(other.yes, yes) || other.yes == yes) &&
            (identical(other.no, no) || other.no == no) &&
            (identical(other.unknown, unknown) || other.unknown == unknown));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, yes, no, unknown);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$VotingIntentImplCopyWith<_$VotingIntentImpl> get copyWith =>
      __$$VotingIntentImplCopyWithImpl<_$VotingIntentImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$VotingIntentImplToJson(
      this,
    );
  }
}

abstract class _VotingIntent implements VotingIntent {
  const factory _VotingIntent(
      {final int yes, final int no, final int unknown}) = _$VotingIntentImpl;

  factory _VotingIntent.fromJson(Map<String, dynamic> json) =
      _$VotingIntentImpl.fromJson;

  @override
  int get yes;
  @override
  int get no;
  @override
  int get unknown;
  @override
  @JsonKey(ignore: true)
  _$$VotingIntentImplCopyWith<_$VotingIntentImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

ProfileHealth _$ProfileHealthFromJson(Map<String, dynamic> json) {
  return _ProfileHealth.fromJson(json);
}

/// @nodoc
mixin _$ProfileHealth {
  int get complete => throw _privateConstructorUsedError;
  int get high => throw _privateConstructorUsedError;
  int get medium => throw _privateConstructorUsedError;
  int get low => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $ProfileHealthCopyWith<ProfileHealth> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ProfileHealthCopyWith<$Res> {
  factory $ProfileHealthCopyWith(
          ProfileHealth value, $Res Function(ProfileHealth) then) =
      _$ProfileHealthCopyWithImpl<$Res, ProfileHealth>;
  @useResult
  $Res call({int complete, int high, int medium, int low});
}

/// @nodoc
class _$ProfileHealthCopyWithImpl<$Res, $Val extends ProfileHealth>
    implements $ProfileHealthCopyWith<$Res> {
  _$ProfileHealthCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? complete = null,
    Object? high = null,
    Object? medium = null,
    Object? low = null,
  }) {
    return _then(_value.copyWith(
      complete: null == complete
          ? _value.complete
          : complete // ignore: cast_nullable_to_non_nullable
              as int,
      high: null == high
          ? _value.high
          : high // ignore: cast_nullable_to_non_nullable
              as int,
      medium: null == medium
          ? _value.medium
          : medium // ignore: cast_nullable_to_non_nullable
              as int,
      low: null == low
          ? _value.low
          : low // ignore: cast_nullable_to_non_nullable
              as int,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$ProfileHealthImplCopyWith<$Res>
    implements $ProfileHealthCopyWith<$Res> {
  factory _$$ProfileHealthImplCopyWith(
          _$ProfileHealthImpl value, $Res Function(_$ProfileHealthImpl) then) =
      __$$ProfileHealthImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({int complete, int high, int medium, int low});
}

/// @nodoc
class __$$ProfileHealthImplCopyWithImpl<$Res>
    extends _$ProfileHealthCopyWithImpl<$Res, _$ProfileHealthImpl>
    implements _$$ProfileHealthImplCopyWith<$Res> {
  __$$ProfileHealthImplCopyWithImpl(
      _$ProfileHealthImpl _value, $Res Function(_$ProfileHealthImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? complete = null,
    Object? high = null,
    Object? medium = null,
    Object? low = null,
  }) {
    return _then(_$ProfileHealthImpl(
      complete: null == complete
          ? _value.complete
          : complete // ignore: cast_nullable_to_non_nullable
              as int,
      high: null == high
          ? _value.high
          : high // ignore: cast_nullable_to_non_nullable
              as int,
      medium: null == medium
          ? _value.medium
          : medium // ignore: cast_nullable_to_non_nullable
              as int,
      low: null == low
          ? _value.low
          : low // ignore: cast_nullable_to_non_nullable
              as int,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$ProfileHealthImpl implements _ProfileHealth {
  const _$ProfileHealthImpl(
      {this.complete = 0, this.high = 0, this.medium = 0, this.low = 0});

  factory _$ProfileHealthImpl.fromJson(Map<String, dynamic> json) =>
      _$$ProfileHealthImplFromJson(json);

  @override
  @JsonKey()
  final int complete;
  @override
  @JsonKey()
  final int high;
  @override
  @JsonKey()
  final int medium;
  @override
  @JsonKey()
  final int low;

  @override
  String toString() {
    return 'ProfileHealth(complete: $complete, high: $high, medium: $medium, low: $low)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ProfileHealthImpl &&
            (identical(other.complete, complete) ||
                other.complete == complete) &&
            (identical(other.high, high) || other.high == high) &&
            (identical(other.medium, medium) || other.medium == medium) &&
            (identical(other.low, low) || other.low == low));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, complete, high, medium, low);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$ProfileHealthImplCopyWith<_$ProfileHealthImpl> get copyWith =>
      __$$ProfileHealthImplCopyWithImpl<_$ProfileHealthImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ProfileHealthImplToJson(
      this,
    );
  }
}

abstract class _ProfileHealth implements ProfileHealth {
  const factory _ProfileHealth(
      {final int complete,
      final int high,
      final int medium,
      final int low}) = _$ProfileHealthImpl;

  factory _ProfileHealth.fromJson(Map<String, dynamic> json) =
      _$ProfileHealthImpl.fromJson;

  @override
  int get complete;
  @override
  int get high;
  @override
  int get medium;
  @override
  int get low;
  @override
  @JsonKey(ignore: true)
  _$$ProfileHealthImplCopyWith<_$ProfileHealthImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

SignupTrendEntry _$SignupTrendEntryFromJson(Map<String, dynamic> json) {
  return _SignupTrendEntry.fromJson(json);
}

/// @nodoc
mixin _$SignupTrendEntry {
  String get week => throw _privateConstructorUsedError;
  int get count => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $SignupTrendEntryCopyWith<SignupTrendEntry> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $SignupTrendEntryCopyWith<$Res> {
  factory $SignupTrendEntryCopyWith(
          SignupTrendEntry value, $Res Function(SignupTrendEntry) then) =
      _$SignupTrendEntryCopyWithImpl<$Res, SignupTrendEntry>;
  @useResult
  $Res call({String week, int count});
}

/// @nodoc
class _$SignupTrendEntryCopyWithImpl<$Res, $Val extends SignupTrendEntry>
    implements $SignupTrendEntryCopyWith<$Res> {
  _$SignupTrendEntryCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? week = null,
    Object? count = null,
  }) {
    return _then(_value.copyWith(
      week: null == week
          ? _value.week
          : week // ignore: cast_nullable_to_non_nullable
              as String,
      count: null == count
          ? _value.count
          : count // ignore: cast_nullable_to_non_nullable
              as int,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$SignupTrendEntryImplCopyWith<$Res>
    implements $SignupTrendEntryCopyWith<$Res> {
  factory _$$SignupTrendEntryImplCopyWith(_$SignupTrendEntryImpl value,
          $Res Function(_$SignupTrendEntryImpl) then) =
      __$$SignupTrendEntryImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String week, int count});
}

/// @nodoc
class __$$SignupTrendEntryImplCopyWithImpl<$Res>
    extends _$SignupTrendEntryCopyWithImpl<$Res, _$SignupTrendEntryImpl>
    implements _$$SignupTrendEntryImplCopyWith<$Res> {
  __$$SignupTrendEntryImplCopyWithImpl(_$SignupTrendEntryImpl _value,
      $Res Function(_$SignupTrendEntryImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? week = null,
    Object? count = null,
  }) {
    return _then(_$SignupTrendEntryImpl(
      week: null == week
          ? _value.week
          : week // ignore: cast_nullable_to_non_nullable
              as String,
      count: null == count
          ? _value.count
          : count // ignore: cast_nullable_to_non_nullable
              as int,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$SignupTrendEntryImpl implements _SignupTrendEntry {
  const _$SignupTrendEntryImpl({required this.week, this.count = 0});

  factory _$SignupTrendEntryImpl.fromJson(Map<String, dynamic> json) =>
      _$$SignupTrendEntryImplFromJson(json);

  @override
  final String week;
  @override
  @JsonKey()
  final int count;

  @override
  String toString() {
    return 'SignupTrendEntry(week: $week, count: $count)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$SignupTrendEntryImpl &&
            (identical(other.week, week) || other.week == week) &&
            (identical(other.count, count) || other.count == count));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, week, count);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$SignupTrendEntryImplCopyWith<_$SignupTrendEntryImpl> get copyWith =>
      __$$SignupTrendEntryImplCopyWithImpl<_$SignupTrendEntryImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$SignupTrendEntryImplToJson(
      this,
    );
  }
}

abstract class _SignupTrendEntry implements SignupTrendEntry {
  const factory _SignupTrendEntry(
      {required final String week, final int count}) = _$SignupTrendEntryImpl;

  factory _SignupTrendEntry.fromJson(Map<String, dynamic> json) =
      _$SignupTrendEntryImpl.fromJson;

  @override
  String get week;
  @override
  int get count;
  @override
  @JsonKey(ignore: true)
  _$$SignupTrendEntryImplCopyWith<_$SignupTrendEntryImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

DemographicsInsights _$DemographicsInsightsFromJson(Map<String, dynamic> json) {
  return _DemographicsInsights.fromJson(json);
}

/// @nodoc
mixin _$DemographicsInsights {
  int get needsAttention => throw _privateConstructorUsedError;
  int get ghosts => throw _privateConstructorUsedError;
  int get champions => throw _privateConstructorUsedError;
  int get noLocation => throw _privateConstructorUsedError;
  bool get genderGapAlert => throw _privateConstructorUsedError;
  bool get youthGapAlert => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $DemographicsInsightsCopyWith<DemographicsInsights> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $DemographicsInsightsCopyWith<$Res> {
  factory $DemographicsInsightsCopyWith(DemographicsInsights value,
          $Res Function(DemographicsInsights) then) =
      _$DemographicsInsightsCopyWithImpl<$Res, DemographicsInsights>;
  @useResult
  $Res call(
      {int needsAttention,
      int ghosts,
      int champions,
      int noLocation,
      bool genderGapAlert,
      bool youthGapAlert});
}

/// @nodoc
class _$DemographicsInsightsCopyWithImpl<$Res,
        $Val extends DemographicsInsights>
    implements $DemographicsInsightsCopyWith<$Res> {
  _$DemographicsInsightsCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? needsAttention = null,
    Object? ghosts = null,
    Object? champions = null,
    Object? noLocation = null,
    Object? genderGapAlert = null,
    Object? youthGapAlert = null,
  }) {
    return _then(_value.copyWith(
      needsAttention: null == needsAttention
          ? _value.needsAttention
          : needsAttention // ignore: cast_nullable_to_non_nullable
              as int,
      ghosts: null == ghosts
          ? _value.ghosts
          : ghosts // ignore: cast_nullable_to_non_nullable
              as int,
      champions: null == champions
          ? _value.champions
          : champions // ignore: cast_nullable_to_non_nullable
              as int,
      noLocation: null == noLocation
          ? _value.noLocation
          : noLocation // ignore: cast_nullable_to_non_nullable
              as int,
      genderGapAlert: null == genderGapAlert
          ? _value.genderGapAlert
          : genderGapAlert // ignore: cast_nullable_to_non_nullable
              as bool,
      youthGapAlert: null == youthGapAlert
          ? _value.youthGapAlert
          : youthGapAlert // ignore: cast_nullable_to_non_nullable
              as bool,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$DemographicsInsightsImplCopyWith<$Res>
    implements $DemographicsInsightsCopyWith<$Res> {
  factory _$$DemographicsInsightsImplCopyWith(_$DemographicsInsightsImpl value,
          $Res Function(_$DemographicsInsightsImpl) then) =
      __$$DemographicsInsightsImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {int needsAttention,
      int ghosts,
      int champions,
      int noLocation,
      bool genderGapAlert,
      bool youthGapAlert});
}

/// @nodoc
class __$$DemographicsInsightsImplCopyWithImpl<$Res>
    extends _$DemographicsInsightsCopyWithImpl<$Res, _$DemographicsInsightsImpl>
    implements _$$DemographicsInsightsImplCopyWith<$Res> {
  __$$DemographicsInsightsImplCopyWithImpl(_$DemographicsInsightsImpl _value,
      $Res Function(_$DemographicsInsightsImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? needsAttention = null,
    Object? ghosts = null,
    Object? champions = null,
    Object? noLocation = null,
    Object? genderGapAlert = null,
    Object? youthGapAlert = null,
  }) {
    return _then(_$DemographicsInsightsImpl(
      needsAttention: null == needsAttention
          ? _value.needsAttention
          : needsAttention // ignore: cast_nullable_to_non_nullable
              as int,
      ghosts: null == ghosts
          ? _value.ghosts
          : ghosts // ignore: cast_nullable_to_non_nullable
              as int,
      champions: null == champions
          ? _value.champions
          : champions // ignore: cast_nullable_to_non_nullable
              as int,
      noLocation: null == noLocation
          ? _value.noLocation
          : noLocation // ignore: cast_nullable_to_non_nullable
              as int,
      genderGapAlert: null == genderGapAlert
          ? _value.genderGapAlert
          : genderGapAlert // ignore: cast_nullable_to_non_nullable
              as bool,
      youthGapAlert: null == youthGapAlert
          ? _value.youthGapAlert
          : youthGapAlert // ignore: cast_nullable_to_non_nullable
              as bool,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$DemographicsInsightsImpl implements _DemographicsInsights {
  const _$DemographicsInsightsImpl(
      {this.needsAttention = 0,
      this.ghosts = 0,
      this.champions = 0,
      this.noLocation = 0,
      this.genderGapAlert = false,
      this.youthGapAlert = false});

  factory _$DemographicsInsightsImpl.fromJson(Map<String, dynamic> json) =>
      _$$DemographicsInsightsImplFromJson(json);

  @override
  @JsonKey()
  final int needsAttention;
  @override
  @JsonKey()
  final int ghosts;
  @override
  @JsonKey()
  final int champions;
  @override
  @JsonKey()
  final int noLocation;
  @override
  @JsonKey()
  final bool genderGapAlert;
  @override
  @JsonKey()
  final bool youthGapAlert;

  @override
  String toString() {
    return 'DemographicsInsights(needsAttention: $needsAttention, ghosts: $ghosts, champions: $champions, noLocation: $noLocation, genderGapAlert: $genderGapAlert, youthGapAlert: $youthGapAlert)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$DemographicsInsightsImpl &&
            (identical(other.needsAttention, needsAttention) ||
                other.needsAttention == needsAttention) &&
            (identical(other.ghosts, ghosts) || other.ghosts == ghosts) &&
            (identical(other.champions, champions) ||
                other.champions == champions) &&
            (identical(other.noLocation, noLocation) ||
                other.noLocation == noLocation) &&
            (identical(other.genderGapAlert, genderGapAlert) ||
                other.genderGapAlert == genderGapAlert) &&
            (identical(other.youthGapAlert, youthGapAlert) ||
                other.youthGapAlert == youthGapAlert));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, needsAttention, ghosts,
      champions, noLocation, genderGapAlert, youthGapAlert);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$DemographicsInsightsImplCopyWith<_$DemographicsInsightsImpl>
      get copyWith =>
          __$$DemographicsInsightsImplCopyWithImpl<_$DemographicsInsightsImpl>(
              this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$DemographicsInsightsImplToJson(
      this,
    );
  }
}

abstract class _DemographicsInsights implements DemographicsInsights {
  const factory _DemographicsInsights(
      {final int needsAttention,
      final int ghosts,
      final int champions,
      final int noLocation,
      final bool genderGapAlert,
      final bool youthGapAlert}) = _$DemographicsInsightsImpl;

  factory _DemographicsInsights.fromJson(Map<String, dynamic> json) =
      _$DemographicsInsightsImpl.fromJson;

  @override
  int get needsAttention;
  @override
  int get ghosts;
  @override
  int get champions;
  @override
  int get noLocation;
  @override
  bool get genderGapAlert;
  @override
  bool get youthGapAlert;
  @override
  @JsonKey(ignore: true)
  _$$DemographicsInsightsImplCopyWith<_$DemographicsInsightsImpl>
      get copyWith => throw _privateConstructorUsedError;
}

DemographicsData _$DemographicsDataFromJson(Map<String, dynamic> json) {
  return _DemographicsData.fromJson(json);
}

/// @nodoc
mixin _$DemographicsData {
  DemographicsKpis get kpis => throw _privateConstructorUsedError;
  GenderBreakdown get gender => throw _privateConstructorUsedError;
  List<AgeRangeEntry> get ageRanges => throw _privateConstructorUsedError;
  PvcStatus get pvcStatus => throw _privateConstructorUsedError;
  VotingIntent get votingIntent => throw _privateConstructorUsedError;
  ProfileHealth get profileHealth => throw _privateConstructorUsedError;
  List<SignupTrendEntry> get signupTrend => throw _privateConstructorUsedError;
  DemographicsInsights get insights => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $DemographicsDataCopyWith<DemographicsData> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $DemographicsDataCopyWith<$Res> {
  factory $DemographicsDataCopyWith(
          DemographicsData value, $Res Function(DemographicsData) then) =
      _$DemographicsDataCopyWithImpl<$Res, DemographicsData>;
  @useResult
  $Res call(
      {DemographicsKpis kpis,
      GenderBreakdown gender,
      List<AgeRangeEntry> ageRanges,
      PvcStatus pvcStatus,
      VotingIntent votingIntent,
      ProfileHealth profileHealth,
      List<SignupTrendEntry> signupTrend,
      DemographicsInsights insights});

  $DemographicsKpisCopyWith<$Res> get kpis;
  $GenderBreakdownCopyWith<$Res> get gender;
  $PvcStatusCopyWith<$Res> get pvcStatus;
  $VotingIntentCopyWith<$Res> get votingIntent;
  $ProfileHealthCopyWith<$Res> get profileHealth;
  $DemographicsInsightsCopyWith<$Res> get insights;
}

/// @nodoc
class _$DemographicsDataCopyWithImpl<$Res, $Val extends DemographicsData>
    implements $DemographicsDataCopyWith<$Res> {
  _$DemographicsDataCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? kpis = null,
    Object? gender = null,
    Object? ageRanges = null,
    Object? pvcStatus = null,
    Object? votingIntent = null,
    Object? profileHealth = null,
    Object? signupTrend = null,
    Object? insights = null,
  }) {
    return _then(_value.copyWith(
      kpis: null == kpis
          ? _value.kpis
          : kpis // ignore: cast_nullable_to_non_nullable
              as DemographicsKpis,
      gender: null == gender
          ? _value.gender
          : gender // ignore: cast_nullable_to_non_nullable
              as GenderBreakdown,
      ageRanges: null == ageRanges
          ? _value.ageRanges
          : ageRanges // ignore: cast_nullable_to_non_nullable
              as List<AgeRangeEntry>,
      pvcStatus: null == pvcStatus
          ? _value.pvcStatus
          : pvcStatus // ignore: cast_nullable_to_non_nullable
              as PvcStatus,
      votingIntent: null == votingIntent
          ? _value.votingIntent
          : votingIntent // ignore: cast_nullable_to_non_nullable
              as VotingIntent,
      profileHealth: null == profileHealth
          ? _value.profileHealth
          : profileHealth // ignore: cast_nullable_to_non_nullable
              as ProfileHealth,
      signupTrend: null == signupTrend
          ? _value.signupTrend
          : signupTrend // ignore: cast_nullable_to_non_nullable
              as List<SignupTrendEntry>,
      insights: null == insights
          ? _value.insights
          : insights // ignore: cast_nullable_to_non_nullable
              as DemographicsInsights,
    ) as $Val);
  }

  @override
  @pragma('vm:prefer-inline')
  $DemographicsKpisCopyWith<$Res> get kpis {
    return $DemographicsKpisCopyWith<$Res>(_value.kpis, (value) {
      return _then(_value.copyWith(kpis: value) as $Val);
    });
  }

  @override
  @pragma('vm:prefer-inline')
  $GenderBreakdownCopyWith<$Res> get gender {
    return $GenderBreakdownCopyWith<$Res>(_value.gender, (value) {
      return _then(_value.copyWith(gender: value) as $Val);
    });
  }

  @override
  @pragma('vm:prefer-inline')
  $PvcStatusCopyWith<$Res> get pvcStatus {
    return $PvcStatusCopyWith<$Res>(_value.pvcStatus, (value) {
      return _then(_value.copyWith(pvcStatus: value) as $Val);
    });
  }

  @override
  @pragma('vm:prefer-inline')
  $VotingIntentCopyWith<$Res> get votingIntent {
    return $VotingIntentCopyWith<$Res>(_value.votingIntent, (value) {
      return _then(_value.copyWith(votingIntent: value) as $Val);
    });
  }

  @override
  @pragma('vm:prefer-inline')
  $ProfileHealthCopyWith<$Res> get profileHealth {
    return $ProfileHealthCopyWith<$Res>(_value.profileHealth, (value) {
      return _then(_value.copyWith(profileHealth: value) as $Val);
    });
  }

  @override
  @pragma('vm:prefer-inline')
  $DemographicsInsightsCopyWith<$Res> get insights {
    return $DemographicsInsightsCopyWith<$Res>(_value.insights, (value) {
      return _then(_value.copyWith(insights: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$DemographicsDataImplCopyWith<$Res>
    implements $DemographicsDataCopyWith<$Res> {
  factory _$$DemographicsDataImplCopyWith(_$DemographicsDataImpl value,
          $Res Function(_$DemographicsDataImpl) then) =
      __$$DemographicsDataImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {DemographicsKpis kpis,
      GenderBreakdown gender,
      List<AgeRangeEntry> ageRanges,
      PvcStatus pvcStatus,
      VotingIntent votingIntent,
      ProfileHealth profileHealth,
      List<SignupTrendEntry> signupTrend,
      DemographicsInsights insights});

  @override
  $DemographicsKpisCopyWith<$Res> get kpis;
  @override
  $GenderBreakdownCopyWith<$Res> get gender;
  @override
  $PvcStatusCopyWith<$Res> get pvcStatus;
  @override
  $VotingIntentCopyWith<$Res> get votingIntent;
  @override
  $ProfileHealthCopyWith<$Res> get profileHealth;
  @override
  $DemographicsInsightsCopyWith<$Res> get insights;
}

/// @nodoc
class __$$DemographicsDataImplCopyWithImpl<$Res>
    extends _$DemographicsDataCopyWithImpl<$Res, _$DemographicsDataImpl>
    implements _$$DemographicsDataImplCopyWith<$Res> {
  __$$DemographicsDataImplCopyWithImpl(_$DemographicsDataImpl _value,
      $Res Function(_$DemographicsDataImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? kpis = null,
    Object? gender = null,
    Object? ageRanges = null,
    Object? pvcStatus = null,
    Object? votingIntent = null,
    Object? profileHealth = null,
    Object? signupTrend = null,
    Object? insights = null,
  }) {
    return _then(_$DemographicsDataImpl(
      kpis: null == kpis
          ? _value.kpis
          : kpis // ignore: cast_nullable_to_non_nullable
              as DemographicsKpis,
      gender: null == gender
          ? _value.gender
          : gender // ignore: cast_nullable_to_non_nullable
              as GenderBreakdown,
      ageRanges: null == ageRanges
          ? _value._ageRanges
          : ageRanges // ignore: cast_nullable_to_non_nullable
              as List<AgeRangeEntry>,
      pvcStatus: null == pvcStatus
          ? _value.pvcStatus
          : pvcStatus // ignore: cast_nullable_to_non_nullable
              as PvcStatus,
      votingIntent: null == votingIntent
          ? _value.votingIntent
          : votingIntent // ignore: cast_nullable_to_non_nullable
              as VotingIntent,
      profileHealth: null == profileHealth
          ? _value.profileHealth
          : profileHealth // ignore: cast_nullable_to_non_nullable
              as ProfileHealth,
      signupTrend: null == signupTrend
          ? _value._signupTrend
          : signupTrend // ignore: cast_nullable_to_non_nullable
              as List<SignupTrendEntry>,
      insights: null == insights
          ? _value.insights
          : insights // ignore: cast_nullable_to_non_nullable
              as DemographicsInsights,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$DemographicsDataImpl implements _DemographicsData {
  const _$DemographicsDataImpl(
      {required this.kpis,
      required this.gender,
      final List<AgeRangeEntry> ageRanges = const [],
      required this.pvcStatus,
      required this.votingIntent,
      required this.profileHealth,
      final List<SignupTrendEntry> signupTrend = const [],
      required this.insights})
      : _ageRanges = ageRanges,
        _signupTrend = signupTrend;

  factory _$DemographicsDataImpl.fromJson(Map<String, dynamic> json) =>
      _$$DemographicsDataImplFromJson(json);

  @override
  final DemographicsKpis kpis;
  @override
  final GenderBreakdown gender;
  final List<AgeRangeEntry> _ageRanges;
  @override
  @JsonKey()
  List<AgeRangeEntry> get ageRanges {
    if (_ageRanges is EqualUnmodifiableListView) return _ageRanges;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_ageRanges);
  }

  @override
  final PvcStatus pvcStatus;
  @override
  final VotingIntent votingIntent;
  @override
  final ProfileHealth profileHealth;
  final List<SignupTrendEntry> _signupTrend;
  @override
  @JsonKey()
  List<SignupTrendEntry> get signupTrend {
    if (_signupTrend is EqualUnmodifiableListView) return _signupTrend;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_signupTrend);
  }

  @override
  final DemographicsInsights insights;

  @override
  String toString() {
    return 'DemographicsData(kpis: $kpis, gender: $gender, ageRanges: $ageRanges, pvcStatus: $pvcStatus, votingIntent: $votingIntent, profileHealth: $profileHealth, signupTrend: $signupTrend, insights: $insights)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$DemographicsDataImpl &&
            (identical(other.kpis, kpis) || other.kpis == kpis) &&
            (identical(other.gender, gender) || other.gender == gender) &&
            const DeepCollectionEquality()
                .equals(other._ageRanges, _ageRanges) &&
            (identical(other.pvcStatus, pvcStatus) ||
                other.pvcStatus == pvcStatus) &&
            (identical(other.votingIntent, votingIntent) ||
                other.votingIntent == votingIntent) &&
            (identical(other.profileHealth, profileHealth) ||
                other.profileHealth == profileHealth) &&
            const DeepCollectionEquality()
                .equals(other._signupTrend, _signupTrend) &&
            (identical(other.insights, insights) ||
                other.insights == insights));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      kpis,
      gender,
      const DeepCollectionEquality().hash(_ageRanges),
      pvcStatus,
      votingIntent,
      profileHealth,
      const DeepCollectionEquality().hash(_signupTrend),
      insights);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$DemographicsDataImplCopyWith<_$DemographicsDataImpl> get copyWith =>
      __$$DemographicsDataImplCopyWithImpl<_$DemographicsDataImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$DemographicsDataImplToJson(
      this,
    );
  }
}

abstract class _DemographicsData implements DemographicsData {
  const factory _DemographicsData(
      {required final DemographicsKpis kpis,
      required final GenderBreakdown gender,
      final List<AgeRangeEntry> ageRanges,
      required final PvcStatus pvcStatus,
      required final VotingIntent votingIntent,
      required final ProfileHealth profileHealth,
      final List<SignupTrendEntry> signupTrend,
      required final DemographicsInsights insights}) = _$DemographicsDataImpl;

  factory _DemographicsData.fromJson(Map<String, dynamic> json) =
      _$DemographicsDataImpl.fromJson;

  @override
  DemographicsKpis get kpis;
  @override
  GenderBreakdown get gender;
  @override
  List<AgeRangeEntry> get ageRanges;
  @override
  PvcStatus get pvcStatus;
  @override
  VotingIntent get votingIntent;
  @override
  ProfileHealth get profileHealth;
  @override
  List<SignupTrendEntry> get signupTrend;
  @override
  DemographicsInsights get insights;
  @override
  @JsonKey(ignore: true)
  _$$DemographicsDataImplCopyWith<_$DemographicsDataImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

PersonRow _$PersonRowFromJson(Map<String, dynamic> json) {
  return _PersonRow.fromJson(json);
}

/// @nodoc
mixin _$PersonRow {
  String get id => throw _privateConstructorUsedError;
  String? get name => throw _privateConstructorUsedError;
  String? get phone => throw _privateConstructorUsedError;
  String? get email => throw _privateConstructorUsedError;
  String? get gender => throw _privateConstructorUsedError;
  String? get ageRange => throw _privateConstructorUsedError;
  String? get isVoter => throw _privateConstructorUsedError;
  String? get willVote => throw _privateConstructorUsedError;
  String? get votingState => throw _privateConstructorUsedError;
  String? get votingLGA => throw _privateConstructorUsedError;
  String? get votingWard => throw _privateConstructorUsedError;
  String? get votingPU => throw _privateConstructorUsedError;
  String? get profileImage => throw _privateConstructorUsedError;
  String? get designation => throw _privateConstructorUsedError;
  String? get stateOfOrigin => throw _privateConstructorUsedError;
  String? get citizenship => throw _privateConstructorUsedError;
  int get profileCompletionPercentage => throw _privateConstructorUsedError;
  String? get lastActive => throw _privateConstructorUsedError;
  String? get createdAt => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $PersonRowCopyWith<PersonRow> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $PersonRowCopyWith<$Res> {
  factory $PersonRowCopyWith(PersonRow value, $Res Function(PersonRow) then) =
      _$PersonRowCopyWithImpl<$Res, PersonRow>;
  @useResult
  $Res call(
      {String id,
      String? name,
      String? phone,
      String? email,
      String? gender,
      String? ageRange,
      String? isVoter,
      String? willVote,
      String? votingState,
      String? votingLGA,
      String? votingWard,
      String? votingPU,
      String? profileImage,
      String? designation,
      String? stateOfOrigin,
      String? citizenship,
      int profileCompletionPercentage,
      String? lastActive,
      String? createdAt});
}

/// @nodoc
class _$PersonRowCopyWithImpl<$Res, $Val extends PersonRow>
    implements $PersonRowCopyWith<$Res> {
  _$PersonRowCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = freezed,
    Object? phone = freezed,
    Object? email = freezed,
    Object? gender = freezed,
    Object? ageRange = freezed,
    Object? isVoter = freezed,
    Object? willVote = freezed,
    Object? votingState = freezed,
    Object? votingLGA = freezed,
    Object? votingWard = freezed,
    Object? votingPU = freezed,
    Object? profileImage = freezed,
    Object? designation = freezed,
    Object? stateOfOrigin = freezed,
    Object? citizenship = freezed,
    Object? profileCompletionPercentage = null,
    Object? lastActive = freezed,
    Object? createdAt = freezed,
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
      phone: freezed == phone
          ? _value.phone
          : phone // ignore: cast_nullable_to_non_nullable
              as String?,
      email: freezed == email
          ? _value.email
          : email // ignore: cast_nullable_to_non_nullable
              as String?,
      gender: freezed == gender
          ? _value.gender
          : gender // ignore: cast_nullable_to_non_nullable
              as String?,
      ageRange: freezed == ageRange
          ? _value.ageRange
          : ageRange // ignore: cast_nullable_to_non_nullable
              as String?,
      isVoter: freezed == isVoter
          ? _value.isVoter
          : isVoter // ignore: cast_nullable_to_non_nullable
              as String?,
      willVote: freezed == willVote
          ? _value.willVote
          : willVote // ignore: cast_nullable_to_non_nullable
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
      profileImage: freezed == profileImage
          ? _value.profileImage
          : profileImage // ignore: cast_nullable_to_non_nullable
              as String?,
      designation: freezed == designation
          ? _value.designation
          : designation // ignore: cast_nullable_to_non_nullable
              as String?,
      stateOfOrigin: freezed == stateOfOrigin
          ? _value.stateOfOrigin
          : stateOfOrigin // ignore: cast_nullable_to_non_nullable
              as String?,
      citizenship: freezed == citizenship
          ? _value.citizenship
          : citizenship // ignore: cast_nullable_to_non_nullable
              as String?,
      profileCompletionPercentage: null == profileCompletionPercentage
          ? _value.profileCompletionPercentage
          : profileCompletionPercentage // ignore: cast_nullable_to_non_nullable
              as int,
      lastActive: freezed == lastActive
          ? _value.lastActive
          : lastActive // ignore: cast_nullable_to_non_nullable
              as String?,
      createdAt: freezed == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$PersonRowImplCopyWith<$Res>
    implements $PersonRowCopyWith<$Res> {
  factory _$$PersonRowImplCopyWith(
          _$PersonRowImpl value, $Res Function(_$PersonRowImpl) then) =
      __$$PersonRowImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String? name,
      String? phone,
      String? email,
      String? gender,
      String? ageRange,
      String? isVoter,
      String? willVote,
      String? votingState,
      String? votingLGA,
      String? votingWard,
      String? votingPU,
      String? profileImage,
      String? designation,
      String? stateOfOrigin,
      String? citizenship,
      int profileCompletionPercentage,
      String? lastActive,
      String? createdAt});
}

/// @nodoc
class __$$PersonRowImplCopyWithImpl<$Res>
    extends _$PersonRowCopyWithImpl<$Res, _$PersonRowImpl>
    implements _$$PersonRowImplCopyWith<$Res> {
  __$$PersonRowImplCopyWithImpl(
      _$PersonRowImpl _value, $Res Function(_$PersonRowImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = freezed,
    Object? phone = freezed,
    Object? email = freezed,
    Object? gender = freezed,
    Object? ageRange = freezed,
    Object? isVoter = freezed,
    Object? willVote = freezed,
    Object? votingState = freezed,
    Object? votingLGA = freezed,
    Object? votingWard = freezed,
    Object? votingPU = freezed,
    Object? profileImage = freezed,
    Object? designation = freezed,
    Object? stateOfOrigin = freezed,
    Object? citizenship = freezed,
    Object? profileCompletionPercentage = null,
    Object? lastActive = freezed,
    Object? createdAt = freezed,
  }) {
    return _then(_$PersonRowImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: freezed == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String?,
      phone: freezed == phone
          ? _value.phone
          : phone // ignore: cast_nullable_to_non_nullable
              as String?,
      email: freezed == email
          ? _value.email
          : email // ignore: cast_nullable_to_non_nullable
              as String?,
      gender: freezed == gender
          ? _value.gender
          : gender // ignore: cast_nullable_to_non_nullable
              as String?,
      ageRange: freezed == ageRange
          ? _value.ageRange
          : ageRange // ignore: cast_nullable_to_non_nullable
              as String?,
      isVoter: freezed == isVoter
          ? _value.isVoter
          : isVoter // ignore: cast_nullable_to_non_nullable
              as String?,
      willVote: freezed == willVote
          ? _value.willVote
          : willVote // ignore: cast_nullable_to_non_nullable
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
      profileImage: freezed == profileImage
          ? _value.profileImage
          : profileImage // ignore: cast_nullable_to_non_nullable
              as String?,
      designation: freezed == designation
          ? _value.designation
          : designation // ignore: cast_nullable_to_non_nullable
              as String?,
      stateOfOrigin: freezed == stateOfOrigin
          ? _value.stateOfOrigin
          : stateOfOrigin // ignore: cast_nullable_to_non_nullable
              as String?,
      citizenship: freezed == citizenship
          ? _value.citizenship
          : citizenship // ignore: cast_nullable_to_non_nullable
              as String?,
      profileCompletionPercentage: null == profileCompletionPercentage
          ? _value.profileCompletionPercentage
          : profileCompletionPercentage // ignore: cast_nullable_to_non_nullable
              as int,
      lastActive: freezed == lastActive
          ? _value.lastActive
          : lastActive // ignore: cast_nullable_to_non_nullable
              as String?,
      createdAt: freezed == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$PersonRowImpl implements _PersonRow {
  const _$PersonRowImpl(
      {required this.id,
      this.name,
      this.phone,
      this.email,
      this.gender,
      this.ageRange,
      this.isVoter,
      this.willVote,
      this.votingState,
      this.votingLGA,
      this.votingWard,
      this.votingPU,
      this.profileImage,
      this.designation,
      this.stateOfOrigin,
      this.citizenship,
      this.profileCompletionPercentage = 0,
      this.lastActive,
      this.createdAt});

  factory _$PersonRowImpl.fromJson(Map<String, dynamic> json) =>
      _$$PersonRowImplFromJson(json);

  @override
  final String id;
  @override
  final String? name;
  @override
  final String? phone;
  @override
  final String? email;
  @override
  final String? gender;
  @override
  final String? ageRange;
  @override
  final String? isVoter;
  @override
  final String? willVote;
  @override
  final String? votingState;
  @override
  final String? votingLGA;
  @override
  final String? votingWard;
  @override
  final String? votingPU;
  @override
  final String? profileImage;
  @override
  final String? designation;
  @override
  final String? stateOfOrigin;
  @override
  final String? citizenship;
  @override
  @JsonKey()
  final int profileCompletionPercentage;
  @override
  final String? lastActive;
  @override
  final String? createdAt;

  @override
  String toString() {
    return 'PersonRow(id: $id, name: $name, phone: $phone, email: $email, gender: $gender, ageRange: $ageRange, isVoter: $isVoter, willVote: $willVote, votingState: $votingState, votingLGA: $votingLGA, votingWard: $votingWard, votingPU: $votingPU, profileImage: $profileImage, designation: $designation, stateOfOrigin: $stateOfOrigin, citizenship: $citizenship, profileCompletionPercentage: $profileCompletionPercentage, lastActive: $lastActive, createdAt: $createdAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$PersonRowImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.phone, phone) || other.phone == phone) &&
            (identical(other.email, email) || other.email == email) &&
            (identical(other.gender, gender) || other.gender == gender) &&
            (identical(other.ageRange, ageRange) ||
                other.ageRange == ageRange) &&
            (identical(other.isVoter, isVoter) || other.isVoter == isVoter) &&
            (identical(other.willVote, willVote) ||
                other.willVote == willVote) &&
            (identical(other.votingState, votingState) ||
                other.votingState == votingState) &&
            (identical(other.votingLGA, votingLGA) ||
                other.votingLGA == votingLGA) &&
            (identical(other.votingWard, votingWard) ||
                other.votingWard == votingWard) &&
            (identical(other.votingPU, votingPU) ||
                other.votingPU == votingPU) &&
            (identical(other.profileImage, profileImage) ||
                other.profileImage == profileImage) &&
            (identical(other.designation, designation) ||
                other.designation == designation) &&
            (identical(other.stateOfOrigin, stateOfOrigin) ||
                other.stateOfOrigin == stateOfOrigin) &&
            (identical(other.citizenship, citizenship) ||
                other.citizenship == citizenship) &&
            (identical(other.profileCompletionPercentage,
                    profileCompletionPercentage) ||
                other.profileCompletionPercentage ==
                    profileCompletionPercentage) &&
            (identical(other.lastActive, lastActive) ||
                other.lastActive == lastActive) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hashAll([
        runtimeType,
        id,
        name,
        phone,
        email,
        gender,
        ageRange,
        isVoter,
        willVote,
        votingState,
        votingLGA,
        votingWard,
        votingPU,
        profileImage,
        designation,
        stateOfOrigin,
        citizenship,
        profileCompletionPercentage,
        lastActive,
        createdAt
      ]);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$PersonRowImplCopyWith<_$PersonRowImpl> get copyWith =>
      __$$PersonRowImplCopyWithImpl<_$PersonRowImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$PersonRowImplToJson(
      this,
    );
  }
}

abstract class _PersonRow implements PersonRow {
  const factory _PersonRow(
      {required final String id,
      final String? name,
      final String? phone,
      final String? email,
      final String? gender,
      final String? ageRange,
      final String? isVoter,
      final String? willVote,
      final String? votingState,
      final String? votingLGA,
      final String? votingWard,
      final String? votingPU,
      final String? profileImage,
      final String? designation,
      final String? stateOfOrigin,
      final String? citizenship,
      final int profileCompletionPercentage,
      final String? lastActive,
      final String? createdAt}) = _$PersonRowImpl;

  factory _PersonRow.fromJson(Map<String, dynamic> json) =
      _$PersonRowImpl.fromJson;

  @override
  String get id;
  @override
  String? get name;
  @override
  String? get phone;
  @override
  String? get email;
  @override
  String? get gender;
  @override
  String? get ageRange;
  @override
  String? get isVoter;
  @override
  String? get willVote;
  @override
  String? get votingState;
  @override
  String? get votingLGA;
  @override
  String? get votingWard;
  @override
  String? get votingPU;
  @override
  String? get profileImage;
  @override
  String? get designation;
  @override
  String? get stateOfOrigin;
  @override
  String? get citizenship;
  @override
  int get profileCompletionPercentage;
  @override
  String? get lastActive;
  @override
  String? get createdAt;
  @override
  @JsonKey(ignore: true)
  _$$PersonRowImplCopyWith<_$PersonRowImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

PeoplePagination _$PeoplePaginationFromJson(Map<String, dynamic> json) {
  return _PeoplePagination.fromJson(json);
}

/// @nodoc
mixin _$PeoplePagination {
  int get page => throw _privateConstructorUsedError;
  int get limit => throw _privateConstructorUsedError;
  int get total => throw _privateConstructorUsedError;
  int get totalPages => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $PeoplePaginationCopyWith<PeoplePagination> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $PeoplePaginationCopyWith<$Res> {
  factory $PeoplePaginationCopyWith(
          PeoplePagination value, $Res Function(PeoplePagination) then) =
      _$PeoplePaginationCopyWithImpl<$Res, PeoplePagination>;
  @useResult
  $Res call({int page, int limit, int total, int totalPages});
}

/// @nodoc
class _$PeoplePaginationCopyWithImpl<$Res, $Val extends PeoplePagination>
    implements $PeoplePaginationCopyWith<$Res> {
  _$PeoplePaginationCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? page = null,
    Object? limit = null,
    Object? total = null,
    Object? totalPages = null,
  }) {
    return _then(_value.copyWith(
      page: null == page
          ? _value.page
          : page // ignore: cast_nullable_to_non_nullable
              as int,
      limit: null == limit
          ? _value.limit
          : limit // ignore: cast_nullable_to_non_nullable
              as int,
      total: null == total
          ? _value.total
          : total // ignore: cast_nullable_to_non_nullable
              as int,
      totalPages: null == totalPages
          ? _value.totalPages
          : totalPages // ignore: cast_nullable_to_non_nullable
              as int,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$PeoplePaginationImplCopyWith<$Res>
    implements $PeoplePaginationCopyWith<$Res> {
  factory _$$PeoplePaginationImplCopyWith(_$PeoplePaginationImpl value,
          $Res Function(_$PeoplePaginationImpl) then) =
      __$$PeoplePaginationImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({int page, int limit, int total, int totalPages});
}

/// @nodoc
class __$$PeoplePaginationImplCopyWithImpl<$Res>
    extends _$PeoplePaginationCopyWithImpl<$Res, _$PeoplePaginationImpl>
    implements _$$PeoplePaginationImplCopyWith<$Res> {
  __$$PeoplePaginationImplCopyWithImpl(_$PeoplePaginationImpl _value,
      $Res Function(_$PeoplePaginationImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? page = null,
    Object? limit = null,
    Object? total = null,
    Object? totalPages = null,
  }) {
    return _then(_$PeoplePaginationImpl(
      page: null == page
          ? _value.page
          : page // ignore: cast_nullable_to_non_nullable
              as int,
      limit: null == limit
          ? _value.limit
          : limit // ignore: cast_nullable_to_non_nullable
              as int,
      total: null == total
          ? _value.total
          : total // ignore: cast_nullable_to_non_nullable
              as int,
      totalPages: null == totalPages
          ? _value.totalPages
          : totalPages // ignore: cast_nullable_to_non_nullable
              as int,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$PeoplePaginationImpl implements _PeoplePagination {
  const _$PeoplePaginationImpl(
      {this.page = 1, this.limit = 30, this.total = 0, this.totalPages = 0});

  factory _$PeoplePaginationImpl.fromJson(Map<String, dynamic> json) =>
      _$$PeoplePaginationImplFromJson(json);

  @override
  @JsonKey()
  final int page;
  @override
  @JsonKey()
  final int limit;
  @override
  @JsonKey()
  final int total;
  @override
  @JsonKey()
  final int totalPages;

  @override
  String toString() {
    return 'PeoplePagination(page: $page, limit: $limit, total: $total, totalPages: $totalPages)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$PeoplePaginationImpl &&
            (identical(other.page, page) || other.page == page) &&
            (identical(other.limit, limit) || other.limit == limit) &&
            (identical(other.total, total) || other.total == total) &&
            (identical(other.totalPages, totalPages) ||
                other.totalPages == totalPages));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, page, limit, total, totalPages);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$PeoplePaginationImplCopyWith<_$PeoplePaginationImpl> get copyWith =>
      __$$PeoplePaginationImplCopyWithImpl<_$PeoplePaginationImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$PeoplePaginationImplToJson(
      this,
    );
  }
}

abstract class _PeoplePagination implements PeoplePagination {
  const factory _PeoplePagination(
      {final int page,
      final int limit,
      final int total,
      final int totalPages}) = _$PeoplePaginationImpl;

  factory _PeoplePagination.fromJson(Map<String, dynamic> json) =
      _$PeoplePaginationImpl.fromJson;

  @override
  int get page;
  @override
  int get limit;
  @override
  int get total;
  @override
  int get totalPages;
  @override
  @JsonKey(ignore: true)
  _$$PeoplePaginationImplCopyWith<_$PeoplePaginationImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

PeopleResponse _$PeopleResponseFromJson(Map<String, dynamic> json) {
  return _PeopleResponse.fromJson(json);
}

/// @nodoc
mixin _$PeopleResponse {
  List<PersonRow> get data => throw _privateConstructorUsedError;
  PeoplePagination get pagination => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $PeopleResponseCopyWith<PeopleResponse> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $PeopleResponseCopyWith<$Res> {
  factory $PeopleResponseCopyWith(
          PeopleResponse value, $Res Function(PeopleResponse) then) =
      _$PeopleResponseCopyWithImpl<$Res, PeopleResponse>;
  @useResult
  $Res call({List<PersonRow> data, PeoplePagination pagination});

  $PeoplePaginationCopyWith<$Res> get pagination;
}

/// @nodoc
class _$PeopleResponseCopyWithImpl<$Res, $Val extends PeopleResponse>
    implements $PeopleResponseCopyWith<$Res> {
  _$PeopleResponseCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? data = null,
    Object? pagination = null,
  }) {
    return _then(_value.copyWith(
      data: null == data
          ? _value.data
          : data // ignore: cast_nullable_to_non_nullable
              as List<PersonRow>,
      pagination: null == pagination
          ? _value.pagination
          : pagination // ignore: cast_nullable_to_non_nullable
              as PeoplePagination,
    ) as $Val);
  }

  @override
  @pragma('vm:prefer-inline')
  $PeoplePaginationCopyWith<$Res> get pagination {
    return $PeoplePaginationCopyWith<$Res>(_value.pagination, (value) {
      return _then(_value.copyWith(pagination: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$PeopleResponseImplCopyWith<$Res>
    implements $PeopleResponseCopyWith<$Res> {
  factory _$$PeopleResponseImplCopyWith(_$PeopleResponseImpl value,
          $Res Function(_$PeopleResponseImpl) then) =
      __$$PeopleResponseImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({List<PersonRow> data, PeoplePagination pagination});

  @override
  $PeoplePaginationCopyWith<$Res> get pagination;
}

/// @nodoc
class __$$PeopleResponseImplCopyWithImpl<$Res>
    extends _$PeopleResponseCopyWithImpl<$Res, _$PeopleResponseImpl>
    implements _$$PeopleResponseImplCopyWith<$Res> {
  __$$PeopleResponseImplCopyWithImpl(
      _$PeopleResponseImpl _value, $Res Function(_$PeopleResponseImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? data = null,
    Object? pagination = null,
  }) {
    return _then(_$PeopleResponseImpl(
      data: null == data
          ? _value._data
          : data // ignore: cast_nullable_to_non_nullable
              as List<PersonRow>,
      pagination: null == pagination
          ? _value.pagination
          : pagination // ignore: cast_nullable_to_non_nullable
              as PeoplePagination,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$PeopleResponseImpl implements _PeopleResponse {
  const _$PeopleResponseImpl(
      {final List<PersonRow> data = const [], required this.pagination})
      : _data = data;

  factory _$PeopleResponseImpl.fromJson(Map<String, dynamic> json) =>
      _$$PeopleResponseImplFromJson(json);

  final List<PersonRow> _data;
  @override
  @JsonKey()
  List<PersonRow> get data {
    if (_data is EqualUnmodifiableListView) return _data;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_data);
  }

  @override
  final PeoplePagination pagination;

  @override
  String toString() {
    return 'PeopleResponse(data: $data, pagination: $pagination)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$PeopleResponseImpl &&
            const DeepCollectionEquality().equals(other._data, _data) &&
            (identical(other.pagination, pagination) ||
                other.pagination == pagination));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType, const DeepCollectionEquality().hash(_data), pagination);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$PeopleResponseImplCopyWith<_$PeopleResponseImpl> get copyWith =>
      __$$PeopleResponseImplCopyWithImpl<_$PeopleResponseImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$PeopleResponseImplToJson(
      this,
    );
  }
}

abstract class _PeopleResponse implements PeopleResponse {
  const factory _PeopleResponse(
      {final List<PersonRow> data,
      required final PeoplePagination pagination}) = _$PeopleResponseImpl;

  factory _PeopleResponse.fromJson(Map<String, dynamic> json) =
      _$PeopleResponseImpl.fromJson;

  @override
  List<PersonRow> get data;
  @override
  PeoplePagination get pagination;
  @override
  @JsonKey(ignore: true)
  _$$PeopleResponseImplCopyWith<_$PeopleResponseImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
mixin _$PeopleFilters {
  String? get gender => throw _privateConstructorUsedError;
  String? get ageRange => throw _privateConstructorUsedError;
  String? get pvc => throw _privateConstructorUsedError;
  String? get willVote => throw _privateConstructorUsedError;
  String? get profileHealth => throw _privateConstructorUsedError;
  String? get activity => throw _privateConstructorUsedError;
  String? get lga => throw _privateConstructorUsedError;
  String? get search => throw _privateConstructorUsedError;
  String get sortBy => throw _privateConstructorUsedError;
  String get sortDir => throw _privateConstructorUsedError;

  @JsonKey(ignore: true)
  $PeopleFiltersCopyWith<PeopleFilters> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $PeopleFiltersCopyWith<$Res> {
  factory $PeopleFiltersCopyWith(
          PeopleFilters value, $Res Function(PeopleFilters) then) =
      _$PeopleFiltersCopyWithImpl<$Res, PeopleFilters>;
  @useResult
  $Res call(
      {String? gender,
      String? ageRange,
      String? pvc,
      String? willVote,
      String? profileHealth,
      String? activity,
      String? lga,
      String? search,
      String sortBy,
      String sortDir});
}

/// @nodoc
class _$PeopleFiltersCopyWithImpl<$Res, $Val extends PeopleFilters>
    implements $PeopleFiltersCopyWith<$Res> {
  _$PeopleFiltersCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? gender = freezed,
    Object? ageRange = freezed,
    Object? pvc = freezed,
    Object? willVote = freezed,
    Object? profileHealth = freezed,
    Object? activity = freezed,
    Object? lga = freezed,
    Object? search = freezed,
    Object? sortBy = null,
    Object? sortDir = null,
  }) {
    return _then(_value.copyWith(
      gender: freezed == gender
          ? _value.gender
          : gender // ignore: cast_nullable_to_non_nullable
              as String?,
      ageRange: freezed == ageRange
          ? _value.ageRange
          : ageRange // ignore: cast_nullable_to_non_nullable
              as String?,
      pvc: freezed == pvc
          ? _value.pvc
          : pvc // ignore: cast_nullable_to_non_nullable
              as String?,
      willVote: freezed == willVote
          ? _value.willVote
          : willVote // ignore: cast_nullable_to_non_nullable
              as String?,
      profileHealth: freezed == profileHealth
          ? _value.profileHealth
          : profileHealth // ignore: cast_nullable_to_non_nullable
              as String?,
      activity: freezed == activity
          ? _value.activity
          : activity // ignore: cast_nullable_to_non_nullable
              as String?,
      lga: freezed == lga
          ? _value.lga
          : lga // ignore: cast_nullable_to_non_nullable
              as String?,
      search: freezed == search
          ? _value.search
          : search // ignore: cast_nullable_to_non_nullable
              as String?,
      sortBy: null == sortBy
          ? _value.sortBy
          : sortBy // ignore: cast_nullable_to_non_nullable
              as String,
      sortDir: null == sortDir
          ? _value.sortDir
          : sortDir // ignore: cast_nullable_to_non_nullable
              as String,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$PeopleFiltersImplCopyWith<$Res>
    implements $PeopleFiltersCopyWith<$Res> {
  factory _$$PeopleFiltersImplCopyWith(
          _$PeopleFiltersImpl value, $Res Function(_$PeopleFiltersImpl) then) =
      __$$PeopleFiltersImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String? gender,
      String? ageRange,
      String? pvc,
      String? willVote,
      String? profileHealth,
      String? activity,
      String? lga,
      String? search,
      String sortBy,
      String sortDir});
}

/// @nodoc
class __$$PeopleFiltersImplCopyWithImpl<$Res>
    extends _$PeopleFiltersCopyWithImpl<$Res, _$PeopleFiltersImpl>
    implements _$$PeopleFiltersImplCopyWith<$Res> {
  __$$PeopleFiltersImplCopyWithImpl(
      _$PeopleFiltersImpl _value, $Res Function(_$PeopleFiltersImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? gender = freezed,
    Object? ageRange = freezed,
    Object? pvc = freezed,
    Object? willVote = freezed,
    Object? profileHealth = freezed,
    Object? activity = freezed,
    Object? lga = freezed,
    Object? search = freezed,
    Object? sortBy = null,
    Object? sortDir = null,
  }) {
    return _then(_$PeopleFiltersImpl(
      gender: freezed == gender
          ? _value.gender
          : gender // ignore: cast_nullable_to_non_nullable
              as String?,
      ageRange: freezed == ageRange
          ? _value.ageRange
          : ageRange // ignore: cast_nullable_to_non_nullable
              as String?,
      pvc: freezed == pvc
          ? _value.pvc
          : pvc // ignore: cast_nullable_to_non_nullable
              as String?,
      willVote: freezed == willVote
          ? _value.willVote
          : willVote // ignore: cast_nullable_to_non_nullable
              as String?,
      profileHealth: freezed == profileHealth
          ? _value.profileHealth
          : profileHealth // ignore: cast_nullable_to_non_nullable
              as String?,
      activity: freezed == activity
          ? _value.activity
          : activity // ignore: cast_nullable_to_non_nullable
              as String?,
      lga: freezed == lga
          ? _value.lga
          : lga // ignore: cast_nullable_to_non_nullable
              as String?,
      search: freezed == search
          ? _value.search
          : search // ignore: cast_nullable_to_non_nullable
              as String?,
      sortBy: null == sortBy
          ? _value.sortBy
          : sortBy // ignore: cast_nullable_to_non_nullable
              as String,
      sortDir: null == sortDir
          ? _value.sortDir
          : sortDir // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc

class _$PeopleFiltersImpl implements _PeopleFilters {
  const _$PeopleFiltersImpl(
      {this.gender,
      this.ageRange,
      this.pvc,
      this.willVote,
      this.profileHealth,
      this.activity,
      this.lga,
      this.search,
      this.sortBy = 'createdAt',
      this.sortDir = 'desc'});

  @override
  final String? gender;
  @override
  final String? ageRange;
  @override
  final String? pvc;
  @override
  final String? willVote;
  @override
  final String? profileHealth;
  @override
  final String? activity;
  @override
  final String? lga;
  @override
  final String? search;
  @override
  @JsonKey()
  final String sortBy;
  @override
  @JsonKey()
  final String sortDir;

  @override
  String toString() {
    return 'PeopleFilters(gender: $gender, ageRange: $ageRange, pvc: $pvc, willVote: $willVote, profileHealth: $profileHealth, activity: $activity, lga: $lga, search: $search, sortBy: $sortBy, sortDir: $sortDir)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$PeopleFiltersImpl &&
            (identical(other.gender, gender) || other.gender == gender) &&
            (identical(other.ageRange, ageRange) ||
                other.ageRange == ageRange) &&
            (identical(other.pvc, pvc) || other.pvc == pvc) &&
            (identical(other.willVote, willVote) ||
                other.willVote == willVote) &&
            (identical(other.profileHealth, profileHealth) ||
                other.profileHealth == profileHealth) &&
            (identical(other.activity, activity) ||
                other.activity == activity) &&
            (identical(other.lga, lga) || other.lga == lga) &&
            (identical(other.search, search) || other.search == search) &&
            (identical(other.sortBy, sortBy) || other.sortBy == sortBy) &&
            (identical(other.sortDir, sortDir) || other.sortDir == sortDir));
  }

  @override
  int get hashCode => Object.hash(runtimeType, gender, ageRange, pvc, willVote,
      profileHealth, activity, lga, search, sortBy, sortDir);

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$PeopleFiltersImplCopyWith<_$PeopleFiltersImpl> get copyWith =>
      __$$PeopleFiltersImplCopyWithImpl<_$PeopleFiltersImpl>(this, _$identity);
}

abstract class _PeopleFilters implements PeopleFilters {
  const factory _PeopleFilters(
      {final String? gender,
      final String? ageRange,
      final String? pvc,
      final String? willVote,
      final String? profileHealth,
      final String? activity,
      final String? lga,
      final String? search,
      final String sortBy,
      final String sortDir}) = _$PeopleFiltersImpl;

  @override
  String? get gender;
  @override
  String? get ageRange;
  @override
  String? get pvc;
  @override
  String? get willVote;
  @override
  String? get profileHealth;
  @override
  String? get activity;
  @override
  String? get lga;
  @override
  String? get search;
  @override
  String get sortBy;
  @override
  String get sortDir;
  @override
  @JsonKey(ignore: true)
  _$$PeopleFiltersImplCopyWith<_$PeopleFiltersImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
