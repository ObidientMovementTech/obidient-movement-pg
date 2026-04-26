import 'package:flutter/material.dart';

/// Obidient Movement brand palette.
/// Primary: Obidient green #077B32. Never use default Material blue.
class AppColors {
  AppColors._();

  // ── Brand ──────────────────────────────────────────────────────
  static const primary = Color(0xFF077B32);
  static const primaryLight = Color(0xFF0EA04A);
  static const primaryDark = Color(0xFF055E25);

  // ── Dark theme surfaces ────────────────────────────────────────
  static const background = Color(0xFF0A0A0A);
  static const surface = Color(0xFF111111);
  static const elevated = Color(0xFF1A1A1A);
  static const card = Color(0xFF151515);

  // ── Dark theme borders ─────────────────────────────────────────
  static const border = Color(0xFF262626);
  static const borderSubtle = Color(0xFF1E1E1E);
  static const borderFocus = Color(0xFF404040);

  // ── Dark theme text ────────────────────────────────────────────
  static const textPrimary = Color(0xFFF5F5F5);
  static const textSecondary = Color(0xFFA3A3A3);
  static const textMuted = Color(0xFF737373);
  static const textDisabled = Color(0xFF404040);

  // ── Semantic ───────────────────────────────────────────────────
  static const success = Color(0xFF22C55E);
  static const error = Color(0xFFEF4444);
  static const warning = Color(0xFFF59E0B);
  static const info = Color(0xFF3B82F6);

  // ── Light theme surfaces ───────────────────────────────────────
  static const lightBackground = Color(0xFFFAFAFA);
  static const lightSurface = Color(0xFFFFFFFF);
  static const lightCard = Color(0xFFFFFFFF);
  static const lightBorder = Color(0xFFE5E5E5);
  static const lightTextPrimary = Color(0xFF0A0A0A);
  static const lightTextSecondary = Color(0xFF525252);
}

// ═══════════════════════════════════════════════════════════════════
// Theme-aware color extension (provides colors not in ColorScheme)
// ═══════════════════════════════════════════════════════════════════

@immutable
class AppColorExtension extends ThemeExtension<AppColorExtension> {
  final Color textSecondary;
  final Color textMuted;
  final Color textDisabled;
  final Color elevated;
  final Color card;
  final Color borderSubtle;

  const AppColorExtension({
    required this.textSecondary,
    required this.textMuted,
    required this.textDisabled,
    required this.elevated,
    required this.card,
    required this.borderSubtle,
  });

  static const dark = AppColorExtension(
    textSecondary: AppColors.textSecondary,
    textMuted: AppColors.textMuted,
    textDisabled: AppColors.textDisabled,
    elevated: AppColors.elevated,
    card: AppColors.card,
    borderSubtle: AppColors.borderSubtle,
  );

  static const light = AppColorExtension(
    textSecondary: AppColors.lightTextSecondary,
    textMuted: Color(0xFF9CA3AF),
    textDisabled: Color(0xFFD1D5DB),
    elevated: Color(0xFFF5F5F5),
    card: AppColors.lightCard,
    borderSubtle: Color(0xFFEEEEEE),
  );

  @override
  AppColorExtension copyWith({
    Color? textSecondary,
    Color? textMuted,
    Color? textDisabled,
    Color? elevated,
    Color? card,
    Color? borderSubtle,
  }) =>
      AppColorExtension(
        textSecondary: textSecondary ?? this.textSecondary,
        textMuted: textMuted ?? this.textMuted,
        textDisabled: textDisabled ?? this.textDisabled,
        elevated: elevated ?? this.elevated,
        card: card ?? this.card,
        borderSubtle: borderSubtle ?? this.borderSubtle,
      );

  @override
  AppColorExtension lerp(covariant AppColorExtension? other, double t) {
    if (other == null) return this;
    return AppColorExtension(
      textSecondary: Color.lerp(textSecondary, other.textSecondary, t)!,
      textMuted: Color.lerp(textMuted, other.textMuted, t)!,
      textDisabled: Color.lerp(textDisabled, other.textDisabled, t)!,
      elevated: Color.lerp(elevated, other.elevated, t)!,
      card: Color.lerp(card, other.card, t)!,
      borderSubtle: Color.lerp(borderSubtle, other.borderSubtle, t)!,
    );
  }
}

/// Quick access: `context.appColors.textMuted`
extension AppColorExtensionAccess on BuildContext {
  AppColorExtension get appColors =>
      Theme.of(this).extension<AppColorExtension>()!;
}
