import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

/// Shimmer skeleton for the News (blog) tab.
class BlogSkeleton extends StatelessWidget {
  const BlogSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final base = theme.colorScheme.onSurface.withOpacity(0.06);
    final highlight = theme.colorScheme.onSurface.withOpacity(0.02);

    return Shimmer.fromColors(
      baseColor: base,
      highlightColor: highlight,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 40),
        physics: const NeverScrollableScrollPhysics(),
        children: [
          // Hero card skeleton
          const _SkeletonBox(height: 200, radius: 14),
          const SizedBox(height: 12),
          const _SkeletonBox(height: 14, width: 80, radius: 4),
          const SizedBox(height: 8),
          const _SkeletonBox(height: 18, radius: 4),
          const SizedBox(height: 6),
          const _SkeletonBox(height: 18, width: 220, radius: 4),
          const SizedBox(height: 10),
          const _SkeletonBox(height: 12, width: 140, radius: 4),
          const SizedBox(height: 28),
          // Regular cards
          for (int i = 0; i < 4; i++) ...[
            _ArticleRowSkeleton(),
            const SizedBox(height: 16),
          ],
        ],
      ),
    );
  }
}

/// Shimmer skeleton for the Alerts (mobile feeds) tab.
class AlertsSkeleton extends StatelessWidget {
  const AlertsSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final base = theme.colorScheme.onSurface.withOpacity(0.06);
    final highlight = theme.colorScheme.onSurface.withOpacity(0.02);

    return Shimmer.fromColors(
      baseColor: base,
      highlightColor: highlight,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 40),
        physics: const NeverScrollableScrollPhysics(),
        children: [
          for (int i = 0; i < 6; i++) ...[
            _AlertCardSkeleton(),
            const SizedBox(height: 12),
          ],
        ],
      ),
    );
  }
}

// ── Building Blocks ──────────────────────────────────────────

class _SkeletonBox extends StatelessWidget {
  final double height;
  final double? width;
  final double radius;
  const _SkeletonBox({required this.height, this.width, this.radius = 8});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      width: width,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(radius),
      ),
    );
  }
}

class _ArticleRowSkeleton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return const Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _SkeletonBox(height: 12, width: 60, radius: 4),
              SizedBox(height: 6),
              _SkeletonBox(height: 14, radius: 4),
              SizedBox(height: 4),
              _SkeletonBox(height: 14, width: 160, radius: 4),
              SizedBox(height: 8),
              _SkeletonBox(height: 11, width: 100, radius: 4),
            ],
          ),
        ),
        SizedBox(width: 14),
        _SkeletonBox(height: 80, width: 80, radius: 10),
      ],
    );
  }
}

class _AlertCardSkeleton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 90,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
      ),
    );
  }
}
