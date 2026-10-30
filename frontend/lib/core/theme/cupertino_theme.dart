import 'package:flutter/cupertino.dart';

class AppCupertinoTheme {
  static const Color primaryColor = Color(0xFF1A73E8);
  static const Color secondaryColor = Color(0xFF5F6368);

  static const Color successColor = Color(0xFF1E8E3E);
  static const Color warningColor = Color(0xFFF9AB00);
  static const Color dangerColor = Color(0xFFD93025);

  static const Color scaffoldBackground = Color(0xFFF8F9FA);
  static const Color cardBackground = CupertinoColors.white;
  static const Color separatorColor = Color(0xFFDADCE0);

  static const Color textPrimary = Color(0xFF202124);
  static const Color textSecondary = Color(0xFF5F6368);

  static const CupertinoThemeData themeData = CupertinoThemeData(
    brightness: Brightness.light,
    primaryColor: primaryColor,
    primaryContrastingColor: CupertinoColors.white,
    scaffoldBackgroundColor: scaffoldBackground,
    barBackgroundColor: cardBackground,
    textTheme: CupertinoTextThemeData(
      primaryColor: textPrimary,
      textStyle: TextStyle(
        fontFamily: 'Roboto',
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
