import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/push/push_notification_service.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/theme_provider.dart';
import '../../../auth/presentation/providers/auth_providers.dart';
import '../../../dashboard/presentation/providers/dashboard_providers.dart';

class ProfileSettingsTab extends ConsumerStatefulWidget {
  const ProfileSettingsTab({super.key});

  @override
  ConsumerState<ProfileSettingsTab> createState() => _ProfileSettingsTabState();
}

class _ProfileSettingsTabState extends ConsumerState<ProfileSettingsTab> {
  bool _emailNotifs = true;
  bool _pushNotifs = true;
  bool _isDeleting = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final borderColor = theme.colorScheme.outline.withOpacity(0.12);
    final muted = theme.colorScheme.onSurface.withOpacity(0.4);
    final currentThemeMode = ref.watch(themeModeProvider);

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 40),
      children: [
        // ── Account ───────────────────────────────────────────
        _SectionLabel('Account', theme),
        const SizedBox(height: 10),
        GestureDetector(
          onTap: () {
            HapticFeedback.lightImpact();
            context.push('/profile/edit');
          },
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: theme.colorScheme.surface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: borderColor),
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
                    Icons.person_outline_rounded,
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
                        'Edit Profile',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: theme.colorScheme.onSurface,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Name, username, photo, voting info',
                        style: TextStyle(
                          fontSize: 12,
                          color: theme.colorScheme.onSurface.withOpacity(0.4),
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  Icons.chevron_right_rounded,
                  size: 18,
                  color: theme.colorScheme.onSurface.withOpacity(0.25),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 24),

        // ── Appearance ────────────────────────────────────────
        _SectionLabel('Appearance', theme),
        const SizedBox(height: 10),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: theme.colorScheme.surface,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: borderColor),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(
                    Icons.palette_outlined,
                    size: 18,
                    color: muted,
                  ),
                  const SizedBox(width: 10),
                  Text(
                    'Theme',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              _ThemeSegmentedControl(
                theme: theme,
                currentMode: currentThemeMode,
                onChanged: (mode) {
                  HapticFeedback.lightImpact();
                  ref.read(themeModeProvider.notifier).setThemeMode(mode);
                },
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),

        // ── Notifications ─────────────────────────────────────
        _SectionLabel('Notifications', theme),
        const SizedBox(height: 10),
        Container(
          decoration: BoxDecoration(
            color: theme.colorScheme.surface,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: borderColor),
          ),
          child: Column(
            children: [
              _ToggleRow(
                theme: theme,
                icon: Icons.email_outlined,
                title: 'Email Notifications',
                value: _emailNotifs,
                onChanged: (v) {
                  HapticFeedback.lightImpact();
                  setState(() => _emailNotifs = v);
                  _updateNotifPrefs();
                },
                showDivider: true,
              ),
              _ToggleRow(
                theme: theme,
                icon: Icons.notifications_outlined,
                title: 'Push Notifications',
                value: _pushNotifs,
                onChanged: (v) async {
                  HapticFeedback.lightImpact();
                  setState(() => _pushNotifs = v);
                  await _updatePushEnabled(v);
                },
                showDivider: false,
              ),
            ],
          ),
        ),
        if (kDebugMode) ...[
          const SizedBox(height: 12),
          GestureDetector(
            onTap: _sendTestPush,
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.08),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: AppColors.primary.withOpacity(0.3),
                ),
              ),
              child: const Row(
                children: [
                  Icon(
                    Icons.bug_report_rounded,
                    size: 18,
                    color: AppColors.primary,
                  ),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Send test push (debug)',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                  Icon(
                    Icons.send_rounded,
                    size: 16,
                    color: AppColors.primary,
                  ),
                ],
              ),
            ),
          ),
        ],
        const SizedBox(height: 24),

        // ── Chat & Privacy ────────────────────────────────────
        _SectionLabel('Chat & Privacy', theme),
        const SizedBox(height: 10),
        Container(
          decoration: BoxDecoration(
            color: theme.colorScheme.surface,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: borderColor),
          ),
          child: Column(
            children: [
              _ActionRow(
                theme: theme,
                icon: Icons.lock_outline_rounded,
                title: 'Chat Privacy Settings',
                showDivider: false,
                onTap: () {
                  HapticFeedback.lightImpact();
                  context.push('/settings/chat-privacy');
                },
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),

        // ── Account ───────────────────────────────────────────
        _SectionLabel('Account', theme),
        const SizedBox(height: 10),
        Container(
          decoration: BoxDecoration(
            color: theme.colorScheme.surface,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: borderColor),
          ),
          child: Column(
            children: [
              _ActionRow(
                theme: theme,
                icon: Icons.logout_rounded,
                title: 'Sign Out',
                showDivider: false,
                onTap: () {
                  HapticFeedback.lightImpact();
                  _showSignOutDialog();
                },
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),

        // ── Danger Zone ───────────────────────────────────────
        _SectionLabel('Danger Zone', theme),
        const SizedBox(height: 10),
        GestureDetector(
          onTap: _isDeleting ? null : _showDeleteDialog,
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFFF3B30).withOpacity(0.04),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: const Color(0xFFFF3B30).withOpacity(0.2),
              ),
            ),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: const Color(0xFFFF3B30).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.delete_forever_rounded,
                    size: 20,
                    color: Color(0xFFFF3B30),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Delete Account',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFFFF3B30),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Permanently delete your account and data',
                        style: TextStyle(
                          fontSize: 12,
                          color: const Color(0xFFFF3B30).withOpacity(0.6),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 32),

        // ── Version ───────────────────────────────────────────
        Center(
          child: Text(
            'Obidient Movement v1.0.0',
            style: TextStyle(
              fontSize: 11,
              color: theme.colorScheme.onSurface.withOpacity(0.25),
            ),
          ),
        ),
      ],
    );
  }

  // ═════════════════════════════════════════════════════════════════
  // BUSINESS LOGIC — preserved
  // ═════════════════════════════════════════════════════════════════

  Future<void> _updateNotifPrefs() async {
    try {
      final ds = ref.read(userDataSourceProvider);
      await ds.updateNotificationPreferences({
        'email': _emailNotifs,
        'push': _pushNotifs,
      });
    } catch (_) {}
  }

  Future<void> _updatePushEnabled(bool enabled) async {
    try {
      final ds = ref.read(userDataSourceProvider);
      await ds.updatePushSettings(enabled: enabled);
      // When disabling, also delete the FCM token on this device so the
      // user stops receiving push immediately. When enabling again, the
      // push service re-registers on next login or settings reopen.
      final push = ref.read(pushNotificationServiceProvider);
      if (enabled) {
        await push.init();
      } else {
        await push.deleteTokenAndUnregister();
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to update: $e')),
      );
    }
  }

  Future<void> _sendTestPush() async {
    HapticFeedback.lightImpact();
    try {
      final ds = ref.read(userDataSourceProvider);
      await ds.sendTestPush();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Test push dispatched — watch for notification'),
          behavior: SnackBarBehavior.floating,
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed: $e'),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  Future<void> _showSignOutDialog() async {
    final theme = Theme.of(context);
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: theme.colorScheme.surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: Text(
          'Sign Out',
          style: TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w700,
            color: theme.colorScheme.onSurface,
          ),
        ),
        content: Text(
          'Are you sure you want to sign out?',
          style: TextStyle(
            fontSize: 13,
            color: theme.colorScheme.onSurface.withOpacity(0.5),
          ),
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
              backgroundColor: theme.colorScheme.onSurface,
              foregroundColor: theme.colorScheme.surface,
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Sign Out'),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      await ref.read(authActionsProvider).logout();
    }
  }

  Future<void> _showDeleteDialog() async {
    final passwordCtrl = TextEditingController();
    final theme = Theme.of(context);
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: theme.colorScheme.surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: Text(
          'Delete Account',
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
              'This action is permanent and cannot be undone. All your data will be deleted.',
              style: TextStyle(
                fontSize: 13,
                color: theme.colorScheme.onSurface.withOpacity(0.5),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: passwordCtrl,
              obscureText: true,
              decoration: const InputDecoration(
                labelText: 'Enter your password to confirm',
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
            child: const Text('Delete Forever'),
          ),
        ],
      ),
    );
    if (confirmed == true && passwordCtrl.text.isNotEmpty) {
      setState(() => _isDeleting = true);
      try {
        final ds = ref.read(userDataSourceProvider);
        await ds.deleteAccount(passwordCtrl.text);
        await ref.read(authActionsProvider).logout();
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(e.toString()),
              backgroundColor: const Color(0xFFFF3B30),
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          );
        }
      } finally {
        if (mounted) setState(() => _isDeleting = false);
      }
    }
    passwordCtrl.dispose();
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
// THEME SEGMENTED CONTROL — System / Light / Dark
// ═══════════════════════════════════════════════════════════════════

class _ThemeSegmentedControl extends StatelessWidget {
  final ThemeData theme;
  final ThemeMode currentMode;
  final ValueChanged<ThemeMode> onChanged;

  const _ThemeSegmentedControl({
    required this.theme,
    required this.currentMode,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: theme.colorScheme.onSurface.withOpacity(0.05),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: [
          _SegmentButton(
            label: 'System',
            icon: Icons.brightness_auto_outlined,
            isSelected: currentMode == ThemeMode.system,
            theme: theme,
            onTap: () => onChanged(ThemeMode.system),
          ),
          _SegmentButton(
            label: 'Light',
            icon: Icons.light_mode_outlined,
            isSelected: currentMode == ThemeMode.light,
            theme: theme,
            onTap: () => onChanged(ThemeMode.light),
          ),
          _SegmentButton(
            label: 'Dark',
            icon: Icons.dark_mode_outlined,
            isSelected: currentMode == ThemeMode.dark,
            theme: theme,
            onTap: () => onChanged(ThemeMode.dark),
          ),
        ],
      ),
    );
  }
}

class _SegmentButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool isSelected;
  final ThemeData theme;
  final VoidCallback onTap;

  const _SegmentButton({
    required this.label,
    required this.icon,
    required this.isSelected,
    required this.theme,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeOut,
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? theme.colorScheme.surface : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.06),
                      blurRadius: 4,
                      offset: const Offset(0, 1),
                    ),
                  ]
                : null,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 14,
                color: isSelected
                    ? AppColors.primary
                    : theme.colorScheme.onSurface.withOpacity(0.35),
              ),
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                  color: isSelected
                      ? theme.colorScheme.onSurface
                      : theme.colorScheme.onSurface.withOpacity(0.35),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// TOGGLE ROW — grayscale icon, adaptive switch
// ═══════════════════════════════════════════════════════════════════

class _ToggleRow extends StatelessWidget {
  final ThemeData theme;
  final IconData icon;
  final String title;
  final bool value;
  final ValueChanged<bool> onChanged;
  final bool showDivider;

  const _ToggleRow({
    required this.theme,
    required this.icon,
    required this.title,
    required this.value,
    required this.onChanged,
    required this.showDivider,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          child: Row(
            children: [
              Icon(
                icon,
                size: 18,
                color: theme.colorScheme.onSurface.withOpacity(0.4),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  title,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
              ),
              Switch.adaptive(
                value: value,
                onChanged: onChanged,
                activeColor: AppColors.primary,
              ),
            ],
          ),
        ),
        if (showDivider)
          Divider(
            height: 1,
            thickness: 0.5,
            indent: 16,
            endIndent: 16,
            color: theme.colorScheme.outline.withOpacity(0.08),
          ),
      ],
    );
  }
}

// ═══════════════════════════════════════════════════════════════════
// ACTION ROW — list tile style inside a card
// ═══════════════════════════════════════════════════════════════════

class _ActionRow extends StatelessWidget {
  final ThemeData theme;
  final IconData icon;
  final String title;
  final bool showDivider;
  final VoidCallback onTap;

  const _ActionRow({
    required this.theme,
    required this.icon,
    required this.title,
    required this.showDivider,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        GestureDetector(
          onTap: onTap,
          behavior: HitTestBehavior.opaque,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            child: Row(
              children: [
                Icon(
                  icon,
                  size: 18,
                  color: theme.colorScheme.onSurface.withOpacity(0.4),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    title,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                ),
                Icon(
                  Icons.chevron_right_rounded,
                  size: 18,
                  color: theme.colorScheme.onSurface.withOpacity(0.2),
                ),
              ],
            ),
          ),
        ),
        if (showDivider)
          Divider(
            height: 1,
            thickness: 0.5,
            indent: 16,
            endIndent: 16,
            color: theme.colorScheme.outline.withOpacity(0.08),
          ),
      ],
    );
  }
}
