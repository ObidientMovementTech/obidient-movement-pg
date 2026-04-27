import 'dart:async';
import 'dart:io';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:permission_handler/permission_handler.dart';

import '../../features/dashboard/presentation/providers/dashboard_providers.dart';
import '../router/app_router.dart';

/// Android notification channel used for all foreground heads-up notifications.
/// MUST match the meta-data id in `AndroidManifest.xml`
/// (`com.google.firebase.messaging.default_notification_channel_id`).
const _androidChannel = AndroidNotificationChannel(
  'obidient_default',
  'Obidient Movement',
  description: 'Movement updates, alerts and messages',
  importance: Importance.high,
);

final FlutterLocalNotificationsPlugin _localNotifications =
    FlutterLocalNotificationsPlugin();

/// Handles the full FCM lifecycle: permission → token registration →
/// foreground / background / terminated taps → deep-linking.
///
/// Safe to call [init] multiple times; it is idempotent for a given login
/// session. Call [reset] on logout.
class PushNotificationService {
  PushNotificationService._(this._ref);

  final Ref _ref;
  bool _initialized = false;
  StreamSubscription<String>? _tokenRefreshSub;
  StreamSubscription<RemoteMessage>? _onMessageSub;
  StreamSubscription<RemoteMessage>? _onOpenSub;

  /// Single-instance-per-ProviderScope.
  static PushNotificationService? _instance;
  static PushNotificationService of(Ref ref) {
    _instance ??= PushNotificationService._(ref);
    return _instance!;
  }

  /// Called after successful login. Returns `true` if wiring succeeded
  /// end-to-end (permission granted + token obtained + server accepted).
  Future<bool> init() async {
    if (_initialized) return true;

    try {
      // 1. Request OS permissions.
      final granted = await _requestPermissions();
      if (!granted) {
        _log('permission denied');
        return false;
      }

      // 2. Init local notifications (foreground heads-up).
      await _initLocalNotifications();

      // 3. Get FCM token and register with backend.
      final token = await FirebaseMessaging.instance.getToken();
      if (token == null) {
        _log('FCM token is null');
        return false;
      }
      _log('FCM token: ${token.substring(0, 20)}…');
      await _registerToken(token);

      // 4. Subscribe to token refresh.
      _tokenRefreshSub =
          FirebaseMessaging.instance.onTokenRefresh.listen(_registerToken);

      // 5. Foreground messages — show local heads-up.
      _onMessageSub = FirebaseMessaging.onMessage.listen(_onForegroundMessage);

      // 6. Tap while app is in background.
      _onOpenSub = FirebaseMessaging.onMessageOpenedApp.listen(_handleTap);

      // 7. Cold-start tap (app was terminated).
      final initialMessage =
          await FirebaseMessaging.instance.getInitialMessage();
      if (initialMessage != null) {
        // Delay so GoRouter is ready.
        Future.delayed(const Duration(milliseconds: 800), () {
          _handleTap(initialMessage);
        });
      }

      // 8. Invalidate feed providers when any push arrives so the alerts tab
      //    refreshes in real-time.
      FirebaseMessaging.onMessage.listen((_) => _invalidateFeeds());

      _initialized = true;
      return true;
    } catch (e, st) {
      _log('init error: $e\n$st');
      return false;
    }
  }

  /// Tear down listeners (e.g. on logout). Does NOT delete the FCM token —
  /// call [deleteTokenAndUnregister] for that.
  Future<void> reset() async {
    await _tokenRefreshSub?.cancel();
    await _onMessageSub?.cancel();
    await _onOpenSub?.cancel();
    _tokenRefreshSub = null;
    _onMessageSub = null;
    _onOpenSub = null;
    _initialized = false;
  }

  /// Fully revoke push on the current device (used on logout / opt-out).
  Future<void> deleteTokenAndUnregister() async {
    try {
      await FirebaseMessaging.instance.deleteToken();
    } catch (e) {
      _log('deleteToken error: $e');
    }
    await reset();
  }

  // ──────────────────────────────────────────────────────────
  // Internals
  // ──────────────────────────────────────────────────────────

  Future<bool> _requestPermissions() async {
    // iOS + web
    final settings = await FirebaseMessaging.instance.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
    );
    final iosOk =
        settings.authorizationStatus == AuthorizationStatus.authorized ||
            settings.authorizationStatus == AuthorizationStatus.provisional;

    // Android 13+ POST_NOTIFICATIONS runtime permission
    if (Platform.isAndroid) {
      final status = await Permission.notification.request();
      return status.isGranted;
    }
    return iosOk;
  }

  Future<void> _initLocalNotifications() async {
    const androidInit =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosInit = DarwinInitializationSettings(
      requestAlertPermission: false, // already handled by FirebaseMessaging
      requestBadgePermission: false,
      requestSoundPermission: false,
    );
    const init = InitializationSettings(android: androidInit, iOS: iosInit);

    await _localNotifications.initialize(
      init,
      onDidReceiveNotificationResponse: (resp) {
        if (resp.payload == null) return;
        // Payload is JSON-encoded data map from the RemoteMessage.
        _handleTapFromPayload(resp.payload!);
      },
    );

    // Create the Android channel (no-op if already exists).
    await _localNotifications
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(_androidChannel);
  }

  Future<void> _registerToken(String token) async {
    try {
      final platform = Platform.isAndroid
          ? 'android'
          : Platform.isIOS
              ? 'ios'
              : 'unknown';
      final ds = _ref.read(userDataSourceProvider);
      await ds.registerPushToken(token: token, platform: platform);
      _log('token registered');
    } catch (e) {
      _log('registerToken error: $e');
    }
  }

  void _onForegroundMessage(RemoteMessage message) {
    final n = message.notification;
    _log('foreground msg: type=${message.data['type']}, title=${n?.title}, body=${n?.body}');
    if (n == null) return; // data-only — stay silent

    // Skip system notification for chat messages when app is in foreground —
    // the InAppNotificationService shows a slide-down banner instead.
    final type = (message.data['type'] as String?)?.toLowerCase();
    if (type == 'chat_message' || type == 'room_message') {
      _log('foreground msg suppressed (in-app banner handles it)');
      return;
    }

    _log('showing local notification: "${n.title}"');
    final payload = _encodeData(message.data);

    _localNotifications.show(
      n.hashCode,
      n.title ?? 'Obidient Movement',
      n.body ?? '',
      NotificationDetails(
        android: AndroidNotificationDetails(
          _androidChannel.id,
          _androidChannel.name,
          channelDescription: _androidChannel.description,
          importance: Importance.high,
          priority: Priority.high,
          icon: '@mipmap/ic_launcher',
        ),
        iOS: const DarwinNotificationDetails(
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
        ),
      ),
      payload: payload,
    );
  }

  void _handleTap(RemoteMessage message) {
    _log('tap: ${message.data}');
    _routeFromData(Map<String, dynamic>.from(message.data));
  }

  void _handleTapFromPayload(String payload) {
    final data = _decodeData(payload);
    _routeFromData(data);
  }

  void _routeFromData(Map<String, dynamic> data) {
    final type = (data['type'] as String?)?.toLowerCase();
    final broadcastId = data['broadcastId'] as String? ??
        data['feedId'] as String? ??
        data['id'] as String?;

    final ctx = rootNavigatorKey.currentContext;
    if (ctx == null) {
      _log('no navigator context — dropping tap');
      return;
    }

    switch (type) {
      case 'broadcast':
      case 'feed':
      case 'adminbroadcast':
      case 'admin_broadcast':
      case 'votingblocbroadcast':
      case 'votingbloc_broadcast':
      case 'announcement':
      case 'notification':
        final qp = <String, String>{'tab': 'alerts'};
        if (broadcastId != null) qp['openId'] = broadcastId;
        final uri = Uri(path: '/feeds', queryParameters: qp);
        ctx.go(uri.toString());
        break;
      case 'blog_post':
        final slug = data['slug'] as String?;
        if (slug != null && slug.isNotEmpty) {
          ctx.go('/feeds?tab=news&slug=$slug');
        } else {
          ctx.go('/feeds?tab=news');
        }
        break;
      case 'designation':
        ctx.go('/state-dashboard');
        break;
      case 'chat_message':
        final convId = data['conversationId'] as String?;
        if (convId != null && convId.isNotEmpty) {
          ctx.go('/chat/$convId');
        } else {
          ctx.go('/chat');
        }
        break;
      case 'room_message':
        final roomId = data['roomId'] as String?;
        if (roomId != null && roomId.isNotEmpty) {
          ctx.go('/chat/room/$roomId');
        } else {
          ctx.go('/chat');
        }
        break;
      case 'message':
      case 'leadership_message':
      case 'message_response':
        ctx.go('/chat');
        break;
      default:
        ctx.go('/home');
    }
  }

  void _invalidateFeeds() {
    // Bust both Home-recent + Alerts providers so new push content shows up.
    try {
      // ignore: avoid_dynamic_calls
      _ref.invalidate(recentNotificationsProvider);
    } catch (_) {}
  }

  // ──────────────────────────────────────────────────────────
  // Payload encoding (keep tiny — data: Map<String, dynamic>)
  // ──────────────────────────────────────────────────────────

  String _encodeData(Map<String, dynamic> data) {
    // Simple "k=v;k=v" encoding — FCM data values are always strings,
    // so we skip JSON to avoid nested escaping headaches.
    return data.entries
        .map((e) =>
            '${Uri.encodeComponent(e.key)}=${Uri.encodeComponent(e.value.toString())}')
        .join('&');
  }

  Map<String, dynamic> _decodeData(String payload) {
    final result = <String, dynamic>{};
    for (final part in payload.split('&')) {
      if (part.isEmpty) continue;
      final i = part.indexOf('=');
      if (i < 0) continue;
      final k = Uri.decodeComponent(part.substring(0, i));
      final v = Uri.decodeComponent(part.substring(i + 1));
      result[k] = v;
    }
    return result;
  }

  void _log(String msg) {
    if (kDebugMode) {
      // ignore: avoid_print
      print('[FCM] $msg');
    }
  }
}

/// Provider exposing the singleton service. Reads datasources via [_ref].
final pushNotificationServiceProvider =
    Provider<PushNotificationService>((ref) {
  return PushNotificationService.of(ref);
});
