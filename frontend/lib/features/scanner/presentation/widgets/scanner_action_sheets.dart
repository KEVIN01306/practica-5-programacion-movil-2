import 'package:flutter/cupertino.dart';
import '../../../products/domain/product_model.dart';

Future<void> showScannedProductSheet({
  required BuildContext context,
  required Product product,
  required VoidCallback onSelectMovement,
  required VoidCallback onSelectDetail,
  VoidCallback? onDismiss,
}) async {
  await showCupertinoModalPopup<void>(
    context: context,
    builder: (ctx) => CupertinoActionSheet(
      title: const Text('Producto Identificado'),
      message: Text(
        '${product.name}\nCódigo: ${product.code} • Stock disponible: ${product.currentStock}',
        style: const TextStyle(fontSize: 14),
      ),
      actions: [
        CupertinoActionSheetAction(
          isDefaultAction: true,
          onPressed: () {
            Navigator.pop(ctx);
            onSelectMovement();
          },
          child: const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(CupertinoIcons.arrow_up_arrow_down_circle_fill, size: 20),
              SizedBox(width: 8),
              Text('Registrar Movimiento (Entrada/Salida/Ajuste)'),
            ],
          ),
        ),
        CupertinoActionSheetAction(
          onPressed: () {
            Navigator.pop(ctx);
            onSelectDetail();
          },
          child: const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(CupertinoIcons.doc_text_viewfinder, size: 20),
              SizedBox(width: 8),
              Text('Ver Ficha Técnica y Etiquetas'),
            ],
          ),
        ),
      ],
      cancelButton: CupertinoActionSheetAction(
        onPressed: () => Navigator.pop(ctx),
        child: const Text('Seguir Escaneando'),
      ),
    ),
  );
  onDismiss?.call();
}

Future<void> showProductNotFoundDialog({
  required BuildContext context,
  required String code,
  required VoidCallback onRetry,
  required VoidCallback onRegisterNew,
  VoidCallback? onDismiss,
}) async {
  await showCupertinoDialog<void>(
    context: context,
    builder: (ctx) => CupertinoAlertDialog(
      title: const Text('Código No Registrado'),
      content: Padding(
        padding: const EdgeInsets.only(top: 8.0),
        child: Text(
          'El código "$code" (Code 128 / QR) no existe en el catálogo de inventario.',
        ),
      ),
      actions: [
        CupertinoDialogAction(
          onPressed: () {
            Navigator.pop(ctx);
            onRetry();
          },
          child: const Text('Reintentar'),
        ),
        CupertinoDialogAction(
          isDefaultAction: true,
          onPressed: () {
            Navigator.pop(ctx);
            onRegisterNew();
          },
          child: const Text('Registrar como Nuevo Producto'),
        ),
      ],
    ),
  );
  onDismiss?.call();
}

Future<void> showManualCodeInputDialog({
  required BuildContext context,
  required TextEditingController controller,
  required ValueChanged<String> onSubmit,
  VoidCallback? onDismiss,
}) async {
  controller.clear();
  await showCupertinoDialog<void>(
    context: context,
    builder: (ctx) => CupertinoAlertDialog(
      title: const Text('Ingreso Manual de Código'),
      content: Padding(
        padding: const EdgeInsets.only(top: 12.0),
        child: Column(
          children: [
            const Text(
              'Digita el código impreso en la etiqueta física si la cámara no puede enfocarlo:',
              style: TextStyle(fontSize: 12, color: CupertinoColors.secondaryLabel),
            ),
            const SizedBox(height: 12),
            CupertinoTextField(
              controller: controller,
              placeholder: 'ej. PROD-100234',
              autofocus: true,
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: CupertinoColors.systemGrey6,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: CupertinoColors.systemGrey4),
              ),
            ),
          ],
        ),
      ),
      actions: [
        CupertinoDialogAction(
          onPressed: () => Navigator.pop(ctx),
          child: const Text('Cancelar'),
        ),
        CupertinoDialogAction(
          isDefaultAction: true,
          onPressed: () {
            final code = controller.text.trim();
            Navigator.pop(ctx);
            if (code.isNotEmpty) {
              onSubmit(code);
            }
          },
          child: const Text('Buscar'),
        ),
      ],
    ),
  );
  onDismiss?.call();
}
