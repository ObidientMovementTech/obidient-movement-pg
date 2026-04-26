import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/network/api_exceptions.dart';
import '../../../../core/theme/app_colors.dart';
import '../providers/auth_providers.dart';

class SignupScreen extends ConsumerStatefulWidget {
  const SignupScreen({super.key});

  @override
  ConsumerState<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends ConsumerState<SignupScreen>
    with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _obscurePassword = true;
  bool _obscureConfirm = true;
  bool _loading = false;
  String? _errorMessage;

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
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _phoneCtrl.dispose();
    _passwordCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    HapticFeedback.mediumImpact();
    setState(() {
      _loading = true;
      _errorMessage = null;
    });

    try {
      await ref.read(authActionsProvider).register(
            name: _nameCtrl.text.trim(),
            email: _emailCtrl.text.trim(),
            phone: _phoneCtrl.text.trim(),
            password: _passwordCtrl.text,
          );

      if (!mounted) return;
      context.go(
          '/verify-email?email=${Uri.encodeComponent(_emailCtrl.text.trim())}');
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => _errorMessage = e.userMessage);
    } catch (e) {
      if (!mounted) return;
      setState(() => _errorMessage = 'Something went wrong. Please try again.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  String? _validatePassword(String? value) {
    if (value == null || value.isEmpty) return 'Required';
    if (value.length < 6) return 'Min 6 characters';
    return null;
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
                          const SizedBox(height: 28),

                          // ── Heading ─────────────────────────
                          Text(
                            'Create Account',
                            style: TextStyle(
                              fontSize: 26,
                              fontWeight: FontWeight.w800,
                              color: cs.onSurface,
                              letterSpacing: -0.5,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Join the Obidient Movement',
                            style: TextStyle(
                              fontSize: 14,
                              color: appC.textMuted,
                            ),
                          ),
                          const SizedBox(height: 32),

                          // ── Error banner ────────────────────
                          if (_errorMessage != null) ...[
                            Container(
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: cs.error.withOpacity(0.08),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                    color: cs.error.withOpacity(0.2)),
                              ),
                              child: Row(
                                children: [
                                  Icon(Icons.error_outline_rounded,
                                      size: 16, color: cs.error),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      _errorMessage!,
                                      style: TextStyle(
                                        color: cs.error,
                                        fontSize: 13,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 20),
                          ],

                          // ── Name ────────────────────────────
                          _UnderlineField(
                            controller: _nameCtrl,
                            label: 'Full Name',
                            textCapitalization: TextCapitalization.words,
                            textInputAction: TextInputAction.next,
                            validator: (v) {
                              if (v == null || v.trim().isEmpty) {
                                return 'Required';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 24),

                          // ── Email ───────────────────────────
                          _UnderlineField(
                            controller: _emailCtrl,
                            label: 'Email Address',
                            keyboardType: TextInputType.emailAddress,
                            textInputAction: TextInputAction.next,
                            validator: (v) {
                              if (v == null || v.trim().isEmpty) {
                                return 'Required';
                              }
                              if (!RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')
                                  .hasMatch(v.trim())) {
                                return 'Enter a valid email';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 24),

                          // ── Phone ───────────────────────────
                          _UnderlineField(
                            controller: _phoneCtrl,
                            label: 'WhatsApp Phone Number',
                            keyboardType: TextInputType.phone,
                            textInputAction: TextInputAction.next,
                            hintText: '+234...',
                            validator: (v) {
                              if (v == null || v.trim().isEmpty) {
                                return 'Required';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 24),

                          // ── Password ────────────────────────
                          _UnderlineField(
                            controller: _passwordCtrl,
                            label: 'Password',
                            obscure: _obscurePassword,
                            textInputAction: TextInputAction.next,
                            suffixIcon: GestureDetector(
                              onTap: () {
                                HapticFeedback.lightImpact();
                                setState(
                                    () => _obscurePassword = !_obscurePassword);
                              },
                              child: Icon(
                                _obscurePassword
                                    ? Icons.visibility_off_rounded
                                    : Icons.visibility_rounded,
                                color: appC.textMuted,
                                size: 20,
                              ),
                            ),
                            validator: _validatePassword,
                          ),
                          const SizedBox(height: 24),

                          // ── Confirm Password ────────────────
                          _UnderlineField(
                            controller: _confirmCtrl,
                            label: 'Confirm Password',
                            obscure: _obscureConfirm,
                            textInputAction: TextInputAction.done,
                            onFieldSubmitted: (_) => _submit(),
                            suffixIcon: GestureDetector(
                              onTap: () {
                                HapticFeedback.lightImpact();
                                setState(
                                    () => _obscureConfirm = !_obscureConfirm);
                              },
                              child: Icon(
                                _obscureConfirm
                                    ? Icons.visibility_off_rounded
                                    : Icons.visibility_rounded,
                                color: appC.textMuted,
                                size: 20,
                              ),
                            ),
                            validator: (v) {
                              if (v != _passwordCtrl.text) {
                                return 'Passwords don\'t match';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 36),

                          // ── Create Account button ───────────
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
                                      'Create Account',
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                            ),
                          ),
                          const SizedBox(height: 24),

                          // ── Sign in link ────────────────────
                          Center(
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  'Already have an account? ',
                                  style: TextStyle(
                                    color: appC.textMuted,
                                    fontSize: 14,
                                  ),
                                ),
                                GestureDetector(
                                  onTap: () => context.pop(),
                                  child: const Text(
                                    'Sign In',
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
// SHARED WIDGETS (duplicated from login for self-containment)
// ═══════════════════════════════════════════════════════════════════

class _UnderlineField extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final TextInputType? keyboardType;
  final TextCapitalization textCapitalization;
  final TextInputAction? textInputAction;
  final bool obscure;
  final Widget? suffixIcon;
  final String? hintText;
  final String? Function(String?)? validator;
  final void Function(String)? onFieldSubmitted;

  const _UnderlineField({
    required this.controller,
    required this.label,
    this.keyboardType,
    this.textCapitalization = TextCapitalization.none,
    this.textInputAction,
    this.obscure = false,
    this.suffixIcon,
    this.hintText,
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
          textCapitalization: textCapitalization,
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
            hintText: hintText,
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
