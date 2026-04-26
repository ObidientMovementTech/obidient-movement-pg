import 'package:freezed_annotation/freezed_annotation.dart';

part 'dashboard_data.freezed.dart';
part 'dashboard_data.g.dart';

/// Aggregate stats for a dashboard view level.
@freezed
class DashboardStats with _$DashboardStats {
  const factory DashboardStats({
    @Default(0) int obidientRegisteredVoters,
    @Default(0) int obidientVotersWithPVC,
    @Default(0) int obidientVotersWithoutPVC,
    @Default(0) int pvcWithStatus,
    @Default(0) int pvcWithoutStatus,
  }) = _DashboardStats;

  factory DashboardStats.fromJson(Map<String, dynamic> json) =>
      _$DashboardStatsFromJson(json);
}

/// A single item in the dashboard list (state / LGA / ward / PU).
@freezed
class DashboardItem with _$DashboardItem {
  const factory DashboardItem({
    required String id,
    required String name,
    String? code,
    String? level,
    @Default(0) int obidientRegisteredVoters,
    @Default(0) int obidientVotersWithPVC,
    @Default(0) int obidientVotersWithoutPVC,
    @Default(0) int pvcWithStatus,
    @Default(0) int pvcWithoutStatus,
  }) = _DashboardItem;

  factory DashboardItem.fromJson(Map<String, dynamic> json) =>
      _$DashboardItemFromJson(json);
}

/// Breadcrumb for navigation trail.
@freezed
class BreadcrumbItem with _$BreadcrumbItem {
  const factory BreadcrumbItem({
    required String level,
    required String name,
    String? id,
  }) = _BreadcrumbItem;

  factory BreadcrumbItem.fromJson(Map<String, dynamic> json) =>
      _$BreadcrumbItemFromJson(json);
}

/// Response from getUserLevel endpoint.
@freezed
class UserLevelInfo with _$UserLevelInfo {
  const factory UserLevelInfo({
    required String userLevel,
    Map<String, dynamic>? assignedLocation,
    @Default([]) List<String> allowedLevels,
    String? designation,
    String? role,
  }) = _UserLevelInfo;

  factory UserLevelInfo.fromJson(Map<String, dynamic> json) =>
      _$UserLevelInfoFromJson(json);
}

/// Full dashboard response from any level endpoint.
@freezed
class DashboardResponse with _$DashboardResponse {
  const factory DashboardResponse({
    required String level,
    required DashboardStats stats,
    @Default([]) List<DashboardItem> items,
    @Default([]) List<BreadcrumbItem> breadcrumbs,
  }) = _DashboardResponse;

  factory DashboardResponse.fromJson(Map<String, dynamic> json) =>
      _$DashboardResponseFromJson(json);
}
