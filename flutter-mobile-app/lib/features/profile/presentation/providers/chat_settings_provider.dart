import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../auth/presentation/providers/auth_providers.dart';
import '../../data/datasources/chat_settings_datasource.dart';

// ═══════════════════════════════════════════════════════════════
// Data Source
// ═══════════════════════════════════════════════════════════════

final chatSettingsDataSourceProvider = Provider((ref) {
  return ChatSettingsDataSource(ref.watch(apiClientProvider));
});

// ═══════════════════════════════════════════════════════════════
// Chat Settings State
// ═══════════════════════════════════════════════════════════════

final chatSettingsProvider =
    AsyncNotifierProvider.autoDispose<ChatSettingsNotifier, ChatSettings>(
        ChatSettingsNotifier.new);

class ChatSettingsNotifier extends AutoDisposeAsyncNotifier<ChatSettings> {
  @override
  Future<ChatSettings> build() async {
    final ds = ref.watch(chatSettingsDataSourceProvider);
    return ds.getChatSettings();
  }

  Future<void> updateWhoCanDm(String value) async {
    final ds = ref.read(chatSettingsDataSourceProvider);
    final updated = await ds.updateChatSettings({'who_can_dm': value});
    state = AsyncData(updated);
  }

  Future<void> toggleReadReceipts(bool value) async {
    final ds = ref.read(chatSettingsDataSourceProvider);
    final updated = await ds.updateChatSettings({'read_receipts': value});
    state = AsyncData(updated);
  }

  Future<void> toggleOnlineStatus(bool value) async {
    final ds = ref.read(chatSettingsDataSourceProvider);
    final updated = await ds.updateChatSettings({'show_online_status': value});
    state = AsyncData(updated);
  }

  Future<void> toggleTypingIndicator(bool value) async {
    final ds = ref.read(chatSettingsDataSourceProvider);
    final updated =
        await ds.updateChatSettings({'show_typing_indicator': value});
    state = AsyncData(updated);
  }

  Future<void> toggleMessageRequests(bool value) async {
    final ds = ref.read(chatSettingsDataSourceProvider);
    final updated =
        await ds.updateChatSettings({'allow_message_requests': value});
    state = AsyncData(updated);
  }
}
