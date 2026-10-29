import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/api_client.dart';
import '../../../core/storage/session_storage.dart';
import '../domain/auth_models.dart';
import '../domain/auth_repository.dart';

class AuthRepositoryImpl implements AuthRepository {
  final ApiClient _apiClient = ApiClient.instance;
  final SessionStorage _sessionStorage = SessionStorage.instance;

  @override
  Future<({String token, AuthUser user})> login({
    required String email,
    required String password,
  }) async {
    final response = await _apiClient.post(
      ApiEndpoints.login,
      body: {
        'email': email.trim(),
        'password': password,
      },
    );

    final data = response.data as Map<String, dynamic>;
    final token = data['accessToken'] as String;
    final userJson = data['user'] as Map<String, dynamic>;
    final user = AuthUser.fromJson(userJson);

    await _sessionStorage.saveSession(token: token, user: user);

    return (token: token, user: user);
  }

  @override
  Future<void> logout() async {
    try {
      await _apiClient.post(ApiEndpoints.logout);
    } catch (_) {
      // Ignore network errors on logout to clear local session anyway
    } finally {
      await _sessionStorage.clearSession();
    }
  }

  @override
  Future<AuthUser?> getCurrentUser() {
    if (!_sessionStorage.isAuthenticated) return Future.value(null);
    return Future.value(_sessionStorage.user);
  }
}
