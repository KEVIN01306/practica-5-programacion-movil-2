import 'stock_movement_model.dart';

abstract class StockMovementsRepository {
  Future<StockMovement> registerMovement({
    required String productId,
    required MovementType type,
    required int quantity,
    required String reason,
    String? notes,
  });

  Future<({List<StockMovement> movements, int total})> listMovements({
    int page = 1,
    int limit = 50,
    String? productId,
    MovementType? type,
    DateTime? startDate,
    DateTime? endDate,
  });

  Future<List<StockMovement>> getProductMovements(String productId, {int limit = 20});
}
