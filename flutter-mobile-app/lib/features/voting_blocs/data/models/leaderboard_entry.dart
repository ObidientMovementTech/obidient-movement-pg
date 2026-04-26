import 'package:freezed_annotation/freezed_annotation.dart';
import 'voting_bloc.dart';

part 'leaderboard_entry.freezed.dart';
part 'leaderboard_entry.g.dart';

@freezed
class LeaderboardEntry with _$LeaderboardEntry {
  const factory LeaderboardEntry({
    @JsonKey(name: '_id') required String id,
    required String name,
    BlocCreator? creator,
    BlocMetrics? metrics,
    BlocLocation? location,
    @Default('') String scope,
    String? bannerImageUrl,
    @Default('active') String status,
    String? createdAt,
  }) = _LeaderboardEntry;

  factory LeaderboardEntry.fromJson(Map<String, dynamic> json) =>
      _$LeaderboardEntryFromJson(json);
}
