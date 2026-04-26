import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

/// Shimmer skeleton placeholder — use instead of CircularProgressIndicator.
class SkeletonLoader extends StatelessWidget {
  final double width;
  final double height;
  final double borderRadius;

  const SkeletonLoader({
    super.key,
    this.width = double.infinity,
    this.height = 16,
    this.borderRadius = 8,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Shimmer.fromColors(
      baseColor: isDark ? const Color(0xFF1A1A1A) : const Color(0xFFE0E0E0),
      highlightColor:
          isDark ? const Color(0xFF2A2A2A) : const Color(0xFFF5F5F5),
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1A1A1A) : const Color(0xFFE0E0E0),
          borderRadius: BorderRadius.circular(borderRadius),
        ),
      ),
    );
  }
}

/// Card-shaped skeleton for list items.
class SkeletonCard extends StatelessWidget {
  final double height;

  const SkeletonCard({super.key, this.height = 80});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: SkeletonLoader(height: height, borderRadius: 14),
    );
  }
}

/// Full list of skeleton cards for loading states.
class SkeletonList extends StatelessWidget {
  final int itemCount;
  final double itemHeight;

  const SkeletonList({
    super.key,
    this.itemCount = 6,
    this.itemHeight = 80,
  });

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: itemCount,
      itemBuilder: (_, __) => SkeletonCard(height: itemHeight),
    );
  }
}
