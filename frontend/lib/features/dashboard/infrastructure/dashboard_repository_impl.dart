import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/api_client.dart';
import '../../products/domain/product_model.dart';
import '../../stock_movements/domain/stock_movement_model.dart';
import '../domain/dashboard_metrics.dart';
import '../domain/dashboard_repository.dart';

class DashboardRepositoryImpl implements DashboardRepository {
  final ApiClient _apiClient = ApiClient.instance;

  @override
  Future<DashboardMetrics> getMetrics() async {
    // 1. Fetch products
    final productsResponse = await _apiClient.get(
      ApiEndpoints.products,
      queryParams: {'limit': 100},
    );

    final rawProductsList = productsResponse.data;
    final List<Product> products = [];
    if (rawProductsList is List) {
      for (final item in rawProductsList) {
        if (item is Map<String, dynamic>) {
          products.add(Product.fromJson(item));
        }
      }
    }

    // 2. Fetch recent movements
    List<StockMovement> recentMovements = [];
    try {
      final movementsResponse = await _apiClient.get(
        ApiEndpoints.stockMovements,
        queryParams: {'limit': 5},
      );
      final rawMovementsList = movementsResponse.data;
      if (rawMovementsList is List) {
        for (final item in rawMovementsList) {
          if (item is Map<String, dynamic>) {
            recentMovements.add(StockMovement.fromJson(item));
          }
        }
      }
    } catch (_) {
      // Non-fatal if movements fail or empty
    }

    // 3. Calculate metrics
    final activeProducts = products.where((p) => p.isActive).toList();
    final totalActiveProducts = activeProducts.length;

    int totalStockUnits = 0;
    double totalValuation = 0.0;
    final List<Product> lowStockProducts = [];

    for (final p in activeProducts) {
      totalStockUnits += p.currentStock;
      totalValuation += p.currentStock * p.costPrice;
      if (p.isLowStock) {
        lowStockProducts.add(p);
      }
    }

    return DashboardMetrics(
      totalActiveProducts: totalActiveProducts,
      totalStockUnits: totalStockUnits,
      totalValuation: totalValuation,
      lowStockProducts: lowStockProducts,
      recentMovements: recentMovements,
    );
  }
}
