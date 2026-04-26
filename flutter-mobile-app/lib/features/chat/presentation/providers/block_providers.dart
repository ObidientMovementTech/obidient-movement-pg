import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../auth/presentation/providers/auth_providers.dart';
import '../../data/datasources/block_remote_datasource.dart';

// ═══════════════════════════════════════════════════════════════
// Data Source
// ═══════════════════════════════════════════════════════════════

final blockDataSourceProvider = Provider((ref) {
  return BlockRemoteDataSource(ref.watch(apiClientProvider));
});

// ═══════════════════════════════════════════════════════════════
// Blocked Users List
// ═══════════════════════════════════════════════════════════════

final blockedUsersProvider =
    AsyncNotifierProvider<BlockedUsersNotifier, List<BlockedUser>>(
        BlockedUsersNotifier.new);

class BlockedUsersNotifier extends AsyncNotifier<List<BlockedUser>> {
  @override
  Future<List<BlockedUser>> build() async {
    final ds = ref.read(blockDataSourceProvider);
    final result = await ds.getBlockedUsers();
    return result.users;
  }

  /// Block a user and refresh the list.
  Future<void> blockUser(String userId, {String? reason}) async {
    final ds = ref.read(blockDataSourceProvider);
    await ds.blockUser(userId, reason: reason);
    ref.invalidateSelf();
  }

  /// Unblock a user and refresh the list.
  Future<void> unblockUser(String userId) async {
    final ds = ref.read(blockDataSourceProvider);
    await ds.unblockUser(userId);
    ref.invalidateSelf();
  }
}

// ═══════════════════════════════════════════════════════════════
// Blocked IDs set (single provider — no family to avoid
// per-userId InheritedElement accumulation with GoRouter)
// ═══════════════════════════════════════════════════════════════

final blockedIdsProvider = Provider<Set<String>>((ref) {
  final blockedAsync = ref.watch(blockedUsersProvider);
  return blockedAsync.when(
    data: (list) => list.map((u) => u.id).toSet(),
    loading: () => const <String>{},
    error: (_, __) => const <String>{},
  );
});
