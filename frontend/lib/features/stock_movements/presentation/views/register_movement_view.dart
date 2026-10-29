import 'package:flutter/cupertino.dart';
import '../../../../core/storage/session_storage.dart';
import '../../../../core/theme/cupertino_theme.dart';
import '../../../../shared/widgets/cupertino_components.dart';
import '../../../products/domain/product_model.dart';
import '../../../products/domain/products_repository.dart';
import '../../../products/infrastructure/products_repository_impl.dart';
import '../controllers/stock_movements_controller.dart';
import '../../domain/stock_movement_model.dart';
import '../widgets/movement_type_selector.dart';
import '../widgets/realtime_projection_card.dart';

class RegisterMovementView extends StatefulWidget {
  final Product? initialProduct;
  final StockMovementsController controller;
  final VoidCallback onMovementRegistered;

  const RegisterMovementView({
    super.key,
    this.initialProduct,
    required this.controller,
    required this.onMovementRegistered,
  });

  @override
  State<RegisterMovementView> createState() => _RegisterMovementViewState();
}

class _RegisterMovementViewState extends State<RegisterMovementView> {
  final ProductsRepository _productsRepository = ProductsRepositoryImpl();

  Product? _selectedProduct;
  List<Product> _availableProducts = [];
  bool _isLoadingProducts = false;

  MovementType _selectedType = MovementType.entry;

  final TextEditingController _quantityController = TextEditingController();
  final TextEditingController _countedStockController = TextEditingController();
  final TextEditingController _notesController = TextEditingController();

  String _selectedReason = 'Compra';
  bool _isSubmitting = false;
  String? _errorMessage;

  static const List<String> _entryReasons = [
    'Compra a proveedor',
    'Devolución de cliente',
    'Transferencia recibida',
    'Producción / Ensamble interno',
    'Otro ingreso',
  ];

  static const List<String> _exitReasons = [
    'Venta / Despacho',
    'Merma por vencimiento',
    'Daño / Rotura en bodega',
    'Muestra comercial / Uso interno',
    'Transferencia enviada',
    'Otra salida',
  ];

  @override
  void initState() {
    super.initState();
    _selectedProduct = widget.initialProduct;
    _quantityController.addListener(_onFieldChanged);
    _countedStockController.addListener(_onFieldChanged);
    _loadProducts();
  }

  @override
  void dispose() {
    _quantityController.dispose();
    _countedStockController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  void _onFieldChanged() {
    setState(() {});
  }

  Future<void> _loadProducts() async {
    setState(() => _isLoadingProducts = true);
    try {
      final res = await _productsRepository.getProducts(page: 1, limit: 100);
      setState(() {
        _availableProducts = res.products.where((p) => p.isActive).toList();
        _isLoadingProducts = false;
        if (_selectedProduct == null && _availableProducts.isNotEmpty) {
          _selectedProduct = _availableProducts.first;
        }
      });
    } catch (_) {
      setState(() => _isLoadingProducts = false);
    }
  }

  void _showProductPicker() {
    if (_availableProducts.isEmpty) return;

    showCupertinoModalPopup<void>(
      context: context,
      builder: (ctx) => CupertinoActionSheet(
        title: const Text('Seleccionar Producto del Inventario'),
        actions: _availableProducts.map((p) {
          return CupertinoActionSheetAction(
            isDefaultAction: p.id == _selectedProduct?.id,
            onPressed: () {
              setState(() {
                _selectedProduct = p;
                _quantityController.clear();
                _countedStockController.clear();
              });
              Navigator.pop(ctx);
            },
            child: Text('${p.name} (Cód: ${p.code} • Stock: ${p.currentStock})'),
          );
        }).toList(),
        cancelButton: CupertinoActionSheetAction(
          onPressed: () => Navigator.pop(ctx),
          child: const Text('Cancelar'),
        ),
      ),
    );
  }

  void _showReasonPicker(List<String> reasons) {
    showCupertinoModalPopup<void>(
      context: context,
      builder: (ctx) => CupertinoActionSheet(
        title: const Text('Seleccionar Motivo'),
        actions: reasons.map((r) {
          return CupertinoActionSheetAction(
            isDefaultAction: r == _selectedReason,
            onPressed: () {
              setState(() => _selectedReason = r);
              Navigator.pop(ctx);
            },
            child: Text(r),
          );
        }).toList(),
        cancelButton: CupertinoActionSheetAction(
          onPressed: () => Navigator.pop(ctx),
          child: const Text('Cancelar'),
        ),
      ),
    );
  }

  int? get _projectedStock {
    if (_selectedProduct == null) return null;
    final current = _selectedProduct!.currentStock;

    if (_selectedType == MovementType.entry) {
      final qty = int.tryParse(_quantityController.text.trim());
      if (qty == null || qty <= 0) return current;
      return current + qty;
    } else if (_selectedType == MovementType.exit) {
      final qty = int.tryParse(_quantityController.text.trim());
      if (qty == null || qty <= 0) return current;
      return current - qty;
    } else {
      // Ajuste
      final counted = int.tryParse(_countedStockController.text.trim());
      if (counted == null || counted < 0) return current;
      return counted;
    }
  }

  bool get _isExitQuantityExceeded {
    if (_selectedType != MovementType.exit || _selectedProduct == null) return false;
    final qty = int.tryParse(_quantityController.text.trim());
    if (qty == null) return false;
    return qty > _selectedProduct!.currentStock;
  }

  Future<void> _validateAndConfirm() async {
    setState(() => _errorMessage = null);

    if (_selectedProduct == null) {
      setState(() => _errorMessage = 'Debes seleccionar un producto.');
      return;
    }

    int finalQuantity = 0;
    String finalReason = _selectedReason;
    final notes = _notesController.text.trim();

    if (_selectedType == MovementType.entry) {
      final qty = int.tryParse(_quantityController.text.trim());
      if (qty == null || qty <= 0) {
        setState(() => _errorMessage = 'La cantidad de Entrada debe ser mayor a 0.');
        return;
      }
      finalQuantity = qty;
    } else if (_selectedType == MovementType.exit) {
      final qty = int.tryParse(_quantityController.text.trim());
      if (qty == null || qty <= 0) {
        setState(() => _errorMessage = 'La cantidad de Salida debe ser mayor a 0.');
        return;
      }
      if (qty > _selectedProduct!.currentStock) {
        setState(() => _errorMessage = 'Operación Bloqueada: La cantidad a retirar ($qty) supera el stock disponible (${_selectedProduct!.currentStock}).');
        return;
      }
      finalQuantity = qty;
    } else {
      // Ajuste
      final counted = int.tryParse(_countedStockController.text.trim());
      if (counted == null || counted < 0) {
        setState(() => _errorMessage = 'Debes ingresar una cantidad física contada válida (mayor o igual a 0).');
        return;
      }
      if (notes.isEmpty) {
        setState(() => _errorMessage = 'La justificación es obligatoria para movimientos de Ajuste (ej. Conteo físico mensual, Merma no identificada).');
        return;
      }
      finalQuantity = counted;
      finalReason = 'Ajuste de inventario';
    }

    // Atomic Confirmation Dialog
    final user = SessionStorage.instance.user;
    final previous = _selectedProduct!.currentStock;
    final resulting = _projectedStock!;

    final confirmed = await showCupertinoConfirm(
      context: context,
      title: 'Confirmar Transacción Inmutable',
      message: 'Detalle de la operación atómica:\n\n'
          '• Producto: ${_selectedProduct!.name}\n'
          '• Tipo: ${_selectedType.value}\n'
          '• Responsable: ${user?.name ?? "Usuario actual"}\n'
          '• Stock Anterior: $previous uds.\n'
          '• Cantidad: $finalQuantity uds.\n'
          '• Stock Proyectado Resultante: $resulting uds.\n'
          '• Motivo: $finalReason\n'
          '${notes.isNotEmpty ? "• Justificación: $notes\n" : ""}\n'
          '¿Deseas confirmar y aplicar este movimiento?',
      confirmText: 'Confirmar Registro',
    );

    if (confirmed) {
      _executeMovement(finalQuantity, finalReason, notes.isEmpty ? null : notes);
    }
  }

  Future<void> _executeMovement(int quantity, String reason, String? notes) async {
    setState(() => _isSubmitting = true);

    try {
      await widget.controller.registerMovement(
        productId: _selectedProduct!.id,
        type: _selectedType,
        quantity: quantity,
        reason: reason,
        notes: notes,
      );

      setState(() => _isSubmitting = false);

      if (mounted) {
        await showCupertinoAlert(
          context: context,
          title: 'Movimiento Registrado',
          message: 'La transacción se ejecutó y las existencias físicas han sido actualizadas.',
        );
        widget.onMovementRegistered();
      }
    } catch (e) {
      setState(() {
        _isSubmitting = false;
        _errorMessage = e.toString();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final currentStock = _selectedProduct?.currentStock ?? 0;
    final projected = _projectedStock ?? currentStock;

    return CupertinoPageScaffold(
      backgroundColor: AppCupertinoTheme.scaffoldBackground,
      navigationBar: const CupertinoNavigationBar(
        middle: Text('Registrar Movimiento'),
      ),
      child: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Error Banner
              if (_errorMessage != null) ...[
                Container(
                  padding: const EdgeInsets.all(12.0),
                  margin: const EdgeInsets.only(bottom: 16.0),
                  decoration: BoxDecoration(
                    color: CupertinoColors.systemRed.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(8.0),
                    border: Border.all(color: CupertinoColors.systemRed),
                  ),
                  child: Row(
                    children: [
                      const Icon(CupertinoIcons.exclamationmark_triangle_fill, color: CupertinoColors.systemRed, size: 20),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _errorMessage!,
                          style: const TextStyle(color: CupertinoColors.systemRed, fontSize: 13, fontWeight: FontWeight.w500),
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              // Modular Movement Type Selector
              MovementTypeSelector(
                selectedType: _selectedType,
                onTypeChanged: (val) {
                  setState(() {
                    _selectedType = val;
                    _errorMessage = null;
                    if (val == MovementType.entry) {
                      _selectedReason = _entryReasons.first;
                    } else if (val == MovementType.exit) {
                      _selectedReason = _exitReasons.first;
                    }
                  });
                },
              ),

              const SizedBox(height: 16),

              // Product Selector Card
              CupertinoCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Artículo a Modificar', style: TextStyle(fontSize: 12, color: CupertinoColors.secondaryLabel)),
                    const SizedBox(height: 8),
                    CupertinoButton(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                      color: CupertinoColors.systemGrey6,
                      borderRadius: BorderRadius.circular(8),
                      onPressed: _showProductPicker,
                      child: Row(
                        children: [
                          const Icon(CupertinoIcons.cube_box_fill, size: 24, color: AppCupertinoTheme.primaryColor),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  _selectedProduct?.name ?? 'Seleccionar producto...',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: CupertinoColors.label),
                                ),
                                if (_selectedProduct != null)
                                  Text(
                                    'Código: ${_selectedProduct!.code}',
                                    style: const TextStyle(fontSize: 12, color: CupertinoColors.secondaryLabel),
                                  ),
                              ],
                            ),
                          ),
                          _isLoadingProducts
                              ? const CupertinoActivityIndicator(radius: 8)
                              : const Icon(CupertinoIcons.chevron_down, size: 16, color: CupertinoColors.systemGrey),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Modular Real-Time Stock Projection Card
              RealtimeProjectionCard(
                currentStock: currentStock,
                projectedStock: projected,
                selectedType: _selectedType,
                isExitQuantityExceeded: _isExitQuantityExceeded,
              ),

              const SizedBox(height: 16),

              // Inputs based on selected type
              CupertinoCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (_selectedType == MovementType.adjust) ...[
                      const Text('Cantidad Física Contada *', style: TextStyle(fontSize: 12, color: CupertinoColors.secondaryLabel)),
                      const SizedBox(height: 6),
                      CupertinoTextField(
                        controller: _countedStockController,
                        placeholder: 'ej. 45 (nuevo stock total real contado)',
                        keyboardType: TextInputType.number,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: CupertinoColors.systemGrey6,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: CupertinoColors.systemGrey4),
                        ),
                      ),
                      const SizedBox(height: 14),

                      const Text('Justificación Obligatoria de Auditoría *', style: TextStyle(fontSize: 12, color: CupertinoColors.secondaryLabel)),
                      const SizedBox(height: 6),
                      CupertinoTextField(
                        controller: _notesController,
                        placeholder: 'ej. Conteo físico mensual / Pérdida no identificada / Ajuste anual',
                        maxLines: 3,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: CupertinoColors.systemGrey6,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: CupertinoColors.systemGrey4),
                        ),
                      ),
                    ] else ...[
                      Text(
                        _selectedType == MovementType.entry ? 'Cantidad a Ingresar *' : 'Cantidad a Retirar *',
                        style: const TextStyle(fontSize: 12, color: CupertinoColors.secondaryLabel),
                      ),
                      const SizedBox(height: 6),
                      CupertinoTextField(
                        controller: _quantityController,
                        placeholder: 'ej. 10 (unidades físicas)',
                        keyboardType: TextInputType.number,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: CupertinoColors.systemGrey6,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: _isExitQuantityExceeded ? CupertinoColors.systemRed : CupertinoColors.systemGrey4,
                          ),
                        ),
                      ),
                      const SizedBox(height: 14),

                      const Text('Motivo de la Operación *', style: TextStyle(fontSize: 12, color: CupertinoColors.secondaryLabel)),
                      const SizedBox(height: 6),
                      CupertinoButton(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                        color: CupertinoColors.systemGrey6,
                        borderRadius: BorderRadius.circular(8),
                        onPressed: () => _showReasonPicker(
                          _selectedType == MovementType.entry ? _entryReasons : _exitReasons,
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(_selectedReason, style: const TextStyle(fontSize: 14, color: CupertinoColors.label)),
                            _isLoadingProducts
                              ? const CupertinoActivityIndicator(radius: 8)
                              : const Icon(CupertinoIcons.chevron_down, size: 16, color: CupertinoColors.systemGrey),
                          ],
                        ),
                      ),
                      const SizedBox(height: 14),

                      const Text('Observaciones / Notas (Opcional)', style: TextStyle(fontSize: 12, color: CupertinoColors.secondaryLabel)),
                      const SizedBox(height: 6),
                      CupertinoTextField(
                        controller: _notesController,
                        placeholder: 'N° de Factura, lote, proveedor o cliente...',
                        maxLines: 2,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: CupertinoColors.systemGrey6,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: CupertinoColors.systemGrey4),
                        ),
                      ),
                    ],
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Confirm Button
              CupertinoButton.filled(
                onPressed: (_isSubmitting || _isExitQuantityExceeded) ? null : _validateAndConfirm,
                child: _isSubmitting
                    ? const CupertinoActivityIndicator(color: CupertinoColors.white)
                    : const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(CupertinoIcons.checkmark_shield_fill, size: 18),
                          SizedBox(width: 8),
                          Text('Confirmar y Guardar Movimiento', style: TextStyle(fontWeight: FontWeight.bold)),
                        ],
                      ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}
