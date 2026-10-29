import 'dart:io';

class ApiEndpoints {
  static String get baseUrl {
    try {
      if (Platform.isAndroid) {
        return 'http://10.0.2.2:7000/api';
      }
    } catch (_) {}
    return 'http://localhost:7000/api';
  }

  // Auth
  static const String login = '/auth/login';
  static const String refresh = '/auth/refresh';
  static const String logout = '/auth/logout';
  static const String me = '/auth/me';

  // Users
  static const String users = '/users';
  static const String userRoles = '/users/roles';
  static const String changePassword = '/users/me/password';

  // Categories
  static const String categories = '/categories';

  // Products
  static const String products = '/products';
  static const String generateProductCode = '/products/generate-code';
  static String productByCode(String code) => '/products/code/$code';
  static String productLabel(String id) => '/products/$id/label';

  // Stock Movements
  static const String stockMovements = '/stock-movements';
  static String stockMovementsByProduct(String productId) =>
      '/stock-movements/product/$productId';
}
