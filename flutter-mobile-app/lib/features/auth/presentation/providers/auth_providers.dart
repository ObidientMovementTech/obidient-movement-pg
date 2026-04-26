import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/api_client.dart';
import '../../../../core/network/api_exceptions.dart';
import '../../../../core/storage/secure_storage.dart';
import '../../../../core/services/socket_service.dart';
import '../../data/datasources/auth_remote_datasource.dart';
import '../../data/models/user.dart';

// ─── Singletons ─────────────────────────────────────────────

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient(
    onUnauthorized: () {
      SecureStorage.clearAll();
      ref.read(authStateProvider.notifier).state =
          const AuthState.unauthenticated();
    },
  );
});

final authDataSourceProvider = Provider((ref) {
  return AuthDataSource(ref.watch(apiClientProvider));
});

// ─── Auth State ─────────────────────────────────────────────

sealed class AuthState {
  const AuthState();
  const factory AuthState.initial() = AuthInitial;
  const factory AuthState.authenticated(User user) = Authenticated;
  const factory AuthState.unauthenticated() = Unauthenticated;
}

class AuthInitial extends AuthState {
  const AuthInitial();
}

class Authenticated extends AuthState {
  final User user;
  const Authenticated(this.user);
}

class Unauthenticated extends AuthState {
  const Unauthenticated();
}

final authStateProvider = StateProvider<AuthState>(
  (_) => const AuthState.initial(),
);

/// Whether the user is currently authenticated (used by router guard).
final isLoggedInProvider = Provider<bool>((ref) {
  return ref.watch(authStateProvider) is Authenticated;
});

/// The current user (null if not authenticated).
final currentUserProvider = Provider<User?>((ref) {
  final state = ref.watch(authStateProvider);
  return state is Authenticated ? state.user : null;
});

// ─── Auth Actions ───────────────────────────────────────────

final authActionsProvider = Provider((ref) => AuthActions(ref));

class AuthActions {
  final Ref _ref;

  AuthActions(this._ref);

  AuthDataSource get _ds => _ref.read(authDataSourceProvider);

  /// Try to restore session from stored token.
  Future<void> tryRestoreSession() async {
    final token = await SecureStorage.getToken();
    if (token == null) {
      _ref.read(authStateProvider.notifier).state =
          const AuthState.unauthenticated();
      return;
    }
    try {
      final user = await _ds.getCurrentUser();
      _ref.read(authStateProvider.notifier).state =
          AuthState.authenticated(user);
      // Connect socket after session restore
      SocketService.instance.connect();
    } on ApiException {
      await SecureStorage.clearAll();
      _ref.read(authStateProvider.notifier).state =
          const AuthState.unauthenticated();
    }
  }

  /// Login with email/phone + password.
  /// Returns the raw LoginResponse so UI can handle 2FA / unverified states.
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final res = await _ds.login(email: email, password: password);

    if (res.requires2FA) {
      return {
        'requires2FA': true,
        'tempToken': res.tempToken,
        'email': res.email,
      };
    }

    // Persist token + fetch full user profile.
    if (res.token != null) {
      await SecureStorage.setToken(res.token!);
      if (res.refreshToken != null) {
        await SecureStorage.setRefreshToken(res.refreshToken!);
      }
      // Login response contains a limited user. Fetch the full profile
      // via /auth/me so all fields (image, voting location, kyc, etc.) are present.
      try {
        final fullUser = await _ds.getCurrentUser();
        _ref.read(authStateProvider.notifier).state =
            AuthState.authenticated(fullUser);
      } on ApiException {
        if (res.user != null) {
          _ref.read(authStateProvider.notifier).state =
              AuthState.authenticated(res.user!);
        }
      }
      SocketService.instance.connect();
    }

    return {'success': true};
  }

  /// Complete 2FA verification.
  Future<void> verify2FA({
    required String tempToken,
    required String code,
  }) async {
    final res = await _ds.verify2FA(tempToken: tempToken, code: code);
    if (res.token != null) {
      await SecureStorage.setToken(res.token!);
      if (res.refreshToken != null) {
        await SecureStorage.setRefreshToken(res.refreshToken!);
      }
      try {
        final fullUser = await _ds.getCurrentUser();
        _ref.read(authStateProvider.notifier).state =
            AuthState.authenticated(fullUser);
      } on ApiException {
        if (res.user != null) {
          _ref.read(authStateProvider.notifier).state =
              AuthState.authenticated(res.user!);
        }
      }
      SocketService.instance.connect();
    }
  }

  /// Register new account.
  Future<void> register({
    required String name,
    required String email,
    required String phone,
    required String password,
    String? countryCode,
    String? votingState,
    String? votingLGA,
    String? votingWard,
  }) async {
    await _ds.register(
      name: name,
      email: email,
      phone: phone,
      password: password,
      countryCode: countryCode,
      votingState: votingState,
      votingLGA: votingLGA,
      votingWard: votingWard,
    );
  }

  /// Forgot password.
  Future<void> forgotPassword(String email) => _ds.forgotPassword(email);

  /// Reset password with OTP code.
  Future<void> resetPasswordWithOTP({
    required String email,
    required String code,
    required String newPassword,
  }) =>
      _ds.resetPasswordWithOTP(
        email: email,
        code: code,
        newPassword: newPassword,
      );

  /// Resend confirmation email.
  Future<void> resendConfirmation(String email) =>
      _ds.resendConfirmation(email);

  /// Verify email with 6-digit OTP code.
  Future<void> verifyEmailCode({
    required String email,
    required String code,
  }) async {
    final res = await _ds.verifyEmailCode(email: email, code: code);
    if (res.token != null) {
      await SecureStorage.setToken(res.token!);
      try {
        final fullUser = await _ds.getCurrentUser();
        _ref.read(authStateProvider.notifier).state =
            AuthState.authenticated(fullUser);
      } on ApiException {
        if (res.user != null) {
          _ref.read(authStateProvider.notifier).state =
              AuthState.authenticated(res.user!);
        }
      }
      SocketService.instance.connect();
    }
  }

  /// Logout.
  Future<void> logout() async {
    SocketService.instance.disconnect();
    try {
      await _ds.logout();
    } catch (_) {
      // Best-effort server logout; clear local state regardless.
    }
    await SecureStorage.clearAll();
    _ref.read(authStateProvider.notifier).state =
        const AuthState.unauthenticated();
  }
}
