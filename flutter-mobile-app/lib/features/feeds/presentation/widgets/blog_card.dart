import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:timeago/timeago.dart' as timeago;
import '../../data/models/blog_post.dart';
import 'reaction_bar.dart';

/// Hero card — large featured image for first post in list.
class BlogHeroCard extends StatelessWidget {
  final BlogPost post;
  final VoidCallback onTap;
  const BlogHeroCard({super.key, required this.post, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final borderColor = theme.colorScheme.outline.withOpacity(0.12);

    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        onTap();
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 24),
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: borderColor),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Featured image
            if (post.featuredImageUrl != null)
              AspectRatio(
                aspectRatio: 16 / 9,
                child: CachedNetworkImage(
                  imageUrl: post.featuredImageUrl!,
                  fit: BoxFit.cover,
                  placeholder: (_, __) => Container(
                    color: theme.colorScheme.onSurface.withOpacity(0.05),
                  ),
                  errorWidget: (_, __, ___) => Container(
                    color: theme.colorScheme.onSurface.withOpacity(0.05),
                    child: Icon(
                      Icons.image_outlined,
                      size: 32,
                      color: theme.colorScheme.onSurface.withOpacity(0.15),
                    ),
                  ),
                ),
              ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Category + time
                  Row(
                    children: [
                      _CategoryPill(category: post.category, theme: theme),
                      const Spacer(),
                      Text(
                        _timeAgo(post.publishedAt ?? post.createdAt),
                        style: TextStyle(
                          fontSize: 11,
                          color: theme.colorScheme.onSurface.withOpacity(0.35),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  // Title
                  Text(
                    post.title,
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                      letterSpacing: -0.3,
                      height: 1.3,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                  if (post.excerpt != null && post.excerpt!.isNotEmpty) ...[
                    const SizedBox(height: 6),
                    Text(
                      post.excerpt!,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 13,
                        height: 1.4,
                        color: theme.colorScheme.onSurface.withOpacity(0.5),
                      ),
                    ),
                  ],
                  const SizedBox(height: 12),
                  // Author row
                  _AuthorRow(post: post, theme: theme),
                  const SizedBox(height: 12),
                  // Reactions
                  ReactionBar(
                    targetType: 'blog_post',
                    targetId: post.id,
                    initialCounts: post.reactions,
                    initialUserReaction: post.userReaction,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Compact card — used for posts after the first one.
class BlogCompactCard extends StatelessWidget {
  final BlogPost post;
  final VoidCallback onTap;
  const BlogCompactCard({super.key, required this.post, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        onTap();
      },
      child: Padding(
        padding: const EdgeInsets.only(bottom: 20),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Text side
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _CategoryPill(category: post.category, theme: theme),
                  const SizedBox(height: 6),
                  Text(
                    post.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      height: 1.35,
                      letterSpacing: -0.2,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Obidient Movement · ${_timeAgo(post.publishedAt ?? post.createdAt)}',
                    style: TextStyle(
                      fontSize: 11,
                      color: theme.colorScheme.onSurface.withOpacity(0.35),
                    ),
                  ),
                  const SizedBox(height: 8),
                  ReactionBar(
                    targetType: 'blog_post',
                    targetId: post.id,
                    initialCounts: post.reactions,
                    initialUserReaction: post.userReaction,
                  ),
                ],
              ),
            ),
            // Thumbnail
            if (post.featuredImageUrl != null) ...[
              const SizedBox(width: 14),
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: CachedNetworkImage(
                  imageUrl: post.featuredImageUrl!,
                  width: 80,
                  height: 80,
                  fit: BoxFit.cover,
                  placeholder: (_, __) => Container(
                    width: 80,
                    height: 80,
                    color: theme.colorScheme.onSurface.withOpacity(0.05),
                  ),
                  errorWidget: (_, __, ___) => Container(
                    width: 80,
                    height: 80,
                    color: theme.colorScheme.onSurface.withOpacity(0.05),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

// ── Shared ───────────────────────────────────────────────────

class _CategoryPill extends StatelessWidget {
  final String category;
  final ThemeData theme;
  const _CategoryPill({required this.category, required this.theme});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: theme.colorScheme.onSurface.withOpacity(0.05),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        category,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.2,
          color: theme.colorScheme.onSurface.withOpacity(0.45),
        ),
      ),
    );
  }
}

class _AuthorRow extends StatelessWidget {
  final BlogPost post;
  final ThemeData theme;
  const _AuthorRow({required this.post, required this.theme});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const CircleAvatar(
          radius: 12,
          backgroundImage: AssetImage('assets/images/peter-obi.webp'),
        ),
        const SizedBox(width: 8),
        Text(
          'Obidient Movement',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: theme.colorScheme.onSurface.withOpacity(0.6),
          ),
        ),
      ],
    );
  }
}

String _timeAgo(String? dateStr) {
  if (dateStr == null) return '';
  final dt = DateTime.tryParse(dateStr);
  if (dt == null) return '';
  return timeago.format(dt, allowFromNow: true);
}
