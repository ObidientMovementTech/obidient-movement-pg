import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen>
    with TickerProviderStateMixin {
  // ── Animation controllers ──────────────────────────────────
  late final AnimationController _logoCtrl;
  late final AnimationController _glowCtrl;
  late final AnimationController _titleCtrl;
  late final AnimationController _subtitleCtrl;
  late final AnimationController _buttonsCtrl;
  late final AnimationController _bgGlowCtrl;

  // Logo
  late final Animation<double> _logoScale;
  late final Animation<double> _logoShadowOpacity;

  // Glow pulse behind logo (subtle breathing after settle)
  late final Animation<double> _glowScale;
  late final Animation<double> _glowOpacity;

  // Title
  late final Animation<double> _titleFade;
  late final Animation<Offset> _titleSlide;

  // Subtitle
  late final Animation<double> _subtitleFade;
  late final Animation<Offset> _subtitleSlide;

  // Buttons — separate for stagger
  late final Animation<double> _primaryBtnFade;
  late final Animation<Offset> _primaryBtnSlide;
  late final Animation<double> _secondaryBtnFade;
  late final Animation<Offset> _secondaryBtnSlide;

  // Background glow fade-in
  late final Animation<double> _bgGlowFade;

  @override
  void initState() {
    super.initState();

    // ── Logo: 6x → 1x with organic deceleration + bounce ────
    _logoCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    );
    _logoScale = TweenSequence<double>([
      // Hold at massive scale briefly (200ms)
      TweenSequenceItem(
        tween: ConstantTween<double>(6.0),
        weight: 10,
      ),
      // Smooth decelerate shrink to normal
      TweenSequenceItem(
        tween: Tween<double>(begin: 6.0, end: 1.0)
            .chain(CurveTween(curve: Curves.easeOutQuart)),
        weight: 55,
      ),
      // Micro-bounce: compress
      TweenSequenceItem(
        tween: Tween<double>(begin: 1.0, end: 0.92)
            .chain(CurveTween(curve: Curves.easeInOut)),
        weight: 10,
      ),
      // Micro-bounce: spring back
      TweenSequenceItem(
        tween: Tween<double>(begin: 0.92, end: 1.02)
            .chain(CurveTween(curve: Curves.easeOut)),
        weight: 12,
      ),
      // Settle
      TweenSequenceItem(
        tween: Tween<double>(begin: 1.02, end: 1.0)
            .chain(CurveTween(curve: Curves.easeInOut)),
        weight: 13,
      ),
    ]).animate(_logoCtrl);

    // Logo shadow fades in as it reaches normal size
    _logoShadowOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _logoCtrl,
        curve: const Interval(0.5, 0.8, curve: Curves.easeOut),
      ),
    );

    // ── Glow pulse (loops after logo settles) ────────────────
    _glowCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2400),
    );
    _glowScale = Tween<double>(begin: 1.0, end: 1.15).animate(
      CurvedAnimation(parent: _glowCtrl, curve: Curves.easeInOut),
    );
    _glowOpacity = Tween<double>(begin: 0.35, end: 0.12).animate(
      CurvedAnimation(parent: _glowCtrl, curve: Curves.easeInOut),
    );

    // ── Title ────────────────────────────────────────────────
    _titleCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 550),
    );
    _titleFade = CurvedAnimation(parent: _titleCtrl, curve: Curves.easeOut);
    _titleSlide = Tween<Offset>(
      begin: const Offset(0, 0.25),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _titleCtrl, curve: Curves.easeOutCubic));

    // ── Subtitle ─────────────────────────────────────────────
    _subtitleCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    _subtitleFade =
        CurvedAnimation(parent: _subtitleCtrl, curve: Curves.easeOut);
    _subtitleSlide = Tween<Offset>(
      begin: const Offset(0, 0.25),
      end: Offset.zero,
    ).animate(
        CurvedAnimation(parent: _subtitleCtrl, curve: Curves.easeOutCubic));

    // ── Buttons (staggered: primary then secondary) ──────────
    _buttonsCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    );
    _primaryBtnFade = CurvedAnimation(
      parent: _buttonsCtrl,
      curve: const Interval(0.0, 0.6, curve: Curves.easeOut),
    );
    _primaryBtnSlide = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _buttonsCtrl,
      curve: const Interval(0.0, 0.6, curve: Curves.easeOutCubic),
    ));
    _secondaryBtnFade = CurvedAnimation(
      parent: _buttonsCtrl,
      curve: const Interval(0.3, 1.0, curve: Curves.easeOut),
    );
    _secondaryBtnSlide = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _buttonsCtrl,
      curve: const Interval(0.3, 1.0, curve: Curves.easeOutCubic),
    ));

    // ── Background glow ──────────────────────────────────────
    _bgGlowCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
    _bgGlowFade =
        CurvedAnimation(parent: _bgGlowCtrl, curve: Curves.easeOut);

    // Start after first frame paints
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _startSequence();
    });
  }

  Future<void> _startSequence() async {
    // Haptic on first frame — user feels the app "land"
    HapticFeedback.mediumImpact();

    // Logo shrinks from massive
    _logoCtrl.forward();
    // Background glows fade in during logo animation
    await Future.delayed(const Duration(milliseconds: 600));
    _bgGlowCtrl.forward();

    // Wait for logo to nearly finish
    await Future.delayed(const Duration(milliseconds: 1200));

    // Haptic on bounce settle
    HapticFeedback.lightImpact();

    // Start breathing glow behind logo
    _glowCtrl.repeat(reverse: true);

    // Title reveals
    await Future.delayed(const Duration(milliseconds: 100));
    _titleCtrl.forward();

    // Subtitle
    await Future.delayed(const Duration(milliseconds: 180));
    _subtitleCtrl.forward();

    // Buttons
    await Future.delayed(const Duration(milliseconds: 200));
    _buttonsCtrl.forward();
  }

  @override
  void dispose() {
    _logoCtrl.dispose();
    _glowCtrl.dispose();
    _titleCtrl.dispose();
    _subtitleCtrl.dispose();
    _buttonsCtrl.dispose();
    _bgGlowCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bottomPadding = MediaQuery.of(context).padding.bottom;
    final cs = Theme.of(context).colorScheme;
    final appC = context.appColors;
    final size = MediaQuery.of(context).size;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.dark,
      child: Scaffold(
        body: Stack(
          children: [
            // ── Animated background glows ────────────────────────
            FadeTransition(
              opacity: _bgGlowFade,
              child: Stack(
                children: [
                  Positioned(
                    top: size.height * 0.08,
                    left: -size.width * 0.2,
                    child: Container(
                      width: size.width * 0.7,
                      height: size.width * 0.7,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: RadialGradient(
                          colors: [
                            cs.primary.withOpacity(0.07),
                            cs.primary.withOpacity(0.0),
                          ],
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: size.height * 0.05,
                    right: -size.width * 0.15,
                    child: Container(
                      width: size.width * 0.5,
                      height: size.width * 0.5,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: RadialGradient(
                          colors: [
                            cs.primary.withOpacity(0.04),
                            cs.primary.withOpacity(0.0),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // ── Main content ─────────────────────────────────────
            SafeArea(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 32),
                child: Column(
                  children: [
                    const Spacer(flex: 3),

                    // ── Logo with glow ─────────────────────────────
                    AnimatedBuilder(
                      animation: Listenable.merge([_logoCtrl, _glowCtrl]),
                      builder: (context, child) {
                        final scale = _logoScale.value;
                        final shadowOp = _logoShadowOpacity.value;
                        // Breathing glow (only active after logo settles)
                        final glowSc =
                            _glowCtrl.isAnimating ? _glowScale.value : 1.0;
                        final glowOp =
                            _glowCtrl.isAnimating ? _glowOpacity.value : 0.0;

                        return Transform.scale(
                          scale: scale,
                          child: Stack(
                            alignment: Alignment.center,
                            children: [
                              // Breathing glow ring
                              Transform.scale(
                                scale: glowSc,
                                child: Container(
                                  width: 160,
                                  height: 160,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    boxShadow: [
                                      BoxShadow(
                                        color:
                                            cs.primary.withOpacity(glowOp),
                                        blurRadius: 60,
                                        spreadRadius: 20,
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                              // Logo with shadow
                              Container(
                                width: 120,
                                height: 120,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  boxShadow: [
                                    BoxShadow(
                                      color: cs.primary
                                          .withOpacity(0.2 * shadowOp),
                                      blurRadius: 32,
                                      spreadRadius: 4,
                                    ),
                                    BoxShadow(
                                      color: Colors.black
                                          .withOpacity(0.08 * shadowOp),
                                      blurRadius: 20,
                                      offset: const Offset(0, 8),
                                    ),
                                  ],
                                ),
                                child: ClipOval(
                                  child: Image.asset(
                                    'assets/images/obi-logo-icon.png',
                                    width: 120,
                                    height: 120,
                                    fit: BoxFit.cover,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: 32),

                    // ── Title ────────────────────────────────────
                    FadeTransition(
                      opacity: _titleFade,
                      child: SlideTransition(
                        position: _titleSlide,
                        child: Text(
                          'Obidient\nMovement',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 34,
                            fontWeight: FontWeight.w800,
                            color: cs.onSurface,
                            height: 1.12,
                            letterSpacing: -0.8,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),

                    // ── Subtitle ─────────────────────────────────
                    FadeTransition(
                      opacity: _subtitleFade,
                      child: SlideTransition(
                        position: _subtitleSlide,
                        child: Text(
                          'A New Nigeria is Possible',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w400,
                            color: appC.textMuted,
                            letterSpacing: 0.6,
                          ),
                        ),
                      ),
                    ),

                    const Spacer(flex: 4),

                    // ── Primary button ───────────────────────────
                    FadeTransition(
                      opacity: _primaryBtnFade,
                      child: SlideTransition(
                        position: _primaryBtnSlide,
                        child: SizedBox(
                          width: double.infinity,
                          height: 56,
                          child: ElevatedButton(
                            onPressed: () {
                              HapticFeedback.lightImpact();
                              context.push('/signup');
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: cs.primary,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                              elevation: 0,
                            ),
                            child: const Text(
                              'Get Started',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 0.3,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // ── Secondary button ─────────────────────────
                    FadeTransition(
                      opacity: _secondaryBtnFade,
                      child: SlideTransition(
                        position: _secondaryBtnSlide,
                        child: SizedBox(
                          width: double.infinity,
                          height: 56,
                          child: OutlinedButton(
                            onPressed: () {
                              HapticFeedback.lightImpact();
                              context.push('/login');
                            },
                            style: OutlinedButton.styleFrom(
                              foregroundColor: cs.onSurface,
                              side: BorderSide(
                                color: cs.outline.withOpacity(0.5),
                                width: 1.2,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                            ),
                            child: const Text(
                              'I Already Have an Account',
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w600,
                                letterSpacing: 0.2,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                    SizedBox(height: bottomPadding + 32),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
