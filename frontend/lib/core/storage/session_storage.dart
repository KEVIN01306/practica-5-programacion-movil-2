import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../../features/auth/domain/auth_models.dart';

class SessionStorage {
  static const String _tokenKey = 'auth_access_token';
  static const String _userKey = 'auth_user_data';

  static SessionStorage? _instance;
  static SessionStorage get instance => _instance ??= SessionStorage._();

  SessionStorage._();

  String? _cachedToken;
  AuthUser? _cachedUser;

  String? get token => _cachedToken;
  AuthUser? get user => _cachedUser;
  bool get isAuthenticated => _cachedToken != null && _cachedToken!.isNotEmpty;

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _cachedToken = prefs.getString(_tokenKey);
    final userJson = prefs.getString(_userKey);
    if (userJson != null) {
      try {
        _cachedUser = AuthUser.fromJson(
          jsonDecode(userJson) as Map<String, dynamic>,
        );
      } catch (_) {
        _cachedUser = null;
      }
    }
  }

  Future<void> saveSession({
    required String token,
    required AuthUser user,
  }) async {
    _cachedToken = token;
    _cachedUser = user;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    await prefs.setString(_userKey, jsonEncode(user.toJson()));
  }

  Future<void> clearSession() async {
    _cachedToken = null;
    _cachedUser = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userKey);
  }
}
