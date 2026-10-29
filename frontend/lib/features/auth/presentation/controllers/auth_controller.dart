import 'package:flutter/cupertino.dart';
import '../../domain/auth_models.dart';
import '../../domain/auth_repository.dart';
import '../../infrastructure/auth_repository_impl.dart';

class AuthController extends ChangeNotifier {
  final AuthRepository _repository;

  bool _isLoading = false;
  String? _errorMessage;
  AuthUser? _currentUser;

  AuthController({AuthRepository? repository})
      : _repository = repository ?? AuthRepositoryImpl();

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  AuthUser? get currentUser => _currentUser;
  bool get isAuthenticated => _currentUser != null;

  Future<void> initSession() async {
    _currentUser = await _repository.getCurrentUser();
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await _repository.login(email: email, password: password);
      _currentUser = result.user;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();
    await _repository.logout();
    _currentUser = null;
    _isLoading = false;
    notifyListeners();
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
