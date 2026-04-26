import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../dashboard/presentation/providers/dashboard_providers.dart';

enum UsernameStatus { idle, checking, available, taken, invalid }

/// Debounced username field with live availability check against
/// GET /users/check-username. Emits status via [onStatusChanged].
class UsernameField extends ConsumerStatefulWidget {
  final TextEditingController controller;
  final String? initialUsername;
  final ValueChanged<UsernameStatus>? onStatusChanged;

  const UsernameField({
    super.key,
    required this.controller,
    this.initialUsername,
    this.onStatusChanged,
  });

  @override
  ConsumerState<UsernameField> createState() => _UsernameFieldState();
}

class _UsernameFieldState extends ConsumerState<UsernameField> {
  Timer? _debounce;
  UsernameStatus _status = UsernameStatus.idle;
  String _lastChecked = '';

  static final _usernameRegex = RegExp(r'^[a-zA-Z0-9_]{3,20}$');

  @override
  void initState() {
    super.initState();
    widget.controller.addListener(_onChanged);
  }

  @override
  void dispose() {
    _debounce?.cancel();
    widget.controller.removeListener(_onChanged);
    super.dispose();
  }

  void _setStatus(UsernameStatus s) {
    if (_status == s) return;
    setState(() => _status = s);
    widget.onStatusChanged?.call(s);
  }

  void _onChanged() {
    _debounce?.cancel();
    final v = widget.controller.text.trim();

    // Unchanged from initial → idle
    if (v == (widget.initialUsername ?? '').trim()) {
      _setStatus(UsernameStatus.idle);
      return;
    }

    if (v.isEmpty) {
      _setStatus(UsernameStatus.idle);
      return;
    }

    if (!_usernameRegex.hasMatch(v)) {
      _setStatus(UsernameStatus.invalid);
      return;
    }

    _setStatus(UsernameStatus.checking);
    _debounce = Timer(const Duration(milliseconds: 450), () => _check(v));
  }

  Future<void> _check(String username) async {
    if (username != widget.controller.text.trim()) return;
    if (_lastChecked == username) return;
    _lastChecked = username;
    try {
      final ds = ref.read(userDataSourceProvider);
      final available = await ds.checkUsername(username);
      if (username != widget.controller.text.trim()) return;
      _setStatus(
          available ? UsernameStatus.available : UsernameStatus.taken);
    } catch (_) {
      if (username != widget.controller.text.trim()) return;
      _setStatus(UsernameStatus.idle);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final appC = context.appColors;

    Widget? suffix;
    String? helper;
    Color helperColor = appC.textMuted;

    switch (_status) {
      case UsernameStatus.checking:
        suffix = const Padding(
          padding: EdgeInsets.all(12),
          child: SizedBox(
            width: 16,
            height: 16,
            child: CircularProgressIndicator(strokeWidth: 2),
          ),
        );
        break;
      case UsernameStatus.available:
        suffix = const Icon(Icons.check_circle_rounded,
            color: Color(0xFF34C759));
        helper = 'Username is available';
        helperColor = const Color(0xFF34C759);
        break;
      case UsernameStatus.taken:
        suffix =
            const Icon(Icons.cancel_rounded, color: Color(0xFFFF3B30));
        helper = 'Username is taken';
        helperColor = const Color(0xFFFF3B30);
        break;
      case UsernameStatus.invalid:
        suffix =
            const Icon(Icons.error_outline_rounded, color: Color(0xFFFF9500));
        helper = '3–20 chars, letters/numbers/underscore only';
        helperColor = const Color(0xFFFF9500);
        break;
      case UsernameStatus.idle:
        suffix = null;
        break;
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Username',
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: appC.textSecondary,
          ),
        ),
        const SizedBox(height: 6),
        TextFormField(
          controller: widget.controller,
          style: TextStyle(fontSize: 14, color: cs.onSurface),
          decoration: InputDecoration(
            prefixText: '@',
            prefixStyle: TextStyle(
              fontSize: 14,
              color: appC.textMuted,
              fontWeight: FontWeight.w600,
            ),
            hintText: 'your_handle',
            hintStyle: TextStyle(color: appC.textMuted, fontSize: 13),
            filled: true,
            fillColor: appC.elevated,
            suffixIcon: suffix,
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
              borderSide:
                  const BorderSide(color: AppColors.primary, width: 1.5),
            ),
          ),
        ),
        if (helper != null) ...[
          const SizedBox(height: 6),
          Text(
            helper,
            style: TextStyle(fontSize: 12, color: helperColor),
          ),
        ],
      ],
    );
  }
}
