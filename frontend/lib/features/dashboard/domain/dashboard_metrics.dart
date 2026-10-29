import '../../products/domain/product_model.dart';
import '../../stock_movements/domain/stock_movement_model.dart';

class DashboardMetrics {
  final int totalActiveProducts;
  final int totalStockUnits;
  final double totalValuation;
  final List<Product> lowStockProducts;
  final List<StockMovement> recentMovements;

  const DashboardMetrics({
    required this.totalActiveProducts,
    required this.totalStockUnits,
    required this.totalValuation,
    required this.lowStockProducts,
    required this.recentMovements,
  });

  factory DashboardMetrics.empty() {
    return const DashboardMetrics(
      totalActiveProducts: 0,
      totalStockUnits: 0,
      totalValuation: 0.0,
      lowStockProducts: [],
      recentMovements: [],
    );
  }
}
