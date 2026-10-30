import 'package:flutter/cupertino.dart';

import '../../../categories/domain/categories_repository.dart';
import '../../../categories/domain/category_model.dart';
import '../../../categories/infrastructure/categories_repository_impl.dart';
import '../../domain/product_model.dart';
import '../../domain/products_repository.dart';
import '../../infrastructure/products_repository_impl.dart';

class ProductsController extends ChangeNotifier {
  final ProductsRepository _repository;
  final CategoriesRepository _categoriesRepository;

  bool _isLoading = false;
  String? _errorMessage;
  List<Product> _products = [];
  List<Category> _categories = [];
  int _total = 0;

  String _searchQuery = '';
  String? _selectedCategoryId;
  bool _filterLowStock = false;

  ProductsController({
    ProductsRepository? repository,
    CategoriesRepository? categoriesRepository,
  }) : _repository = repository ?? ProductsRepositoryImpl(),
       _categoriesRepository =
           categoriesRepository ?? CategoriesRepositoryImpl();

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  List<Product> get products => _products;
  List<Category> get categories => _categories;
  int get total => _total;
  String get searchQuery => _searchQuery;
  String? get selectedCategoryId => _selectedCategoryId;
  bool get filterLowStock => _filterLowStock;

  Future<void> init() async {
    await Future.wait([loadCategories(), loadProducts(refresh: true)]);
  }

  Future<void> loadCategories() async {
    try {
      _categories = await _categoriesRepository.getCategories();
      notifyListeners();
    } catch (_) {}
  }

  Future<Category?> createCategory({
    required String name,
    String? description,
  }) async {
    try {
      final category = await _categoriesRepository.createCategory(
        name: name,
        description: description,
      );
      await loadCategories();
      return category;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return null;
    }
  }

  Future<void> loadProducts({bool refresh = false}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await _repository.getProducts(
        page: 1,
        limit: 100,
        search: _searchQuery.isEmpty ? null : _searchQuery,
        categoryId: _selectedCategoryId,
        lowStock: _filterLowStock ? true : null,
      );

      _products = result.products;
      if (_filterLowStock) {
        _products = _products.where((p) => p.isLowStock).toList();
      }
      _total = _filterLowStock ? _products.length : result.total;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
    }
  }

  void setSearchQuery(String query) {
    _searchQuery = query;
    loadProducts();
  }

  void setSelectedCategory(String? categoryId) {
    _selectedCategoryId = categoryId;
    loadProducts();
  }

  void setFilterLowStock(bool value) {
    _filterLowStock = value;
    loadProducts();
  }

  Future<bool> deactivateProduct(Product product) async {
    try {
      await _repository.deactivateProduct(product.id);
      await loadProducts();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> checkHasMovements(String productId) async {
    return await _repository.hasMovements(productId);
  }
}
