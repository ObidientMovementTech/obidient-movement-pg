import 'package:dio/dio.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_endpoints.dart';
import '../../../../core/network/api_exceptions.dart';

class ChatSettings {
  final String whoCanDm;
  final bool readReceipts;
  final bool showOnlineStatus;
  final bool showTypingIndicator;
  final bool allowMessageRequests;

  const ChatSettings({
    this.whoCanDm = 'everyone',
    this.readReceipts = true,
    this.showOnlineStatus = true,
    this.showTypingIndicator = true,
    this.allowMessageRequests = true,
  });

  factory ChatSettings.fromJson(Map<String, dynamic> json) => ChatSettings(
        whoCanDm: json['who_can_dm'] as String? ?? 'everyone',
        readReceipts: json['read_receipts'] as bool? ?? true,
        showOnlineStatus: json['show_online_status'] as bool? ?? true,
        showTypingIndicator: json['show_typing_indicator'] as bool? ?? true,
        allowMessageRequests: json['allow_message_requests'] as bool? ?? true,
      );

  Map<String, dynamic> toJson() => {
        'who_can_dm': whoCanDm,
        'read_receipts': readReceipts,
        'show_online_status': showOnlineStatus,
        'show_typing_indicator': showTypingIndicator,
        'allow_message_requests': allowMessageRequests,
      };

  ChatSettings copyWith({
    String? whoCanDm,
    bool? readReceipts,
    bool? showOnlineStatus,
    bool? showTypingIndicator,
    bool? allowMessageRequests,
  }) =>
      ChatSettings(
        whoCanDm: whoCanDm ?? this.whoCanDm,
        readReceipts: readReceipts ?? this.readReceipts,
        showOnlineStatus: showOnlineStatus ?? this.showOnlineStatus,
        showTypingIndicator: showTypingIndicator ?? this.showTypingIndicator,
        allowMessageRequests:
            allowMessageRequests ?? this.allowMessageRequests,
      );
}

class ChatSettingsDataSource {
  final ApiClient _api;

  ChatSettingsDataSource(this._api);

  Future<ChatSettings> getChatSettings() async {
    try {
      final res = await _api.get(ApiEndpoints.chatSettings);
      final data = res.data['data'] as Map<String, dynamic>? ?? {};
      return ChatSettings.fromJson(data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<ChatSettings> updateChatSettings(Map<String, dynamic> updates) async {
    try {
      final res = await _api.patch(
        ApiEndpoints.chatSettings,
        data: updates,
      );
      final data = res.data['data'] as Map<String, dynamic>? ?? {};
      return ChatSettings.fromJson(data);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}
