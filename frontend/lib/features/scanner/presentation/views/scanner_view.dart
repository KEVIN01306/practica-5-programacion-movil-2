import 'package:flutter/cupertino.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
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

  late final MobileScannerController _scannerController;
  late final AnimationController _animationController;
  late final Animation<double> _scanAnimation;

  bool _isProcessing = false;

  @override
  void initState() {
    super.initState();
    _scannerController = MobileScannerController(
      detectionSpeed: DetectionSpeed.noDuplicates,
      facing: CameraFacing.back,
      torchEnabled: false,
    );

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
    _scannerController.dispose();
    super.dispose();
  }

  void _onBarcodeDetected(BarcodeCapture capture) {
    if (_isProcessing) return;

    for (final barcode in capture.barcodes) {
      final code = barcode.rawValue?.trim();
      if (code != null && code.isNotEmpty) {
        _processScannedCode(code);
        break;
      }
    }
  }

  Future<void> _processScannedCode(String rawCode) async {
    final code = rawCode.trim();
    if (code.isEmpty || _isProcessing) return;

    setState(() => _isProcessing = true);
    try {
      await _scannerController.stop();
    } catch (_) {}

    try {
      final product = await _repository.getProductByCode(code);

      if (!mounted) return;
      setState(() => _isProcessing = false);

      if (product != null) {
        await showScannedProductSheet(
          context: context,
          product: product,
          onSelectMovement: () => widget.onProductFoundMovement(product),
          onSelectDetail: () => widget.onProductFoundDetail(product),
          onDismiss: () {
            if (mounted) {
              _scannerController.start();
            }
          },
        );
      } else {
        await showProductNotFoundDialog(
          context: context,
          code: code,
          onRetry: () {
            if (mounted) {
              _scannerController.start();
            }
          },
          onRegisterNew: () => widget.onRegisterNewProductWithCode(code),
          onDismiss: () {
            if (mounted) {
              _scannerController.start();
            }
          },
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
      if (mounted) {
        _scannerController.start();
      }
    }
  }

  void _openManualInputDialog() {
    showManualCodeInputDialog(
      context: context,
      controller: _manualCodeController,
      onSubmit: (code) => _processScannedCode(code),
    );
  }

  Widget _buildCameraError(BuildContext context, MobileScannerException error) {
    String message;
    switch (error.errorCode) {
      case MobileScannerErrorCode.permissionDenied:
        message = 'Acceso a la cámara denegado. Otorga permiso en Ajustes para escanear.';
        break;
      case MobileScannerErrorCode.unsupported:
        message = 'La cámara o escáner no es soportado en este dispositivo.';
        break;
      default:
        message = error.errorDetails?.message ?? 'No se pudo inicializar la cámara.';
    }

    return Container(
      color: const Color(0xFF141418),
      padding: const EdgeInsets.all(24.0),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              CupertinoIcons.exclamationmark_triangle_fill,
              color: CupertinoColors.systemYellow,
              size: 52,
            ),
            const SizedBox(height: 14),
            const Text(
              'Cámara no disponible',
              style: TextStyle(
                color: CupertinoColors.white,
                fontSize: 17,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: CupertinoColors.systemGrey,
                fontSize: 13,
              ),
            ),
            const SizedBox(height: 18),
            CupertinoButton.filled(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              onPressed: () => _scannerController.start(),
              child: const Text('Reintentar Conexión', style: TextStyle(fontSize: 14)),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      backgroundColor: CupertinoColors.black,
      navigationBar: CupertinoNavigationBar(
        backgroundColor: CupertinoColors.black.withValues(alpha: 0.7),
        middle: const Text('Escáner de Bodega', style: TextStyle(color: CupertinoColors.white)),
        trailing: ValueListenableBuilder<MobileScannerState>(
          valueListenable: _scannerController,
          builder: (context, state, _) {
            final isTorchOn = state.torchState == TorchState.on;
            return Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                CupertinoButton(
                  padding: const EdgeInsets.symmetric(horizontal: 4.0),
                  onPressed: () async {
                    try {
                      await _scannerController.toggleTorch();
                    } catch (_) {}
                  },
                  child: Icon(
                    isTorchOn ? CupertinoIcons.bolt_fill : CupertinoIcons.bolt_slash_fill,
                    color: isTorchOn ? CupertinoColors.systemYellow : CupertinoColors.white,
                    size: 22,
                  ),
                ),
                CupertinoButton(
                  padding: const EdgeInsets.symmetric(horizontal: 4.0),
                  onPressed: () async {
                    try {
                      await _scannerController.switchCamera();
                    } catch (_) {}
                  },
                  child: const Icon(
                    CupertinoIcons.switch_camera,
                    color: CupertinoColors.white,
                    size: 22,
                  ),
                ),
              ],
            );
          },
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

            // Viewfinder Area with Live Camera
            Expanded(
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // Live Camera Stream
                  MobileScanner(
                    controller: _scannerController,
                    onDetect: _onBarcodeDetected,
                    fit: BoxFit.cover,
                    errorBuilder: _buildCameraError,
                    placeholderBuilder: (context) => Container(
                      color: const Color(0xFF141418),
                      child: const Center(
                        child: CupertinoActivityIndicator(
                          radius: 16,
                          color: CupertinoColors.white,
                        ),
                      ),
                    ),
                  ),

                  // Modular Scanner Viewfinder Reticle & Laser
                  ScannerViewfinder(scanAnimation: _scanAnimation),

                  // Processing Overlay Indicator
                  if (_isProcessing)
                    Container(
                      color: CupertinoColors.black.withValues(alpha: 0.65),
                      child: const Center(
                        child: CupertinoLoadingState(
                          message: 'Consultando producto...',
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
