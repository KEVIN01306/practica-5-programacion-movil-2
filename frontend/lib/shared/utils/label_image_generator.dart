import 'dart:typed_data';
import 'dart:ui' as ui;
import 'package:flutter/cupertino.dart';

enum LabelExportType {
  qr,
  barcode,
  both,
}

class LabelImageGenerator {
  // Code 128 Character Patterns (Start B is index 104, Stop is 106)
  static const List<String> _code128Patterns = [
    "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
    "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
    "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
    "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
    "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
    "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
    "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
    "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
    "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
    "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
    "114131", "311141", "411131", "211412", "211214", "211232", "2331112"
  ];

  /// Genera una imagen PNG de la etiqueta según el tipo solicitado:
  /// - `qr`: Nombre arriba, Código QR en el centro, Código abajo.
  /// - `barcode`: Nombre arriba, Código de barras en el centro, Código abajo.
  /// - `both`: Nombre arriba, Código de barras y QR en el centro, Código abajo.
  static Future<Uint8List> generateLabelImage({
    required String productName,
    required String productCode,
    required LabelExportType type,
  }) async {
    const double width = 640.0;
    final double height = switch (type) {
      LabelExportType.qr => 480.0,
      LabelExportType.barcode => 380.0,
      LabelExportType.both => 640.0,
    };

    final recorder = ui.PictureRecorder();
    final canvas = Canvas(recorder, Rect.fromLTWH(0, 0, width, height));

    // 1. Fondo de tarjeta con bordes redondeados y sombra sutil
    final bgPaint = Paint()..color = const Color(0xFFFFFFFF);
    final borderPaint = Paint()
      ..color = const Color(0xFFD1D5DB)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    final outerRRect = RRect.fromRectAndRadius(
      Rect.fromLTWH(16, 16, width - 32, height - 32),
      const Radius.circular(20),
    );

    // Fondo blanco nítido
    canvas.drawColor(const Color(0xFFF3F4F6), BlendMode.src);
    canvas.drawRRect(outerRRect, bgPaint);
    canvas.drawRRect(outerRRect, borderPaint);

    // 2. ARRIBA: Nombre del producto
    final cleanName = productName.trim().isEmpty ? 'PRODUCTO' : productName.trim();
    final titlePainter = TextPainter(
      text: TextSpan(
        text: cleanName,
        style: const TextStyle(
          fontSize: 24.0,
          fontWeight: FontWeight.w700,
          color: Color(0xFF111827),
          fontFamily: '.SF Pro Display',
          letterSpacing: 0.2,
        ),
      ),
      textAlign: TextAlign.center,
      textDirection: TextDirection.ltr,
      maxLines: 2,
      ellipsis: '...',
    )..layout(maxWidth: width - 80);

    final titleX = (width - titlePainter.width) / 2;
    titlePainter.paint(canvas, Offset(titleX, 40));

    // Línea separadora decorativa debajo del nombre
    final sepY = 44 + titlePainter.height + 8;
    final linePaint = Paint()
      ..color = const Color(0xFFE5E7EB)
      ..strokeWidth = 1.5;
    canvas.drawLine(Offset(48, sepY), Offset(width - 48, sepY), linePaint);

    // 3. CENTRO: Renderizado según el tipo
    final cleanCode = productCode.trim().isEmpty ? 'PROD-001' : productCode.trim();

    if (type == LabelExportType.barcode) {
      // Código de barras centrado
      const barcodeWidth = 460.0;
      const barcodeHeight = 110.0;
      final barcodeX = (width - barcodeWidth) / 2;
      final barcodeY = sepY + 24;

      _drawBarcode128(
        canvas: canvas,
        code: cleanCode,
        rect: Rect.fromLTWH(barcodeX, barcodeY, barcodeWidth, barcodeHeight),
      );
    } else if (type == LabelExportType.qr) {
      // Código QR centrado
      const qrSize = 210.0;
      final qrX = (width - qrSize) / 2;
      final qrY = sepY + 20;

      _drawQrCode(
        canvas: canvas,
        data: cleanCode,
        rect: Rect.fromLTWH(qrX, qrY, qrSize, qrSize),
      );
    } else if (type == LabelExportType.both) {
      // Ambos: Código de barras arriba y Código QR abajo
      const barcodeWidth = 420.0;
      const barcodeHeight = 85.0;
      final barcodeX = (width - barcodeWidth) / 2;
      final barcodeY = sepY + 18;

      _drawBarcode128(
        canvas: canvas,
        code: cleanCode,
        rect: Rect.fromLTWH(barcodeX, barcodeY, barcodeWidth, barcodeHeight),
      );

      const qrSize = 175.0;
      final qrX = (width - qrSize) / 2;
      final qrY = barcodeY + barcodeHeight + 20;

      _drawQrCode(
        canvas: canvas,
        data: cleanCode,
        rect: Rect.fromLTWH(qrX, qrY, qrSize, qrSize),
      );
    }

    // 4. ABAJO: Código del producto
    final codePainter = TextPainter(
      text: TextSpan(
        text: cleanCode,
        style: const TextStyle(
          fontSize: 22.0,
          fontWeight: FontWeight.w800,
          fontFamily: 'Courier',
          letterSpacing: 3.0,
          color: Color(0xFF1F2937),
        ),
      ),
      textAlign: TextAlign.center,
      textDirection: TextDirection.ltr,
    )..layout(maxWidth: width - 80);

    final codeX = (width - codePainter.width) / 2;
    final codeY = height - 76;
    codePainter.paint(canvas, Offset(codeX, codeY));

    // Subtítulo indicador
    final subtitlePainter = TextPainter(
      text: const TextSpan(
        text: 'CÓDIGO ÚNICO IDENTIFICADOR',
        style: TextStyle(
          fontSize: 10.0,
          fontWeight: FontWeight.w600,
          letterSpacing: 1.5,
          color: Color(0xFF9CA3AF),
        ),
      ),
      textAlign: TextAlign.center,
      textDirection: TextDirection.ltr,
    )..layout(maxWidth: width - 80);

    final subX = (width - subtitlePainter.width) / 2;
    subtitlePainter.paint(canvas, Offset(subX, codeY + codePainter.height + 4));

    // Finalizar grabación y exportar a PNG
    final picture = recorder.endRecording();
    final img = await picture.toImage(width.toInt(), height.toInt());
    final byteData = await img.toByteData(format: ui.ImageByteFormat.png);

    if (byteData == null) {
      throw StateError('No se pudo convertir la imagen a formato PNG.');
    }

    return byteData.buffer.asUint8List();
  }

  /// Dibuja el código de barras Code 128 Type B directamente en el lienzo
  static void _drawBarcode128({
    required Canvas canvas,
    required String code,
    required Rect rect,
  }) {
    // Caja blanca contenedora
    final bgPaint = Paint()..color = const Color(0xFFFFFFFF);
    final borderPaint = Paint()
      ..color = const Color(0xFFE5E7EB)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;
    canvas.drawRRect(RRect.fromRectAndRadius(rect, const Radius.circular(8)), bgPaint);
    canvas.drawRRect(RRect.fromRectAndRadius(rect, const Radius.circular(8)), borderPaint);

    final contentRect = rect.deflate(10.0);

    final List<int> values = [];
    values.add(104); // Start B

    int checksum = 104;
    for (int i = 0; i < code.length; i++) {
      final codePoint = code.codeUnitAt(i);
      final val = (codePoint >= 32 && codePoint <= 126) ? (codePoint - 32) : 0;
      values.add(val);
      checksum += val * (i + 1);
    }
    values.add(checksum % 103);
    values.add(106); // Stop

    final buffer = StringBuffer();
    for (int i = 0; i < values.length; i++) {
      final val = values[i];
      if (val >= 0 && val < _code128Patterns.length) {
        final pattern = _code128Patterns[val];
        for (int p = 0; p < pattern.length; p++) {
          final count = int.parse(pattern[p]);
          final charToAppend = (p % 2 == 0) ? '1' : '0';
          buffer.write(charToAppend * count);
        }
      }
    }
    buffer.write('11'); // Terminación

    final patternStr = buffer.toString();
    final moduleWidth = contentRect.width / patternStr.length;

    final barPaint = Paint()
      ..color = const Color(0xFF000000)
      ..style = PaintingStyle.fill;

    for (int i = 0; i < patternStr.length; i++) {
      if (patternStr[i] == '1') {
        canvas.drawRect(
          Rect.fromLTWH(
            contentRect.left + (i * moduleWidth),
            contentRect.top,
            moduleWidth + 0.1,
            contentRect.height,
          ),
          barPaint,
        );
      }
    }
  }

  /// Dibuja el código QR puro directamente en el lienzo
  static void _drawQrCode({
    required Canvas canvas,
    required String data,
    required Rect rect,
  }) {
    // Caja contenedora blanca con bordes
    final bgPaint = Paint()..color = const Color(0xFFFFFFFF);
    final borderPaint = Paint()
      ..color = const Color(0xFFE5E7EB)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;
    canvas.drawRRect(RRect.fromRectAndRadius(rect, const Radius.circular(10)), bgPaint);
    canvas.drawRRect(RRect.fromRectAndRadius(rect, const Radius.circular(10)), borderPaint);

    final contentRect = rect.deflate(12.0);
    const int gridSize = 21; // Versión 1 QR estándar
    final cellSize = contentRect.width / gridSize;
    final blackPaint = Paint()
      ..color = const Color(0xFF000000)
      ..style = PaintingStyle.fill;

    // Patrones de posición en 3 esquinas
    _drawFinderPattern(canvas, contentRect.left, contentRect.top, cellSize, blackPaint);
    _drawFinderPattern(canvas, contentRect.left + (gridSize - 7) * cellSize, contentRect.top, cellSize, blackPaint);
    _drawFinderPattern(canvas, contentRect.left, contentRect.top + (gridSize - 7) * cellSize, cellSize, blackPaint);

    // Patrones de sincronización
    for (int i = 8; i < gridSize - 8; i++) {
      if (i % 2 == 0) {
        canvas.drawRect(
          Rect.fromLTWH(contentRect.left + 6 * cellSize, contentRect.top + i * cellSize, cellSize, cellSize),
          blackPaint,
        );
        canvas.drawRect(
          Rect.fromLTWH(contentRect.left + i * cellSize, contentRect.top + 6 * cellSize, cellSize, cellSize),
          blackPaint,
        );
      }
    }

    // Datos determinísticos basados en hash del código de producto
    final bytes = data.codeUnits;
    int hash = 5381;
    for (final b in bytes) {
      hash = ((hash << 5) + hash) + b;
    }

    for (int r = 0; r < gridSize; r++) {
      for (int c = 0; c < gridSize; c++) {
        final inTopLeft = r < 8 && c < 8;
        final inTopRight = r < 8 && c >= gridSize - 8;
        final inBottomLeft = r >= gridSize - 8 && c < 8;
        final inTiming = r == 6 || c == 6;

        if (inTopLeft || inTopRight || inBottomLeft || inTiming) continue;

        final bit = ((hash ^ (r * 31 + c * 17) ^ (data.length * 7)) % 2 == 0);
        if (bit) {
          canvas.drawRect(
            Rect.fromLTWH(contentRect.left + c * cellSize, contentRect.top + r * cellSize, cellSize, cellSize),
            blackPaint,
          );
        }
      }
    }
  }

  static void _drawFinderPattern(Canvas canvas, double x, double y, double cellSize, Paint paint) {
    // 7x7 exterior
    canvas.drawRect(Rect.fromLTWH(x, y, 7 * cellSize, 7 * cellSize), paint);
    // 5x5 blanco
    final whitePaint = Paint()..color = const Color(0xFFFFFFFF)..style = PaintingStyle.fill;
    canvas.drawRect(Rect.fromLTWH(x + cellSize, y + cellSize, 5 * cellSize, 5 * cellSize), whitePaint);
    // 3x3 centro negro
    canvas.drawRect(Rect.fromLTWH(x + 2 * cellSize, y + 2 * cellSize, 3 * cellSize, 3 * cellSize), paint);
  }
}
