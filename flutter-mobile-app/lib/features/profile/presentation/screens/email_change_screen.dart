import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../auth/presentation/providers/auth_providers.dart';
import '../../../dashboard/presentation/providers/dashboard_providers.dart';

class EmailChangeScreen extends ConsumerStatefulWidget {
  const EmailChangeScreen({super.key});

  @override
  ConsumerState<EmailChangeScreen> createState() => _EmailChangeScreenState();
}

enum _Step { request, verify }

class _EmailChangeScreenState extends ConsumerState<EmailChangeScreen> {
  final _newEmailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _otpCtrl = TextEditingController();

  _Step _step = _Step.request;
  bool _requires2FA = false;
  bool _busy = false;

  static final _emailRegex = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');

  @override
  void dispose() {
    _newEmailCtrl.dispose();
    _passwordCtrl.dispose();
    _otpCtrl.dispose();
    super.dispose();
  }

  Future<void> _request() async {
    FocusScope.of(context).unfocus();
    final email = _newEmailCtrl.text.trim();
    if (!_emailRegex.hasMatch(email)) {
      _snack('Enter a valid email address');
      return;
    }
    if (_passwordCtrl.text.isEmpty) {
      _snack('Enter your current password');
      return;
    }

    setState(() => _busy = true);
    try {
      final ds = ref.read(userDataSourceProvider);
      final res = await ds.requestEmailChange(
        newEmail: email,
        currentPassword: _passwordCtrl.text,
      );
      if (!mounted) return;
      setState(() {
        _requires2FA = (res['requires2FA'] as bool?) ?? false;
        _step = _Step.verify;
      });
      HapticFeedback.lightImpact();
      _snack(
        _requires2FA
            ? 'Enter the code from your authenticator app'
            : 'Verification code sent to $email',
        success: true,
      );
    } catch (e) {
      _snack(e.toString());
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _verify() async {
    FocusScope.of(context).unfocus();
    final otp = _otpCtrl.text.trim();
    if (otp.length != 6) {
      _snack('Enter the 6-digit code');
      return;
    }
    setState(() => _busy = true);
    try {
      final ds = ref.read(userDataSourceProvider);
      await ds.verifyEmailChange(otp);
      if (!mounted) return;

      // If 2FA flow — server has sent the new email OTP now; switch to email OTP step
      if (_requires2FA) {
        setState(() {
          _requires2FA = false;
          _otpCtrl.clear();
        });
        HapticFeedback.lightImpact();
        _snack('Code sent to ${_newEmailCtrl.text.trim()}', success: true);
        return;
      }

      // Successful email change — refresh user and return
      await ref.read(authActionsProvider).tryRestoreSession();
      HapticFeedback.mediumImpact();
      _snack('Email updated', success: true);
      if (mounted) context.pop();
    } catch (e) {
      _snack(e.toString());
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  void _snack(String msg, {bool success = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor:
            success ? const Color(0xFF34C759) : const Color(0xFFFF3B30),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final appC = context.appColors;
    final user = ref.watch(currentUserProvider);

    return Scaffold(
      appBar: AppBar(
        backgroundColor: theme.scaffoldBackgroundColor,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        title: Text(
          'Change Email',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: theme.colorScheme.onSurface,
          ),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
          child: _step == _Step.request
              ? _buildRequest(theme, appC, user?.email)
              : _buildVerify(theme, appC),
        ),
      ),
    );
  }

  Widget _buildRequest(ThemeData theme, AppColorExtension appC, String? currentEmail) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Current email',
          style: TextStyle(fontSize: 12, color: appC.textMuted),
        ),
        const SizedBox(height: 4),
        Text(
          currentEmail ?? '—',
          style: TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w600,
            color: theme.colorScheme.onSurface,
          ),
        ),
        const SizedBox(height: 24),
        _fieldLabel('New email', appC),
        const SizedBox(height: 6),
        TextField(
          controller: _newEmailCtrl,
          keyboardType: TextInputType.emailAddress,
          autocorrect: false,
          decoration: _inputDecoration(appC, hint: 'you@example.com'),
        ),
        const SizedBox(height: 16),
        _fieldLabel('Current password', appC),
        const SizedBox(height: 6),
        TextField(
          controller: _passwordCtrl,
          obscureText: true,
          decoration: _inputDecoration(appC, hint: 'Required for security'),
        ),
        const Spacer(),
        _primaryButton(
          label: 'Send verification code',
          busy: _busy,
          onPressed: _request,
        ),
      ],
    );
  }

  Widget _buildVerify(ThemeData theme, AppColorExtension appC) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          _requires2FA
              ? 'Enter your authenticator code'
              : 'Enter the 6-digit code',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: theme.colorScheme.onSurface,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          _requires2FA
              ? 'Because 2FA is enabled, enter the current code from your authenticator app.'
              : 'We sent a 6-digit code to ${_newEmailCtrl.text.trim()}. Enter it to confirm.',
          style: TextStyle(
            fontSize: 13,
            color: appC.textMuted,
            height: 1.5,
          ),
        ),
        const SizedBox(height: 24),
        TextField(
          controller: _otpCtrl,
          keyboardType: TextInputType.number,
          maxLength: 6,
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w700,
            letterSpacing: 8,
          ),
          decoration: _inputDecoration(appC, hint: '000000').copyWith(
            counterText: '',
          ),
        ),
        const Spacer(),
        _primaryButton(
          label: _requires2FA ? 'Verify' : 'Confirm email',
          busy: _busy,
          onPressed: _verify,
        ),
        const SizedBox(height: 8),
        Center(
          child: TextButton(
            onPressed: _busy
                ? null
                : () {
                    setState(() {
                      _step = _Step.request;
                      _otpCtrl.clear();
                    });
                  },
            child: Text(
              'Back',
              style: TextStyle(color: appC.textMuted),
            ),
          ),
        ),
      ],
    );
  }

  Widget _fieldLabel(String label, AppColorExtension appC) {
    return Text(
      label,
      style: TextStyle(
        fontSize: 13,
        fontWeight: FontWeight.w600,
        color: appC.textSecondary,
      ),
    );
  }

  InputDecoration _inputDecoration(AppColorExtension appC,
      {required String hint}) {
    return InputDecoration(
      hintText: hint,
      hintStyle: TextStyle(color: appC.textMuted, fontSize: 13),
      filled: true,
      fillColor: appC.elevated,
      contentPadding:
          const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: BorderSide(color: appC.borderSubtle),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: BorderSide(color: appC.borderSubtle),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
      ),
    );
  }

  Widget _primaryButton({
    required String label,
    required bool busy,
    required VoidCallback onPressed,
  }) {
    return SizedBox(
      width: double.infinity,
      height: 52,
      child: ElevatedButton(
        onPressed: busy ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: 0,
        ),
        child: busy
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: Colors.white,
                ),
              )
            : Text(
                label,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                ),
              ),
      ),
    );
  }
}
