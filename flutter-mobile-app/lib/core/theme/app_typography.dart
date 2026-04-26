import 'package:google_fonts/google_fonts.dart';
import 'package:flutter/material.dart';
import 'app_colors.dart';

/// Plus Jakarta Sans — warm, modern startup feel.
class AppTypography {
  AppTypography._();

  static TextTheme get textTheme => GoogleFonts.plusJakartaSansTextTheme();

  static TextTheme buildTextTheme(TextTheme base, {required bool isDark}) {
    final muted =
        isDark ? AppColors.textMuted : AppColors.lightTextSecondary;
    return base.copyWith(
      displayLarge: base.displayLarge?.copyWith(
        fontSize: 34,
        fontWeight: FontWeight.w800,
        letterSpacing: -1.0,
        height: 1.15,
      ),
      headlineMedium: base.headlineMedium?.copyWith(
        fontSize: 24,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.5,
        height: 1.25,
      ),
      titleLarge: base.titleLarge?.copyWith(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        letterSpacing: -0.3,
      ),
      titleMedium: base.titleMedium?.copyWith(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        letterSpacing: -0.2,
      ),
      bodyLarge: base.bodyLarge?.copyWith(
        fontSize: 16,
        fontWeight: FontWeight.w400,
        height: 1.5,
      ),
      bodyMedium: base.bodyMedium?.copyWith(
        fontSize: 14,
        fontWeight: FontWeight.w400,
        height: 1.5,
        color: muted,
      ),
      bodySmall: base.bodySmall?.copyWith(
        fontSize: 12,
        fontWeight: FontWeight.w400,
        color: muted,
      ),
      labelLarge: base.labelLarge?.copyWith(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.5,
      ),
      labelSmall: base.labelSmall?.copyWith(
        fontSize: 11,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.8,
        color: muted,
      ),
    );
  }
}
