import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorage {
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  static const _tokenKey = 'auth_token';
  static const _refreshTokenKey = 'refresh_token';
  static const _userKey = 'user_data';

  // ── Token ──────────────────────────────────────────────────────
  static Future<String?> getToken() => _storage.read(key: _tokenKey);

  static Future<void> setToken(String token) =>
      _storage.write(key: _tokenKey, value: token);

  static Future<void> clearToken() => _storage.delete(key: _tokenKey);

  // ── Refresh Token ──────────────────────────────────────────────
  static Future<String?> getRefreshToken() =>
      _storage.read(key: _refreshTokenKey);

  static Future<void> setRefreshToken(String token) =>
      _storage.write(key: _refreshTokenKey, value: token);

  static Future<void> clearRefreshToken() =>
      _storage.delete(key: _refreshTokenKey);

  // ── User JSON ──────────────────────────────────────────────────
  static Future<String?> getUserJson() => _storage.read(key: _userKey);

  static Future<void> setUserJson(String json) =>
      _storage.write(key: _userKey, value: json);

  static Future<void> clearUserJson() => _storage.delete(key: _userKey);

  // ── Clear all ──────────────────────────────────────────────────
  static Future<void> clearAll() => _storage.deleteAll();
}
