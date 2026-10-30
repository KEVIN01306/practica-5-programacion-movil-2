import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/api_client.dart';
import '../domain/category_model.dart';
import '../domain/categories_repository.dart';

class CategoriesRepositoryImpl implements CategoriesRepository {
  final ApiClient _apiClient = ApiClient.instance;

  @override
  Future<List<Category>> getCategories() async {
    final response = await _apiClient.get(ApiEndpoints.categories);
    final rawList = response.data;
    if (rawList is List) {
      return rawList
          .whereType<Map<String, dynamic>>()
          .map((json) => Category.fromJson(json))
          .toList();
    }
    return [];
  }

  @override
  Future<Category> createCategory({
    required String name,
    String? description,
  }) async {
    final response = await _apiClient.post(
      ApiEndpoints.categories,
      body: {
        'name': name.trim(),
        if (description != null && description.trim().isNotEmpty)
          'description': description.trim(),
      },
    );

    final data = response.data;
    if (data is Map<String, dynamic>) {
      return Category.fromJson(data);
    }

    throw ApiException(
      'Respuesta inesperada al crear la categoría',
      statusCode: 500,
    );
  }
}
