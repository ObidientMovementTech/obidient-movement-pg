import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';

/// Branded hero section used at the top of all auth screens.
/// Shows the Obidient logo inside a green gradient with a curved bottom edge.
class AuthHeroSection extends StatefulWidget {
  final String title;
  final String subtitle;
  final bool compact;

  const AuthHeroSection({
    super.key,
    required this.title,
    required this.subtitle,
    this.compact = false,
  });

  @override
  State<AuthHeroSection> createState() => _AuthHeroSectionState();
}

class _AuthHeroSectionState extends State<AuthHeroSection>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double> _logoScale;
  late final Animation<double> _logoOpacity;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );
    _logoScale = Tween<double>(begin: 0.7, end: 1.0).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.easeOutBack),
    );
    _logoOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _ctrl,
        curve: const Interval(0.0, 0.6, curve: Curves.easeOut),
      ),
    );
    _ctrl.forward();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final topPadding = MediaQuery.of(context).padding.top;
    final heroHeight = widget.compact ? 200.0 : 260.0;
    final logoSize = widget.compact ? 56.0 : 72.0;

    return SizedBox(
      height: heroHeight + topPadding,
      child: Stack(
        children: [
          // ── Green gradient background with curve ──────────
          ClipPath(
            clipper: _WaveCurveClipper(),
            child: Container(
              height: heroHeight + topPadding,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Color(0xFF0A9E3E), // Slightly brighter at top
                    AppColors.primary,
                    AppColors.primaryDark,
                  ],
                  stops: [0.0, 0.5, 1.0],
                ),
              ),
            ),
          ),

          // ── Content ──────────────────────────────────────
          Positioned.fill(
            top: topPadding,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Logo with animated scale-in
                AnimatedBuilder(
                  animation: _ctrl,
                  builder: (context, child) => Opacity(
                    opacity: _logoOpacity.value,
                    child: Transform.scale(
                      scale: _logoScale.value,
                      child: child,
                    ),
                  ),
                  child: Container(
                    width: logoSize + 16,
                    height: logoSize + 16,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.2),
                          blurRadius: 20,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                    child: ClipOval(
                      child: Image.asset(
                        'assets/images/obi-logo-icon.png',
                        width: logoSize + 16,
                        height: logoSize + 16,
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                ),
                SizedBox(height: widget.compact ? 10 : 14),

                // Title
                Text(
                  widget.title,
                  style: TextStyle(
                    fontSize: widget.compact ? 18 : 22,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                    letterSpacing: -0.3,
                  ),
                ),
                const SizedBox(height: 4),

                // Subtitle
                Text(
                  widget.subtitle,
                  style: TextStyle(
                    fontSize: widget.compact ? 12 : 13,
                    fontWeight: FontWeight.w400,
                    color: Colors.white.withOpacity(0.8),
                  ),
                ),
                // Extra bottom space for the wave clip
                SizedBox(height: widget.compact ? 16 : 24),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Clips the bottom of the hero with a smooth concave wave.
class _WaveCurveClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    final path = Path();
    // Start from top-left, go down to wave start
    path.lineTo(0, size.height - 40);

    // Smooth wave curve
    final controlPoint1 = Offset(size.width * 0.25, size.height);
    final endPoint1 = Offset(size.width * 0.5, size.height - 20);
    path.quadraticBezierTo(
        controlPoint1.dx, controlPoint1.dy, endPoint1.dx, endPoint1.dy);

    final controlPoint2 = Offset(size.width * 0.75, size.height - 42);
    final endPoint2 = Offset(size.width, size.height - 12);
    path.quadraticBezierTo(
        controlPoint2.dx, controlPoint2.dy, endPoint2.dx, endPoint2.dy);

    // Close the path
    path.lineTo(size.width, 0);
    path.close();
    return path;
  }

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) => false;
}
