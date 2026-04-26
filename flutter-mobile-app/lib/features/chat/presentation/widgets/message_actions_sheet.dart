import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../../core/theme/app_colors.dart';

/// Quick-reaction emoji set (WhatsApp-style).
const kQuickReactions = ['👍', '❤️', '😂', '😮', '🙏', '🔥'];

/// Callback types for message actions.
typedef OnReaction = void Function(String emoji);
typedef OnReply = void Function();
typedef OnDelete = void Function({required bool forEveryone});

/// Long-press context sheet with quick reactions + action list.
void showMessageActionsSheet(
  BuildContext context, {
  required bool isMe,
  required bool isDark,
  required String messageContent,
  required bool isDeleted,
  required OnReaction onReact,
  required OnReply onReply,
  required OnDelete onDelete,
  bool canDeleteForEveryone = true,
}) {
  HapticFeedback.mediumImpact();
  showModalBottomSheet(
    context: context,
    backgroundColor: Colors.transparent,
    isScrollControlled: true,
    builder: (_) => _MessageActionsSheet(
      isMe: isMe,
      isDark: isDark,
      messageContent: messageContent,
      isDeleted: isDeleted,
      onReact: onReact,
      onReply: onReply,
      onDelete: onDelete,
      canDeleteForEveryone: canDeleteForEveryone,
    ),
  );
}

class _MessageActionsSheet extends StatelessWidget {
  final bool isMe;
  final bool isDark;
  final String messageContent;
  final bool isDeleted;
  final OnReaction onReact;
  final OnReply onReply;
  final OnDelete onDelete;
  final bool canDeleteForEveryone;

  const _MessageActionsSheet({
    required this.isMe,
    required this.isDark,
    required this.messageContent,
    required this.isDeleted,
    required this.onReact,
    required this.onReply,
    required this.onDelete,
    required this.canDeleteForEveryone,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.surface : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Handle
            Container(
              width: 36,
              height: 4,
              margin: const EdgeInsets.only(top: 12, bottom: 16),
              decoration: BoxDecoration(
                color: isDark ? AppColors.border : const Color(0xFFD4D4D4),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            // Quick reactions row
            if (!isDeleted) ...[
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: kQuickReactions.map((emoji) {
                    return GestureDetector(
                      onTap: () {
                        HapticFeedback.lightImpact();
                        Navigator.pop(context);
                        onReact(emoji);
                      },
                      child: Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: isDark
                              ? AppColors.elevated
                              : const Color(0xFFF5F5F5),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        alignment: Alignment.center,
                        child: Text(emoji, style: const TextStyle(fontSize: 22)),
                      ),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 16),
              Divider(
                height: 1,
                color: isDark ? AppColors.border : const Color(0xFFEEEEEE),
              ),
            ],
            // Actions
            if (!isDeleted)
              _ActionTile(
                icon: Icons.reply_rounded,
                label: 'Reply',
                isDark: isDark,
                onTap: () {
                  Navigator.pop(context);
                  onReply();
                },
              ),
            if (!isDeleted)
              _ActionTile(
                icon: Icons.copy_rounded,
                label: 'Copy',
                isDark: isDark,
                onTap: () {
                  Clipboard.setData(ClipboardData(text: messageContent));
                  Navigator.pop(context);
                },
              ),
            _ActionTile(
              icon: Icons.delete_outline_rounded,
              label: 'Delete for me',
              isDark: isDark,
              isDestructive: true,
              onTap: () {
                Navigator.pop(context);
                onDelete(forEveryone: false);
              },
            ),
            if (isMe && canDeleteForEveryone && !isDeleted)
              _ActionTile(
                icon: Icons.delete_forever_rounded,
                label: 'Delete for everyone',
                isDark: isDark,
                isDestructive: true,
                onTap: () {
                  Navigator.pop(context);
                  onDelete(forEveryone: true);
                },
              ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}

class _ActionTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isDark;
  final bool isDestructive;
  final VoidCallback onTap;

  const _ActionTile({
    required this.icon,
    required this.label,
    required this.isDark,
    this.isDestructive = false,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final color = isDestructive
        ? const Color(0xFFFF3B30)
        : (isDark ? AppColors.textPrimary : AppColors.lightTextPrimary);

    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        child: Row(
          children: [
            Icon(icon, size: 20, color: color),
            const SizedBox(width: 14),
            Text(
              label,
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w500,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
