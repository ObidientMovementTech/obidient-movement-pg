import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/theme/app_colors.dart';

/// Data model for an in-app chat notification banner.
class InAppNotification {
  final String id; // conversationId or roomId
  final String title; // sender name or room title
  final String body; // message preview
  final String? avatarUrl;
  final bool isRoom;

  const InAppNotification({
    required this.id,
    required this.title,
    required this.body,
    this.avatarUrl,
    this.isRoom = false,
  });
}

/// Overlay-based in-app notification banner (WhatsApp-style slide-down).
///
/// Usage:
///   InAppNotificationOverlay.show(context, notification, onTap: () => ...)
class InAppNotificationOverlay {
  static OverlayEntry? _currentEntry;
  static Timer? _autoDismiss;

  /// Show a notification banner that slides down from the top.
  /// Auto-dismisses after [duration]. Tapping calls [onTap] and dismisses.
  static void show(
    OverlayState overlay,
    InAppNotification notification, {
    VoidCallback? onTap,
    Duration duration = const Duration(seconds: 4),
  }) {
    // Dismiss any existing banner first
    dismiss();

    HapticFeedback.mediumImpact();

    late final OverlayEntry entry;

    entry = OverlayEntry(
      builder: (ctx) => _BannerWidget(
        notification: notification,
        onTap: () {
          dismiss();
          onTap?.call();
        },
        onDismiss: dismiss,
      ),
    );

    _currentEntry = entry;
    overlay.insert(entry);

    _autoDismiss = Timer(duration, dismiss);
  }

  static void dismiss() {
    _autoDismiss?.cancel();
    _autoDismiss = null;
    _currentEntry?.remove();
    _currentEntry = null;
  }
}

class _BannerWidget extends StatefulWidget {
  final InAppNotification notification;
  final VoidCallback onTap;
  final VoidCallback onDismiss;

  const _BannerWidget({
    required this.notification,
    required this.onTap,
    required this.onDismiss,
  });

  @override
  State<_BannerWidget> createState() => _BannerWidgetState();
}

class _BannerWidgetState extends State<_BannerWidget>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, -1),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic));
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final topPadding = MediaQuery.of(context).padding.top;

    return Positioned(
      top: 0,
      left: 0,
      right: 0,
      child: SlideTransition(
        position: _slideAnimation,
        child: GestureDetector(
          onTap: widget.onTap,
          onVerticalDragEnd: (details) {
            // Swipe up to dismiss
            if (details.velocity.pixelsPerSecond.dy < -100) {
              widget.onDismiss();
            }
          },
          child: Material(
            color: Colors.transparent,
            child: Container(
              padding: EdgeInsets.fromLTRB(16, topPadding + 8, 16, 12),
              decoration: BoxDecoration(
                color: isDark
                    ? AppColors.elevated.withOpacity(0.97)
                    : AppColors.lightSurface.withOpacity(0.97),
                border: Border(
                  bottom: BorderSide(
                    color: isDark ? AppColors.border : AppColors.lightBorder,
                    width: 0.5,
                  ),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.15),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  // Avatar
                  _buildAvatar(isDark),
                  const SizedBox(width: 12),
                  // Text content
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Row(
                          children: [
                            if (widget.notification.isRoom)
                              const Padding(
                                padding: EdgeInsets.only(right: 4),
                                child: Icon(
                                  Icons.group,
                                  size: 14,
                                  color: AppColors.primary,
                                ),
                              ),
                            Expanded(
                              child: Text(
                                widget.notification.title,
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: isDark
                                      ? AppColors.textPrimary
                                      : AppColors.lightTextPrimary,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 2),
                        Text(
                          widget.notification.body,
                          style: TextStyle(
                            fontSize: 13,
                            color: isDark
                                ? AppColors.textSecondary
                                : AppColors.lightTextSecondary,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildAvatar(bool isDark) {
    final url = widget.notification.avatarUrl;
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: isDark ? AppColors.surface : AppColors.lightBorder,
      ),
      clipBehavior: Clip.antiAlias,
      child: url != null && url.isNotEmpty
          ? CachedNetworkImage(
              imageUrl: url,
              fit: BoxFit.cover,
              placeholder: (_, __) => Icon(
                widget.notification.isRoom ? Icons.group : Icons.person,
                size: 20,
                color: AppColors.textMuted,
              ),
              errorWidget: (_, __, ___) => Icon(
                widget.notification.isRoom ? Icons.group : Icons.person,
                size: 20,
                color: AppColors.textMuted,
              ),
            )
          : Icon(
              widget.notification.isRoom ? Icons.group : Icons.person,
              size: 20,
              color: AppColors.textMuted,
            ),
    );
  }
}
