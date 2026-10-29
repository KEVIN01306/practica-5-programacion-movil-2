import 'package:flutter/cupertino.dart';
import '../../../../shared/widgets/cupertino_components.dart';
import '../../../products/domain/product_model.dart';
import '../../../products/domain/products_repository.dart';
import '../../../products/infrastructure/products_repository_impl.dart';
import '../widgets/scanner_action_sheets.dart';
import '../widgets/scanner_viewfinder.dart';

class ScannerView extends StatefulWidget {
  final void Function(Product product) onProductFoundDetail;
  final void Function(Product product) onProductFoundMovement;
  final void Function(String prefilledCode) onRegisterNewProductWithCode;

  const ScannerView({
    super.key,
    required this.onProductFoundDetail,
    required this.onProductFoundMovement,
    required this.onRegisterNewProductWithCode,
  });

  @override
  State<ScannerView> createState() => _ScannerViewState();
}

class _ScannerViewState extends State<ScannerView> with SingleTickerProviderStateMixin {
  final ProductsRepository _repository = ProductsRepositoryImpl();
  final TextEditingController _manualCodeController = TextEditingController();

  late AnimationController _animationController;
  late Animation<double> _scanAnimation;

  bool _isProcessing = false;
  bool _isFlashOn = false;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2200),
    )..repeat(reverse: true);

    _scanAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    _manualCodeController.dispose();
    super.dispose();
  }

  Future<void> _processScannedCode(String rawCode) async {
    final code = rawCode.trim();
    if (code.isEmpty || _isProcessing) return;

    setState(() => _isProcessing = true);

    try {
      final product = await _repository.getProductByCode(code);

      if (!mounted) return;
      setState(() => _isProcessing = false);

      if (product != null) {
        showScannedProductSheet(
          context: context,
          product: product,
          onSelectMovement: () => widget.onProductFoundMovement(product),
          onSelectDetail: () => widget.onProductFoundDetail(product),
        );
      } else {
        showProductNotFoundDialog(
          context: context,
          code: code,
          onRetry: () {},
          onRegisterNew: () => widget.onRegisterNewProductWithCode(code),
        );
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _isProcessing = false);
      showCupertinoAlert(
        context: context,
        title: 'Error de Escaneo',
        message: 'No se pudo consultar el código: ${e.toString()}',
      );
    }
  }

  void _openManualInputDialog() {
    showManualCodeInputDialog(
      context: context,
      controller: _manualCodeController,
      onSubmit: (code) => _processScannedCode(code),
    );
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      backgroundColor: CupertinoColors.black,
      navigationBar: CupertinoNavigationBar(
        backgroundColor: CupertinoColors.black.withValues(alpha: 0.7),
        middle: const Text('Escáner de Bodega', style: TextStyle(color: CupertinoColors.white)),
        trailing: CupertinoButton(
          padding: EdgeInsets.zero,
          onPressed: () => setState(() => _isFlashOn = !_isFlashOn),
          child: Icon(
            _isFlashOn ? CupertinoIcons.bolt_fill : CupertinoIcons.bolt_slash_fill,
            color: _isFlashOn ? CupertinoColors.systemYellow : CupertinoColors.white,
            size: 22,
          ),
        ),
      ),
      child: SafeArea(
        child: Column(
          children: [
            // Top instructions bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 10.0),
              color: CupertinoColors.black.withValues(alpha: 0.6),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(CupertinoIcons.barcode_viewfinder, color: CupertinoColors.white, size: 18),
                  SizedBox(width: 8),
                  Text(
                    'Compatible con Código de Barras (Code 128) y QR',
                    style: TextStyle(color: CupertinoColors.white, fontSize: 13, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
            ),

            // Viewfinder Area
            Expanded(
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // Camera Simulation Background Grid
                  Container(
                    color: const Color(0xFF141418),
                    child: Center(
                      child: Icon(
                        CupertinoIcons.camera_fill,
                        size: 90,
                        color: CupertinoColors.white.withValues(alpha: 0.08),
                      ),
                    ),
                  ),

                  // Modular Scanner Viewfinder
                  ScannerViewfinder(scanAnimation: _scanAnimation),

                  // Processing Overlay Indicator
                  if (_isProcessing)
                    Container(
                      color: CupertinoColors.black.withValues(alpha: 0.6),
                      child: const Center(
                        child: CupertinoLoadingState(
                          message: 'Buscando en base de datos...',
                        ),
                      ),
                    ),
                ],
              ),
            ),

            // Bottom Actions Container
            Container(
              padding: const EdgeInsets.all(16.0),
              color: CupertinoColors.secondarySystemGroupedBackground,
              child: Column(
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: CupertinoButton(
                          padding: const EdgeInsets.symmetric(vertical: 12.0),
                          color: CupertinoColors.systemGrey6,
                          borderRadius: BorderRadius.circular(10.0),
                          onPressed: _openManualInputDialog,
                          child: const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(CupertinoIcons.keyboard, size: 18, color: CupertinoColors.label),
                              SizedBox(width: 8),
                              Text(
                                'Digitar Código Manual',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: CupertinoColors.label,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8.0),
                  const Text(
                    'Alinea el código dentro del visor para detección instantánea',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 11, color: CupertinoColors.tertiaryLabel),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
