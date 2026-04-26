import 'package:dio/dio.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_endpoints.dart';
import '../../../../core/network/api_exceptions.dart';
import '../models/blog_post.dart';
import '../models/mobile_feed.dart';
import '../models/reaction_counts.dart';
import '../models/unified_feed_item.dart';

class FeedsDataSource {
  final ApiClient _api;

  FeedsDataSource(this._api);

  // ── Blog Posts ──────────────────────────────────────────────

  /// Fetch published blog posts (paginated).
  Future<({List<BlogPost> posts, int total, int pages})> getBlogPosts({
    int page = 1,
    int limit = 12,
    String? category,
  }) async {
    try {
      final params = <String, dynamic>{
        'page': page,
        'limit': limit,
      };
      if (category != null) params['category'] = category;

      final res = await _api.get(
        ApiEndpoints.blogPosts,
        queryParameters: params,
      );
      final body = res.data as Map<String, dynamic>;
      final list = (body['posts'] as List? ?? [])
          .map((e) => BlogPost.fromJson(e as Map<String, dynamic>))
          .toList();
      return (
        posts: list,
        total: body['total'] as int? ?? 0,
        pages: body['pages'] as int? ?? 1,
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Fetch a single blog post by slug.
  Future<BlogPost> getBlogPostBySlug(String slug) async {
    try {
      final res = await _api.get(ApiEndpoints.blogPostBySlug(slug));
      final body = res.data as Map<String, dynamic>;
      final post = body['post'] as Map<String, dynamic>? ?? body;
      return BlogPost.fromJson(post);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  // ── Mobile Feeds ────────────────────────────────────────────

  /// Fetch mobile feeds/alerts (paginated).
  Future<({List<MobileFeed> feeds, bool hasMore})> getMobileFeeds({
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final res = await _api.get(
        ApiEndpoints.mobileFeeds,
        queryParameters: {'page': page, 'limit': limit},
      );
      final body = res.data as Map<String, dynamic>;
      final list = (body['feeds'] as List? ?? [])
          .map((e) => MobileFeed.fromJson(e as Map<String, dynamic>))
          .toList();
      final pagination = body['pagination'] as Map<String, dynamic>? ?? {};
      return (
        feeds: list,
        hasMore: pagination['hasMore'] as bool? ?? false,
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  // ── Unified Feed ────────────────────────────────────────────

  /// Fetch the unified feed (mobile_feeds + broadcast notifications), newest first.
  Future<({List<UnifiedFeedItem> items, bool hasMore})> getUnifiedFeed({
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final res = await _api.get(
        ApiEndpoints.mobileFeedsUnified,
        queryParameters: {'page': page, 'limit': limit},
      );
      final body = res.data as Map<String, dynamic>;
      final list = (body['items'] as List? ?? [])
          .map((e) => UnifiedFeedItem.fromJson(e as Map<String, dynamic>))
          .toList();
      final pagination = body['pagination'] as Map<String, dynamic>? ?? {};
      return (
        items: list,
        hasMore: pagination['hasMore'] as bool? ?? false,
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  /// Mark a notification as read. Only call for items with source == 'notification'.
  Future<void> markNotificationRead(String rawId) async {
    try {
      await _api.put(ApiEndpoints.mobileNotificationRead(rawId));
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  // ── Reactions ───────────────────────────────────────────────

  /// Toggle a reaction on a target. Returns updated counts and the action taken.
  Future<({String action, ReactionCounts counts})> toggleReaction({
    required String targetType,
    required String targetId,
    required String reactionType,
  }) async {
    try {
      final res = await _api.post(
        ApiEndpoints.reactions,
        data: {
          'targetType': targetType,
          'targetId': targetId,
          'reactionType': reactionType,
        },
      );
      final body = res.data as Map<String, dynamic>;
      return (
        action: body['action'] as String,
        counts: ReactionCounts.fromJson(body['counts'] as Map<String, dynamic>),
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}
