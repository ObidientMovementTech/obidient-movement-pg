import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app.dart';

/// Top-level background FCM message handler.
/// Must be a top-level or static function annotated with `@pragma('vm:entry-point')`.
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // Keep this minimal — the system notification tray handles display.
  await Firebase.initializeApp();
  if (kDebugMode) {
    // ignore: avoid_print
    print('[FCM][bg] ${message.messageId}: ${message.data}');
  }
}

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  try {
    await Firebase.initializeApp();
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  } catch (e) {
    // Firebase config may not yet be in place (pre-flutterfire configure).
    // Continue launching; push features stay disabled until config is added.
    if (kDebugMode) {
      // ignore: avoid_print
      print('[FCM] Firebase init failed: $e');
    }
  }

  runApp(
    const ProviderScope(
      child: ObidientApp(),
    ),
  );
}
