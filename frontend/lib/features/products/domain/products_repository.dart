import 'product_model.dart';

abstract class ProductsRepository {
  Future<({List<Product> products, int total})> getProducts({
    int page = 1,
    int limit = 20,
    String? search,
    String? categoryId,
    bool? lowStock,
  });

  Future<Product> getProductById(String id);

  Future<Product?> getProductByCode(String code);

  Future<Product> createProduct({
    required String code,
    required String name,
    required String? description,
    required String categoryId,
    required double costPrice,
    required double salePrice,
    required int minStock,
    int initialStock = 0,
    String? imageUrl,
  });

  Future<Product> updateProduct(
    String id, {
    required String name,
    required String? description,
    required String categoryId,
    required double costPrice,
    required double salePrice,
    required int minStock,
    String? imageUrl,
  });

  Future<void> deactivateProduct(String id);

  Future<bool> hasMovements(String productId);

  Future<String> generateProductCode([String prefix = 'PRD']);

  Future<Map<String, dynamic>> getProductLabel(String id);
}
