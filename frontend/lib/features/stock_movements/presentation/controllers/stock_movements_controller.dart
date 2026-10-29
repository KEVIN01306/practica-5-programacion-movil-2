import 'package:flutter/cupertino.dart';
import '../../../products/domain/products_repository.dart';
import '../../../products/infrastructure/products_repository_impl.dart';
import '../../domain/stock_movement_model.dart';
import '../../domain/stock_movements_repository.dart';
import '../../infrastructure/stock_movements_repository_impl.dart';

class StockMovementsController extends ChangeNotifier {
  final StockMovementsRepository _repository;
  final ProductsRepository _productsRepository;

  bool _isLoading = false;
  String? _errorMessage;
  List<StockMovement> _movements = [];
  int _total = 0;

  MovementType? _selectedType;
  DateTime? _startDate;
  DateTime? _endDate;
  String? _selectedProductId;

  StockMovementsController({
    StockMovementsRepository? repository,
    ProductsRepository? productsRepository,
  })  : _repository = repository ?? StockMovementsRepositoryImpl(),
        _productsRepository = productsRepository ?? ProductsRepositoryImpl();

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  List<StockMovement> get movements => _movements;
  int get total => _total;
  MovementType? get selectedType => _selectedType;
  DateTime? get startDate => _startDate;
  DateTime? get endDate => _endDate;
  String? get selectedProductId => _selectedProductId;

  Future<void> loadMovements({bool refresh = false}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await _repository.listMovements(
        page: 1,
        limit: 100,
        type: _selectedType,
        startDate: _startDate,
        endDate: _endDate,
        productId: _selectedProductId,
      );

      _movements = result.movements;
      _total = result.total;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString();
      notifyListeners();
    }
  }

  void setTypeFilter(MovementType? type) {
    _selectedType = type;
    loadMovements();
  }

  void setDateRange(DateTime? start, DateTime? end) {
    _startDate = start;
    _endDate = end;
    loadMovements();
  }

  void setProductFilter(String? productId) {
    _selectedProductId = productId;
    loadMovements();
  }

  Future<StockMovement> registerMovement({
    required String productId,
    required MovementType type,
    required int quantity,
    required String reason,
    String? notes,
  }) async {
    final movement = await _repository.registerMovement(
      productId: productId,
      type: type,
      quantity: quantity,
      reason: reason,
      notes: notes,
    );
    await loadMovements();
    return movement;
  }

  Future<String> generateInventoryCsv() async {
    final result = await _productsRepository.getProducts(page: 1, limit: 1000);
    final products = result.products;

    final buffer = StringBuffer();
    // CSV Header
    buffer.writeln('"Código","Nombre","Categoría","Precio Compra","Precio Venta","Stock Actual","Stock Mínimo","Alerta Stock"');

    for (final p in products) {
      final code = p.code.replaceAll('"', '""');
      final name = p.name.replaceAll('"', '""');
      final cat = (p.categoryName ?? '').replaceAll('"', '""');
      final cost = p.costPrice.toStringAsFixed(2);
      final sale = p.salePrice.toStringAsFixed(2);
      final stock = p.currentStock;
      final min = p.minStock;
      final alert = p.isLowStock ? 'STOCK_BAJO' : 'OPTIMO';

      buffer.writeln('"$code","$name","$cat","$cost","$sale","$stock","$min","$alert"');
    }

    return buffer.toString();
  }

  String generateMovementsCsv() {
    final buffer = StringBuffer();
    // CSV Header
    buffer.writeln('"Fecha","Tipo","Producto","Código","Cantidad","Stock Anterior","Stock Resultante","Motivo","Justificación / Notas","Responsable"');

    for (final m in _movements) {
      final date = m.createdAt.toIso8601String();
      final type = m.type.value;
      final prod = (m.productName ?? m.productId).replaceAll('"', '""');
      final code = (m.productCode ?? '').replaceAll('"', '""');
      final qty = m.quantity;
      final prev = m.previousStock;
      final res = m.resultingStock;
      final reason = m.reason.replaceAll('"', '""');
      final notes = (m.notes ?? '').replaceAll('"', '""');
      final user = (m.userName ?? m.userId).replaceAll('"', '""');

      buffer.writeln('"$date","$type","$prod","$code","$qty","$prev","$res","$reason","$notes","$user"');
    }

    return buffer.toString();
  }
}
