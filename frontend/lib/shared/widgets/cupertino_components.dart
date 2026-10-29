import 'package:flutter/cupertino.dart';
import '../../core/theme/cupertino_theme.dart';

class CupertinoCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;
  final Color? backgroundColor;

  const CupertinoCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16.0),
    this.onTap,
    this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    final card = Container(
      decoration: BoxDecoration(
        color: backgroundColor ?? AppCupertinoTheme.cardBackground,
        borderRadius: BorderRadius.circular(12.0),
        border: Border.all(color: CupertinoColors.systemGrey5, width: 0.8),
        boxShadow: const [
          BoxShadow(
            color: Color(0x08000000),
            blurRadius: 6,
            offset: Offset(0, 2),
          ),
        ],
      ),
      padding: padding,
      child: child,
    );

    if (onTap != null) {
      return CupertinoButton(
        padding: EdgeInsets.zero,
        onPressed: onTap,
        child: card,
      );
    }

    return card;
  }
}

class CupertinoBadge extends StatelessWidget {
  final String text;
  final Color backgroundColor;
  final Color textColor;
  final IconData? icon;

  const CupertinoBadge({
    super.key,
    required this.text,
    this.backgroundColor = CupertinoColors.systemGrey5,
    this.textColor = CupertinoColors.label,
    this.icon,
  });

  factory CupertinoBadge.lowStock() {
    return const CupertinoBadge(
      text: 'Stock Bajo',
      backgroundColor: Color(0xFFFFEAEA),
      textColor: CupertinoColors.systemRed,
      icon: CupertinoIcons.exclamationmark_triangle_fill,
    );
  }

  factory CupertinoBadge.inStock() {
    return const CupertinoBadge(
      text: 'Óptimo',
      backgroundColor: Color(0xFFEAF9EA),
      textColor: CupertinoColors.systemGreen,
      icon: CupertinoIcons.checkmark_seal_fill,
    );
  }

  factory CupertinoBadge.entry() {
    return const CupertinoBadge(
      text: 'Entrada',
      backgroundColor: Color(0xFFEAF9EA),
      textColor: CupertinoColors.systemGreen,
      icon: CupertinoIcons.arrow_down_circle_fill,
    );
  }

  factory CupertinoBadge.exit() {
    return const CupertinoBadge(
      text: 'Salida',
      backgroundColor: Color(0xFFFFEEEE),
      textColor: CupertinoColors.systemRed,
      icon: CupertinoIcons.arrow_up_circle_fill,
    );
  }

  factory CupertinoBadge.adjust() {
    return const CupertinoBadge(
      text: 'Ajuste',
      backgroundColor: Color(0xFFF2EAFF),
      textColor: CupertinoColors.systemPurple,
      icon: CupertinoIcons.slider_horizontal_3,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 4.0),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(6.0),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 12.0, color: textColor),
            const SizedBox(width: 4.0),
          ],
          Text(
            text,
            style: TextStyle(
              fontSize: 12.0,
              fontWeight: FontWeight.w600,
              color: textColor,
            ),
          ),
        ],
      ),
    );
  }
}

class CupertinoStatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color iconColor;
  final String? subtitle;

  const CupertinoStatCard({
    super.key,
    required this.title,
    required this.value,
    required this.icon,
    required this.iconColor,
    this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return CupertinoCard(
      padding: const EdgeInsets.all(14.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 13.0,
                  fontWeight: FontWeight.w500,
                  color: CupertinoColors.secondaryLabel,
                ),
              ),
              Container(
                padding: const EdgeInsets.all(6.0),
                decoration: BoxDecoration(
                  color: iconColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(8.0),
                ),
                child: Icon(icon, size: 18.0, color: iconColor),
              ),
            ],
          ),
          const SizedBox(height: 8.0),
          Text(
            value,
            style: const TextStyle(
              fontSize: 22.0,
              fontWeight: FontWeight.bold,
              letterSpacing: -0.5,
              color: CupertinoColors.label,
            ),
          ),
          if (subtitle != null) ...[
            const SizedBox(height: 2.0),
            Text(
              subtitle!,
              style: const TextStyle(
                fontSize: 11.0,
                color: CupertinoColors.tertiaryLabel,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class CupertinoLoadingState extends StatelessWidget {
  final String? message;

  const CupertinoLoadingState({super.key, this.message});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const CupertinoActivityIndicator(radius: 14.0),
          if (message != null) ...[
            const SizedBox(height: 12.0),
            Text(
              message!,
              style: const TextStyle(
                fontSize: 14.0,
                color: CupertinoColors.secondaryLabel,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class CupertinoEmptyState extends StatelessWidget {
  final String title;
  final String message;
  final IconData icon;
  final Widget? action;

  const CupertinoEmptyState({
    super.key,
    required this.title,
    required this.message,
    this.icon = CupertinoIcons.cube_box,
    this.action,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 54.0, color: CupertinoColors.systemGrey3),
            const SizedBox(height: 14.0),
            Text(
              title,
              style: const TextStyle(
                fontSize: 18.0,
                fontWeight: FontWeight.w600,
                color: CupertinoColors.label,
              ),
            ),
            const SizedBox(height: 6.0),
            Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 14.0,
                color: CupertinoColors.secondaryLabel,
              ),
            ),
            if (action != null) ...[
              const SizedBox(height: 20.0),
              action!,
            ],
          ],
        ),
      ),
    );
  }
}

Future<void> showCupertinoAlert({
  required BuildContext context,
  required String title,
  required String message,
  String buttonText = 'Aceptar',
  VoidCallback? onConfirm,
}) {
  return showCupertinoDialog<void>(
    context: context,
    builder: (BuildContext ctx) => CupertinoAlertDialog(
      title: Text(title),
      content: Padding(
        padding: const EdgeInsets.only(top: 8.0),
        child: Text(message),
      ),
      actions: <CupertinoDialogAction>[
        CupertinoDialogAction(
          isDefaultAction: true,
          onPressed: () {
            Navigator.of(ctx).pop();
            onConfirm?.call();
          },
          child: Text(buttonText),
        ),
      ],
    ),
  );
}

Future<bool> showCupertinoConfirm({
  required BuildContext context,
  required String title,
  required String message,
  String confirmText = 'Confirmar',
  String cancelText = 'Cancelar',
  bool isDestructive = false,
}) async {
  final result = await showCupertinoDialog<bool>(
    context: context,
    builder: (BuildContext ctx) => CupertinoAlertDialog(
      title: Text(title),
      content: Padding(
        padding: const EdgeInsets.only(top: 8.0),
        child: Text(message),
      ),
      actions: <CupertinoDialogAction>[
        CupertinoDialogAction(
          onPressed: () => Navigator.of(ctx).pop(false),
          child: Text(cancelText),
        ),
        CupertinoDialogAction(
          isDestructiveAction: isDestructive,
          onPressed: () => Navigator.of(ctx).pop(true),
          child: Text(confirmText),
        ),
      ],
    ),
  );
  return result ?? false;
}
