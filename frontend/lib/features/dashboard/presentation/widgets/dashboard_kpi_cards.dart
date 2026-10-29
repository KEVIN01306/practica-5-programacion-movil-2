import 'package:flutter/cupertino.dart';
import '../../../../shared/widgets/cupertino_components.dart';

class DashboardKpiCards extends StatelessWidget {
  final int totalActiveProducts;
  final int totalStockUnits;
  final double totalValuation;

  const DashboardKpiCards({
    super.key,
    required this.totalActiveProducts,
    required this.totalStockUnits,
    required this.totalValuation,
  });

  String _formatCurrency(double amount) {
    return '\$${amount.toStringAsFixed(2).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    )}';
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Resumen General',
          style: TextStyle(
            fontSize: 18.0,
            fontWeight: FontWeight.bold,
            letterSpacing: -0.3,
            color: CupertinoColors.label,
          ),
        ),
        const SizedBox(height: 12.0),
        Row(
          children: [
            Expanded(
              child: CupertinoStatCard(
                title: 'Catálogo',
                value: '$totalActiveProducts',
                subtitle: 'Productos activos',
                icon: CupertinoIcons.cube_box,
                iconColor: CupertinoColors.activeBlue,
              ),
            ),
            const SizedBox(width: 12.0),
            Expanded(
              child: CupertinoStatCard(
                title: 'Existencias',
                value: '$totalStockUnits',
                subtitle: 'Unidades en bodega',
                icon: CupertinoIcons.layers_alt,
                iconColor: const Color(0xFF00B4D8),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12.0),
        CupertinoStatCard(
          title: 'Valoración Económica Total Estimada',
          value: _formatCurrency(totalValuation),
          subtitle: 'Cálculo: existencias × precio de compra',
          icon: CupertinoIcons.money_dollar_circle_fill,
          iconColor: CupertinoColors.systemGreen,
        ),
      ],
    );
  }
}
