import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../auth/presentation/providers/auth_providers.dart';
import '../../data/datasources/voting_bloc_remote_datasource.dart';
import '../../data/models/voting_bloc.dart';
import '../../data/models/bloc_member.dart';
import '../../data/models/bloc_invitation.dart';
import '../../data/models/bloc_engagement.dart';

// ── Data Source ──────────────────────────────────────────────────

final votingBlocDataSourceProvider = Provider((ref) {
  return VotingBlocDataSource(ref.watch(apiClientProvider));
});

// ── My Bloc (auto-generated, single bloc per user) ─────────────

/// Fetches the user's owned blocs, then loads full detail for the first one.
final myBlocProvider =
    FutureProvider.autoDispose<VotingBloc?>((ref) async {
  final ds = ref.watch(votingBlocDataSourceProvider);
  final owned = await ds.getOwnedBlocs();
  if (owned.isEmpty) return null;
  // Fetch full detail for the first (auto-generated) bloc.
  return ds.getBlocDetail(owned.first.id);
});

// ── Members (with metadata) ────────────────────────────────────

final blocMembersProvider =
    FutureProvider.autoDispose.family<List<BlocMember>, String>(
        (ref, blocId) async {
  final ds = ref.watch(votingBlocDataSourceProvider);
  return ds.getMemberMetadata(blocId);
});

// ── Invitations ────────────────────────────────────────────────

final blocInvitationsProvider =
    FutureProvider.autoDispose.family<List<BlocInvitation>, String>(
        (ref, blocId) async {
  final ds = ref.watch(votingBlocDataSourceProvider);
  return ds.getInvitations(blocId);
});

// ── Engagement / Analytics ─────────────────────────────────────

final blocEngagementProvider =
    FutureProvider.autoDispose.family<BlocEngagement, String>(
        (ref, blocId) async {
  final ds = ref.watch(votingBlocDataSourceProvider);
  return ds.getEngagement(blocId);
});

// ── Polling Unit Members ───────────────────────────────────────

final pollingUnitMembersProvider = FutureProvider.autoDispose<
    ({List<Map<String, dynamic>> members, Map<String, dynamic>? pollingUnit, int total})>(
    (ref) async {
  final ds = ref.watch(votingBlocDataSourceProvider);
  return ds.getPollingUnitMembers();
});
