import 'package:flutter/cupertino.dart';
import '../../../../core/theme/cupertino_theme.dart';
import '../../../../shared/widgets/cupertino_components.dart';
import '../../domain/product_model.dart';

class ProductCard extends StatelessWidget {
  final Product product;
  final VoidCallback onTap;
  final VoidCallback onOptionsTap;

  const ProductCard({
    super.key,
    required this.product,
    required this.onTap,
    required this.onOptionsTap,
  });

  Widget _buildFallbackIcon() {
    return Container(
      width: 48.0,
      height: 48.0,
      decoration: BoxDecoration(
        color: CupertinoColors.systemGrey6,
        borderRadius: BorderRadius.circular(10.0),
        border: Border.all(color: CupertinoColors.systemGrey5),
      ),
      child: const Icon(
        CupertinoIcons.cube_box_fill,
        color: AppCupertinoTheme.primaryColor,
        size: 24.0,
      ),
    );
  }

  Widget _buildThumbnail() {
    final imageUrl = product.imageUrl?.trim();
    if (imageUrl != null && imageUrl.isNotEmpty) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(10.0),
        child: SizedBox(
          width: 48.0,
          height: 48.0,
          child: Image.network(
            imageUrl,
            width: 48.0,
            height: 48.0,
            fit: BoxFit.cover,
            loadingBuilder: (context, child, loadingProgress) {
              if (loadingProgress == null) return child;
              return Container(
                width: 48.0,
                height: 48.0,
                color: CupertinoColors.systemGrey6,
                child: const Center(
                  child: CupertinoActivityIndicator(radius: 8.0),
                ),
              );
            },
            errorBuilder: (context, error, stackTrace) => _buildFallbackIcon(),
          ),
        ),
      );
    }
    return _buildFallbackIcon();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: CupertinoCard(
        padding: const EdgeInsets.all(12.0),
        onTap: onTap,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Thumbnail / Icon
            _buildThumbnail(),
            const SizedBox(width: 12.0),

            // Product details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 15.0,
                      fontWeight: FontWeight.w600,
                      color: CupertinoColors.label,
                    ),
                  ),
                  const SizedBox(height: 2.0),
                  Text(
                    'Cód: ${product.code}',
                    style: const TextStyle(
                      fontSize: 12.0,
                      color: CupertinoColors.secondaryLabel,
                    ),
                  ),
                  const SizedBox(height: 4.0),
                  Text(
                    'Venta: \$${product.salePrice.toStringAsFixed(2)}',
                    style: const TextStyle(
                      fontSize: 13.0,
                      fontWeight: FontWeight.bold,
                      color: CupertinoColors.systemGreen,
                    ),
                  ),
                ],
              ),
            ),

            // Stock & Badge
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  'Stock: ${product.currentStock}',
                  style: TextStyle(
                    fontSize: 14.0,
                    fontWeight: FontWeight.bold,
                    color: product.isLowStock
                        ? CupertinoColors.systemRed
                        : CupertinoColors.label,
                  ),
                ),
                const SizedBox(height: 4.0),
                product.isLowStock
                    ? CupertinoBadge.lowStock()
                    : CupertinoBadge.inStock(),
              ],
            ),

            // Menu icon
            CupertinoButton(
              padding: const EdgeInsets.only(left: 8.0),
              minimumSize: Size.zero,
              onPressed: onOptionsTap,
              child: const Icon(
                CupertinoIcons.ellipsis_vertical,
                size: 20.0,
                color: CupertinoColors.systemGrey,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
