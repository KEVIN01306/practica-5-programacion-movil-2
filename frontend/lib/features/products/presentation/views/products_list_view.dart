import 'package:flutter/cupertino.dart';
import '../../../../core/theme/cupertino_theme.dart';
import '../../../../shared/widgets/cupertino_components.dart';
import '../controllers/products_controller.dart';
import '../../domain/product_model.dart';
import '../widgets/product_card.dart';
import '../widgets/product_options_sheet.dart';
import '../widgets/product_search_bar.dart';

class ProductsListView extends StatefulWidget {
  final ProductsController controller;
  final void Function(Product product) onSelectProduct;
  final void Function(Product product) onEditProduct;
  final VoidCallback onCreateProduct;

  const ProductsListView({
    super.key,
    required this.controller,
    required this.onSelectProduct,
    required this.onEditProduct,
    required this.onCreateProduct,
  });

  @override
  State<ProductsListView> createState() => _ProductsListViewState();
}

class _ProductsListViewState extends State<ProductsListView> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      widget.controller.init();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _showCategoryPicker() {
    final categories = widget.controller.categories;
    if (categories.isEmpty) return;

    showCupertinoModalPopup<void>(
      context: context,
      builder: (ctx) => CupertinoActionSheet(
        title: const Text('Filtrar por Categoría'),
        actions: [
          CupertinoActionSheetAction(
            isDefaultAction: widget.controller.selectedCategoryId == null,
            onPressed: () {
              widget.controller.setSelectedCategory(null);
              Navigator.pop(ctx);
            },
            child: const Text('Todas las categorías'),
          ),
          ...categories.map(
            (cat) => CupertinoActionSheetAction(
              isDefaultAction: widget.controller.selectedCategoryId == cat.id,
              onPressed: () {
                widget.controller.setSelectedCategory(cat.id);
                Navigator.pop(ctx);
              },
              child: Text(cat.name),
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

  Future<void> _confirmDeactivation(Product product) async {
    final hasMovements = await widget.controller.checkHasMovements(product.id);

    if (!mounted) return;

    final confirmed = await showCupertinoConfirm(
      context: context,
      title: 'Desactivar Producto',
      message: hasMovements
          ? 'El producto "${product.name}" posee historial de movimientos. Por auditoría, se realizará un borrado lógico (quedará inactivo) y la eliminación física está bloqueada.'
          : '¿Deseas desactivar el producto "${product.name}" del catálogo?',
      confirmText: 'Desactivar',
      isDestructive: true,
    );

    if (confirmed) {
      final success = await widget.controller.deactivateProduct(product);
      if (mounted) {
        if (success) {
          showCupertinoAlert(
            context: context,
            title: 'Producto Desactivado',
            message: 'El producto ha sido dado de baja lógicamente.',
          );
        } else {
          showCupertinoAlert(
            context: context,
            title: 'Error',
            message: widget.controller.errorMessage ?? 'No se pudo desactivar el producto.',
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      backgroundColor: AppCupertinoTheme.scaffoldBackground,
      navigationBar: CupertinoNavigationBar(
        middle: const Text('Catálogo de Productos'),
        trailing: CupertinoButton(
          padding: EdgeInsets.zero,
          onPressed: widget.onCreateProduct,
          child: const Icon(CupertinoIcons.plus_circle_fill, size: 26.0),
        ),
      ),
      child: SafeArea(
        child: AnimatedBuilder(
          animation: widget.controller,
          builder: (context, _) {
            final products = widget.controller.products;
            final isLoading = widget.controller.isLoading;

            return Column(
              children: [
                // Modular Search Bar & Filters
                ProductSearchBar(
                  searchController: _searchController,
                  onSearchChanged: widget.controller.setSearchQuery,
                  categories: widget.controller.categories,
                  selectedCategoryId: widget.controller.selectedCategoryId,
                  onCategoryTap: _showCategoryPicker,
                  filterLowStock: widget.controller.filterLowStock,
                  onToggleLowStock: widget.controller.setFilterLowStock,
                ),

                // Products List
                Expanded(
                  child: isLoading && products.isEmpty
                      ? const CupertinoLoadingState(message: 'Cargando catálogo...')
                      : products.isEmpty
                          ? CupertinoEmptyState(
                              title: 'Sin productos encontrados',
                              message: 'No hay productos que coincidan con los filtros aplicados.',
                              icon: CupertinoIcons.search,
                              action: CupertinoButton.filled(
                                onPressed: widget.onCreateProduct,
                                child: const Text('Registrar Nuevo Producto'),
                              ),
                            )
                          : CustomScrollView(
                              physics: const AlwaysScrollableScrollPhysics(),
                              slivers: [
                                CupertinoSliverRefreshControl(
                                  onRefresh: () => widget.controller.loadProducts(refresh: true),
                                ),
                                SliverPadding(
                                  padding: const EdgeInsets.all(12.0),
                                  sliver: SliverList(
                                    delegate: SliverChildBuilderDelegate(
                                      (context, index) {
                                        final prod = products[index];
                                        return ProductCard(
                                          product: prod,
                                          onTap: () => widget.onSelectProduct(prod),
                                          onOptionsTap: () {
                                            showProductOptionsSheet(
                                              context: context,
                                              product: prod,
                                              onSelectDetail: () => widget.onSelectProduct(prod),
                                              onEdit: () => widget.onEditProduct(prod),
                                              onDeactivate: () => _confirmDeactivation(prod),
                                            );
                                          },
                                        );
                                      },
                                      childCount: products.length,
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
