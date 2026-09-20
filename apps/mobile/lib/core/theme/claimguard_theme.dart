import 'package:flutter/material.dart';

class ClaimGuardTheme {
  // Brand Color Palette (Section 22 & 60/30/10 Rule)
  static const Color brandOrange = Color(0xFFF97316);
  static const Color brandOrangeHover = Color(0xFFEA580C);
  static const Color brandOrangeLight = Color(0xFFFDBA74);
  static const Color brandOrangeSurface = Color(0xFFFFF7ED); // 5% tint for highlights

  static const Color slateDark = Color(0xFF0F172A);
  static const Color slateSecondary = Color(0xFF1E293B);
  static const Color slateMuted = Color(0xFF64748B);
  static const Color slateBorder = Color(0xFFE2E8F0);
  static const Color canvasOffWhite = Color(0xFFF8FAFC);
  static const Color surfaceWhite = Color(0xFFFFFFFF);

  // Status & Risk Palette (Evidence-based)
  static const Color riskLow = Color(0xFF16A34A); // Verified green
  static const Color riskLowBg = Color(0xFFF0FDF4);
  static const Color riskLowBorder = Color(0xFFBBF7D0);

  static const Color riskMedium = Color(0xFFD97706); // Amber
  static const Color riskMediumBg = Color(0xFFFFFBEB);
  static const Color riskMediumBorder = Color(0xFFFDE68A);

  static const Color riskHigh = Color(0xFFDC2626); // Crimson
  static const Color riskHighBg = Color(0xFFFEF2F2);
  static const Color riskHighBorder = Color(0xFFFECACA);

  static const Color riskCritical = Color(0xFF991B1B);
  static const Color riskCriticalBg = Color(0xFFFEF2F2);

  static const Color infoBlue = Color(0xFF2563EB);
  static const Color infoBlueBg = Color(0xFFEFF6FF);
  static const Color infoBlueBorder = Color(0xFFBFDBFE);

  // 8-Point Grid Spacing Tokens
  static const double space4 = 4.0;
  static const double space8 = 8.0;
  static const double space12 = 12.0;
  static const double space16 = 16.0;
  static const double space20 = 20.0;
  static const double space24 = 24.0;
  static const double space32 = 32.0;
  static const double space48 = 48.0;

  // Minimum Touch Target
  static const double minTouchTarget = 48.0;

  // Modern Soft Ambient Shadows
  static List<BoxShadow> get cardShadow => [
        BoxShadow(
          color: slateDark.withAlpha(10),
          blurRadius: 10,
          offset: const Offset(0, 3),
        ),
        BoxShadow(
          color: slateDark.withAlpha(6),
          blurRadius: 2,
          offset: const Offset(0, 1),
        ),
      ];
  static List<BoxShadow> get subtleShadow => cardShadow;

  static List<BoxShadow> get floatingShadow => [
        BoxShadow(
          color: slateDark.withAlpha(18),
          blurRadius: 20,
          offset: const Offset(0, 8),
        ),
      ];

  // Gradients
  static const LinearGradient heroGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
  );

  static const LinearGradient brandGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFF97316), Color(0xFFEA580C)],
  );

  // Category Icon & Color Helper
  static IconData getCategoryIcon(String category) {
    switch (category.toUpperCase()) {
      case 'FUEL':
        return Icons.local_gas_station_rounded;
      case 'MEALS':
      case 'FOOD':
        return Icons.restaurant_rounded;
      case 'HOTEL':
      case 'LODGING':
        return Icons.hotel_rounded;
      case 'TRAVEL':
      case 'CAB':
        return Icons.directions_car_rounded;
      default:
        return Icons.receipt_long_rounded;
    }
  }

  static Color getCategoryColor(String category) {
    switch (category.toUpperCase()) {
      case 'FUEL':
        return const Color(0xFFD97706); // Amber/Orange
      case 'MEALS':
      case 'FOOD':
        return const Color(0xFFE11D48); // Rose
      case 'HOTEL':
        return const Color(0xFF7C3AED); // Purple
      case 'TRAVEL':
        return const Color(0xFF2563EB); // Blue
      default:
        return slateSecondary;
    }
  }

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
          fontWeight: FontWeight.w800,
          letterSpacing: -0.3,
        ),
      ),
      cardTheme: CardThemeData(
        color: surfaceWhite,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: slateBorder, width: 1.0),
        ),
        margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 0),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: brandOrange,
          foregroundColor: surfaceWhite,
          minimumSize: const Size(double.infinity, 52),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w700,
            letterSpacing: 0.1,
          ),
          elevation: 0,
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: slateDark,
          minimumSize: const Size(double.infinity, 50),
          side: const BorderSide(color: slateBorder, width: 1.2),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
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
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: slateBorder, width: 1.0),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: slateBorder, width: 1.0),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
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
        elevation: 12,
        selectedLabelStyle: TextStyle(fontSize: 11, fontWeight: FontWeight.w700),
        unselectedLabelStyle: TextStyle(fontSize: 11, fontWeight: FontWeight.w500),
      ),
    );
  }
}
