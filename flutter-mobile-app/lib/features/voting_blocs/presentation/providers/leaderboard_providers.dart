import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/leaderboard_entry.dart';
import 'voting_bloc_providers.dart';

/// Parameters for the leaderboard query.
typedef LeaderboardParams = ({String level, String period});

/// Fetches leaderboard entries filtered by level and time period.
final leaderboardProvider = FutureProvider.autoDispose
    .family<List<LeaderboardEntry>, LeaderboardParams>((ref, params) async {
  final ds = ref.watch(votingBlocDataSourceProvider);
  return ds.getLeaderboard(
    level: params.level,
    period: params.period,
  );
});
