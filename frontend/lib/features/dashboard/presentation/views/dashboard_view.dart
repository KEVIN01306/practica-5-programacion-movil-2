import 'package:flutter/cupertino.dart';
import '../../../../core/theme/cupertino_theme.dart';
import '../../../../shared/widgets/cupertino_components.dart';
import '../../../products/domain/product_model.dart';
import '../controllers/dashboard_controller.dart';
import '../widgets/dashboard_header.dart';
import '../widgets/dashboard_kpi_cards.dart';
import '../widgets/low_stock_section.dart';
import '../widgets/quick_actions_grid.dart';

class DashboardView extends StatefulWidget {
  final DashboardController controller;
  final VoidCallback onOpenScanner;
  final VoidCallback onOpenRegisterMovement;
  final VoidCallback onOpenCreateProduct;
  final void Function(Product product) onSelectProduct;
  final VoidCallback onLogout;

  const DashboardView({
    super.key,
    required this.controller,
    required this.onOpenScanner,
    required this.onOpenRegisterMovement,
    required this.onOpenCreateProduct,
    required this.onSelectProduct,
    required this.onLogout,
  });

  @override
  State<DashboardView> createState() => _DashboardViewState();
}

class _DashboardViewState extends State<DashboardView> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      widget.controller.loadDashboard();
    });
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      backgroundColor: AppCupertinoTheme.scaffoldBackground,
      navigationBar: CupertinoNavigationBar(
        middle: const Text('Inicio'),
        leading: CupertinoButton(
          padding: EdgeInsets.zero,
          onPressed: widget.onLogout,
          child: const Icon(
            CupertinoIcons.square_arrow_left,
            size: 22.0,
            color: CupertinoColors.systemRed,
          ),
        ),
        trailing: CupertinoButton(
          padding: EdgeInsets.zero,
          onPressed: () => widget.controller.loadDashboard(),
          child: const Icon(CupertinoIcons.arrow_clockwise, size: 20.0),
        ),
      ),
      child: SafeArea(
        child: AnimatedBuilder(
          animation: widget.controller,
          builder: (context, _) {
            if (widget.controller.isLoading &&
                widget.controller.metrics.totalActiveProducts == 0) {
              return const CupertinoLoadingState(
                message: 'Cargando indicadores...',
              );
            }

            if (widget.controller.errorMessage != null &&
                widget.controller.metrics.totalActiveProducts == 0) {
              return Center(
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        CupertinoIcons.exclamationmark_circle,
                        size: 48,
                        color: CupertinoColors.systemRed,
                      ),
                      const SizedBox(height: 12),
                      Text(
                        widget.controller.errorMessage!,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontSize: 14,
                          color: CupertinoColors.secondaryLabel,
                        ),
                      ),
                      const SizedBox(height: 16),
                      CupertinoButton.filled(
                        onPressed: () => widget.controller.loadDashboard(),
                        child: const Text('Reintentar'),
                      ),
                    ],
                  ),
                ),
              );
            }

            final metrics = widget.controller.metrics;

            return CustomScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              slivers: [
                CupertinoSliverRefreshControl(
                  onRefresh: () => widget.controller.loadDashboard(),
                ),
                SliverPadding(
                  padding: const EdgeInsets.all(16.0),
                  sliver: SliverList(
                    delegate: SliverChildListDelegate([
                      // Modular Header (Greeting & Role Badge)
                      const DashboardHeader(),
                      const SizedBox(height: 20.0),

                      // Modular KPI Stat Cards
                      DashboardKpiCards(
                        totalActiveProducts: metrics.totalActiveProducts,
                        totalStockUnits: metrics.totalStockUnits,
                        totalValuation: metrics.totalValuation,
                      ),
                      const SizedBox(height: 24.0),

                      // Modular Quick Action Buttons Grid
                      QuickActionsGrid(
                        onOpenScanner: widget.onOpenScanner,
                        onOpenRegisterMovement: widget.onOpenRegisterMovement,
                        onOpenCreateProduct: widget.onOpenCreateProduct,
                      ),
                      const SizedBox(height: 26.0),

                      // Modular Low Stock Alerts Section
                      LowStockSection(
                        lowStockProducts: metrics.lowStockProducts,
                        onSelectProduct: widget.onSelectProduct,
                      ),
                      const SizedBox(height: 24.0),
                    ]),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
