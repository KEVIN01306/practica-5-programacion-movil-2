import 'package:flutter/cupertino.dart';
import '../../../../core/theme/cupertino_theme.dart';

class QuickActionsGrid extends StatelessWidget {
  final VoidCallback onOpenScanner;
  final VoidCallback onOpenRegisterMovement;
  final VoidCallback onOpenCreateProduct;

  const QuickActionsGrid({
    super.key,
    required this.onOpenScanner,
    required this.onOpenRegisterMovement,
    required this.onOpenCreateProduct,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Accesos Rápidos',
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
              child: _QuickActionButton(
                title: 'Escanear',
                subtitle: 'Cámara / QR',
                icon: CupertinoIcons.qrcode_viewfinder,
                color: CupertinoColors.activeBlue,
                onTap: onOpenScanner,
              ),
            ),
            const SizedBox(width: 10.0),
            Expanded(
              child: _QuickActionButton(
                title: 'Movimiento',
                subtitle: 'Entrada / Salida',
                icon: CupertinoIcons.arrow_up_arrow_down_circle_fill,
                color: CupertinoColors.systemGreen,
                onTap: onOpenRegisterMovement,
              ),
            ),
            const SizedBox(width: 10.0),
            Expanded(
              child: _QuickActionButton(
                title: 'Producto',
                subtitle: 'Nuevo registro',
                icon: CupertinoIcons.add_circled_solid,
                color: const Color(0xFF8E44AD),
                onTap: onOpenCreateProduct,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _QuickActionButton extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const _QuickActionButton({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return CupertinoButton(
      padding: EdgeInsets.zero,
      onPressed: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 18.0, horizontal: 8.0),
        decoration: BoxDecoration(
          color: AppCupertinoTheme.cardBackground,
          borderRadius: BorderRadius.circular(16.0),
          border: Border.all(color: CupertinoColors.systemGrey5, width: 0.8),
          boxShadow: const [
            BoxShadow(
              color: Color(0x06000000),
              blurRadius: 8,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 44.0,
              height: 44.0,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.12),
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Icon(icon, size: 22.0, color: color),
              ),
            ),
            const SizedBox(height: 10.0),
            Text(
              title,
              style: const TextStyle(
                fontSize: 14.0,
                fontWeight: FontWeight.bold,
                color: CupertinoColors.label,
              ),
            ),
            const SizedBox(height: 3.0),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 11.0,
                color: CupertinoColors.secondaryLabel,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
