import 'package:freezed_annotation/freezed_annotation.dart';

part 'bloc_engagement.freezed.dart';
part 'bloc_engagement.g.dart';

double _toDouble(dynamic v) =>
    v is num ? v.toDouble() : double.tryParse(v?.toString() ?? '') ?? 0.0;

/// From GET /:id/engagement
@freezed
class BlocEngagement with _$BlocEngagement {
  const factory BlocEngagement({
    @Default(0) int totalMembers,
    @Default(0) int recentMembers,
    @Default(0) int pendingInvitations,
    @Default(0) int acceptedInvitations,
    @Default(0) int declinedInvitations,
    @JsonKey(fromJson: _toDouble) @Default(0.0) double conversionRate,
    @Default(0) int growthRate,
  }) = _BlocEngagement;

  factory BlocEngagement.fromJson(Map<String, dynamic> json) =>
      _$BlocEngagementFromJson(json);
}
