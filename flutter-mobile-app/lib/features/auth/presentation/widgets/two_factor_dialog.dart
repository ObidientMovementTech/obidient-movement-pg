import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:pinput/pinput.dart';
import '../../../../core/network/api_exceptions.dart';
import '../../../../core/theme/app_colors.dart';

class TwoFactorDialog extends StatefulWidget {
  final String tempToken;
  final String email;
  final Future<void> Function(String code) onVerify;

  const TwoFactorDialog({
    super.key,
    required this.tempToken,
    required this.email,
    required this.onVerify,
  });

  @override
  State<TwoFactorDialog> createState() => _TwoFactorDialogState();
}

class _TwoFactorDialogState extends State<TwoFactorDialog> {
  final _pinCtrl = TextEditingController();
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _pinCtrl.dispose();
    super.dispose();
  }

  Future<void> _verify() async {
    final code = _pinCtrl.text.trim();
    if (code.length != 6) {
      setState(() => _error = 'Enter the 6-digit code');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      await widget.onVerify(code);
      if (mounted) Navigator.of(context).pop(true);
    } on ApiException catch (e) {
      if (mounted) setState(() => _error = e.userMessage);
    } catch (_) {
      if (mounted) setState(() => _error = 'Verification failed. Try again.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final defaultPinTheme = PinTheme(
      width: 48,
      height: 52,
      textStyle: theme.textTheme.titleLarge,
      decoration: BoxDecoration(
        border: Border.all(color: theme.colorScheme.outline),
        borderRadius: BorderRadius.circular(10),
      ),
    );

    return AlertDialog(
      title: const Text('Two-Factor Authentication'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'Enter the 6-digit code from your authenticator app for ${widget.email}',
            style: theme.textTheme.bodyMedium,
          ),
          const SizedBox(height: 24),
          Pinput(
            controller: _pinCtrl,
            length: 6,
            autofocus: true,
            keyboardType: TextInputType.number,
            inputFormatters: [FilteringTextInputFormatter.digitsOnly],
            defaultPinTheme: defaultPinTheme,
            focusedPinTheme: defaultPinTheme.copyWith(
              decoration: defaultPinTheme.decoration!.copyWith(
                border: Border.all(color: AppColors.primary, width: 2),
              ),
            ),
            onCompleted: (_) => _verify(),
          ),
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(
              _error!,
              style: theme.textTheme.bodySmall?.copyWith(
                color: AppColors.error,
              ),
            ),
          ],
        ],
      ),
      actions: [
        TextButton(
          onPressed: _loading ? null : () => Navigator.of(context).pop(false),
          child: const Text('Cancel'),
        ),
        FilledButton(
          onPressed: _loading ? null : _verify,
          child: _loading
              ? const SizedBox(
                  height: 18,
                  width: 18,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                )
              : const Text('Verify'),
        ),
      ],
    );
  }
}
