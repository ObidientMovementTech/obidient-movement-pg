import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../providers/chat_settings_provider.dart';

class ChatPrivacySettingsScreen extends ConsumerWidget {
  const ChatPrivacySettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final borderColor = theme.colorScheme.outline.withOpacity(0.12);
    final muted = theme.colorScheme.onSurface.withOpacity(0.4);
    final settingsAsync = ref.watch(chatSettingsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Chat & Privacy',
          style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700),
        ),
        centerTitle: true,
      ),
      body: settingsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Failed to load settings',
                  style: TextStyle(color: muted)),
              const SizedBox(height: 8),
              TextButton(
                onPressed: () => ref.invalidate(chatSettingsProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
        data: (settings) => ListView(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 40),
          children: [
            // ── Who Can DM Me ──────────────────────────────────
            _SectionLabel('Who Can Message Me', theme),
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
                  Text(
                    'Control who can start a direct message with you.',
                    style: TextStyle(fontSize: 12, color: muted),
                  ),
                  const SizedBox(height: 14),
                  _RadioOption(
                    theme: theme,
                    title: 'Everyone',
                    subtitle: 'Anyone in the community',
                    value: 'everyone',
                    groupValue: settings.whoCanDm,
                    onChanged: (v) {
                      HapticFeedback.lightImpact();
                      ref
                          .read(chatSettingsProvider.notifier)
                          .updateWhoCanDm(v);
                    },
                  ),
                  Divider(
                    height: 1,
                    color: theme.colorScheme.outline.withOpacity(0.08),
                  ),
                  _RadioOption(
                    theme: theme,
                    title: 'Coordinators Only',
                    subtitle: 'Only coordinators can message you',
                    value: 'coordinators_only',
                    groupValue: settings.whoCanDm,
                    onChanged: (v) {
                      HapticFeedback.lightImpact();
                      ref
                          .read(chatSettingsProvider.notifier)
                          .updateWhoCanDm(v);
                    },
                  ),
                  Divider(
                    height: 1,
                    color: theme.colorScheme.outline.withOpacity(0.08),
                  ),
                  _RadioOption(
                    theme: theme,
                    title: 'Nobody',
                    subtitle: 'Block all new direct messages',
                    value: 'nobody',
                    groupValue: settings.whoCanDm,
                    onChanged: (v) {
                      HapticFeedback.lightImpact();
                      ref
                          .read(chatSettingsProvider.notifier)
                          .updateWhoCanDm(v);
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // ── Privacy Toggles ────────────────────────────────
            _SectionLabel('Privacy', theme),
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
                    icon: Icons.visibility_outlined,
                    title: 'Show Online Status',
                    subtitle: 'Others can see when you\'re online',
                    value: settings.showOnlineStatus,
                    onChanged: (v) {
                      HapticFeedback.lightImpact();
                      ref
                          .read(chatSettingsProvider.notifier)
                          .toggleOnlineStatus(v);
                    },
                    showDivider: true,
                  ),
                  _ToggleRow(
                    theme: theme,
                    icon: Icons.done_all_rounded,
                    title: 'Read Receipts',
                    subtitle: 'Others can see when you\'ve read messages',
                    value: settings.readReceipts,
                    onChanged: (v) {
                      HapticFeedback.lightImpact();
                      ref
                          .read(chatSettingsProvider.notifier)
                          .toggleReadReceipts(v);
                    },
                    showDivider: true,
                  ),
                  _ToggleRow(
                    theme: theme,
                    icon: Icons.keyboard_outlined,
                    title: 'Typing Indicator',
                    subtitle: 'Others can see when you\'re typing',
                    value: settings.showTypingIndicator,
                    onChanged: (v) {
                      HapticFeedback.lightImpact();
                      ref
                          .read(chatSettingsProvider.notifier)
                          .toggleTypingIndicator(v);
                    },
                    showDivider: true,
                  ),
                  _ToggleRow(
                    theme: theme,
                    icon: Icons.mark_email_read_outlined,
                    title: 'Message Requests',
                    subtitle:
                        'Allow messages from people without a shared group',
                    value: settings.allowMessageRequests,
                    onChanged: (v) {
                      HapticFeedback.lightImpact();
                      ref
                          .read(chatSettingsProvider.notifier)
                          .toggleMessageRequests(v);
                    },
                    showDivider: false,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // ── Blocked Users ──────────────────────────────────
            _SectionLabel('Blocked Users', theme),
            const SizedBox(height: 10),
            GestureDetector(
              onTap: () {
                HapticFeedback.lightImpact();
                context.push('/settings/blocked-users');
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
                    Icon(Icons.block_rounded, size: 18, color: muted),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Blocked Users',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: theme.colorScheme.onSurface,
                        ),
                      ),
                    ),
                    Icon(
                      Icons.chevron_right_rounded,
                      size: 20,
                      color: muted,
                    ),
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

// ═══════════════════════════════════════════════════════════════
// Section Label
// ═══════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════
// Radio Option
// ═══════════════════════════════════════════════════════════════

class _RadioOption extends StatelessWidget {
  final ThemeData theme;
  final String title;
  final String subtitle;
  final String value;
  final String groupValue;
  final ValueChanged<String> onChanged;

  const _RadioOption({
    required this.theme,
    required this.title,
    required this.subtitle,
    required this.value,
    required this.groupValue,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: () => onChanged(value),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 10),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 11,
                      color: theme.colorScheme.onSurface.withOpacity(0.4),
                    ),
                  ),
                ],
              ),
            ),
            Radio<String>(
              value: value,
              groupValue: groupValue,
              onChanged: (v) {
                if (v != null) onChanged(v);
              },
              activeColor: AppColors.primary,
            ),
          ],
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// Toggle Row with subtitle
// ═══════════════════════════════════════════════════════════════

class _ToggleRow extends StatelessWidget {
  final ThemeData theme;
  final IconData icon;
  final String title;
  final String subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;
  final bool showDivider;

  const _ToggleRow({
    required this.theme,
    required this.icon,
    required this.title,
    required this.subtitle,
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
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: theme.colorScheme.onSurface,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: TextStyle(
                        fontSize: 11,
                        color: theme.colorScheme.onSurface.withOpacity(0.4),
                      ),
                    ),
                  ],
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
