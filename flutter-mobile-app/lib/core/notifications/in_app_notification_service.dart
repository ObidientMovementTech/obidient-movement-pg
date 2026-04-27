import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/providers/auth_providers.dart';
import '../../features/chat/presentation/providers/chat_providers.dart';
import '../../shared/widgets/in_app_notification_banner.dart';
import '../router/app_router.dart';
import '../services/socket_service.dart';

/// Listens to socket chat events and shows in-app notification banners
/// when the user is NOT in the relevant conversation/room.
///
/// Wired up in [ObidientApp] after authentication, torn down on logout.
class InAppNotificationService {
  InAppNotificationService._(this._ref);

  final Ref _ref;
  StreamSubscription<Map<String, dynamic>>? _dmSub;
  StreamSubscription<Map<String, dynamic>>? _roomSub;
  bool _active = false;

  static InAppNotificationService? _instance;
  static InAppNotificationService of(Ref ref) {
    _instance ??= InAppNotificationService._(ref);
    return _instance!;
  }

  void start() {
    if (_active) return;
    _active = true;
    _log('started');

    final socket = SocketService.instance;

    // ── DM messages ──
    _dmSub = socket.onNewMessage.listen(_handleDM);

    // ── Room messages ──
    _roomSub = socket.onRoomMessage.listen(_handleRoom);
  }

  void stop() {
    _dmSub?.cancel();
    _roomSub?.cancel();
    _dmSub = null;
    _roomSub = null;
    _active = false;
  }

  void _handleDM(Map<String, dynamic> data) {
    _log('DM event: ${data.keys.toList()}');
    final convId = data['conversation_id']?.toString();
    final senderId = data['sender_id']?.toString();
    if (convId == null || senderId == null) {
      _log('DM skipped: convId=$convId, senderId=$senderId');
      return;
    }

    // Don't show banner for own messages
    final currentUserId = _ref.read(currentUserProvider)?.id;
    if (senderId == currentUserId) {
      _log('DM skipped: own message');
      return;
    }

    // Don't show if user is viewing this conversation
    final activeConvoId =
        _ref.read(conversationsProvider.notifier).activeConversationId;
    if (convId == activeConvoId) {
      _log('DM skipped: viewing this conversation');
      return;
    }
    _log('DM showing banner for convo=$convId from=$senderId');

    final senderName = data['sender_name']?.toString() ??
        data['senderName']?.toString() ??
        'New message';
    final content = data['content']?.toString() ?? '';
    final preview =
        content.length > 120 ? '${content.substring(0, 120)}...' : content;
    final avatarUrl = data['sender_image']?.toString() ??
        data['senderImage']?.toString();

    _show(
      InAppNotification(
        id: convId,
        title: senderName,
        body: preview,
        avatarUrl: avatarUrl,
      ),
      onTap: () => _navigateTo('/chat/$convId'),
    );
  }

  void _handleRoom(Map<String, dynamic> data) {
    final roomId = data['conversation_id']?.toString();
    final senderId = data['sender_id']?.toString();
    if (roomId == null || senderId == null) return;

    // Don't show banner for own messages
    final currentUserId = _ref.read(currentUserProvider)?.id;
    if (senderId == currentUserId) return;

    // Don't show if user is viewing this room
    final activeRoomId = _ref.read(roomsProvider.notifier).activeRoomId;
    if (roomId == activeRoomId) return;

    final senderName = data['sender_name']?.toString() ??
        data['senderName']?.toString() ??
        'Someone';
    final roomTitle =
        data['room_title']?.toString() ??
        data['roomTitle']?.toString() ??
        'Group';
    final content = data['content']?.toString() ?? '';
    final preview =
        content.length > 120 ? '${content.substring(0, 120)}...' : content;

    _show(
      InAppNotification(
        id: roomId,
        title: roomTitle,
        body: '$senderName: $preview',
        isRoom: true,
      ),
      onTap: () => _navigateTo('/chat/room/$roomId'),
    );
  }

  void _show(InAppNotification notification, {VoidCallback? onTap}) {
    final overlay = rootNavigatorKey.currentState?.overlay;
    if (overlay == null) {
      _log('show FAILED: navigator overlay is null');
      return;
    }
    _log('show: title="${notification.title}", body="${notification.body}"');
    InAppNotificationOverlay.show(overlay, notification, onTap: onTap);
  }

  void _log(String msg) {
    if (kDebugMode) {
      // ignore: avoid_print
      print('[InAppNotif] $msg');
    }
  }

  void _navigateTo(String path) {
    final ctx = rootNavigatorKey.currentContext;
    if (ctx == null) return;
    GoRouter.of(ctx).go(path);
  }
}

final inAppNotificationServiceProvider =
    Provider<InAppNotificationService>((ref) {
  return InAppNotificationService.of(ref);
});
