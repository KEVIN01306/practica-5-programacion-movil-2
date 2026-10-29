import 'package:flutter/cupertino.dart';

/// Code 128 Type B Barcode generator & painter
class Barcode128Widget extends StatelessWidget {
  final String code;
  final double height;
  final double width;
  final bool showText;

  const Barcode128Widget({
    super.key,
    required this.code,
    this.height = 70.0,
    this.width = 240.0,
    this.showText = true,
  });

  @override
  Widget build(BuildContext context) {
    final cleanCode = code.trim().isEmpty ? 'SAMPLE' : code.trim();
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 8.0),
          decoration: BoxDecoration(
            color: CupertinoColors.white,
            borderRadius: BorderRadius.circular(8.0),
            border: Border.all(color: CupertinoColors.systemGrey4),
          ),
          child: CustomPaint(
            size: Size(width, height),
            painter: _Code128Painter(cleanCode),
          ),
        ),
        if (showText) ...[
          const SizedBox(height: 6.0),
          Text(
            cleanCode,
            style: const TextStyle(
              fontFamily: 'Courier',
              fontSize: 13.0,
              fontWeight: FontWeight.w600,
              letterSpacing: 2.0,
              color: CupertinoColors.darkBackgroundGray,
            ),
          ),
        ],
      ],
    );
  }
}

class _Code128Painter extends CustomPainter {
  final String text;

  // Code 128 Character Patterns (Start B is index 104, Stop is 106)
  static const List<String> _patterns = [
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

  _Code128Painter(this.text);

  @override
  void paint(Canvas canvas, Size size) {
    final List<int> values = [];
    values.add(104); // Start B

    int checksum = 104;
    for (int i = 0; i < text.length; i++) {
      final codePoint = text.codeUnitAt(i);
      final val = (codePoint >= 32 && codePoint <= 126) ? (codePoint - 32) : 0;
      values.add(val);
      checksum += val * (i + 1);
    }
    values.add(checksum % 103);
    values.add(106); // Stop

    final buffer = StringBuffer();
    for (int i = 0; i < values.length; i++) {
      final val = values[i];
      if (val >= 0 && val < _patterns.length) {
        final pattern = _patterns[val];
        for (int p = 0; p < pattern.length; p++) {
          final count = int.parse(pattern[p]);
          final charToAppend = (p % 2 == 0) ? '1' : '0';
          buffer.write(charToAppend * count);
        }
      }
    }
    buffer.write('11'); // Final termination bar

    final patternStr = buffer.toString();
    final moduleWidth = size.width / patternStr.length;

    final paint = Paint()
      ..color = CupertinoColors.black
      ..style = PaintingStyle.fill;

    for (int i = 0; i < patternStr.length; i++) {
      if (patternStr[i] == '1') {
        canvas.drawRect(
          Rect.fromLTWH(i * moduleWidth, 0, moduleWidth + 0.1, size.height),
          paint,
        );
      }
    }
  }

  @override
  bool shouldRepaint(covariant _Code128Painter oldDelegate) => oldDelegate.text != text;
}

/// Standalone QR Code Painter & Widget
class QrCodeWidget extends StatelessWidget {
  final String data;
  final double size;

  const QrCodeWidget({
    super.key,
    required this.data,
    this.size = 140.0,
  });

  @override
  Widget build(BuildContext context) {
    final cleanData = data.trim().isEmpty ? 'PROD' : data.trim();
    return Container(
      width: size,
      height: size,
      padding: const EdgeInsets.all(8.0),
      decoration: BoxDecoration(
        color: CupertinoColors.white,
        borderRadius: BorderRadius.circular(10.0),
        border: Border.all(color: CupertinoColors.systemGrey4),
      ),
      child: CustomPaint(
        size: Size(size - 16.0, size - 16.0),
        painter: _SimpleQrPainter(cleanData),
      ),
    );
  }
}

class _SimpleQrPainter extends CustomPainter {
  final String data;

  _SimpleQrPainter(this.data);

  @override
  void paint(Canvas canvas, Size size) {
    const int gridSize = 21; // Version 1 QR code grid
    final cellSize = size.width / gridSize;
    final paint = Paint()..color = CupertinoColors.black..style = PaintingStyle.fill;

    // Draw standard finder patterns at 3 corners
    _drawFinderPattern(canvas, 0, 0, cellSize, paint);
    _drawFinderPattern(canvas, (gridSize - 7) * cellSize, 0, cellSize, paint);
    _drawFinderPattern(canvas, 0, (gridSize - 7) * cellSize, cellSize, paint);

    // Timing patterns
    for (int i = 8; i < gridSize - 8; i++) {
      if (i % 2 == 0) {
        canvas.drawRect(Rect.fromLTWH(6 * cellSize, i * cellSize, cellSize, cellSize), paint);
        canvas.drawRect(Rect.fromLTWH(i * cellSize, 6 * cellSize, cellSize, cellSize), paint);
      }
    }

    // Deterministic hash based data fill
    final bytes = data.codeUnits;
    int hash = 5381;
    for (final b in bytes) {
      hash = ((hash << 5) + hash) + b;
    }

    for (int r = 0; r < gridSize; r++) {
      for (int c = 0; c < gridSize; c++) {
        // Exclude finder patterns
        final inTopLeft = r < 8 && c < 8;
        final inTopRight = r < 8 && c >= gridSize - 8;
        final inBottomLeft = r >= gridSize - 8 && c < 8;
        final inTiming = r == 6 || c == 6;

        if (inTopLeft || inTopRight || inBottomLeft || inTiming) continue;

        // Pseudo-random bit based on data and cell location
        final bit = ((hash ^ (r * 31 + c * 17) ^ (data.length * 7)) % 2 == 0);
        if (bit) {
          canvas.drawRect(Rect.fromLTWH(c * cellSize, r * cellSize, cellSize, cellSize), paint);
        }
      }
    }
  }

  void _drawFinderPattern(Canvas canvas, double x, double y, double cellSize, Paint paint) {
    // 7x7 outer box
    canvas.drawRect(Rect.fromLTWH(x, y, 7 * cellSize, 7 * cellSize), paint);
    // 5x5 inner white
    final whitePaint = Paint()..color = CupertinoColors.white..style = PaintingStyle.fill;
    canvas.drawRect(Rect.fromLTWH(x + cellSize, y + cellSize, 5 * cellSize, 5 * cellSize), whitePaint);
    // 3x3 inner black
    canvas.drawRect(Rect.fromLTWH(x + 2 * cellSize, y + 2 * cellSize, 3 * cellSize, 3 * cellSize), paint);
  }

  @override
  bool shouldRepaint(covariant _SimpleQrPainter oldDelegate) => oldDelegate.data != data;
}
