import 'package:flutter/cupertino.dart';
import '../../domain/product_model.dart';

void showProductOptionsSheet({
  required BuildContext context,
  required Product product,
  required VoidCallback onSelectDetail,
  required VoidCallback onEdit,
  required VoidCallback onDeactivate,
}) {
  showCupertinoModalPopup<void>(
    context: context,
    builder: (ctx) => CupertinoActionSheet(
      title: Text(product.name),
      message: Text('Código: ${product.code} • Stock actual: ${product.currentStock} uds.'),
      actions: [
        CupertinoActionSheetAction(
          onPressed: () {
            Navigator.pop(ctx);
            onSelectDetail();
          },
          child: const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(CupertinoIcons.eye, size: 20),
              SizedBox(width: 8),
              Text('Ver Ficha y Etiquetas'),
            ],
          ),
        ),
        CupertinoActionSheetAction(
          onPressed: () {
            Navigator.pop(ctx);
            onEdit();
          },
          child: const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(CupertinoIcons.pencil, size: 20),
              SizedBox(width: 8),
              Text('Editar Producto'),
            ],
          ),
        ),
        CupertinoActionSheetAction(
          isDestructiveAction: true,
          onPressed: () {
            Navigator.pop(ctx);
            onDeactivate();
          },
          child: const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(CupertinoIcons.trash, size: 20, color: CupertinoColors.systemRed),
              SizedBox(width: 8),
              Text('Desactivar (Borrado Lógico)'),
            ],
          ),
        ),
      ],
      cancelButton: CupertinoActionSheetAction(
        onPressed: () => Navigator.pop(ctx),
        child: const Text('Cancelar'),
      ),
    ),
  );
}
