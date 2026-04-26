import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:pinput/pinput.dart';
import '../../../../core/network/api_exceptions.dart';
import '../../../../core/theme/app_colors.dart';
import '../providers/auth_providers.dart';

class VerifyEmailScreen extends ConsumerStatefulWidget {
  final String email;

  const VerifyEmailScreen({super.key, required this.email});

  @override
  ConsumerState<VerifyEmailScreen> createState() => _VerifyEmailScreenState();
}

class _VerifyEmailScreenState extends ConsumerState<VerifyEmailScreen>
    with SingleTickerProviderStateMixin {
  final _pinCtrl = TextEditingController();
  final _focusNode = FocusNode();
  bool _verifying = false;
  bool _resending = false;
  String? _errorMessage;
  bool _verified = false;

  // Countdown for resend cooldown
  int _resendCooldown = 0;
  Timer? _timer;

  late final AnimationController _animCtrl;
  late final Animation<double> _fadeIn;

  @override
  void initState() {
    super.initState();
    _animCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    );
    _fadeIn = CurvedAnimation(parent: _animCtrl, curve: Curves.easeOut);
    _animCtrl.forward();

    // Start initial cooldown (just registered, email was just sent)
    _startResendCooldown();
  }

  @override
  void dispose() {
    _animCtrl.dispose();
    _pinCtrl.dispose();
    _focusNode.dispose();
    _timer?.cancel();
    super.dispose();
  }

  void _startResendCooldown() {
    setState(() => _resendCooldown = 60);
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_resendCooldown <= 0) {
        t.cancel();
      } else {
        setState(() => _resendCooldown--);
      }
    });
  }

  Future<void> _verify(String code) async {
    if (code.length != 6) return;
    HapticFeedback.mediumImpact();
    setState(() {
      _verifying = true;
      _errorMessage = null;
    });

    try {
      await ref.read(authActionsProvider).verifyEmailCode(
            email: widget.email,
            code: code,
          );

      if (!mounted) return;
      HapticFeedback.heavyImpact();
      setState(() => _verified = true);

      // Brief delay to show success state, then router redirects
      await Future.delayed(const Duration(milliseconds: 1200));
      // Auth state is now authenticated — GoRouter redirect will handle navigation
    } on ApiException catch (e) {
      if (!mounted) return;
      HapticFeedback.lightImpact();
      setState(() {
        _errorMessage = e.userMessage;
        _verifying = false;
      });
      _pinCtrl.clear();
      _focusNode.requestFocus();
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = 'Verification failed. Please try again.';
        _verifying = false;
      });
      _pinCtrl.clear();
      _focusNode.requestFocus();
    }
  }

  Future<void> _resend() async {
    if (_resendCooldown > 0 || widget.email.isEmpty) return;
    HapticFeedback.lightImpact();
    setState(() {
      _resending = true;
      _errorMessage = null;
    });
    try {
      await ref.read(authActionsProvider).resendConfirmation(widget.email);
      if (mounted) {
        _startResendCooldown();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('New code sent! Check your inbox.'),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to resend. Try again.'),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _resending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final maskedEmail = _maskEmail(widget.email);
    final cs = Theme.of(context).colorScheme;
    final appC = context.appColors;

    // ── Success state ─────────────────────────────────────────
    if (_verified) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: AppColors.success.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check_circle_rounded,
                  size: 48,
                  color: AppColors.success,
                ),
              ),
              const SizedBox(height: 20),
              Text(
                'Email Verified!',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  color: cs.onSurface,
                  letterSpacing: -0.3,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Setting up your account...',
                style: TextStyle(
                  fontSize: 14,
                  color: appC.textMuted,
                ),
              ),
            ],
          ),
        ),
      );
    }

    // ── OTP Entry state ───────────────────────────────────────
    return Scaffold(
      appBar: AppBar(
        elevation: 0,
        scrolledUnderElevation: 0,
        leading: IconButton(
          onPressed: () => context.go('/login'),
          icon: Icon(Icons.arrow_back_ios_new_rounded,
              size: 20, color: cs.onSurface),
        ),
      ),
      body: SafeArea(
        child: FadeTransition(
          opacity: _fadeIn,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 16),

                // ── Icon ──────────────────────────────────
                Center(
                  child: Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      color: cs.primary.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.mail_outline_rounded,
                      size: 32,
                      color: cs.primary,
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // ── Title ─────────────────────────────────
                Text(
                  'Verify Your Email',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w800,
                    color: cs.onSurface,
                    letterSpacing: -0.3,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  'Enter the 6-digit code sent to',
                  style: TextStyle(
                    fontSize: 14,
                    color: appC.textSecondary,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 4),
                Text(
                  maskedEmail,
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: cs.onSurface,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 36),

                // ── Pin input ─────────────────────────────
                Center(
                  child: Pinput(
                    length: 6,
                    controller: _pinCtrl,
                    focusNode: _focusNode,
                    autofocus: true,
                    keyboardType: TextInputType.number,
                    onCompleted: _verify,
                    enabled: !_verifying,
                    defaultPinTheme: PinTheme(
                      width: 50,
                      height: 56,
                      textStyle: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w700,
                        color: cs.onSurface,
                      ),
                      decoration: BoxDecoration(
                        color: cs.surface,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: cs.outline),
                      ),
                    ),
                    focusedPinTheme: PinTheme(
                      width: 50,
                      height: 56,
                      textStyle: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w700,
                        color: cs.onSurface,
                      ),
                      decoration: BoxDecoration(
                        color: cs.surface,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                            color: cs.primary, width: 1.5),
                      ),
                    ),
                    errorPinTheme: PinTheme(
                      width: 50,
                      height: 56,
                      textStyle: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w700,
                        color: cs.error,
                      ),
                      decoration: BoxDecoration(
                        color: cs.error.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: cs.error),
                      ),
                    ),
                    submittedPinTheme: PinTheme(
                      width: 50,
                      height: 56,
                      textStyle: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w700,
                        color: cs.primary,
                      ),
                      decoration: BoxDecoration(
                        color: cs.primary.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: cs.primary),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // ── Error message ─────────────────────────
                if (_errorMessage != null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Text(
                      _errorMessage!,
                      style: TextStyle(
                        fontSize: 13,
                        color: cs.error,
                        fontWeight: FontWeight.w500,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),

                // ── Verifying indicator ───────────────────
                if (_verifying)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    child: Center(
                      child: SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: cs.primary,
                        ),
                      ),
                    ),
                  ),

                const Spacer(),

                // ── Resend section ────────────────────────
                Center(
                  child: Column(
                    children: [
                      Text(
                        'Didn\'t receive the code?',
                        style: TextStyle(
                          fontSize: 13,
                          color: appC.textMuted,
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextButton(
                        onPressed: (_resendCooldown > 0 || _resending)
                            ? null
                            : _resend,
                        style: TextButton.styleFrom(
                          foregroundColor: cs.primary,
                          disabledForegroundColor: appC.textDisabled,
                        ),
                        child: _resending
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(
                                    strokeWidth: 2),
                              )
                            : Text(
                                _resendCooldown > 0
                                    ? 'Resend in ${_resendCooldown}s'
                                    : 'Resend Code',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: _resendCooldown > 0
                                      ? appC.textDisabled
                                      : cs.primary,
                                ),
                              ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // ── Back to login ─────────────────────────
                Center(
                  child: TextButton(
                    onPressed: () => context.go('/login'),
                    child: Text(
                      'Back to Sign In',
                      style: TextStyle(
                        fontSize: 14,
                        color: appC.textSecondary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  /// Masks email like j***n@gmail.com
  String _maskEmail(String email) {
    final parts = email.split('@');
    if (parts.length != 2) return email;
    final local = parts[0];
    final domain = parts[1];
    if (local.length <= 2) return email;
    return '${local[0]}${'*' * (local.length - 2)}${local[local.length - 1]}@$domain';
  }
}
