import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/push/push_notification_service.dart';
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'core/theme/theme_provider.dart';
import 'features/auth/presentation/providers/auth_providers.dart';
import 'shared/widgets/logo_loader.dart';

class ObidientApp extends ConsumerStatefulWidget {
  const ObidientApp({super.key});

  @override
  ConsumerState<ObidientApp> createState() => _ObidientAppState();
}

class _ObidientAppState extends ConsumerState<ObidientApp> {
  @override
  void initState() {
    super.initState();
    // Restore session from stored token on app startup.
    Future.microtask(
      () => ref.read(authActionsProvider).tryRestoreSession(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);
    final router = ref.watch(routerProvider);
    final themeMode = ref.watch(themeModeProvider);

    // Wire push notifications once user is authenticated; tear down on logout.
    ref.listen<AuthState>(authStateProvider, (previous, next) {
      final wasAuth = previous is Authenticated;
      final isAuth = next is Authenticated;
      final push = ref.read(pushNotificationServiceProvider);
      if (isAuth && !wasAuth) {
        // Fire-and-forget; service handles its own errors.
        push.init();
      } else if (!isAuth && wasAuth) {
        push.deleteTokenAndUnregister();
      }
    });

    // Show splash while checking for stored token.
    if (authState is AuthInitial) {
      return MaterialApp(
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light,
        darkTheme: AppTheme.dark,
        themeMode: themeMode,
        home: const _SplashScreen(),
      );
    }

    return MaterialApp.router(
      title: 'Obidient Movement',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      themeMode: themeMode,
      routerConfig: router,
    );
  }
}

class _SplashScreen extends StatelessWidget {
  const _SplashScreen();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: LogoLoader(size: 96),
      ),
    );
  }
}
