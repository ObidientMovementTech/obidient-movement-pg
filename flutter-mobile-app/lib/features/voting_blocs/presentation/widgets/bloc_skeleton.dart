import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

/// Full-page shimmer skeleton shown while the bloc data loads.
class BlocSkeleton extends StatelessWidget {
  const BlocSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final base = theme.colorScheme.onSurface.withOpacity(0.06);
    final highlight = theme.colorScheme.onSurface.withOpacity(0.02);

    return SafeArea(
      child: Shimmer.fromColors(
        baseColor: base,
        highlightColor: highlight,
        child: ListView(
          physics: const NeverScrollableScrollPhysics(),
          children: const [
            // Banner
            _Box(height: 180),
            SizedBox(height: 16),
            // Title
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _Box(height: 22, width: 200, radius: 6),
                  SizedBox(height: 10),
                  _Box(height: 14, radius: 4),
                  SizedBox(height: 6),
                  _Box(height: 14, width: 240, radius: 4),
                  SizedBox(height: 14),
                  // Meta chips
                  Row(
                    children: [
                      _Box(height: 28, width: 100, radius: 8),
                      SizedBox(width: 8),
                      _Box(height: 28, width: 130, radius: 8),
                      SizedBox(width: 8),
                      _Box(height: 28, width: 90, radius: 8),
                    ],
                  ),
                  SizedBox(height: 16),
                  // Action buttons
                  Row(
                    children: [
                      Expanded(child: _Box(height: 42, radius: 10)),
                      SizedBox(width: 10),
                      Expanded(child: _Box(height: 42, radius: 10)),
                    ],
                  ),
                  SizedBox(height: 16),
                  _Box(height: 1),
                  SizedBox(height: 8),
                  // Tab bar skeleton
                  Row(
                    children: [
                      _Box(height: 14, width: 60, radius: 4),
                      SizedBox(width: 24),
                      _Box(height: 14, width: 60, radius: 4),
                      SizedBox(width: 24),
                      _Box(height: 14, width: 80, radius: 4),
                      SizedBox(width: 24),
                      _Box(height: 14, width: 60, radius: 4),
                    ],
                  ),
                  SizedBox(height: 24),
                  // Content skeleton (stat cards)
                  Row(
                    children: [
                      Expanded(child: _Box(height: 80, radius: 12)),
                      SizedBox(width: 12),
                      Expanded(child: _Box(height: 80, radius: 12)),
                    ],
                  ),
                  SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(child: _Box(height: 80, radius: 12)),
                      SizedBox(width: 12),
                      Expanded(child: _Box(height: 80, radius: 12)),
                    ],
                  ),
                  SizedBox(height: 20),
                  // Goals section
                  _Box(height: 16, width: 100, radius: 4),
                  SizedBox(height: 10),
                  _Box(height: 44, radius: 10),
                  SizedBox(height: 8),
                  _Box(height: 44, radius: 10),
                  SizedBox(height: 8),
                  _Box(height: 44, radius: 10),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Box extends StatelessWidget {
  final double height;
  final double? width;
  final double radius;
  const _Box({required this.height, this.width, this.radius = 0});

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
