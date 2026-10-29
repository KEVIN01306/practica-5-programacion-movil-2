import 'package:flutter/cupertino.dart';
import '../../../../core/theme/cupertino_theme.dart';
import '../../../../shared/widgets/cupertino_components.dart';
import '../../domain/product_model.dart';
import '../widgets/product_label_card.dart';

class ProductDetailView extends StatelessWidget {
  final Product product;
  final VoidCallback onEditProduct;
  final VoidCallback onRegisterMovement;

  const ProductDetailView({
    super.key,
    required this.product,
    required this.onEditProduct,
    required this.onRegisterMovement,
  });

  void _showExportLabelSheet(BuildContext context) {
    showCupertinoModalPopup<void>(
      context: context,
      builder: (ctx) => CupertinoActionSheet(
        title: Text('Exportar Etiqueta: ${product.name}'),
        message: Text(
          'Código: ${product.code}\nFormato de impresión listo para rotulación de bodega.',
        ),
        actions: [
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(ctx);
              showCupertinoAlert(
                context: context,
                title: 'Etiqueta Exportada',
                message: 'Se ha generado la plantilla de impresión de etiqueta con código Code 128 y QR para "${product.name}".',
              );
            },
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(CupertinoIcons.printer, size: 20),
                SizedBox(width: 8),
                Text('Enviar a Impresora Térmica / PDF'),
              ],
            ),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(ctx);
              showCupertinoAlert(
                context: context,
                title: 'Código Copiado',
                message: 'Código único "${product.code}" copiado al portapapeles.',
              );
            },
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(CupertinoIcons.doc_on_clipboard, size: 20),
                SizedBox(width: 8),
                Text('Copiar Código Único'),
              ],
            ),
          ),
        ],
        cancelButton: CupertinoActionSheetAction(
          onPressed: () => Navigator.pop(ctx),
          child: const Text('Cerrar'),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      backgroundColor: AppCupertinoTheme.scaffoldBackground,
      navigationBar: CupertinoNavigationBar(
        middle: Text(product.name),
        trailing: CupertinoButton(
          padding: EdgeInsets.zero,
          onPressed: onEditProduct,
          child: const Text('Editar'),
        ),
      ),
      child: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Product Header Card
              CupertinoCard(
                child: Column(
                  children: [
                    Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                        color: CupertinoColors.systemGrey6,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: CupertinoColors.systemGrey4),
                      ),
                      child: const Icon(
                        CupertinoIcons.cube_box_fill,
                        color: AppCupertinoTheme.primaryColor,
                        size: 40,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      product.name,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: CupertinoColors.label,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Código: ${product.code}',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: CupertinoColors.secondaryLabel,
                        letterSpacing: 1.0,
                      ),
                    ),
                    const SizedBox(height: 8),
                    product.isLowStock
                        ? CupertinoBadge.lowStock()
                        : CupertinoBadge.inStock(),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Stock Status Card
              CupertinoCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Estado de Existencias',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: CupertinoColors.label,
                      ),
                    ),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Stock Actual', style: TextStyle(fontSize: 12, color: CupertinoColors.secondaryLabel)),
                              const SizedBox(height: 4),
                              Text(
                                '${product.currentStock} uds.',
                                style: TextStyle(
                                  fontSize: 22,
                                  fontWeight: FontWeight.bold,
                                  color: product.isLowStock ? CupertinoColors.systemRed : CupertinoColors.systemGreen,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Stock Mínimo', style: TextStyle(fontSize: 12, color: CupertinoColors.secondaryLabel)),
                              const SizedBox(height: 4),
                              Text(
                                '${product.minStock} uds.',
                                style: const TextStyle(
                                  fontSize: 22,
                                  fontWeight: FontWeight.bold,
                                  color: CupertinoColors.label,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    if (product.isLowStock) ...[
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(10.0),
                        decoration: BoxDecoration(
                          color: CupertinoColors.systemRed.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(8.0),
                        ),
                        child: const Row(
                          children: [
                            Icon(CupertinoIcons.exclamationmark_triangle_fill, size: 16, color: CupertinoColors.systemRed),
                            SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Nivel de alerta: El stock actual es igual o menor al mínimo requerido.',
                                style: TextStyle(fontSize: 12, color: CupertinoColors.systemRed, fontWeight: FontWeight.w500),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Ficha Económica y Categoría
              CupertinoCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Información Comercial y Clasificación',
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: CupertinoColors.label),
                    ),
                    const SizedBox(height: 12),
                    _DetailRow(
                      label: 'Precio de Compra',
                      value: '\$${product.costPrice.toStringAsFixed(2)}',
                    ),
                    const _CupertinoDivider(),
                    _DetailRow(
                      label: 'Precio de Venta',
                      value: '\$${product.salePrice.toStringAsFixed(2)}',
                      valueColor: CupertinoColors.systemGreen,
                    ),
                    const _CupertinoDivider(),
                    _DetailRow(
                      label: 'Margen Bruto Unitario',
                      value: '\$${(product.salePrice - product.costPrice).toStringAsFixed(2)}',
                      valueColor: CupertinoColors.systemBlue,
                    ),
                    if (product.categoryName != null) ...[
                      const _CupertinoDivider(),
                      _DetailRow(
                        label: 'Categoría',
                        value: product.categoryName!,
                      ),
                    ],
                    if (product.description != null && product.description!.isNotEmpty) ...[
                      const _CupertinoDivider(),
                      const SizedBox(height: 4),
                      const Text('Descripción:', style: TextStyle(fontSize: 12, color: CupertinoColors.secondaryLabel)),
                      const SizedBox(height: 2),
                      Text(product.description!, style: const TextStyle(fontSize: 13, color: CupertinoColors.label)),
                    ],
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Modular Product Label Card (Code 128 + QR)
              ProductLabelCard(
                product: product,
                onExportTap: () => _showExportLabelSheet(context),
              ),

              const SizedBox(height: 24),

              // Register movement button
              CupertinoButton.filled(
                onPressed: onRegisterMovement,
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(CupertinoIcons.arrow_up_arrow_down_circle_fill, size: 20),
                    SizedBox(width: 8),
                    Text('Registrar Movimiento para este Producto'),
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

class _CupertinoDivider extends StatelessWidget {
  const _CupertinoDivider();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 1,
      margin: const EdgeInsets.symmetric(vertical: 6.0),
      color: CupertinoColors.separator,
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;
  final Color? valueColor;

  const _DetailRow({
    required this.label,
    required this.value,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, color: CupertinoColors.secondaryLabel)),
        Text(
          value,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: valueColor ?? CupertinoColors.label,
          ),
        ),
      ],
    );
  }
}
