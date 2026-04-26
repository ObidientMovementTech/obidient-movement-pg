import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:pinput/pinput.dart';
import '../../../../core/network/api_exceptions.dart';
import '../../../../core/theme/app_colors.dart';
import '../providers/auth_providers.dart';

/// Forgot-password flow: Email → OTP → New Password.
class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ConsumerState<ForgotPasswordScreen> createState() =>
      _ForgotPasswordScreenState();
}

enum _Step { email, otp, password }

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  final _otpCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();

  _Step _step = _Step.email;
  bool _loading = false;
  bool _obscure = true;
  String? _errorMessage;
  int _cooldown = 0;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _otpCtrl.dispose();
    _passwordCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  void _startCooldown() {
    _cooldown = 60;
    _tick();
  }

  void _tick() {
    if (!mounted || _cooldown <= 0) return;
    Future.delayed(const Duration(seconds: 1), () {
      if (mounted) setState(() => _cooldown--);
      _tick();
    });
  }

  // Step 1: Send OTP
  Future<void> _sendOtp() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() {
      _loading = true;
      _errorMessage = null;
    });
    try {
      await ref
          .read(authActionsProvider)
          .forgotPassword(_emailCtrl.text.trim());
      if (mounted) {
        setState(() {
          _step = _Step.otp;
        });
        _startCooldown();
      }
    } on ApiException catch (e) {
      if (mounted) setState(() => _errorMessage = e.userMessage);
    } catch (_) {
      if (mounted) {
        setState(() => _errorMessage = 'Something went wrong. Try again.');
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  // Resend OTP
  Future<void> _resend() async {
    if (_cooldown > 0) return;
    setState(() => _loading = true);
    try {
      await ref
          .read(authActionsProvider)
          .forgotPassword(_emailCtrl.text.trim());
      _otpCtrl.clear();
      _startCooldown();
    } catch (_) {
      // best-effort
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  // Step 2 → 3 transition
  void _verifyOtp() {
    if (_otpCtrl.text.length != 6) {
      setState(() => _errorMessage = 'Please enter the full 6-digit code');
      return;
    }
    setState(() {
      _errorMessage = null;
      _step = _Step.password;
    });
  }

  // Step 3: Reset password with OTP
  Future<void> _resetPassword() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    if (_passwordCtrl.text != _confirmCtrl.text) {
      setState(() => _errorMessage = 'Passwords do not match');
      return;
    }
    setState(() {
      _loading = true;
      _errorMessage = null;
    });
    try {
      await ref.read(authActionsProvider).resetPasswordWithOTP(
            email: _emailCtrl.text.trim(),
            code: _otpCtrl.text.trim(),
            newPassword: _passwordCtrl.text,
          );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Password reset successful! Please sign in.'),
            backgroundColor: AppColors.primary,
          ),
        );
        context.go('/login');
      }
    } on ApiException catch (e) {
      if (mounted) setState(() => _errorMessage = e.userMessage);
    } catch (_) {
      if (mounted) {
        setState(() => _errorMessage = 'Something went wrong. Try again.');
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () {
            if (_step == _Step.otp) {
              setState(() => _step = _Step.email);
            } else if (_step == _Step.password) {
              setState(() => _step = _Step.otp);
            } else {
              context.pop();
            }
          },
        ),
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Icon(
                    _step == _Step.password
                        ? Icons.lock_rounded
                        : _step == _Step.otp
                            ? Icons.pin_rounded
                            : Icons.lock_reset_rounded,
                    size: 64,
                    color: AppColors.primary,
                  ),
                  const SizedBox(height: 24),
                  Text(
                    _step == _Step.email
                        ? 'Forgot Password?'
                        : _step == _Step.otp
                            ? 'Enter Verification Code'
                            : 'Set New Password',
                    style: theme.textTheme.headlineMedium?.copyWith(
                      color: theme.colorScheme.onSurface,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _step == _Step.email
                        ? "Enter your email and we'll send you a verification code."
                        : _step == _Step.otp
                            ? 'We sent a 6-digit code to ${_emailCtrl.text.trim()}.'
                            : 'Choose a strong password for your account.',
                    style: theme.textTheme.bodyMedium,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 32),

                  // Error banner
                  if (_errorMessage != null) ...[
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.error.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: AppColors.error.withOpacity(0.3),
                        ),
                      ),
                      child: Text(
                        _errorMessage!,
                        style: theme.textTheme.bodySmall
                            ?.copyWith(color: AppColors.error),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // ── Step: Email ──────────────────────────────
                  if (_step == _Step.email) ...[
                    TextFormField(
                      controller: _emailCtrl,
                      keyboardType: TextInputType.emailAddress,
                      textInputAction: TextInputAction.done,
                      onFieldSubmitted: (_) => _sendOtp(),
                      decoration: const InputDecoration(
                        labelText: 'Email Address',
                        prefixIcon: Icon(Icons.email_outlined),
                      ),
                      validator: (v) {
                        if (v == null || v.trim().isEmpty) {
                          return 'Enter your email address';
                        }
                        if (!RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')
                            .hasMatch(v.trim())) {
                          return 'Enter a valid email';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 24),
                    FilledButton(
                      onPressed: _loading ? null : _sendOtp,
                      child: _loading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Text('Send Verification Code'),
                    ),
                  ],

                  // ── Step: OTP ────────────────────────────────
                  if (_step == _Step.otp) ...[
                    Center(
                      child: Pinput(
                        controller: _otpCtrl,
                        length: 6,
                        onCompleted: (_) => _verifyOtp(),
                        defaultPinTheme: PinTheme(
                          width: 48,
                          height: 56,
                          textStyle: theme.textTheme.headlineSmall,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: theme.colorScheme.outline,
                            ),
                          ),
                        ),
                        focusedPinTheme: PinTheme(
                          width: 48,
                          height: 56,
                          textStyle: theme.textTheme.headlineSmall,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: AppColors.primary,
                              width: 2,
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    FilledButton(
                      onPressed:
                          _otpCtrl.text.length == 6 ? _verifyOtp : null,
                      child: const Text('Verify Code'),
                    ),
                    const SizedBox(height: 12),
                    Center(
                      child: TextButton(
                        onPressed: _cooldown > 0 ? null : _resend,
                        child: Text(
                          _cooldown > 0
                              ? 'Resend code in ${_cooldown}s'
                              : 'Resend code',
                        ),
                      ),
                    ),
                  ],

                  // ── Step: New Password ───────────────────────
                  if (_step == _Step.password) ...[
                    TextFormField(
                      controller: _passwordCtrl,
                      obscureText: _obscure,
                      textInputAction: TextInputAction.next,
                      decoration: InputDecoration(
                        labelText: 'New Password',
                        prefixIcon: const Icon(Icons.lock_outlined),
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscure
                                ? Icons.visibility_off
                                : Icons.visibility,
                          ),
                          onPressed: () =>
                              setState(() => _obscure = !_obscure),
                        ),
                      ),
                      validator: (v) {
                        if (v == null || v.length < 6) {
                          return 'At least 6 characters';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _confirmCtrl,
                      obscureText: _obscure,
                      textInputAction: TextInputAction.done,
                      onFieldSubmitted: (_) => _resetPassword(),
                      decoration: const InputDecoration(
                        labelText: 'Confirm Password',
                        prefixIcon: Icon(Icons.lock_outlined),
                      ),
                      validator: (v) {
                        if (v != _passwordCtrl.text) {
                          return 'Passwords do not match';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 24),
                    FilledButton(
                      onPressed: _loading ? null : _resetPassword,
                      child: _loading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Text('Reset Password'),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
