import 'package:flutter/cupertino.dart';

import '../../../../shared/widgets/barcode_widget.dart';
import '../../../../shared/widgets/cupertino_components.dart';
import '../../domain/product_model.dart';

class ProductLabelCard extends StatelessWidget {
  final Product product;
  final VoidCallback onExportTap;

  const ProductLabelCard({
    super.key,
    required this.product,
    required this.onExportTap,
  });

  @override
  Widget build(BuildContext context) {
    return CupertinoCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Etiqueta Escaneable del Producto',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: CupertinoColors.label,
                ),
              ),
              CupertinoButton(
                padding: EdgeInsets.zero,
                minimumSize: Size.zero,
                onPressed: onExportTap,
                child: const Row(
                  children: [
                    Icon(CupertinoIcons.share, size: 16),
                    SizedBox(width: 4),
                    Text('Exportar', style: TextStyle(fontSize: 13)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Barcode Code 128
          Barcode128Widget(code: product.code),

          const SizedBox(height: 16),
          const Text(
            'Código QR (Únicamente código de producto)',
            style: TextStyle(
              fontSize: 12,
              color: CupertinoColors.secondaryLabel,
            ),
          ),
          const SizedBox(height: 8),

          // QR Code (strictly encoding ONLY unique code string)
          QrCodeWidget(data: product.code, size: 130),
        ],
      ),
    );
  }
}
