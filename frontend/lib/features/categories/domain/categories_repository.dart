import 'category_model.dart';

abstract class CategoriesRepository {
  Future<List<Category>> getCategories();
  Future<Category> createCategory({
    required String name,
    String? description,
  });
}
