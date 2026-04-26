import 'package:dio/dio.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_endpoints.dart';
import '../../../../core/network/api_exceptions.dart';
import '../models/chat_contact.dart';
import '../models/chat_message.dart';
import '../models/conversation.dart';
import '../models/message_reaction.dart';

class ChatRemoteDataSource {
  final ApiClient _api;

  ChatRemoteDataSource(this._api);

  /// Fetch paginated conversations list.
  Future<({List<Conversation> conversations, int total})>
      getConversations({int page = 1, int limit = 30}) async {
    try {
      final res = await _api.get(
        ApiEndpoints.conversations,
        queryParameters: {'page': page, 'limit': limit},
      );
      final body = res.data as Map<String, dynamic>;
      final list = body['conversations'] as List<dynamic>? ?? [];
      final pagination = body['pagination'] as Map<String, dynamic>? ?? {};
      return (
        conversations: list
            .map((e) => Conversation.fromJson(e as Map<String, dynamic>))
            .toList(),
        total: pagination['total'] as int? ?? list.length,
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Get or create a conversation with another user.
  Future<({String conversationId, bool created})> getOrCreateConversation(
      String participantId) async {
    try {
      final res = await _api.post(
        ApiEndpoints.conversations,
        data: {'participantId': participantId},
      );
      final body = res.data as Map<String, dynamic>;
      return (
        conversationId: body['conversationId'] as String,
        created: body['created'] as bool? ?? false,
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Fetch paginated messages for a conversation.
  Future<({List<ChatMessage> messages, bool hasMore})> getMessages(
    String conversationId, {
    String? before,
    int limit = 50,
  }) async {
    try {
      final qp = <String, dynamic>{'limit': limit};
      if (before != null) qp['before'] = before;

      final res = await _api.get(
        ApiEndpoints.conversationMessages(conversationId),
        queryParameters: qp,
      );
      final body = res.data as Map<String, dynamic>;
      final list = body['messages'] as List<dynamic>? ?? [];
      return (
        messages: list
            .map((e) => ChatMessage.fromJson(e as Map<String, dynamic>))
            .toList(),
        hasMore: body['hasMore'] as bool? ?? false,
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Send a text message (with optional reply).
  Future<ChatMessage> sendMessage(
      String conversationId, String content, {String? replyToId}) async {
    try {
      final data = <String, dynamic>{'content': content};
      if (replyToId != null) data['replyToId'] = replyToId;
      final res = await _api.post(
        ApiEndpoints.conversationMessages(conversationId),
        data: data,
      );
      final body = res.data as Map<String, dynamic>;
      return ChatMessage.fromJson(body['message'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Toggle a reaction on a message.
  Future<List<MessageReaction>> toggleReaction(
      String conversationId, String messageId, String emoji) async {
    try {
      final res = await _api.post(
        ApiEndpoints.messageReactions(conversationId, messageId),
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

  /// Delete a message (for me or for everyone).
  Future<void> deleteMessage(
      String conversationId, String messageId,
      {bool forEveryone = false}) async {
    try {
      final mode = forEveryone ? 'for_everyone' : 'for_me';
      await _api.delete(
        '${ApiEndpoints.deleteMessage(conversationId, messageId)}?mode=$mode',
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Fetch chat contacts (coordinators + subordinates).
  Future<ChatContacts> getContacts() async {
    try {
      final res = await _api.get(ApiEndpoints.contacts);
      final body = res.data as Map<String, dynamic>;
      return ChatContacts.fromJson(body);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Fetch online status for a list of user IDs.
  Future<Map<String, bool>> getOnlineStatus(List<String> userIds) async {
    try {
      final res = await _api.post(
        ApiEndpoints.onlineStatus,
        data: {'userIds': userIds},
      );
      final body = res.data as Map<String, dynamic>;
      final status = body['status'] as Map<String, dynamic>? ?? {};
      return status.map((k, v) => MapEntry(k, v as bool? ?? false));
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}
