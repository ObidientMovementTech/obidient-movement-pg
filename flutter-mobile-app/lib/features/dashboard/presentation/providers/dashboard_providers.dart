import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/api_endpoints.dart';
import '../../../auth/presentation/providers/auth_providers.dart';
import '../../../feeds/data/models/unified_feed_item.dart';
import '../../../feeds/presentation/providers/feeds_providers.dart';
import '../../data/datasources/user_remote_datasource.dart';

final userDataSourceProvider = Provider((ref) {
  return UserDataSource(ref.watch(apiClientProvider));
});

/// Profile completion data — { percentage: int, missingFields: [...] }
final profileCompletionProvider =
    FutureProvider.autoDispose<Map<String, dynamic>>((ref) async {
  final ds = ref.watch(userDataSourceProvider);
  return ds.getProfileCompletion();
});

/// Owned voting blocs.
final ownedBlocsProvider =
    FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  final ds = ref.watch(userDataSourceProvider);
  return ds.getOwnedBlocs();
});

/// Joined voting blocs.
final joinedBlocsProvider =
    FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  final ds = ref.watch(userDataSourceProvider);
  return ds.getJoinedBlocs();
});

/// Leadership coordinators for user's voting location.
final leadersProvider =
    FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  final ds = ref.watch(userDataSourceProvider);
  return ds.getLeaders();
});

/// Recent notifications/broadcasts (first 5 from unified feed).
final recentNotificationsProvider =
    FutureProvider.autoDispose<List<UnifiedFeedItem>>((ref) async {
  final ds = ref.watch(feedsDataSourceProvider);
  final result = await ds.getUnifiedFeed(page: 1, limit: 5);
  return result.items;
});

/// CTA links from admin settings (volunteer, run for office, donate, feedback).
final ctaLinksProvider =
    FutureProvider.autoDispose<Map<String, String>>((ref) async {
  final client = ref.watch(apiClientProvider);
  const keys = [
    'cta_volunteer_url',
    'cta_run_for_office_url',
    'cta_donate_url',
    'cta_feedback_url',
  ];
  final results = await Future.wait(
    keys.map((key) async {
      try {
        final res = await client.get(ApiEndpoints.appSetting(key));
        final value = (res.data['value'] as String?) ?? '';
        return MapEntry(key, value);
      } catch (_) {
        return MapEntry(key, '');
      }
    }),
  );
  final links = <String, String>{};
  for (final entry in results) {
    if (entry.value.isNotEmpty) links[entry.key] = entry.value;
  }
  return links;
});
