import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

const _kThemeModeKey = 'app_theme_mode';

/// Persisted theme mode: system (default), light, or dark.
class ThemeModeNotifier extends StateNotifier<ThemeMode> {
  final FlutterSecureStorage _storage;

  ThemeModeNotifier(this._storage) : super(ThemeMode.system) {
    _load();
  }

  Future<void> _load() async {
    final stored = await _storage.read(key: _kThemeModeKey);
    if (stored == 'light') {
      state = ThemeMode.light;
    } else if (stored == 'dark') {
      state = ThemeMode.dark;
    } else {
      state = ThemeMode.system;
    }
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    state = mode;
    final value = mode == ThemeMode.light
        ? 'light'
        : mode == ThemeMode.dark
            ? 'dark'
            : 'system';
    await _storage.write(key: _kThemeModeKey, value: value);
  }
}

final themeModeProvider =
    StateNotifierProvider<ThemeModeNotifier, ThemeMode>((ref) {
  return ThemeModeNotifier(const FlutterSecureStorage());
});
