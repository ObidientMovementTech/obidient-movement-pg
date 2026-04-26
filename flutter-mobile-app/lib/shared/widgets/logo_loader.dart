import 'package:flutter/material.dart';

/// Reusable pulsing logo loader — use instead of CircularProgressIndicator.
/// Shows the Obidient logo with a subtle scale + opacity pulse.
class LogoLoader extends StatefulWidget {
  final double size;
  const LogoLoader({super.key, this.size = 80});

  @override
  State<LogoLoader> createState() => _LogoLoaderState();
}

class _LogoLoaderState extends State<LogoLoader>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double> _scale;
  late final Animation<double> _opacity;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
    _scale = Tween<double>(begin: 0.92, end: 1.0).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut),
    );
    _opacity = Tween<double>(begin: 0.6, end: 1.0).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _ctrl,
      builder: (context, child) => Opacity(
        opacity: _opacity.value,
        child: Transform.scale(
          scale: _scale.value,
          child: child,
        ),
      ),
      child: Image.asset(
        'assets/images/obi-logo-icon.png',
        width: widget.size,
        height: widget.size,
      ),
    );
  }
}
