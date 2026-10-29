import 'package:flutter/cupertino.dart';

class AppCupertinoTheme {
  static const Color primaryColor = Color(0xFF1A73E8); // Google Blue 600
  static const Color secondaryColor = Color(0xFF5F6368); // Google Grey 700

  // Colores de estado corporativos
  static const Color successColor = Color(0xFF1E8E3E); // Google Green 600
  static const Color warningColor = Color(0xFFF9AB00); // Google Yellow 700
  static const Color dangerColor = Color(0xFFD93025); // Google Red 600

  // Fondos y superficies neutras
  static const Color scaffoldBackground = Color(0xFFF8F9FA); // Google Grey 50
  static const Color cardBackground = CupertinoColors.white;
  static const Color separatorColor = Color(0xFFDADCE0); // Google Grey 300

  // Textos sobrios Google
  static const Color textPrimary = Color(0xFF202124); // Google Grey 900
  static const Color textSecondary = Color(0xFF5F6368); // Google Grey 700

  static const CupertinoThemeData themeData = CupertinoThemeData(
    brightness: Brightness.light,
    primaryColor: primaryColor,
    primaryContrastingColor: CupertinoColors.white,
    scaffoldBackgroundColor: scaffoldBackground,
    barBackgroundColor: cardBackground,
    textTheme: CupertinoTextThemeData(
      primaryColor: textPrimary,
      textStyle: TextStyle(
        fontFamily:
            'Roboto', // Sustituir por 'Google Sans' si está en tus assets
        fontSize: 15.0,
        letterSpacing: 0.2,
        color: textPrimary,
      ),
      navTitleTextStyle: TextStyle(
        fontFamily: 'Roboto',
        fontSize: 17.0,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.15,
        color: textPrimary,
      ),
      navLargeTitleTextStyle: TextStyle(
        fontFamily: 'Roboto',
        fontSize: 26.0,
        fontWeight: FontWeight.w500,
        letterSpacing: -0.2,
        color: textPrimary,
      ),
      navActionTextStyle: TextStyle(
        fontFamily: 'Roboto',
        fontSize: 15.0,
        fontWeight: FontWeight.w500,
        color: primaryColor,
      ),
      actionTextStyle: TextStyle(
        fontFamily: 'Roboto',
        fontSize: 15.0,
        fontWeight: FontWeight.w500,
        color: primaryColor,
      ),
      tabLabelTextStyle: TextStyle(
        fontFamily: 'Roboto',
        fontSize: 11.0,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.3,
      ),
    ),
  );
}
