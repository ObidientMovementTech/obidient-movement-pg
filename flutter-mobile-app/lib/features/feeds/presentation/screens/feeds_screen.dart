import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/models/blog_post.dart';
import '../../data/models/unified_feed_item.dart';
import '../providers/feeds_providers.dart';
import '../widgets/blog_card.dart';
import '../widgets/unified_alert_card.dart';
import '../widgets/broadcast_detail_sheet.dart';
import '../widgets/feeds_skeleton.dart';
import '../widgets/reaction_bar.dart';

class FeedsScreen extends ConsumerWidget {
  final int initialTabIndex;
  final String? openBroadcastId;
  const FeedsScreen({
    super.key,
    this.initialTabIndex = 0,
    this.openBroadcastId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);

    return DefaultTabController(
      length: 2,
      initialIndex: initialTabIndex.clamp(0, 1),
      child: Scaffold(
        body: SafeArea(
          child: Column(
            children: [
              // ── Header ──────────────────────────────────────
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                child: Row(
                  children: [
                    Text(
                      'Feeds',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -0.5,
                        color: theme.colorScheme.onSurface,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              // ── Tab Bar ─────────────────────────────────────
              TabBar(
                labelColor: theme.colorScheme.onSurface,
                unselectedLabelColor:
                    theme.colorScheme.onSurface.withOpacity(0.4),
                indicatorColor: AppColors.primary,
                indicatorWeight: 2,
                indicatorSize: TabBarIndicatorSize.label,
                labelStyle: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.2,
                ),
                unselectedLabelStyle: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                ),
                dividerColor: theme.colorScheme.outline.withOpacity(0.15),
                tabs: const [
                  Tab(text: 'News'),
                  Tab(text: 'Alerts'),
                ],
              ),
              // ── Tab Content ─────────────────────────────────
              Expanded(
                child: TabBarView(
                  children: [
                    _NewsTab(),
                    _AlertsTab(openBroadcastId: openBroadcastId),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// NEWS TAB — blog posts
// ═══════════════════════════════════════════════════════════════════

class _NewsTab extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final postsAsync = ref.watch(blogPostsProvider);

    return postsAsync.when(
      loading: () => const BlogSkeleton(),
      error: (err, _) => _ErrorView(
        message: 'Could not load news',
        onRetry: () => ref.invalidate(blogPostsProvider),
      ),
      data: (posts) {
        if (posts.isEmpty) {
          return const _EmptyView(
            icon: Icons.article_outlined,
            title: 'No news yet',
            subtitle: 'Check back soon for movement updates.',
          );
        }
        return RefreshIndicator(
          color: AppColors.primary,
          onRefresh: () async {
            HapticFeedback.mediumImpact();
            ref.invalidate(blogPostsProvider);
          },
          child: ListView.builder(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 40),
            itemCount: posts.length,
            itemBuilder: (context, index) {
              final post = posts[index];
              if (index == 0) {
                return BlogHeroCard(
                  post: post,
                  onTap: () => _openBlogDetail(context, post),
                );
              }
              return BlogCompactCard(
                post: post,
                onTap: () => _openBlogDetail(context, post),
              );
            },
          ),
        );
      },
    );
  }

  void _openBlogDetail(BuildContext context, BlogPost post) {
    context.push('/feeds/blog/${post.id}', extra: post);
  }
}

// ═══════════════════════════════════════════════════════════════════
// ALERTS TAB — mobile feeds
// ═══════════════════════════════════════════════════════════════════

class _AlertsTab extends ConsumerStatefulWidget {
  final String? openBroadcastId;
  const _AlertsTab({this.openBroadcastId});

  @override
  ConsumerState<_AlertsTab> createState() => _AlertsTabState();
}

class _AlertsTabState extends ConsumerState<_AlertsTab> {
  bool _autoOpened = false;

  @override
  Widget build(BuildContext context) {
    final feedsAsync = ref.watch(unifiedFeedProvider(30));

    return feedsAsync.when(
      loading: () => const AlertsSkeleton(),
      error: (err, _) => _ErrorView(
        message: 'Could not load alerts',
        onRetry: () => ref.invalidate(unifiedFeedProvider),
      ),
      data: (items) {
        // Auto-open a specific broadcast when arriving from a push tap.
        final target = widget.openBroadcastId;
        if (target != null && !_autoOpened && items.isNotEmpty) {
          _autoOpened = true;
          UnifiedFeedItem? match;
          for (final it in items) {
            if (it.id == target || it.rawId == target) {
              match = it;
              break;
            }
          }
          if (match != null) {
            final itemToOpen = match;
            WidgetsBinding.instance.addPostFrameCallback((_) {
              if (!mounted) return;
              showBroadcastDetailSheet(context, itemToOpen, ref: ref);
            });
          }
        }

        if (items.isEmpty) {
          return const _EmptyView(
            icon: Icons.notifications_none_rounded,
            title: 'No alerts yet',
            subtitle: 'You\'ll see announcements and updates here.',
          );
        }
        return RefreshIndicator(
          color: AppColors.primary,
          onRefresh: () async {
            HapticFeedback.mediumImpact();
            ref.invalidate(unifiedFeedProvider);
          },
          child: ListView.builder(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 40),
            itemCount: items.length,
            itemBuilder: (context, index) {
              final item = items[index];
              return UnifiedAlertCard(
                item: item,
                onTap: () => showBroadcastDetailSheet(context, item, ref: ref),
              );
            },
          ),
        );
      },
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// INLINE BLOG DETAIL PAGE (pushed via Navigator)
// ═══════════════════════════════════════════════════════════════════

class BlogDetailPage extends StatelessWidget {
  final BlogPost post;
  const BlogDetailPage({super.key, required this.post});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // ── App bar with hero image ─────────────────────────
          SliverAppBar(
            expandedHeight: post.featuredImageUrl != null ? 240 : 0,
            pinned: true,
            backgroundColor: theme.scaffoldBackgroundColor,
            surfaceTintColor: Colors.transparent,
            leading: IconButton(
              icon: Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: theme.scaffoldBackgroundColor.withOpacity(0.8),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.arrow_back_rounded,
                  size: 20,
                  color: theme.colorScheme.onSurface,
                ),
              ),
              onPressed: () => Navigator.pop(context),
            ),
            flexibleSpace: post.featuredImageUrl != null
                ? FlexibleSpaceBar(
                    background: Image.network(
                      post.featuredImageUrl!,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        color: theme.colorScheme.onSurface.withOpacity(0.05),
                      ),
                    ),
                  )
                : null,
          ),
          // ── Content ─────────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 40),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Category
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.onSurface.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      post.category,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color:
                            theme.colorScheme.onSurface.withOpacity(0.45),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  // Title
                  Text(
                    post.title,
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.5,
                      height: 1.25,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                  const SizedBox(height: 14),
                  // Author + date row
                  Row(
                    children: [
                      const CircleAvatar(
                        radius: 14,
                        backgroundImage: AssetImage('assets/images/peter-obi.webp'),
                      ),
                      const SizedBox(width: 10),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Obidient Movement',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: theme.colorScheme.onSurface,
                            ),
                          ),
                          Text(
                            _formatDate(post.publishedAt ?? post.createdAt),
                            style: TextStyle(
                              fontSize: 11,
                              color: theme.colorScheme.onSurface
                                  .withOpacity(0.35),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Divider(
                    color: theme.colorScheme.outline.withOpacity(0.1),
                    height: 1,
                  ),
                  const SizedBox(height: 16),
                  // Reactions
                  ReactionBar(
                    targetType: 'blog_post',
                    targetId: post.id,
                    initialCounts: post.reactions,
                    initialUserReaction: post.userReaction,
                  ),
                  const SizedBox(height: 24),
                  // Body content — rendered HTML or plain text
                  if (post.content != null && post.content!.isNotEmpty)
                    _ArticleBody(
                      content: post.content!,
                      theme: theme,
                    )
                  else
                    Text(
                      post.excerpt ?? 'No content available.',
                      style: TextStyle(
                        fontSize: 15,
                        height: 1.7,
                        color:
                            theme.colorScheme.onSurface.withOpacity(0.7),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(String? dateStr) {
    if (dateStr == null) return '';
    final dt = DateTime.tryParse(dateStr);
    if (dt == null) return '';
    final months = [
      '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return '${months[dt.month]} ${dt.day}, ${dt.year}';
  }
}

/// Renders HTML blog content with theme-aware styling.
class _ArticleBody extends StatelessWidget {
  final String content;
  final ThemeData theme;
  const _ArticleBody({required this.content, required this.theme});

  @override
  Widget build(BuildContext context) {
    return Html(
      data: content,
      style: {
        'body': Style(
          fontSize: FontSize(15),
          lineHeight: const LineHeight(1.7),
          color: theme.colorScheme.onSurface.withOpacity(0.75),
          margin: Margins.zero,
          padding: HtmlPaddings.zero,
        ),
        'p': Style(
          margin: Margins.only(bottom: 14),
        ),
        'h1': Style(
          fontSize: FontSize(22),
          fontWeight: FontWeight.w800,
          color: theme.colorScheme.onSurface,
          margin: Margins.only(top: 20, bottom: 10),
        ),
        'h2': Style(
          fontSize: FontSize(19),
          fontWeight: FontWeight.w700,
          color: theme.colorScheme.onSurface,
          margin: Margins.only(top: 18, bottom: 8),
        ),
        'h3': Style(
          fontSize: FontSize(17),
          fontWeight: FontWeight.w700,
          color: theme.colorScheme.onSurface,
          margin: Margins.only(top: 16, bottom: 6),
        ),
        'strong': Style(
          fontWeight: FontWeight.w700,
          color: theme.colorScheme.onSurface,
        ),
        'em': Style(
          fontStyle: FontStyle.italic,
        ),
        'ul': Style(
          margin: Margins.only(bottom: 14),
        ),
        'ol': Style(
          margin: Margins.only(bottom: 14),
        ),
        'li': Style(
          margin: Margins.only(bottom: 4),
        ),
        'blockquote': Style(
          margin: Margins.only(left: 16, top: 10, bottom: 10),
          padding: HtmlPaddings.only(left: 12),
          border: Border(
            left: BorderSide(
              color: theme.colorScheme.onSurface.withOpacity(0.15),
              width: 3,
            ),
          ),
          fontStyle: FontStyle.italic,
          color: theme.colorScheme.onSurface.withOpacity(0.6),
        ),
        'a': Style(
          color: const Color(0xFF077B32),
          textDecoration: TextDecoration.underline,
        ),
      },
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// EMPTY + ERROR STATES
// ═══════════════════════════════════════════════════════════════════

class _EmptyView extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  const _EmptyView({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: theme.colorScheme.onSurface.withOpacity(0.05),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(
                icon,
                size: 28,
                color: theme.colorScheme.onSurface.withOpacity(0.2),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              title,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: theme.colorScheme.onSurface,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                color: theme.colorScheme.onSurface.withOpacity(0.4),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;
  const _ErrorView({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.error_outline_rounded,
              size: 40,
              color: theme.colorScheme.onSurface.withOpacity(0.2),
            ),
            const SizedBox(height: 14),
            Text(
              message,
              style: TextStyle(
                fontSize: 14,
                color: theme.colorScheme.onSurface.withOpacity(0.5),
              ),
            ),
            const SizedBox(height: 16),
            OutlinedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh_rounded, size: 16),
              label: const Text('Try again'),
              style: OutlinedButton.styleFrom(
                foregroundColor: theme.colorScheme.onSurface.withOpacity(0.6),
                side: BorderSide(
                  color: theme.colorScheme.outline.withOpacity(0.2),
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
