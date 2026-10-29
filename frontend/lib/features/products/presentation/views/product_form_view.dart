import 'package:flutter/cupertino.dart';

import '../../../../core/theme/cupertino_theme.dart';
import '../../../../shared/widgets/cupertino_components.dart';
import '../../../categories/domain/category_model.dart';
import '../../domain/product_model.dart';
import '../../domain/products_repository.dart';
import '../../infrastructure/products_repository_impl.dart';

class ProductFormView extends StatefulWidget {
  final Product? productToEdit;
  final List<Category> categories;
  final VoidCallback onSaved;

  const ProductFormView({
    super.key,
    this.productToEdit,
    required this.categories,
    required this.onSaved,
  });

  @override
  State<ProductFormView> createState() => _ProductFormViewState();
}

class _ProductFormViewState extends State<ProductFormView> {
  final ProductsRepository _repository = ProductsRepositoryImpl();

  final TextEditingController _codeController = TextEditingController();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _descController = TextEditingController();
  final TextEditingController _costPriceController = TextEditingController();
  final TextEditingController _salePriceController = TextEditingController();
  final TextEditingController _minStockController = TextEditingController();
  final TextEditingController _initialStockController = TextEditingController(
    text: '0',
  );
  final TextEditingController _imageUrlController = TextEditingController();

  String? _selectedCategoryId;
  bool _isSaving = false;
  bool _isGeneratingCode = false;
  String? _errorMessage;

  bool get isEditMode => widget.productToEdit != null;

  Future<void> _handleAutoGenerateCode() async {
    setState(() => _isGeneratingCode = true);
    try {
      final code = await _repository.generateProductCode();
      setState(() {
        _codeController.text = code;
        _isGeneratingCode = false;
      });
    } catch (_) {
      setState(() => _isGeneratingCode = false);
    }
  }

  @override
  void initState() {
    super.initState();
    if (isEditMode) {
      final p = widget.productToEdit!;
      _codeController.text = p.code;
      _nameController.text = p.name;
      _descController.text = p.description ?? '';
      _costPriceController.text = p.costPrice.toStringAsFixed(2);
      _salePriceController.text = p.salePrice.toStringAsFixed(2);
      _minStockController.text = p.minStock.toString();
      _imageUrlController.text = p.imageUrl ?? '';
      _selectedCategoryId = p.categoryId;
    } else {
      if (widget.categories.isNotEmpty) {
        _selectedCategoryId = widget.categories.first.id;
      }
    }
  }

  @override
  void dispose() {
    _codeController.dispose();
    _nameController.dispose();
    _descController.dispose();
    _costPriceController.dispose();
    _salePriceController.dispose();
    _minStockController.dispose();
    _initialStockController.dispose();
    _imageUrlController.dispose();
    super.dispose();
  }

  void _showCategoryPicker() {
    if (widget.categories.isEmpty) return;

    showCupertinoModalPopup<void>(
      context: context,
      builder: (ctx) => CupertinoActionSheet(
        title: const Text('Seleccionar Categoría'),
        actions: widget.categories
            .map(
              (cat) => CupertinoActionSheetAction(
                isDefaultAction: cat.id == _selectedCategoryId,
                onPressed: () {
                  setState(() => _selectedCategoryId = cat.id);
                  Navigator.pop(ctx);
                },
                child: Text(cat.name),
              ),
            )
            .toList(),
        cancelButton: CupertinoActionSheetAction(
          onPressed: () => Navigator.pop(ctx),
          child: const Text('Cancelar'),
        ),
      ),
    );
  }

  Future<void> _submit() async {
    setState(() => _errorMessage = null);

    final code = _codeController.text.trim();
    final name = _nameController.text.trim();
    final description = _descController.text.trim();
    final costPrice = double.tryParse(
      _costPriceController.text.replaceAll(',', '.'),
    );
    final salePrice = double.tryParse(
      _salePriceController.text.replaceAll(',', '.'),
    );
    final minStock = int.tryParse(_minStockController.text.trim());
    final initialStock = int.tryParse(_initialStockController.text.trim()) ?? 0;
    final imageUrl = _imageUrlController.text.trim().isEmpty
        ? null
        : _imageUrlController.text.trim();

    if (code.isEmpty) {
      setState(() => _errorMessage = 'El código único es obligatorio');
      return;
    }
    if (name.isEmpty) {
      setState(() => _errorMessage = 'El nombre del producto es obligatorio');
      return;
    }
    if (_selectedCategoryId == null) {
      setState(() => _errorMessage = 'Debes seleccionar una categoría');
      return;
    }
    if (costPrice == null || costPrice < 0) {
      setState(
        () => _errorMessage =
            'El precio de compra debe ser un número válido mayor o igual a 0',
      );
      return;
    }
    if (salePrice == null || salePrice < 0) {
      setState(
        () => _errorMessage =
            'El precio de venta debe ser un número válido mayor o igual a 0',
      );
      return;
    }
    if (minStock == null || minStock < 0) {
      setState(
        () => _errorMessage =
            'El stock mínimo debe ser un número entero mayor o igual a 0',
      );
      return;
    }

    setState(() => _isSaving = true);

    try {
      if (isEditMode) {
        await _repository.updateProduct(
          widget.productToEdit!.id,
          name: name,
          description: description.isEmpty ? null : description,
          categoryId: _selectedCategoryId!,
          costPrice: costPrice,
          salePrice: salePrice,
          minStock: minStock,
          imageUrl: imageUrl,
        );
      } else {
        // In create mode: check if code is duplicated before saving
        final existing = await _repository.getProductByCode(code);
        if (existing != null) {
          setState(() {
            _isSaving = false;
            _errorMessage =
                'El código "$code" ya está registrado con otro producto.';
          });
          return;
        }

        await _repository.createProduct(
          code: code,
          name: name,
          description: description.isEmpty ? null : description,
          categoryId: _selectedCategoryId!,
          costPrice: costPrice,
          salePrice: salePrice,
          minStock: minStock,
          initialStock: initialStock,
          imageUrl: imageUrl,
        );
      }

      setState(() => _isSaving = false);
      if (mounted) {
        widget.onSaved();
        Navigator.of(context).pop();
      }
    } catch (e) {
      setState(() {
        _isSaving = false;
        _errorMessage = e.toString();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final selectedCategoryName = widget.categories
        .firstWhere(
          (c) => c.id == _selectedCategoryId,
          orElse: () => Category(
            id: '',
            name: 'Seleccionar...',
            createdAt: DateTime.now(),
            updatedAt: DateTime.now(),
          ),
        )
        .name;

    return CupertinoPageScaffold(
      backgroundColor: AppCupertinoTheme.scaffoldBackground,
      navigationBar: CupertinoNavigationBar(
        middle: Text(isEditMode ? 'Editar Producto' : 'Nuevo Producto'),
        leading: CupertinoButton(
          padding: EdgeInsets.zero,
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancelar'),
        ),
        trailing: CupertinoButton(
          padding: EdgeInsets.zero,
          onPressed: _isSaving ? null : _submit,
          child: _isSaving
              ? const CupertinoActivityIndicator()
              : const Text(
                  'Guardar',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
        ),
      ),
      child: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
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
                      const Icon(
                        CupertinoIcons.exclamationmark_triangle_fill,
                        color: CupertinoColors.systemRed,
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _errorMessage!,
                          style: const TextStyle(
                            color: CupertinoColors.systemRed,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              // Card 1: Identificación y Descripción
              CupertinoCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Identificación del Artículo',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: CupertinoColors.label,
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Código único
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Código Único (Barcode / QR) *',
                          style: TextStyle(
                            fontSize: 12,
                            color: CupertinoColors.secondaryLabel,
                          ),
                        ),
                        if (!isEditMode)
                          CupertinoButton(
                            padding: EdgeInsets.zero,
                            minimumSize: Size.zero,
                            onPressed: _isGeneratingCode ? null : _handleAutoGenerateCode,
                            child: Row(
                              children: [
                                if (_isGeneratingCode)
                                  const CupertinoActivityIndicator(radius: 6)
                                else
                                  const Icon(CupertinoIcons.sparkles, size: 14),
                                const SizedBox(width: 4),
                                const Text('Generar Automático', style: TextStyle(fontSize: 12)),
                              ],
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    CupertinoTextField(
                      controller: _codeController,
                      placeholder: 'ej. PROD-100234 o Escanea código',
                      enabled: !isEditMode,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: isEditMode
                            ? CupertinoColors.systemGrey5
                            : CupertinoColors.systemGrey6,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: CupertinoColors.systemGrey4),
                      ),
                    ),
                    if (isEditMode)
                      const Padding(
                        padding: EdgeInsets.only(top: 4.0),
                        child: Text(
                          'El código único no se puede cambiar después del registro.',
                          style: TextStyle(
                            fontSize: 11,
                            color: CupertinoColors.tertiaryLabel,
                          ),
                        ),
                      ),

                    const SizedBox(height: 14),

                    // Nombre
                    const Text(
                      'Nombre del Producto *',
                      style: TextStyle(
                        fontSize: 12,
                        color: CupertinoColors.secondaryLabel,
                      ),
                    ),
                    const SizedBox(height: 6),
                    CupertinoTextField(
                      controller: _nameController,
                      placeholder: 'ej. Llave de impacto 1/2 pulgada',
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: CupertinoColors.systemGrey6,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: CupertinoColors.systemGrey4),
                      ),
                    ),

                    const SizedBox(height: 14),

                    // Categoría
                    const Text(
                      'Categoría *',
                      style: TextStyle(
                        fontSize: 12,
                        color: CupertinoColors.secondaryLabel,
                      ),
                    ),
                    const SizedBox(height: 6),
                    CupertinoButton(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 12,
                      ),
                      color: CupertinoColors.systemGrey6,
                      borderRadius: BorderRadius.circular(8),
                      onPressed: _showCategoryPicker,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            selectedCategoryName,
                            style: const TextStyle(
                              fontSize: 14,
                              color: CupertinoColors.label,
                            ),
                          ),
                          const Icon(
                            CupertinoIcons.chevron_down,
                            size: 16,
                            color: CupertinoColors.systemGrey,
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 14),

                    // Descripción
                    const Text(
                      'Descripción',
                      style: TextStyle(
                        fontSize: 12,
                        color: CupertinoColors.secondaryLabel,
                      ),
                    ),
                    const SizedBox(height: 6),
                    CupertinoTextField(
                      controller: _descController,
                      placeholder:
                          'Detalles, especificaciones o ubicación física...',
                      maxLines: 3,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: CupertinoColors.systemGrey6,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: CupertinoColors.systemGrey4),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Card 2: Precios y Existencias
              CupertinoCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Precios y Niveles de Stock',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: CupertinoColors.label,
                      ),
                    ),
                    const SizedBox(height: 12),

                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Precio Compra (\$) *',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: CupertinoColors.secondaryLabel,
                                ),
                              ),
                              const SizedBox(height: 6),
                              CupertinoTextField(
                                controller: _costPriceController,
                                placeholder: '0.00',
                                keyboardType:
                                    const TextInputType.numberWithOptions(
                                      decimal: true,
                                    ),
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: CupertinoColors.systemGrey6,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(
                                    color: CupertinoColors.systemGrey4,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Precio Venta (\$) *',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: CupertinoColors.secondaryLabel,
                                ),
                              ),
                              const SizedBox(height: 6),
                              CupertinoTextField(
                                controller: _salePriceController,
                                placeholder: '0.00',
                                keyboardType:
                                    const TextInputType.numberWithOptions(
                                      decimal: true,
                                    ),
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: CupertinoColors.systemGrey6,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(
                                    color: CupertinoColors.systemGrey4,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 14),

                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Stock Mínimo (Alerta) *',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: CupertinoColors.secondaryLabel,
                                ),
                              ),
                              const SizedBox(height: 6),
                              CupertinoTextField(
                                controller: _minStockController,
                                placeholder: 'ej. 5',
                                keyboardType: TextInputType.number,
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: CupertinoColors.systemGrey6,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(
                                    color: CupertinoColors.systemGrey4,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                isEditMode ? 'Stock Actual' : 'Stock Inicial',
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: CupertinoColors.secondaryLabel,
                                ),
                              ),
                              const SizedBox(height: 6),
                              CupertinoTextField(
                                controller: isEditMode
                                    ? TextEditingController(
                                        text:
                                            '${widget.productToEdit!.currentStock}',
                                      )
                                    : _initialStockController,
                                placeholder: '0',
                                enabled: !isEditMode,
                                keyboardType: TextInputType.number,
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: isEditMode
                                      ? CupertinoColors.systemGrey5
                                      : CupertinoColors.systemGrey6,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(
                                    color: CupertinoColors.systemGrey4,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 8),

                    if (isEditMode)
                      const Text(
                        'En modo de edición, el stock no se modifica aquí. Usa la pantalla de Movimientos para registrar Entradas, Salidas o Ajustes.',
                        style: TextStyle(
                          fontSize: 11,
                          color: CupertinoColors.systemOrange,
                        ),
                      )
                    else
                      const Text(
                        'Si ingresas un stock inicial mayor a 0, se registrará automáticamente un movimiento de "Entrada" para garantizar trazabilidad.',
                        style: TextStyle(
                          fontSize: 11,
                          color: CupertinoColors.secondaryLabel,
                        ),
                      ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Card 3: Fotografía / Imagen
              CupertinoCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Fotografía / Imagen del Producto (Opcional)',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: CupertinoColors.label,
                      ),
                    ),
                    const SizedBox(height: 12),
                    CupertinoTextField(
                      controller: _imageUrlController,
                      placeholder: 'https://ejemplo.com/foto-producto.jpg',
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: CupertinoColors.systemGrey6,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: CupertinoColors.systemGrey4),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              CupertinoButton.filled(
                onPressed: _isSaving ? null : _submit,
                child: _isSaving
                    ? const CupertinoActivityIndicator(
                        color: CupertinoColors.white,
                      )
                    : Text(
                        isEditMode
                            ? 'Actualizar Producto'
                            : 'Registrar Producto',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
