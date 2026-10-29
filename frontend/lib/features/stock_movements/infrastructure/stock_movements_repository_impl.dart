import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/api_client.dart';
import '../domain/stock_movement_model.dart';
import '../domain/stock_movements_repository.dart';

class StockMovementsRepositoryImpl implements StockMovementsRepository {
  final ApiClient _apiClient = ApiClient.instance;

  @override
  Future<StockMovement> registerMovement({
    required String productId,
    required MovementType type,
    required int quantity,
    required String reason,
    String? notes,
  }) async {
    final payload = {
      'productId': productId,
      'type': type.value,
      'quantity': quantity,
      'reason': reason.trim(),
      'notes': notes?.trim(),
    };

    final response = await _apiClient.post(
      ApiEndpoints.stockMovements,
      body: payload,
    );

    return StockMovement.fromJson(response.data as Map<String, dynamic>);
  }

  @override
  Future<({List<StockMovement> movements, int total})> listMovements({
    int page = 1,
    int limit = 50,
    String? productId,
    MovementType? type,
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    final queryParams = <String, dynamic>{
      'page': page,
      'limit': limit,
    };

    if (productId != null && productId.isNotEmpty) {
      queryParams['productId'] = productId;
    }
    if (type != null) {
      queryParams['type'] = type.value;
    }
    if (startDate != null) {
      queryParams['startDate'] = startDate.toIso8601String();
    }
    if (endDate != null) {
      queryParams['endDate'] = endDate.toIso8601String();
    }

    final response = await _apiClient.get(
      ApiEndpoints.stockMovements,
      queryParams: queryParams,
    );

    final List<StockMovement> list = [];
    final rawData = response.data;
    if (rawData is List) {
      for (final item in rawData) {
        if (item is Map<String, dynamic>) {
          list.add(StockMovement.fromJson(item));
        }
      }
    }

    final total = response.meta?['total'] as int? ?? list.length;
    return (movements: list, total: total);
  }

  @override
  Future<List<StockMovement>> getProductMovements(String productId, {int limit = 20}) async {
    final response = await _apiClient.get(
      ApiEndpoints.stockMovementsByProduct(productId),
      queryParams: {'limit': limit},
    );

    final List<StockMovement> list = [];
    final rawData = response.data;
    if (rawData is List) {
      for (final item in rawData) {
        if (item is Map<String, dynamic>) {
          list.add(StockMovement.fromJson(item));
        }
      }
    }
    return list;
  }
}
