import 'package:flutter/cupertino.dart';
import '../../../../core/theme/cupertino_theme.dart';
import '../../../../shared/widgets/cupertino_components.dart';
import '../../../../shared/utils/csv_downloader.dart';
import '../controllers/stock_movements_controller.dart';
import '../../domain/stock_movement_model.dart';
import '../widgets/movement_item_card.dart';

class MovementsHistoryView extends StatefulWidget {
  final StockMovementsController controller;

  const MovementsHistoryView({
    super.key,
    required this.controller,
  });

  @override
  State<MovementsHistoryView> createState() => _MovementsHistoryViewState();
}

class _MovementsHistoryViewState extends State<MovementsHistoryView> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      widget.controller.loadMovements();
    });
  }

  void _showExportOptions() {
    showCupertinoModalPopup<void>(
      context: context,
      builder: (ctx) => CupertinoActionSheet(
        title: const Text('Exportar Datos a Formato CSV'),
        message: const Text('Selecciona el reporte que deseas generar para descarga o análisis externo.'),
        actions: [
          CupertinoActionSheetAction(
            onPressed: () async {
              Navigator.pop(ctx);
              final csv = await widget.controller.generateInventoryCsv();
              if (mounted) {
                final filename = CsvDownloader.generateFileName('inventario_general');
                await CsvDownloader.download(
                  context: context,
                  filename: filename,
                  content: csv,
                );
              }
            },
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(CupertinoIcons.cube_box, size: 20),
                SizedBox(width: 8),
                Flexible(
                  child: Text(
                    'Inventario General',
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
          CupertinoActionSheetAction(
            onPressed: () async {
              Navigator.pop(ctx);
              final csv = widget.controller.generateMovementsCsv();
              if (mounted) {
                final filename = CsvDownloader.generateFileName('historial_movimientos');
                await CsvDownloader.download(
                  context: context,
                  filename: filename,
                  content: csv,
                );
              }
            },
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(CupertinoIcons.clock_fill, size: 20),
                SizedBox(width: 8),
                Flexible(
                  child: Text(
                    'Historial de Movimientos',
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
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

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      backgroundColor: AppCupertinoTheme.scaffoldBackground,
      navigationBar: CupertinoNavigationBar(
        middle: const Text('Historial y Reportes'),
        trailing: CupertinoButton(
          padding: EdgeInsets.zero,
          onPressed: _showExportOptions,
          child: const Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(CupertinoIcons.share_up, size: 18),
              SizedBox(width: 4),
              Text('Exportar CSV', style: TextStyle(fontSize: 14)),
            ],
          ),
        ),
      ),
      child: SafeArea(
        child: AnimatedBuilder(
          animation: widget.controller,
          builder: (context, _) {
            final movements = widget.controller.movements;
            final isLoading = widget.controller.isLoading;
            final selectedType = widget.controller.selectedType;
            final selectedKey = selectedType == null ? 'ALL' : selectedType.value;

            return Column(
              children: [
                // Filter Segmented Control
                Container(
                  color: CupertinoColors.secondarySystemGroupedBackground,
                  padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 8.0),
                  child: SizedBox(
                    width: double.infinity,
                    child: CupertinoSlidingSegmentedControl<String>(
                      groupValue: selectedKey,
                      children: const {
                        'ALL': Padding(
                          padding: EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          child: Text('Todos', style: TextStyle(fontSize: 12)),
                        ),
                        'ENTRY': Padding(
                          padding: EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          child: Text('Entradas', style: TextStyle(fontSize: 12)),
                        ),
                        'EXIT': Padding(
                          padding: EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          child: Text('Salidas', style: TextStyle(fontSize: 12)),
                        ),
                        'ADJUST': Padding(
                          padding: EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          child: Text('Ajustes', style: TextStyle(fontSize: 12)),
                        ),
                      },
                      onValueChanged: (val) {
                        if (val == null || val == 'ALL') {
                          widget.controller.setTypeFilter(null);
                        } else {
                          widget.controller.setTypeFilter(MovementType.fromString(val));
                        }
                      },
                    ),
                  ),
                ),

                // Movement List / Timeline
                Expanded(
                  child: isLoading && movements.isEmpty
                      ? const CupertinoLoadingState(message: 'Cargando transacciones...')
                      : movements.isEmpty
                          ? const CupertinoEmptyState(
                              title: 'Sin movimientos registrados',
                              message: 'No existen registros de movimientos para los filtros seleccionados.',
                              icon: CupertinoIcons.clock,
                            )
                          : CustomScrollView(
                              physics: const AlwaysScrollableScrollPhysics(),
                              slivers: [
                                CupertinoSliverRefreshControl(
                                  onRefresh: () => widget.controller.loadMovements(refresh: true),
                                ),
                                SliverPadding(
                                  padding: const EdgeInsets.all(12.0),
                                  sliver: SliverList(
                                    delegate: SliverChildBuilderDelegate(
                                      (context, index) {
                                        final m = movements[index];
                                        return MovementItemCard(movement: m);
                                      },
                                      childCount: movements.length,
                                    ),
                                  ),
                                ),
                              ],
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
