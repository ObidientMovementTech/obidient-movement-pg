import 'package:dio/dio.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_endpoints.dart';
import '../../../../core/network/api_exceptions.dart';
import '../models/message_reaction.dart';
import '../models/room.dart';
import '../models/room_member.dart';
import '../models/room_message.dart';

class RoomRemoteDataSource {
  final ApiClient _api;

  RoomRemoteDataSource(this._api);

  /// Fetch the user's auto-assigned community rooms.
  Future<List<Room>> getMyRooms() async {
    try {
      final res = await _api.get(ApiEndpoints.myRooms);
      final body = res.data as Map<String, dynamic>;
      final list = body['rooms'] as List<dynamic>? ?? [];
      return list
          .map((e) => Room.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Fetch paginated messages for a room.
  Future<({List<RoomMessage> messages, bool hasMore})> getMessages(
    String roomId, {
    String? before,
    int limit = 50,
  }) async {
    try {
      final qp = <String, dynamic>{'limit': limit};
      if (before != null) qp['before'] = before;

      final res = await _api.get(
        ApiEndpoints.roomMessages(roomId),
        queryParameters: qp,
      );
      final body = res.data as Map<String, dynamic>;
      final list = body['messages'] as List<dynamic>? ?? [];
      return (
        messages: list
            .map((e) => RoomMessage.fromJson(e as Map<String, dynamic>))
            .toList(),
        hasMore: body['hasMore'] as bool? ?? false,
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Send a text message to a room (with optional reply).
  Future<RoomMessage> sendMessage(String roomId, String content,
      {String? replyToId}) async {
    try {
      final data = <String, dynamic>{'content': content};
      if (replyToId != null) data['replyToId'] = replyToId;
      final res = await _api.post(
        ApiEndpoints.roomMessages(roomId),
        data: data,
      );
      final body = res.data as Map<String, dynamic>;
      return RoomMessage.fromJson(body['message'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Fetch paginated room members.
  Future<({List<RoomMember> members, int total, int totalPages})> getMembers(
    String roomId, {
    int page = 1,
    int limit = 30,
    String? search,
  }) async {
    try {
      final qp = <String, dynamic>{'page': page, 'limit': limit};
      if (search != null && search.isNotEmpty) qp['search'] = search;

      final res = await _api.get(
        ApiEndpoints.roomMembers(roomId),
        queryParameters: qp,
      );
      final body = res.data as Map<String, dynamic>;
      final list = body['members'] as List<dynamic>? ?? [];
      final pagination = body['pagination'] as Map<String, dynamic>? ?? {};
      return (
        members: list
            .map((e) => RoomMember.fromJson(e as Map<String, dynamic>))
            .toList(),
        total: pagination['total'] as int? ?? list.length,
        totalPages: pagination['totalPages'] as int? ?? 1,
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Fetch pinned messages in a room.
  Future<List<RoomMessage>> getPinnedMessages(String roomId) async {
    try {
      final res = await _api.get(ApiEndpoints.roomPinned(roomId));
      final body = res.data as Map<String, dynamic>;
      final list = body['messages'] as List<dynamic>? ?? [];
      return list
          .map((e) => RoomMessage.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Pin/unpin a message.
  Future<void> togglePin(String roomId, String messageId) async {
    try {
      await _api.put(ApiEndpoints.roomPin(roomId, messageId));
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Delete a message from a room.
  Future<void> deleteMessage(String roomId, String messageId) async {
    try {
      await _api.delete(ApiEndpoints.deleteRoomMessage(roomId, messageId));
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Mute a user in a room.
  Future<void> muteUser(
      String roomId, String userId, int durationMinutes) async {
    try {
      await _api.post(
        ApiEndpoints.roomMute(roomId, userId),
        data: {'duration': durationMinutes},
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Unmute a user in a room.
  Future<void> unmuteUser(String roomId, String userId) async {
    try {
      await _api.post(ApiEndpoints.roomUnmute(roomId, userId));
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Ban a user from a room.
  Future<void> banUser(String roomId, String userId, String reason) async {
    try {
      await _api.post(
        ApiEndpoints.roomBan(roomId, userId),
        data: {'reason': reason},
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Toggle a reaction on a room message.
  Future<List<MessageReaction>> toggleReaction(
      String roomId, String messageId, String emoji) async {
    try {
      final res = await _api.post(
        ApiEndpoints.roomMessageReactions(roomId, messageId),
        data: {'emoji': emoji},
      );
      final body = res.data as Map<String, dynamic>;
      final list = body['reactions'] as List<dynamic>? ?? [];
      return list
          .map((e) => MessageReaction.fromJson(e as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}
