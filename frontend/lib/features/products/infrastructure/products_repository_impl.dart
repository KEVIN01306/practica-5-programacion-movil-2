import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/api_client.dart';
import '../domain/product_model.dart';
import '../domain/products_repository.dart';

class ProductsRepositoryImpl implements ProductsRepository {
  final ApiClient _apiClient = ApiClient.instance;

  @override
  Future<({List<Product> products, int total})> getProducts({
    int page = 1,
    int limit = 20,
    String? search,
    String? categoryId,
    bool? lowStock,
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
    };

    if (search != null && search.trim().isNotEmpty) {
      queryParams['search'] = search.trim();
    }
    if (categoryId != null && categoryId.isNotEmpty) {
      queryParams['categoryId'] = categoryId;
    }
    if (lowStock == true) {
      queryParams['lowStock'] = 'true';
    }

    final response = await _apiClient.get(
      ApiEndpoints.products,
      queryParams: queryParams,
    );

    final List<Product> list = [];
    final rawData = response.data;
    if (rawData is List) {
      for (final item in rawData) {
        if (item is Map<String, dynamic>) {
          list.add(Product.fromJson(item));
        }
      }
    }

    final total = response.meta?['total'] as int? ?? list.length;
    return (products: list, total: total);
  }

  @override
  Future<Product> getProductById(String id) async {
    final response = await _apiClient.get('${ApiEndpoints.products}/$id');
    return Product.fromJson(response.data as Map<String, dynamic>);
  }

  @override
  Future<Product?> getProductByCode(String code) async {
    try {
      final response = await _apiClient.get(ApiEndpoints.productByCode(code.trim()));
      if (response.data != null && response.data is Map<String, dynamic>) {
        return Product.fromJson(response.data as Map<String, dynamic>);
      }
      return null;
    } on ApiException catch (e) {
      if (e.statusCode == 404) return null;
      rethrow;
    }
  }

  @override
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
  }) async {
    // 1. Create product with currentStock = 0 so that initial stock creates an entry movement
    final payload = {
      'code': code.trim(),
      'name': name.trim(),
      'description': description?.trim(),
      'categoryId': categoryId,
      'costPrice': costPrice,
      'salePrice': salePrice,
      'currentStock': 0,
      'minStock': minStock,
      'imageUrl': imageUrl,
    };

    final response = await _apiClient.post(ApiEndpoints.products, body: payload);
    var product = Product.fromJson(response.data as Map<String, dynamic>);

    // 2. If initialStock > 0, register initial ENTRY movement behind the scenes
    if (initialStock > 0) {
      try {
        await _apiClient.post(
          ApiEndpoints.stockMovements,
          body: {
            'productId': product.id,
            'type': 'ENTRY',
            'quantity': initialStock,
            'reason': 'Inventario inicial',
            'notes': 'Registro inicial automático tras creación de producto',
          },
        );

        // Fetch fresh product with updated currentStock
        product = await getProductById(product.id);
      } catch (_) {
        // Product was created, movement registration fallback
      }
    }

    return product;
  }

  @override
  Future<Product> updateProduct(
    String id, {
    required String name,
    required String? description,
    required String categoryId,
    required double costPrice,
    required double salePrice,
    required int minStock,
    String? imageUrl,
  }) async {
    final payload = {
      'name': name.trim(),
      'description': description?.trim(),
      'categoryId': categoryId,
      'costPrice': costPrice,
      'salePrice': salePrice,
      'minStock': minStock,
      'imageUrl': imageUrl,
    };

    final response = await _apiClient.put('${ApiEndpoints.products}/$id', body: payload);
    return Product.fromJson(response.data as Map<String, dynamic>);
  }

  @override
  Future<void> deactivateProduct(String id) async {
    await _apiClient.delete('${ApiEndpoints.products}/$id');
  }

  @override
  Future<bool> hasMovements(String productId) async {
    try {
      final response = await _apiClient.get(ApiEndpoints.stockMovementsByProduct(productId));
      if (response.data is List) {
        return (response.data as List).isNotEmpty;
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  @override
  Future<String> generateProductCode([String prefix = 'PRD']) async {
    final response = await _apiClient.get(
      ApiEndpoints.generateProductCode,
      queryParams: {'prefix': prefix},
    );
    final data = response.data as Map<String, dynamic>;
    return data['code'] as String;
  }

  @override
  Future<Map<String, dynamic>> getProductLabel(String id) async {
    final response = await _apiClient.get(ApiEndpoints.productLabel(id));
    return response.data as Map<String, dynamic>;
  }
}
