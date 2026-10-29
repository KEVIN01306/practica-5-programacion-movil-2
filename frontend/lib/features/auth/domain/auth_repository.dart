import 'auth_models.dart';

abstract class AuthRepository {
  Future<({String token, AuthUser user})> login({
    required String email,
    required String password,
  });

  Future<void> logout();

  Future<AuthUser?> getCurrentUser();
}
