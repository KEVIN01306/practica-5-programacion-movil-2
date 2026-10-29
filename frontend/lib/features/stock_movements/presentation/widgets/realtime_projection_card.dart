import 'package:flutter/cupertino.dart';
import '../../../../shared/widgets/cupertino_components.dart';
import '../../domain/stock_movement_model.dart';

class RealtimeProjectionCard extends StatelessWidget {
  final int currentStock;
  final int projectedStock;
  final MovementType selectedType;
  final bool isExitQuantityExceeded;

  const RealtimeProjectionCard({
    super.key,
    required this.currentStock,
    required this.projectedStock,
    required this.selectedType,
    required this.isExitQuantityExceeded,
  });

  @override
  Widget build(BuildContext context) {
    return CupertinoCard(
      backgroundColor: isExitQuantityExceeded ? const Color(0xFFFFEEEE) : null,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Proyección de Existencias en Tiempo Real',
            style: TextStyle(
              fontSize: 14,
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
                      'Stock Actual',
                      style: TextStyle(
                        fontSize: 12,
                        color: CupertinoColors.secondaryLabel,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '$currentStock uds.',
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: CupertinoColors.label,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(
                CupertinoIcons.arrow_right,
                size: 20,
                color: CupertinoColors.systemGrey,
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    const Text(
                      'Stock Proyectado',
                      style: TextStyle(
                        fontSize: 12,
                        color: CupertinoColors.secondaryLabel,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '$projectedStock uds.',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: isExitQuantityExceeded
                            ? CupertinoColors.systemRed
                            : selectedType == MovementType.entry
                                ? CupertinoColors.systemGreen
                                : CupertinoColors.systemBlue,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          if (isExitQuantityExceeded) ...[
            const SizedBox(height: 10),
            const Row(
              children: [
                Icon(
                  CupertinoIcons.clear_circled_solid,
                  size: 16,
                  color: CupertinoColors.systemRed,
                ),
                SizedBox(width: 6),
                Expanded(
                  child: Text(
                    'Bloqueo: La cantidad supera el stock físico disponible en almacén.',
                    style: TextStyle(
                      fontSize: 12,
                      color: CupertinoColors.systemRed,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
