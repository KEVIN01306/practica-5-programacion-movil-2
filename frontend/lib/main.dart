import 'package:flutter/cupertino.dart';
import 'core/storage/session_storage.dart';
import 'core/theme/cupertino_theme.dart';
import 'features/auth/presentation/controllers/auth_controller.dart';
import 'features/auth/presentation/views/login_view.dart';
import 'features/dashboard/presentation/controllers/dashboard_controller.dart';
import 'features/dashboard/presentation/views/dashboard_view.dart';
import 'features/products/domain/product_model.dart';
import 'features/products/presentation/controllers/products_controller.dart';
import 'features/products/presentation/views/product_detail_view.dart';
import 'features/products/presentation/views/product_form_view.dart';
import 'features/products/presentation/views/products_list_view.dart';
import 'features/scanner/presentation/views/scanner_view.dart';
import 'features/stock_movements/presentation/controllers/stock_movements_controller.dart';
import 'features/stock_movements/presentation/views/movements_history_view.dart';
import 'features/stock_movements/presentation/views/register_movement_view.dart';
import 'shared/widgets/cupertino_components.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SessionStorage.instance.init();
  runApp(const InventarioApp());
}

class InventarioApp extends StatefulWidget {
  const InventarioApp({super.key});

  @override
  State<InventarioApp> createState() => _InventarioAppState();
}

class _InventarioAppState extends State<InventarioApp> {
  final AuthController _authController = AuthController();
  bool _isInitialized = false;

  @override
  void initState() {
    super.initState();
    _bootstrap();
  }

  Future<void> _bootstrap() async {
    await _authController.initSession();
    setState(() => _isInitialized = true);
  }

  @override
  Widget build(BuildContext context) {
    if (!_isInitialized) {
      return const CupertinoApp(
        debugShowCheckedModeBanner: false,
        theme: AppCupertinoTheme.themeData,
        home: CupertinoPageScaffold(
          child: CupertinoLoadingState(message: 'Iniciando sistema...'),
        ),
      );
    }

    return CupertinoApp(
      title: 'Sistema de Inventario',
      debugShowCheckedModeBanner: false,
      theme: AppCupertinoTheme.themeData,
      home: AnimatedBuilder(
        animation: _authController,
        builder: (context, _) {
          if (_authController.isAuthenticated) {
            return MainCupertinoShell(
              authController: _authController,
            );
          }
          return LoginView(
            authController: _authController,
            onLoginSuccess: () => setState(() {}),
          );
        },
      ),
    );
  }
}

class MainCupertinoShell extends StatefulWidget {
  final AuthController authController;

  const MainCupertinoShell({
    super.key,
    required this.authController,
  });

  @override
  State<MainCupertinoShell> createState() => _MainCupertinoShellState();
}

class _MainCupertinoShellState extends State<MainCupertinoShell> {
  final CupertinoTabController _tabController = CupertinoTabController();

  final DashboardController _dashboardController = DashboardController();
  final ProductsController _productsController = ProductsController();
  final StockMovementsController _stockMovementsController = StockMovementsController();

  Product? _preselectedProductForMovement;

  @override
  void initState() {
    super.initState();
    _productsController.init();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _dashboardController.dispose();
    _productsController.dispose();
    _stockMovementsController.dispose();
    super.dispose();
  }

  void _navigateToTab(int index) {
    _tabController.index = index;
  }

  void _openProductDetail(BuildContext context, Product product) {
    Navigator.of(context).push(
      CupertinoPageRoute(
        builder: (ctx) => ProductDetailView(
          product: product,
          onEditProduct: () {
            Navigator.of(ctx).pop();
            _openProductForm(context, productToEdit: product);
          },
          onRegisterMovement: () {
            Navigator.of(ctx).pop();
            setState(() {
              _preselectedProductForMovement = product;
            });
            _navigateToTab(3); // Tab Movimientos
          },
        ),
      ),
    );
  }

  void _openProductForm(BuildContext context, {Product? productToEdit, String? prefilledCode}) {
    Navigator.of(context).push(
      CupertinoPageRoute(
        builder: (ctx) => ProductFormView(
          productToEdit: productToEdit,
          categories: _productsController.categories,
          onSaved: () {
            _productsController.loadProducts(refresh: true);
            _dashboardController.loadDashboard();
          },
        ),
      ),
    );
  }

  Future<void> _handleLogout(BuildContext context) async {
    final confirmed = await showCupertinoConfirm(
      context: context,
      title: 'Cerrar Sesión',
      message: '¿Estás seguro de que deseas salir del sistema?',
      confirmText: 'Cerrar Sesión',
      isDestructive: true,
    );

    if (confirmed) {
      await widget.authController.logout();
    }
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoTabScaffold(
      controller: _tabController,
      tabBar: CupertinoTabBar(
        activeColor: AppCupertinoTheme.primaryColor,
        inactiveColor: CupertinoColors.systemGrey,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(CupertinoIcons.house),
            activeIcon: Icon(CupertinoIcons.house_fill),
            label: 'Inicio',
          ),
          BottomNavigationBarItem(
            icon: Icon(CupertinoIcons.cube_box),
            activeIcon: Icon(CupertinoIcons.cube_box_fill),
            label: 'Catálogo',
          ),
          BottomNavigationBarItem(
            icon: Icon(CupertinoIcons.qrcode_viewfinder),
            activeIcon: Icon(CupertinoIcons.qrcode_viewfinder),
            label: 'Escáner',
          ),
          BottomNavigationBarItem(
            icon: Icon(CupertinoIcons.arrow_up_arrow_down_circle),
            activeIcon: Icon(CupertinoIcons.arrow_up_arrow_down_circle_fill),
            label: 'Movimientos',
          ),
          BottomNavigationBarItem(
            icon: Icon(CupertinoIcons.chart_bar_square),
            activeIcon: Icon(CupertinoIcons.chart_bar_square_fill),
            label: 'Reportes',
          ),
        ],
      ),
      tabBuilder: (context, index) {
        return CupertinoTabView(
          builder: (tabContext) {
            switch (index) {
              case 0:
                return DashboardView(
                  controller: _dashboardController,
                  onOpenScanner: () => _navigateToTab(2),
                  onOpenRegisterMovement: () {
                    setState(() => _preselectedProductForMovement = null);
                    _navigateToTab(3);
                  },
                  onOpenCreateProduct: () => _openProductForm(tabContext),
                  onSelectProduct: (p) => _openProductDetail(tabContext, p),
                  onLogout: () => _handleLogout(tabContext),
                );
              case 1:
                return ProductsListView(
                  controller: _productsController,
                  onSelectProduct: (p) => _openProductDetail(tabContext, p),
                  onEditProduct: (p) => _openProductForm(tabContext, productToEdit: p),
                  onCreateProduct: () => _openProductForm(tabContext),
                );
              case 2:
                return ScannerView(
                  onProductFoundDetail: (p) => _openProductDetail(tabContext, p),
                  onProductFoundMovement: (p) {
                    setState(() => _preselectedProductForMovement = p);
                    _navigateToTab(3);
                  },
                  onRegisterNewProductWithCode: (code) => _openProductForm(tabContext, prefilledCode: code),
                );
              case 3:
                return RegisterMovementView(
                  key: ValueKey(_preselectedProductForMovement?.id ?? 'default_reg'),
                  initialProduct: _preselectedProductForMovement,
                  controller: _stockMovementsController,
                  onMovementRegistered: () {
                    _dashboardController.loadDashboard();
                    _productsController.loadProducts(refresh: true);
                    setState(() => _preselectedProductForMovement = null);
                    _navigateToTab(4); // Navigate to History/Reports tab
                  },
                );
              case 4:
                return MovementsHistoryView(
                  controller: _stockMovementsController,
                );
              default:
                return const CupertinoPageScaffold(
                  child: Center(child: Text('Pantalla no encontrada')),
                );
            }
          },
        );
      },
    );
  }
}
