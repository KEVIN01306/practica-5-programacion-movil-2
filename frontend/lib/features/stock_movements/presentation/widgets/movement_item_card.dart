import 'package:flutter/cupertino.dart';
import '../../../../shared/widgets/cupertino_components.dart';
import '../../domain/stock_movement_model.dart';

class MovementItemCard extends StatelessWidget {
  final StockMovement movement;

  const MovementItemCard({
    super.key,
    required this.movement,
  });

  String _formatDate(DateTime dt) {
    final day = dt.day.toString().padLeft(2, '0');
    final month = dt.month.toString().padLeft(2, '0');
    final year = dt.year;
    final hour = dt.hour.toString().padLeft(2, '0');
    final minute = dt.minute.toString().padLeft(2, '0');
    return '$day/$month/$year $hour:$minute';
  }

  Widget _buildTypeBadge(MovementType type) {
    switch (type) {
      case MovementType.entry:
        return CupertinoBadge.entry();
      case MovementType.exit:
        return CupertinoBadge.exit();
      case MovementType.adjust:
        return CupertinoBadge.adjust();
    }
  }

  Color _getTypeColor(MovementType type) {
    switch (type) {
      case MovementType.entry:
        return CupertinoColors.systemGreen;
      case MovementType.exit:
        return CupertinoColors.systemRed;
      case MovementType.adjust:
        return CupertinoColors.systemPurple;
    }
  }

  String _getQuantityPrefix(MovementType type) {
    switch (type) {
      case MovementType.entry:
        return '+';
      case MovementType.exit:
        return '-';
      case MovementType.adjust:
        return '±';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: CupertinoCard(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Row: Badge & Timestamp
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildTypeBadge(movement.type),
                Text(
                  _formatDate(movement.createdAt),
                  style: const TextStyle(
                    fontSize: 11.0,
                    color: CupertinoColors.secondaryLabel,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8.0),

            // Product Name & Code
            Text(
              movement.productName ?? 'Producto (${movement.productId})',
              style: const TextStyle(
                fontSize: 15.0,
                fontWeight: FontWeight.bold,
                color: CupertinoColors.label,
              ),
            ),
            if (movement.productCode != null) ...[
              const SizedBox(height: 2.0),
              Text(
                'Cód: ${movement.productCode}',
                style: const TextStyle(
                  fontSize: 12.0,
                  color: CupertinoColors.secondaryLabel,
                ),
              ),
            ],

            const SizedBox(height: 8.0),

            // Quantities & Stocks transition
            Row(
              children: [
                Text(
                  '${_getQuantityPrefix(movement.type)}${movement.quantity} uds.',
                  style: TextStyle(
                    fontSize: 15.0,
                    fontWeight: FontWeight.bold,
                    color: _getTypeColor(movement.type),
                  ),
                ),
                const SizedBox(width: 8.0),
                Text(
                  '(Stock: ${movement.previousStock} → ${movement.resultingStock})',
                  style: const TextStyle(
                    fontSize: 13.0,
                    color: CupertinoColors.secondaryLabel,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 6.0),

            // Reason & Notes
            Text(
              'Motivo: ${movement.reason}',
              style: const TextStyle(
                fontSize: 12.0,
                fontWeight: FontWeight.w500,
                color: CupertinoColors.label,
              ),
            ),

            if (movement.notes != null && movement.notes!.isNotEmpty) ...[
              const SizedBox(height: 2.0),
              Text(
                'Justificación / Notas: ${movement.notes}',
                style: const TextStyle(
                  fontSize: 11.0,
                  fontStyle: FontStyle.italic,
                  color: CupertinoColors.secondaryLabel,
                ),
              ),
            ],

            const SizedBox(height: 4.0),
            Row(
              children: [
                const Icon(
                  CupertinoIcons.person_crop_circle,
                  size: 13,
                  color: CupertinoColors.systemGrey,
                ),
                const SizedBox(width: 4),
                Text(
                  'Responsable: ${movement.userName ?? "Operador"}',
                  style: const TextStyle(
                    fontSize: 11,
                    color: CupertinoColors.tertiaryLabel,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
