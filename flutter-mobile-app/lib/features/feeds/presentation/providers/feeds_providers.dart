import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../auth/presentation/providers/auth_providers.dart';
import '../../data/datasources/feeds_remote_datasource.dart';
import '../../data/models/blog_post.dart';
import '../../data/models/mobile_feed.dart';
import '../../data/models/reaction_counts.dart';
import '../../data/models/unified_feed_item.dart';

// ── Data Source ───────────────────────────────────────────────

final feedsDataSourceProvider = Provider((ref) {
  return FeedsDataSource(ref.watch(apiClientProvider));
});

// ── Blog Posts (first page) ──────────────────────────────────

final blogPostsProvider =
    FutureProvider.autoDispose<List<BlogPost>>((ref) async {
  final ds = ref.watch(feedsDataSourceProvider);
  final result = await ds.getBlogPosts(page: 1, limit: 20);
  return result.posts;
});

// ── Mobile Feeds (first page) ────────────────────────────────

final mobileFeedsProvider =
    FutureProvider.autoDispose<List<MobileFeed>>((ref) async {
  final ds = ref.watch(feedsDataSourceProvider);
  final result = await ds.getMobileFeeds(page: 1, limit: 30);
  return result.feeds;
});

// ── Unified Feed (mobile_feeds + broadcast notifications) ────

final unifiedFeedProvider =
    FutureProvider.autoDispose.family<List<UnifiedFeedItem>, int>(
  (ref, limit) async {
    final ds = ref.watch(feedsDataSourceProvider);
    final result = await ds.getUnifiedFeed(page: 1, limit: limit);
    return result.items;
  },
);

// ── Single Blog Post by slug ─────────────────────────────────

final blogPostDetailProvider =
    FutureProvider.autoDispose.family<BlogPost, String>((ref, slug) async {
  final ds = ref.watch(feedsDataSourceProvider);
  return ds.getBlogPostBySlug(slug);
});

// ── Reaction toggle helper ───────────────────────────────────

/// Holds per-target reaction state for optimistic updates.
/// Key = "$targetType:$targetId"
class ReactionState {
  final ReactionCounts counts;
  final String? userReaction;
  const ReactionState({required this.counts, this.userReaction});
}

final reactionStateProvider =
    StateProvider.family<ReactionState?, String>((ref, key) => null);

/// Toggle a reaction. Uses optimistic update for instant feedback.
Future<void> toggleReaction(
  WidgetRef ref, {
  required String targetType,
  required String targetId,
  required String reactionType,
}) async {
  final key = '$targetType:$targetId';
  final ds = ref.read(feedsDataSourceProvider);
  final notifier = ref.read(reactionStateProvider(key).notifier);
  final current = ref.read(reactionStateProvider(key));

  if (current == null) return;

  // Optimistic: compute expected state
  final oldCounts = current.counts;
  final oldReaction = current.userReaction;

  ReactionCounts newCounts;
  String? newReaction;

  if (oldReaction == reactionType) {
    // Removing same reaction
    newReaction = null;
    newCounts = _adjustCount(oldCounts, reactionType, -1);
  } else {
    // Adding new reaction (possibly replacing old)
    newReaction = reactionType;
    newCounts = _adjustCount(oldCounts, reactionType, 1);
    if (oldReaction != null) {
      newCounts = _adjustCount(newCounts, oldReaction, -1);
    }
  }

  // Apply optimistic update
  notifier.state = ReactionState(counts: newCounts, userReaction: newReaction);

  try {
    final result = await ds.toggleReaction(
      targetType: targetType,
      targetId: targetId,
      reactionType: reactionType,
    );
    // Reconcile with server truth
    notifier.state = ReactionState(
      counts: result.counts,
      userReaction: result.action == 'removed' ? null : reactionType,
    );
  } catch (_) {
    // Revert on failure
    notifier.state = ReactionState(counts: oldCounts, userReaction: oldReaction);
  }
}

ReactionCounts _adjustCount(ReactionCounts c, String type, int delta) {
  int l = c.like, lo = c.love, s = c.smile, m = c.meh;
  switch (type) {
    case 'like':
      l += delta;
    case 'love':
      lo += delta;
    case 'smile':
      s += delta;
    case 'meh':
      m += delta;
  }
  return ReactionCounts(
    like: l < 0 ? 0 : l,
    love: lo < 0 ? 0 : lo,
    smile: s < 0 ? 0 : s,
    meh: m < 0 ? 0 : m,
    total: (l < 0 ? 0 : l) + (lo < 0 ? 0 : lo) + (s < 0 ? 0 : s) + (m < 0 ? 0 : m),
  );
}
