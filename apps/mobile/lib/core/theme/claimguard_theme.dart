import 'package:flutter/material.dart';

class ClaimGuardTheme {
  // Brand Color Palette (Section 22)
  static const Color brandOrange = Color(0xFFF97316);
  static const Color brandOrangeLight = Color(0xFFFDBA74);
  static const Color slateDark = Color(0xFF0F172A);
  static const Color slateSecondary = Color(0xFF334155);
  static const Color slateMuted = Color(0xFF64748B);
  static const Color slateBorder = Color(0xFFCBD5E1);
  static const Color canvasOffWhite = Color(0xFFF8FAFC);
  static const Color surfaceWhite = Color(0xFFFFFFFF);

  // Status & Risk Palette (Evidence-based)
  static const Color riskLow = Color(0xFF15803D); // Forest Green
  static const Color riskLowBg = Color(0xFFDCFCE7);
  static const Color riskMedium = Color(0xFFD97706); // Amber
  static const Color riskMediumBg = Color(0xFFFEF3C7);
  static const Color riskHigh = Color(0xFFDC2626); // Crimson
  static const Color riskHighBg = Color(0xFFFEE2E2);
  static const Color riskCritical = Color(0xFF7F1D1D); // Dark Wine
  static const Color riskCriticalBg = Color(0xFFFEE2E2);

  // 8-Point Grid Spacing Tokens (Section 24)
  static const double space4 = 4.0;
  static const double space8 = 8.0;
  static const double space12 = 12.0;
  static const double space16 = 16.0;
  static const double space24 = 24.0;
  static const double space32 = 32.0;
  static const double space48 = 48.0;

  // Minimum Touch Target
  static const double minTouchTarget = 48.0;

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: const ColorScheme(
        brightness: Brightness.light,
        primary: brandOrange,
        onPrimary: surfaceWhite,
        secondary: slateSecondary,
        onSecondary: surfaceWhite,
        error: riskHigh,
        onError: surfaceWhite,
        surface: canvasOffWhite,
        onSurface: slateDark,
      ),
      scaffoldBackgroundColor: canvasOffWhite,
      fontFamily: 'Roboto',
      appBarTheme: const AppBarTheme(
        backgroundColor: surfaceWhite,
        foregroundColor: slateDark,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: slateDark,
          fontSize: 18,
          fontWeight: FontWeight.w700,
          letterSpacing: -0.2,
        ),
      ),
      cardTheme: CardThemeData(
        color: surfaceWhite,
        elevation: 1,
        shadowColor: slateDark.withAlpha(15),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: slateBorder, width: 1.0),
        ),
        margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 0),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: brandOrange,
          foregroundColor: surfaceWhite,
          minimumSize: const Size(double.infinity, 50),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          textStyle: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.2,
          ),
          elevation: 0,
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: slateDark,
          minimumSize: const Size(double.infinity, 50),
          side: const BorderSide(color: slateBorder, width: 1.5),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          textStyle: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surfaceWhite,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: slateBorder, width: 1.0),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: slateBorder, width: 1.0),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: brandOrange, width: 2.0),
        ),
        labelStyle: const TextStyle(color: slateMuted, fontSize: 14),
        hintStyle: const TextStyle(color: slateMuted, fontSize: 14),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: surfaceWhite,
        selectedItemColor: brandOrange,
        unselectedItemColor: slateMuted,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
        selectedLabelStyle: TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
        unselectedLabelStyle: TextStyle(fontSize: 11, fontWeight: FontWeight.w500),
      ),
    );
  }
}
