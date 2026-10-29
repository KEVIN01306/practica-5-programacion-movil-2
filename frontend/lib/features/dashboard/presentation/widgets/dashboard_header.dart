import 'package:flutter/cupertino.dart';
import '../../../../core/storage/session_storage.dart';

class DashboardHeader extends StatelessWidget {
  const DashboardHeader({super.key});

  @override
  Widget build(BuildContext context) {
    final user = SessionStorage.instance.user;
    final userName = user != null && user.name.isNotEmpty ? user.name : 'Admin Sistema';
    final userRole = user?.role.value ?? 'ADMIN';
    final isRoleAdmin = userRole.toUpperCase() == 'ADMIN';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Expanded(
              child: Text(
                'Hola, $userName',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 24.0,
                  fontWeight: FontWeight.bold,
                  letterSpacing: -0.5,
                  color: CupertinoColors.label,
                ),
              ),
            ),
            const SizedBox(width: 8.0),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10.0, vertical: 4.0),
              decoration: BoxDecoration(
                color: isRoleAdmin
                    ? const Color(0xFFF2E7FE)
                    : const Color(0xFFE5F1FF),
                borderRadius: BorderRadius.circular(12.0),
              ),
              child: Text(
                userRole,
                style: TextStyle(
                  fontSize: 11.0,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.5,
                  color: isRoleAdmin
                      ? const Color(0xFF9B51E0)
                      : CupertinoColors.activeBlue,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 4.0),
        const Text(
          'Resumen del Almacén e Inventario',
          style: TextStyle(
            fontSize: 13.0,
            fontWeight: FontWeight.w400,
            color: CupertinoColors.secondaryLabel,
          ),
        ),
      ],
    );
  }
}
