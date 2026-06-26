import 'package:freezed_annotation/freezed_annotation.dart';

part 'analytics_models.freezed.dart';
part 'analytics_models.g.dart';

// ── Demographics / KPIs ────────────────────────────────────────

@freezed
class DemographicsKpis with _$DemographicsKpis {
  const factory DemographicsKpis({
    @Default(0) int total,
    @Default(0) int hasPvc,
    @Default(0) int noPvc,
    @Default(0) int willVote,
    @Default(0) int profileComplete,
    @Default(0) int active30d,
  }) = _DemographicsKpis;

  factory DemographicsKpis.fromJson(Map<String, dynamic> json) =>
      _$DemographicsKpisFromJson(json);
}

@freezed
class GenderBreakdown with _$GenderBreakdown {
  const factory GenderBreakdown({
    @Default(0) int male,
    @Default(0) int female,
    @Default(0) int unknown,
  }) = _GenderBreakdown;

  factory GenderBreakdown.fromJson(Map<String, dynamic> json) =>
      _$GenderBreakdownFromJson(json);
}

@freezed
class AgeRangeEntry with _$AgeRangeEntry {
  const factory AgeRangeEntry({
    required String label,
    @Default(0) int count,
  }) = _AgeRangeEntry;

  factory AgeRangeEntry.fromJson(Map<String, dynamic> json) =>
      _$AgeRangeEntryFromJson(json);
}

@freezed
class PvcStatus with _$PvcStatus {
  const factory PvcStatus({
    @Default(0) int yes,
    @Default(0) int no,
  }) = _PvcStatus;

  factory PvcStatus.fromJson(Map<String, dynamic> json) =>
      _$PvcStatusFromJson(json);
}

@freezed
class VotingIntent with _$VotingIntent {
  const factory VotingIntent({
    @Default(0) int yes,
    @Default(0) int no,
    @Default(0) int unknown,
  }) = _VotingIntent;

  factory VotingIntent.fromJson(Map<String, dynamic> json) =>
      _$VotingIntentFromJson(json);
}

@freezed
class ProfileHealth with _$ProfileHealth {
  const factory ProfileHealth({
    @Default(0) int complete,
    @Default(0) int high,
    @Default(0) int medium,
    @Default(0) int low,
  }) = _ProfileHealth;

  factory ProfileHealth.fromJson(Map<String, dynamic> json) =>
      _$ProfileHealthFromJson(json);
}

@freezed
class SignupTrendEntry with _$SignupTrendEntry {
  const factory SignupTrendEntry({
    required String week,
    @Default(0) int count,
  }) = _SignupTrendEntry;

  factory SignupTrendEntry.fromJson(Map<String, dynamic> json) =>
      _$SignupTrendEntryFromJson(json);
}

@freezed
class DemographicsInsights with _$DemographicsInsights {
  const factory DemographicsInsights({
    @Default(0) int needsAttention,
    @Default(0) int ghosts,
    @Default(0) int champions,
    @Default(0) int noLocation,
    @Default(false) bool genderGapAlert,
    @Default(false) bool youthGapAlert,
  }) = _DemographicsInsights;

  factory DemographicsInsights.fromJson(Map<String, dynamic> json) =>
      _$DemographicsInsightsFromJson(json);
}

@freezed
class DemographicsData with _$DemographicsData {
  const factory DemographicsData({
    required DemographicsKpis kpis,
    required GenderBreakdown gender,
    @Default([]) List<AgeRangeEntry> ageRanges,
    required PvcStatus pvcStatus,
    required VotingIntent votingIntent,
    required ProfileHealth profileHealth,
    @Default([]) List<SignupTrendEntry> signupTrend,
    required DemographicsInsights insights,
  }) = _DemographicsData;

  factory DemographicsData.fromJson(Map<String, dynamic> json) =>
      _$DemographicsDataFromJson(json);
}

// ── People / Person Row ────────────────────────────────────────

@freezed
class PersonRow with _$PersonRow {
  const factory PersonRow({
    required String id,
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
    @Default(0) int profileCompletionPercentage,
    String? lastActive,
    String? createdAt,
  }) = _PersonRow;

  factory PersonRow.fromJson(Map<String, dynamic> json) =>
      _$PersonRowFromJson(json);
}

@freezed
class PeoplePagination with _$PeoplePagination {
  const factory PeoplePagination({
    @Default(1) int page,
    @Default(30) int limit,
    @Default(0) int total,
    @Default(0) int totalPages,
  }) = _PeoplePagination;

  factory PeoplePagination.fromJson(Map<String, dynamic> json) =>
      _$PeoplePaginationFromJson(json);
}

@freezed
class PeopleResponse with _$PeopleResponse {
  const factory PeopleResponse({
    @Default([]) List<PersonRow> data,
    required PeoplePagination pagination,
  }) = _PeopleResponse;

  factory PeopleResponse.fromJson(Map<String, dynamic> json) =>
      _$PeopleResponseFromJson(json);
}

// ── Filters ────────────────────────────────────────────────────

@freezed
class PeopleFilters with _$PeopleFilters {
  const factory PeopleFilters({
    String? gender,
    String? ageRange,
    String? pvc,
    String? willVote,
    String? profileHealth,
    String? activity,
    String? lga,
    String? search,
    @Default('createdAt') String sortBy,
    @Default('desc') String sortDir,
  }) = _PeopleFilters;
}
