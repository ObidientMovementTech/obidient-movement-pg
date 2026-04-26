import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/network/api_exceptions.dart';
import '../../../../core/theme/app_colors.dart';
import '../providers/auth_providers.dart';
import '../widgets/two_factor_dialog.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen>
    with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _obscurePassword = true;
  bool _loading = false;
  String? _errorMessage;
  String? _unverifiedEmail;

  late final AnimationController _animCtrl;
  late final Animation<double> _fadeIn;
  late final Animation<Offset> _slideUp;

  @override
  void initState() {
    super.initState();
    _animCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    );
    _fadeIn = CurvedAnimation(parent: _animCtrl, curve: Curves.easeOut);
    _slideUp = Tween<Offset>(
      begin: const Offset(0, 0.06),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _animCtrl, curve: Curves.easeOut));
    _animCtrl.forward();
  }

  @override
  void dispose() {
    _animCtrl.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    HapticFeedback.mediumImpact();
    setState(() {
      _loading = true;
      _errorMessage = null;
      _unverifiedEmail = null;
    });

    try {
      final result = await ref.read(authActionsProvider).login(
            email: _emailCtrl.text.trim(),
            password: _passwordCtrl.text,
          );

      if (!mounted) return;

      if (result['requires2FA'] == true) {
        final verified = await showDialog<bool>(
          context: context,
          barrierDismissible: false,
          builder: (_) => TwoFactorDialog(
            tempToken: result['tempToken'] as String,
            email: result['email'] as String? ?? _emailCtrl.text.trim(),
            onVerify: (code) async {
              await ref.read(authActionsProvider).verify2FA(
                    tempToken: result['tempToken'] as String,
                    code: code,
                  );
            },
          ),
        );
        if (verified != true) {
          setState(() => _loading = false);
        }
        return;
      }
    } on ApiException catch (e) {
      if (!mounted) return;
      if (e.errorType == 'EMAIL_NOT_VERIFIED') {
        setState(() {
          _unverifiedEmail =
              e.data?['email'] as String? ?? _emailCtrl.text.trim();
          _errorMessage = 'Please verify your email before logging in.';
        });
      } else {
        setState(() => _errorMessage = e.userMessage);
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _errorMessage = 'Something went wrong. Please try again.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _resendVerification() async {
    if (_unverifiedEmail == null) return;
    try {
      await ref.read(authActionsProvider).resendConfirmation(_unverifiedEmail!);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Verification email sent! Check your inbox.'),
          behavior: SnackBarBehavior.floating,
        ),
      );
    } catch (_) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Failed to resend. Try again later.'),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottomPadding = MediaQuery.of(context).padding.bottom;
    final cs = Theme.of(context).colorScheme;
    final appC = context.appColors;

    return Scaffold(
      body: SafeArea(
        child: FadeTransition(
          opacity: _fadeIn,
          child: SlideTransition(
            position: _slideUp,
            child: CustomScrollView(
              slivers: [
                SliverFillRemaining(
                  hasScrollBody: false,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 28),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SizedBox(height: 20),

                          // ── Back ────────────────────────────
                          _BackButton(onTap: () => context.pop()),
                          const SizedBox(height: 32),

                          // ── Logo small ──────────────────────
                          Center(
                            child: ClipOval(
                              child: Image.asset(
                                'assets/images/obi-logo-icon.png',
                                width: 56,
                                height: 56,
                                fit: BoxFit.cover,
                              ),
                            ),
                          ),
                          const SizedBox(height: 28),

                          // ── Heading ─────────────────────────
                          Text(
                            'Welcome Back',
                            style: TextStyle(
                              fontSize: 26,
                              fontWeight: FontWeight.w800,
                              color: cs.onSurface,
                              letterSpacing: -0.5,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Enter your details to sign in',
                            style: TextStyle(
                              fontSize: 14,
                              color: appC.textMuted,
                            ),
                          ),
                          const SizedBox(height: 36),

                          // ── Error banner ────────────────────
                          if (_errorMessage != null) ...[
                            _ErrorBanner(
                              message: _errorMessage!,
                              showResend: _unverifiedEmail != null,
                              onResend: _resendVerification,
                            ),
                            const SizedBox(height: 20),
                          ],

                          // ── Email field ─────────────────────
                          _UnderlineField(
                            controller: _emailCtrl,
                            label: 'Email or Phone Number',
                            keyboardType: TextInputType.emailAddress,
                            textInputAction: TextInputAction.next,
                            validator: (v) {
                              if (v == null || v.trim().isEmpty) {
                                return 'Required';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 28),

                          // ── Password field ──────────────────
                          _UnderlineField(
                            controller: _passwordCtrl,
                            label: 'Password',
                            obscure: _obscurePassword,
                            textInputAction: TextInputAction.done,
                            onFieldSubmitted: (_) => _submit(),
                            suffixIcon: GestureDetector(
                              onTap: () {
                                HapticFeedback.lightImpact();
                                setState(() =>
                                    _obscurePassword = !_obscurePassword);
                              },
                              child: Icon(
                                _obscurePassword
                                    ? Icons.visibility_off_rounded
                                    : Icons.visibility_rounded,
                                color: appC.textMuted,
                                size: 20,
                              ),
                            ),
                            validator: (v) {
                              if (v == null || v.isEmpty) return 'Required';
                              return null;
                            },
                          ),
                          const SizedBox(height: 12),

                          // ── Forgot password ─────────────────
                          Align(
                            alignment: Alignment.centerRight,
                            child: GestureDetector(
                              onTap: () => context.push('/forgot-password'),
                              child: const Text(
                                'Forgot Password?',
                                style: TextStyle(
                                  color: AppColors.primary,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ),

                          const Spacer(),

                          // ── Sign In button ──────────────────
                          SizedBox(
                            width: double.infinity,
                            height: 54,
                            child: ElevatedButton(
                              onPressed: _loading ? null : _submit,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: cs.primary,
                                foregroundColor: Colors.white,
                                disabledBackgroundColor:
                                    cs.primary.withOpacity(0.5),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(14),
                                ),
                                elevation: 0,
                              ),
                              child: _loading
                                  ? const SizedBox(
                                      height: 20,
                                      width: 20,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: Colors.white,
                                      ),
                                    )
                                  : const Text(
                                      'Sign In',
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                            ),
                          ),
                          const SizedBox(height: 24),

                          // ── Sign up link ────────────────────
                          Center(
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  'Don\'t have an account? ',
                                  style: TextStyle(
                                    color: appC.textMuted,
                                    fontSize: 14,
                                  ),
                                ),
                                GestureDetector(
                                  onTap: () => context.push('/signup'),
                                  child: const Text(
                                    'Sign Up',
                                    style: TextStyle(
                                      color: AppColors.primary,
                                      fontSize: 14,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          SizedBox(height: bottomPadding + 16),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// SHARED AUTH WIDGETS
// ═══════════════════════════════════════════════════════════════════

/// Minimal underline-style field (Z-app inspired).
/// Label above, content below, thin bottom border.
class _UnderlineField extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final bool obscure;
  final Widget? suffixIcon;
  final String? Function(String?)? validator;
  final void Function(String)? onFieldSubmitted;

  const _UnderlineField({
    required this.controller,
    required this.label,
    this.keyboardType,
    this.textInputAction,
    this.obscure = false,
    this.suffixIcon,
    this.validator,
    this.onFieldSubmitted,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final appC = context.appColors;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: appC.textSecondary,
            letterSpacing: 0.2,
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          textInputAction: textInputAction,
          obscureText: obscure,
          onFieldSubmitted: onFieldSubmitted,
          style: TextStyle(
            color: cs.onSurface,
            fontSize: 16,
            fontWeight: FontWeight.w500,
          ),
          cursorColor: cs.primary,
          decoration: InputDecoration(
            hintStyle:
                TextStyle(color: appC.textDisabled, fontSize: 15),
            suffixIcon: suffixIcon != null
                ? Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: suffixIcon,
                  )
                : null,
            suffixIconConstraints:
                const BoxConstraints(minWidth: 24, minHeight: 24),
            isDense: true,
            contentPadding: const EdgeInsets.only(bottom: 10),
            filled: false,
            border: UnderlineInputBorder(
              borderSide: BorderSide(color: cs.outline, width: 1),
            ),
            enabledBorder: UnderlineInputBorder(
              borderSide: BorderSide(color: cs.outline, width: 1),
            ),
            focusedBorder: UnderlineInputBorder(
              borderSide: BorderSide(color: cs.primary, width: 2),
            ),
            errorBorder: UnderlineInputBorder(
              borderSide: BorderSide(color: cs.error, width: 1),
            ),
            focusedErrorBorder: UnderlineInputBorder(
              borderSide: BorderSide(color: cs.error, width: 2),
            ),
            errorStyle: const TextStyle(fontSize: 11, height: 0.8),
          ),
          validator: validator,
        ),
      ],
    );
  }
}

class _BackButton extends StatelessWidget {
  final VoidCallback onTap;
  const _BackButton({required this.onTap});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final appC = context.appColors;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: cs.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: cs.outline),
        ),
        child: Icon(
          Icons.arrow_back_ios_new_rounded,
          size: 16,
          color: appC.textSecondary,
        ),
      ),
    );
  }
}

class _ErrorBanner extends StatelessWidget {
  final String message;
  final bool showResend;
  final VoidCallback? onResend;

  const _ErrorBanner({
    required this.message,
    this.showResend = false,
    this.onResend,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: cs.error.withOpacity(0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: cs.error.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.error_outline_rounded,
                  size: 16, color: cs.error),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  message,
                  style: TextStyle(
                    color: cs.error,
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
          if (showResend) ...[
            const SizedBox(height: 10),
            GestureDetector(
              onTap: onResend,
              child: const Text(
                'Resend verification email',
                style: TextStyle(
                  color: AppColors.primary,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  decoration: TextDecoration.underline,
                  decorationColor: AppColors.primary,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
