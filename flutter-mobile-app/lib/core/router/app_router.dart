import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/presentation/providers/auth_providers.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/signup_screen.dart';
import '../../features/auth/presentation/screens/forgot_password_screen.dart';
import '../../features/auth/presentation/screens/verify_email_screen.dart';
import '../../features/auth/presentation/screens/welcome_screen.dart';
import '../../features/dashboard/presentation/screens/main_shell.dart';
import '../../features/dashboard/presentation/screens/home_screen.dart';
import '../../features/feeds/presentation/screens/feeds_screen.dart';
import '../../features/feeds/data/models/blog_post.dart';
import '../../features/chat/presentation/screens/chat_screen.dart';
import '../../features/chat/presentation/screens/chat_detail_screen.dart';
import '../../features/chat/presentation/screens/room_chat_screen.dart';
import '../../features/chat/presentation/widgets/user_profile_sheet.dart';
import '../../features/voting_blocs/presentation/screens/blocs_screen.dart';
import '../../features/voting_blocs/presentation/screens/leaderboard_screen.dart';
import '../../features/profile/presentation/screens/profile_screen.dart';
import '../../features/profile/presentation/screens/member_card_screen.dart';
import '../../features/profile/presentation/screens/chat_privacy_settings_screen.dart';
import '../../features/profile/presentation/screens/blocked_users_screen.dart';
import '../../features/state_dashboard/presentation/screens/state_dashboard_screen.dart';
import '../../features/state_dashboard/presentation/screens/assign_coordinator_screen.dart';
import '../../features/state_dashboard/presentation/screens/my_team_screen.dart';
import '../../features/profile/presentation/screens/profile_completion_screen.dart';
import '../../features/profile/presentation/screens/profile_edit_screen.dart';
import '../../features/profile/presentation/screens/email_change_screen.dart';
import '../../features/kyc/presentation/screens/kyc_flow_screen.dart';
import '../../features/common/presentation/screens/in_app_webview_screen.dart';

/// Routes that don't require authentication.
const _publicPaths = {'/welcome', '/login', '/signup', '/forgot-password', '/verify-email'};

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();

/// Exposed for services (e.g. PushNotificationService) that need to
/// navigate from outside the widget tree.
GlobalKey<NavigatorState> get rootNavigatorKey => _rootNavigatorKey;

final routerProvider = Provider<GoRouter>((ref) {
  final isLoggedIn = ref.watch(isLoggedInProvider);
  final user = ref.watch(currentUserProvider);

  // Profile is complete when all required fields are filled (client-side check).
  // Server's profileCompletionPercentage uses legacy columns so we can't rely on it.
  final isProfileComplete = user?.isProfileComplete ?? false;

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/welcome',
    redirect: (context, state) {
      final isPublic = _publicPaths.contains(state.matchedLocation);
      final isCompletionRoute = state.matchedLocation == '/profile/complete';

      if (!isLoggedIn && !isPublic) return '/welcome';
      if (isLoggedIn && isPublic) {
        return isProfileComplete ? '/home' : '/profile/complete';
      }
      // Force profile completion for authenticated users
      if (isLoggedIn && !isProfileComplete && !isCompletionRoute) {
        return '/profile/complete';
      }
      // Already complete — don't let them go back to the completion screen
      if (isLoggedIn && isProfileComplete && isCompletionRoute) {
        return '/home';
      }
      return null;
    },
    routes: [
      // ── Auth routes (no shell) ────────────────────────────────
      GoRoute(
        path: '/welcome',
        builder: (context, state) => const WelcomeScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/signup',
        builder: (context, state) => const SignupScreen(),
      ),
      GoRoute(
        path: '/forgot-password',
        builder: (context, state) => const ForgotPasswordScreen(),
      ),
      GoRoute(
        path: '/verify-email',
        builder: (context, state) {
          final email = state.uri.queryParameters['email'] ?? '';
          return VerifyEmailScreen(email: email);
        },
      ),

      // ── Profile Completion (blocking, no shell) ────────────────
      GoRoute(
        path: '/profile/complete',
        builder: (context, state) => const ProfileCompletionScreen(),
      ),

      // ── Main app with bottom nav ─────────────────────────────
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(
            path: '/home',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: HomeScreen(),
            ),
          ),
          GoRoute(
            path: '/feeds',
            pageBuilder: (context, state) {
              final tab = state.uri.queryParameters['tab'];
              final openId = state.uri.queryParameters['openId'];
              final idx = tab == 'alerts' ? 1 : 0;
              return NoTransitionPage(
                child: FeedsScreen(
                  initialTabIndex: idx,
                  openBroadcastId: openId,
                ),
              );
            },
          ),
          GoRoute(
            path: '/chat',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: ChatScreen(),
            ),
          ),
          GoRoute(
            path: '/blocs',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: BlocsScreen(),
            ),
          ),
          GoRoute(
            path: '/leaderboard',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: LeaderboardScreen(),
            ),
          ),
          GoRoute(
            path: '/profile',
            pageBuilder: (context, state) => const NoTransitionPage(
              child: ProfileScreen(),
            ),
          ),
        ],
      ),

      // ── Member card (full-screen, no bottom nav) ─────────────
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: '/member-card',
        builder: (context, state) => const MemberCardScreen(),
      ),

      // ── Blog detail (full-screen, no bottom nav) ─────────────
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: '/feeds/blog/:blogId',
        builder: (context, state) {
          final post = state.extra as BlogPost;
          return BlogDetailPage(post: post);
        },
      ),

      // ── Chat Privacy Settings ────────────────────────────────
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: '/settings/chat-privacy',
        builder: (context, state) => const ChatPrivacySettingsScreen(),
      ),

      // ── KYC Verification ─────────────────────────────────────
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: '/settings/kyc',
        builder: (context, state) => const KycFlowScreen(),
      ),
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: '/settings/blocked-users',
        builder: (context, state) => const BlockedUsersScreen(),
      ),

      // ── In-app WebView ───────────────────────────────────────
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: '/webview',
        builder: (context, state) {
          final url = state.uri.queryParameters['url'] ?? '';
          final title = state.uri.queryParameters['title'];
          return InAppWebViewScreen(url: url, title: title);
        },
      ),

      // ── Profile Edit (full-screen) ───────────────────────────
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: '/profile/edit',
        builder: (context, state) => const ProfileEditScreen(),
      ),
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: '/profile/email-change',
        builder: (context, state) => const EmailChangeScreen(),
      ),

      // ── State Dashboard (full-screen, no bottom nav) ──────────
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: '/state-dashboard',
        builder: (context, state) => const StateDashboardScreen(),
      ),
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: '/assign-coordinator',
        builder: (context, state) => const AssignCoordinatorScreen(),
      ),
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: '/my-team',
        builder: (context, state) => const MyTeamScreen(),
      ),

      // ── Chat detail (full-screen, no bottom nav) ─────────────
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: '/chat/room/:roomId',
        builder: (context, state) => RoomChatScreen(
          roomId: state.pathParameters['roomId']!,
        ),
      ),
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: '/chat/new/:participantId',
        builder: (context, state) {
          final profile = state.extra as ChatUserProfile?;
          return ChatDetailScreen(
            participantId: state.pathParameters['participantId']!,
            participantInfo: profile,
          );
        },
      ),
      GoRoute(
        parentNavigatorKey: _rootNavigatorKey,
        path: '/chat/:conversationId',
        builder: (context, state) => ChatDetailScreen(
          conversationId: state.pathParameters['conversationId']!,
        ),
      ),
    ],
  );
});
