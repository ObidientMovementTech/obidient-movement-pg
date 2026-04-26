import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../auth/presentation/providers/auth_providers.dart';
import '../../../dashboard/presentation/providers/dashboard_providers.dart';

class ProfileSecurityTab extends ConsumerStatefulWidget {
  const ProfileSecurityTab({super.key});

  @override
  ConsumerState<ProfileSecurityTab> createState() => _ProfileSecurityTabState();
}

class _ProfileSecurityTabState extends ConsumerState<ProfileSecurityTab> {
  bool _isChangingPassword = false;
  bool _isSettingUp2FA = false;
  String? _otpRequestId;
  String? _twoFactorSecret;
  String? _twoFactorQr;

  final _currentPasswordCtrl = TextEditingController();
  final _newPasswordCtrl = TextEditingController();
  final _confirmPasswordCtrl = TextEditingController();
  final _otpCtrl = TextEditingController();
  final _twoFactorCodeCtrl = TextEditingController();

  @override
  void dispose() {
    _currentPasswordCtrl.dispose();
    _newPasswordCtrl.dispose();
    _confirmPasswordCtrl.dispose();
    _otpCtrl.dispose();
    _twoFactorCodeCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProvider);
    final theme = Theme.of(context);
    final muted = theme.colorScheme.onSurface.withOpacity(0.4);
    final borderColor = theme.colorScheme.outline.withOpacity(0.12);

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 40),
      children: [
        // ── Password ──────────────────────────────────────────
        _SectionLabel('Password', theme),
        const SizedBox(height: 10),
        if (!_isChangingPassword)
          _ActionTile(
            theme: theme,
            icon: Icons.lock_outline_rounded,
            title: 'Change Password',
            subtitle: 'Update your account password',
            onTap: () {
              HapticFeedback.lightImpact();
              setState(() => _isChangingPassword = true);
            },
          )
        else
          _PasswordChangeForm(
            theme: theme,
            borderColor: borderColor,
            currentPasswordCtrl: _currentPasswordCtrl,
            newPasswordCtrl: _newPasswordCtrl,
            confirmPasswordCtrl: _confirmPasswordCtrl,
            otpCtrl: _otpCtrl,
            otpRequestId: _otpRequestId,
            onRequestOtp: _requestPasswordOtp,
            onVerifyAndChange: _verifyAndChangePassword,
            onCancel: () {
              setState(() {
                _isChangingPassword = false;
                _otpRequestId = null;
              });
              _currentPasswordCtrl.clear();
              _newPasswordCtrl.clear();
              _confirmPasswordCtrl.clear();
              _otpCtrl.clear();
            },
          ),
        const SizedBox(height: 24),

        // ── Two-Factor Auth ───────────────────────────────────
        _SectionLabel('Two-Factor Authentication', theme),
        const SizedBox(height: 10),
        if (user?.twoFactorEnabled == true)
          _ActionTile(
            theme: theme,
            icon: Icons.shield_rounded,
            title: '2FA Enabled',
            subtitle: 'Your account is protected with TOTP',
            trailing: const _StatusPill('Active', Color(0xFF34C759)),
            onTap: () => _showDisable2FADialog(),
          )
        else if (!_isSettingUp2FA)
          _ActionTile(
            theme: theme,
            icon: Icons.shield_outlined,
            title: 'Enable 2FA',
            subtitle: 'Add an extra layer of security',
            trailing: _StatusPill('Off', muted),
            onTap: () {
              HapticFeedback.lightImpact();
              _setup2FA();
            },
          )
        else
          _TwoFactorSetupCard(
            theme: theme,
            borderColor: borderColor,
            qrUrl: _twoFactorQr,
            secret: _twoFactorSecret,
            codeCtrl: _twoFactorCodeCtrl,
            onVerify: _verify2FASetup,
            onCancel: () {
              setState(() => _isSettingUp2FA = false);
              _twoFactorCodeCtrl.clear();
            },
          ),
        const SizedBox(height: 24),
      ],
    );
  }

  // ═════════════════════════════════════════════════════════════════
  // BUSINESS LOGIC — all preserved from original
  // ═════════════════════════════════════════════════════════════════

  Future<void> _requestPasswordOtp() async {
    if (_currentPasswordCtrl.text.isEmpty) {
      _showSnack('Enter your current password');
      return;
    }
    try {
      final ds = ref.read(userDataSourceProvider);
      await ds.changePasswordRequest(_currentPasswordCtrl.text);
      setState(() => _otpRequestId = 'requested');
      _showSnack('OTP sent to your email', isError: false);
    } catch (e) {
      _showSnack(e.toString());
    }
  }

  Future<void> _verifyAndChangePassword() async {
    if (_newPasswordCtrl.text.length < 8) {
      _showSnack('Password must be at least 8 characters');
      return;
    }
    if (_newPasswordCtrl.text != _confirmPasswordCtrl.text) {
      _showSnack('Passwords do not match');
      return;
    }
    if (_otpCtrl.text.length != 6) {
      _showSnack('Enter the 6-digit OTP');
      return;
    }
    try {
      final ds = ref.read(userDataSourceProvider);
      await ds.verifyOtp(_otpCtrl.text);
      await ds.changePassword(_newPasswordCtrl.text);
      _showSnack('Password changed successfully', isError: false);
      setState(() {
        _isChangingPassword = false;
        _otpRequestId = null;
      });
      _currentPasswordCtrl.clear();
      _newPasswordCtrl.clear();
      _confirmPasswordCtrl.clear();
      _otpCtrl.clear();
    } catch (e) {
      _showSnack(e.toString());
    }
  }

  Future<void> _setup2FA() async {
    try {
      final ds = ref.read(userDataSourceProvider);
      final result = await ds.setup2FA();
      setState(() {
        _isSettingUp2FA = true;
        _twoFactorSecret = result['secret'] as String?;
        _twoFactorQr = result['qrCode'] as String?;
      });
    } catch (e) {
      _showSnack(e.toString());
    }
  }

  Future<void> _verify2FASetup() async {
    if (_twoFactorCodeCtrl.text.length != 6) {
      _showSnack('Enter the 6-digit code');
      return;
    }
    try {
      final ds = ref.read(userDataSourceProvider);
      await ds.verify2FASetup(_twoFactorCodeCtrl.text);
      _showSnack('2FA enabled successfully!', isError: false);
      setState(() => _isSettingUp2FA = false);
      _twoFactorCodeCtrl.clear();
      ref.read(authActionsProvider).tryRestoreSession();
    } catch (e) {
      _showSnack(e.toString());
    }
  }

  Future<void> _showDisable2FADialog() async {
    final codeCtrl = TextEditingController();
    final theme = Theme.of(context);
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: theme.colorScheme.surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: Text(
          'Disable 2FA',
          style: TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w700,
            color: theme.colorScheme.onSurface,
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Enter your authenticator code to disable 2FA.',
              style: TextStyle(
                fontSize: 13,
                color: theme.colorScheme.onSurface.withOpacity(0.5),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: codeCtrl,
              keyboardType: TextInputType.number,
              maxLength: 6,
              decoration: const InputDecoration(
                hintText: '6-digit code',
                counterText: '',
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text(
              'Cancel',
              style: TextStyle(
                color: theme.colorScheme.onSurface.withOpacity(0.5),
              ),
            ),
          ),
          FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: const Color(0xFFFF3B30),
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Disable'),
          ),
        ],
      ),
    );
    if (confirmed == true && codeCtrl.text.length == 6) {
      try {
        final ds = ref.read(userDataSourceProvider);
        await ds.disable2FA(codeCtrl.text);
        _showSnack('2FA disabled', isError: false);
        ref.read(authActionsProvider).tryRestoreSession();
      } catch (e) {
        _showSnack(e.toString());
      }
    }
    codeCtrl.dispose();
  }

  void _showSnack(String msg, {bool isError = true}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: isError ? const Color(0xFFFF3B30) : const Color(0xFF34C759),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// SECTION LABEL
// ═══════════════════════════════════════════════════════════════════

class _SectionLabel extends StatelessWidget {
  final String text;
  final ThemeData theme;
  const _SectionLabel(this.text, this.theme);

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: TextStyle(
        fontSize: 13,
        fontWeight: FontWeight.w700,
        letterSpacing: 0.3,
        color: theme.colorScheme.onSurface.withOpacity(0.4),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// ACTION TILE — grayscale icon, no green
// ═══════════════════════════════════════════════════════════════════

class _ActionTile extends StatelessWidget {
  final ThemeData theme;
  final IconData icon;
  final String title;
  final String subtitle;
  final Widget? trailing;
  final VoidCallback onTap;

  const _ActionTile({
    required this.theme,
    required this.icon,
    required this.title,
    required this.subtitle,
    this.trailing,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: theme.colorScheme.outline.withOpacity(0.12),
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: theme.colorScheme.onSurface.withOpacity(0.06),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                icon,
                size: 20,
                color: theme.colorScheme.onSurface.withOpacity(0.5),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 12,
                      color: theme.colorScheme.onSurface.withOpacity(0.4),
                    ),
                  ),
                ],
              ),
            ),
            if (trailing != null) ...[
              trailing!,
              const SizedBox(width: 8),
            ],
            Icon(
              Icons.chevron_right_rounded,
              size: 18,
              color: theme.colorScheme.onSurface.withOpacity(0.25),
            ),
          ],
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// STATUS PILL
// ═══════════════════════════════════════════════════════════════════

class _StatusPill extends StatelessWidget {
  final String label;
  final Color color;
  const _StatusPill(this.label, this.color);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// PASSWORD CHANGE FORM
// ═══════════════════════════════════════════════════════════════════

class _PasswordChangeForm extends StatelessWidget {
  final ThemeData theme;
  final Color borderColor;
  final TextEditingController currentPasswordCtrl;
  final TextEditingController newPasswordCtrl;
  final TextEditingController confirmPasswordCtrl;
  final TextEditingController otpCtrl;
  final String? otpRequestId;
  final VoidCallback onRequestOtp;
  final VoidCallback onVerifyAndChange;
  final VoidCallback onCancel;

  const _PasswordChangeForm({
    required this.theme,
    required this.borderColor,
    required this.currentPasswordCtrl,
    required this.newPasswordCtrl,
    required this.confirmPasswordCtrl,
    required this.otpCtrl,
    required this.otpRequestId,
    required this.onRequestOtp,
    required this.onVerifyAndChange,
    required this.onCancel,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TextField(
            controller: currentPasswordCtrl,
            obscureText: true,
            decoration: const InputDecoration(labelText: 'Current Password'),
          ),
          if (otpRequestId == null) ...[
            const SizedBox(height: 16),
            _ButtonRow(
              theme: theme,
              cancelLabel: 'Cancel',
              confirmLabel: 'Send OTP',
              onCancel: onCancel,
              onConfirm: onRequestOtp,
            ),
          ] else ...[
            const SizedBox(height: 12),
            TextField(
              controller: newPasswordCtrl,
              obscureText: true,
              decoration: const InputDecoration(labelText: 'New Password'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: confirmPasswordCtrl,
              obscureText: true,
              decoration:
                  const InputDecoration(labelText: 'Confirm New Password'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: otpCtrl,
              keyboardType: TextInputType.number,
              maxLength: 6,
              decoration: const InputDecoration(
                labelText: 'OTP Code',
                counterText: '',
              ),
            ),
            const SizedBox(height: 16),
            _ButtonRow(
              theme: theme,
              cancelLabel: 'Cancel',
              confirmLabel: 'Change',
              onCancel: onCancel,
              onConfirm: onVerifyAndChange,
            ),
          ],
        ],
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// 2FA SETUP CARD
// ═══════════════════════════════════════════════════════════════════

class _TwoFactorSetupCard extends StatelessWidget {
  final ThemeData theme;
  final Color borderColor;
  final String? qrUrl;
  final String? secret;
  final TextEditingController codeCtrl;
  final VoidCallback onVerify;
  final VoidCallback onCancel;

  const _TwoFactorSetupCard({
    required this.theme,
    required this.borderColor,
    required this.qrUrl,
    required this.secret,
    required this.codeCtrl,
    required this.onVerify,
    required this.onCancel,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Scan this QR code with your authenticator app:',
            style: TextStyle(
              fontSize: 13,
              color: theme.colorScheme.onSurface.withOpacity(0.6),
            ),
          ),
          if (qrUrl != null) ...[
            const SizedBox(height: 14),
            Center(
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: _QrImage(dataUrl: qrUrl!),
              ),
            ),
          ],
          const SizedBox(height: 16),
          TextField(
            controller: codeCtrl,
            keyboardType: TextInputType.number,
            maxLength: 6,
            decoration: const InputDecoration(
              labelText: 'Verification Code',
              counterText: '',
            ),
          ),
          const SizedBox(height: 16),
          _ButtonRow(
            theme: theme,
            cancelLabel: 'Cancel',
            confirmLabel: 'Verify',
            onCancel: onCancel,
            onConfirm: onVerify,
          ),
        ],
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// SHARED BUTTON ROW
// ═══════════════════════════════════════════════════════════════════

class _ButtonRow extends StatelessWidget {
  final ThemeData theme;
  final String cancelLabel;
  final String confirmLabel;
  final VoidCallback onCancel;
  final VoidCallback onConfirm;

  const _ButtonRow({
    required this.theme,
    required this.cancelLabel,
    required this.confirmLabel,
    required this.onCancel,
    required this.onConfirm,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: OutlinedButton(
            style: OutlinedButton.styleFrom(
              foregroundColor: theme.colorScheme.onSurface.withOpacity(0.6),
              side: BorderSide(
                color: theme.colorScheme.outline.withOpacity(0.2),
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
              padding: const EdgeInsets.symmetric(vertical: 12),
            ),
            onPressed: onCancel,
            child: Text(cancelLabel),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: theme.colorScheme.onSurface,
              foregroundColor: theme.colorScheme.surface,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
              padding: const EdgeInsets.symmetric(vertical: 12),
            ),
            onPressed: onConfirm,
            child: Text(confirmLabel),
          ),
        ),
      ],
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// QR IMAGE — decodes a `data:image/png;base64,...` URL returned by server
// ═══════════════════════════════════════════════════════════════════

class _QrImage extends StatelessWidget {
  final String dataUrl;
  const _QrImage({required this.dataUrl});

  @override
  Widget build(BuildContext context) {
    try {
      final commaIdx = dataUrl.indexOf(',');
      final b64 = commaIdx >= 0 ? dataUrl.substring(commaIdx + 1) : dataUrl;
      final bytes = base64Decode(b64);
      return Image.memory(bytes, width: 180, height: 180);
    } catch (_) {
      return const SizedBox(
        width: 180,
        height: 180,
        child: Center(child: Text('QR failed to load')),
      );
    }
  }
}
