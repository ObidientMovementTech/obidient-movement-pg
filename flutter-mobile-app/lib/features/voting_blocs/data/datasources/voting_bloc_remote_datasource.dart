import 'package:dio/dio.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_endpoints.dart';
import '../../../../core/network/api_exceptions.dart';
import '../models/voting_bloc.dart';
import '../models/bloc_member.dart';
import '../models/bloc_invitation.dart';
import '../models/bloc_engagement.dart';
import '../models/leaderboard_entry.dart';

class VotingBlocDataSource {
  final ApiClient _api;
  VotingBlocDataSource(this._api);

  // ── Read ──────────────────────────────────────────────────────

  /// Fetch voting blocs owned by the current user.
  Future<List<VotingBloc>> getOwnedBlocs() async {
    try {
      final res = await _api.get(ApiEndpoints.votingBlocsOwned);
      final body = res.data as Map<String, dynamic>;
      final list = body['votingBlocs'] as List<dynamic>? ?? [];
      return list
          .map((e) => VotingBloc.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Fetch full voting bloc detail by ID.
  Future<VotingBloc> getBlocDetail(String id) async {
    try {
      final res = await _api.get(ApiEndpoints.votingBlocDetail(id));
      final body = res.data as Map<String, dynamic>;
      return VotingBloc.fromJson(body['votingBloc'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Fetch members with metadata.
  Future<List<BlocMember>> getMemberMetadata(String blocId) async {
    try {
      final res =
          await _api.get(ApiEndpoints.votingBlocMemberMetadata(blocId));
      final body = res.data as Map<String, dynamic>;
      final list = body['members'] as List<dynamic>? ?? [];
      return list
          .map((e) => BlocMember.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Fetch invitations for a bloc.
  Future<List<BlocInvitation>> getInvitations(String blocId) async {
    try {
      final res =
          await _api.get(ApiEndpoints.votingBlocInvitations(blocId));
      final body = res.data as Map<String, dynamic>;
      final list = body['invitations'] as List<dynamic>? ?? [];
      return list
          .map((e) => BlocInvitation.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Fetch engagement analytics.
  Future<BlocEngagement> getEngagement(String blocId) async {
    try {
      final res =
          await _api.get(ApiEndpoints.votingBlocEngagement(blocId));
      final body = res.data as Map<String, dynamic>;
      return BlocEngagement.fromJson(
          body['engagement'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Fetch polling unit members.
  Future<({List<Map<String, dynamic>> members, Map<String, dynamic>? pollingUnit, int total})>
      getPollingUnitMembers() async {
    try {
      final res = await _api.get(ApiEndpoints.pollingUnitMembers);
      final body = res.data as Map<String, dynamic>;
      final members = (body['members'] as List<dynamic>? ?? [])
          .cast<Map<String, dynamic>>();
      final pollingUnit = body['pollingUnit'] as Map<String, dynamic>?;
      final total = body['total'] as int? ?? members.length;
      return (members: members, pollingUnit: pollingUnit, total: total);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  // ── Write ─────────────────────────────────────────────────────

  /// Fetch leaderboard data with optional filters.
  Future<List<LeaderboardEntry>> getLeaderboard({
    String level = 'national',
    String period = 'all',
    int limit = 50,
    int offset = 0,
  }) async {
    try {
      final params = <String, dynamic>{
        'level': level,
        'limit': limit,
        'offset': offset,
      };
      if (period != 'all') params['period'] = period;

      final res = await _api.get(
        ApiEndpoints.votingBlocLeaderboard,
        queryParameters: params,
      );
      final body = res.data as Map<String, dynamic>;
      final list = body['leaderboard'] as List<dynamic>? ?? [];
      return list
          .map((e) => LeaderboardEntry.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  // ── Mutations ─────────────────────────────────────────────────

  /// Send broadcast message to all members.
  Future<void> sendBroadcast(
    String blocId, {
    required String message,
    String messageType = 'general',
    List<String> channels = const ['in-app', 'email'],
  }) async {
    try {
      await _api.post(
        ApiEndpoints.votingBlocBroadcast(blocId),
        data: {
          'message': message,
          'messageType': messageType,
          'channels': channels,
        },
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Invite a member by email or phone.
  Future<void> inviteMember(
    String blocId, {
    String? email,
    String? phone,
    required String inviteType,
    String? message,
  }) async {
    try {
      await _api.post(
        ApiEndpoints.votingBlocInvite(blocId),
        data: {
          if (email != null) 'email': email,
          if (phone != null) 'phone': phone,
          'inviteType': inviteType,
          if (message != null) 'message': message,
        },
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Add a manual (offline) member.
  Future<void> addManualMember(
    String blocId, {
    required String name,
    required String phone,
    required String state,
    required String lga,
    String? ward,
  }) async {
    try {
      await _api.post(
        ApiEndpoints.votingBlocAddManual(blocId),
        data: {
          'name': name,
          'phone': phone,
          'state': state,
          'lga': lga,
          if (ward != null) 'ward': ward,
        },
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Update member tags.
  Future<void> updateMemberTags(
    String blocId,
    String memberId, {
    String? decisionTag,
    String? contactTag,
    String? engagementLevel,
    String? pvcStatus,
    String? notes,
  }) async {
    try {
      await _api.put(
        ApiEndpoints.votingBlocMemberTags(blocId, memberId),
        data: {
          if (decisionTag != null) 'decisionTag': decisionTag,
          if (contactTag != null) 'contactTag': contactTag,
          if (engagementLevel != null) 'engagementLevel': engagementLevel,
          if (pvcStatus != null) 'pvcStatus': pvcStatus,
          if (notes != null) 'notes': notes,
        },
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Send a private message to a specific member.
  Future<void> sendPrivateMessage(
    String blocId,
    String memberId, {
    required String message,
  }) async {
    try {
      await _api.post(
        ApiEndpoints.votingBlocPrivateMsg(blocId, memberId),
        data: {'message': message},
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Remove a member from the bloc.
  Future<void> removeMember(
    String blocId,
    String memberId, {
    String? reason,
  }) async {
    try {
      await _api.delete(
        ApiEndpoints.votingBlocRemoveMember(blocId, memberId),
        data: {if (reason != null) 'reason': reason},
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Resend a pending invitation.
  Future<void> resendInvitation(
    String blocId, {
    required String invitationId,
  }) async {
    try {
      await _api.post(
        ApiEndpoints.votingBlocResendInvitation(blocId),
        data: {'invitationId': invitationId},
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Clear responded (accepted/declined) invitations.
  Future<void> clearRespondedInvitations(String blocId) async {
    try {
      await _api.delete(ApiEndpoints.votingBlocClearInvitations(blocId));
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}
