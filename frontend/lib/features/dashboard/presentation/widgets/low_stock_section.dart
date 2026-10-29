import 'package:flutter/cupertino.dart';
import '../../../../shared/widgets/cupertino_components.dart';
import '../../../products/domain/product_model.dart';

class LowStockSection extends StatelessWidget {
  final List<Product> lowStockProducts;
  final void Function(Product product) onSelectProduct;

  const LowStockSection({
    super.key,
    required this.lowStockProducts,
    required this.onSelectProduct,
  });

  @override
  Widget build(BuildContext context) {
    final isEmpty = lowStockProducts.isEmpty;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Row(
              children: [
                const Text(
                  'Alertas de Stock Bajo',
                  style: TextStyle(
                    fontSize: 18.0,
                    fontWeight: FontWeight.bold,
                    letterSpacing: -0.3,
                    color: CupertinoColors.label,
                  ),
                ),
                if (!isEmpty) ...[
                  const SizedBox(width: 8.0),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7.0, vertical: 2.0),
                    decoration: BoxDecoration(
                      color: CupertinoColors.systemRed,
                      borderRadius: BorderRadius.circular(10.0),
                    ),
                    child: Text(
                      '${lowStockProducts.length}',
                      style: const TextStyle(
                        color: CupertinoColors.white,
                        fontSize: 11.0,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ],
            ),
            Text(
              isEmpty ? 'Al día' : 'Requiere atención',
              style: TextStyle(
                fontSize: 13.0,
                color: isEmpty ? CupertinoColors.systemGreen : CupertinoColors.systemRed,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12.0),
        if (isEmpty)
          const CupertinoCard(
            padding: EdgeInsets.symmetric(vertical: 28.0, horizontal: 16.0),
            child: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    CupertinoIcons.checkmark_shield_fill,
                    color: CupertinoColors.systemGreen,
                    size: 40.0,
                  ),
                  SizedBox(height: 10.0),
                  Text(
                    '¡Todos los productos tienen stock suficiente!',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 15.0,
                      fontWeight: FontWeight.bold,
                      color: CupertinoColors.label,
                    ),
                  ),
                  SizedBox(height: 4.0),
                  Text(
                    'Ningún artículo está en su stock mínimo o por debajo.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 13.0,
                      color: CupertinoColors.secondaryLabel,
                    ),
                  ),
                ],
              ),
            ),
          )
        else
          ...lowStockProducts.map(
            (prod) => Padding(
              padding: const EdgeInsets.only(bottom: 8.0),
              child: CupertinoCard(
                padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 12.0),
                onTap: () => onSelectProduct(prod),
                child: Row(
                  children: [
                    Container(
                      width: 40.0,
                      height: 40.0,
                      decoration: BoxDecoration(
                        color: CupertinoColors.systemRed.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(10.0),
                      ),
                      child: const Icon(
                        CupertinoIcons.exclamationmark_triangle_fill,
                        color: CupertinoColors.systemRed,
                        size: 20.0,
                      ),
                    ),
                    const SizedBox(width: 12.0),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            prod.name,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 14.0,
                              fontWeight: FontWeight.w600,
                              color: CupertinoColors.label,
                            ),
                          ),
                          const SizedBox(height: 2.0),
                          Text(
                            'Cód: ${prod.code}',
                            style: const TextStyle(
                              fontSize: 12.0,
                              color: CupertinoColors.secondaryLabel,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          'Stock: ${prod.currentStock} / Mín: ${prod.minStock}',
                          style: const TextStyle(
                            fontSize: 12.0,
                            fontWeight: FontWeight.bold,
                            color: CupertinoColors.systemRed,
                          ),
                        ),
                        const SizedBox(height: 3.0),
                        CupertinoBadge.lowStock(),
                      ],
                    ),
                    const SizedBox(width: 4.0),
                    const Icon(
                      CupertinoIcons.chevron_forward,
                      size: 16.0,
                      color: CupertinoColors.systemGrey3,
                    ),
                  ],
                ),
              ),
            ),
          ),
      ],
    );
  }
}
