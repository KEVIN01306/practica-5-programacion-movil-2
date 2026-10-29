import 'package:flutter/cupertino.dart';
import '../../../../core/theme/cupertino_theme.dart';
import 'scanner_reticle_painter.dart';

class ScannerViewfinder extends StatelessWidget {
  final Animation<double> scanAnimation;
  final double size;

  const ScannerViewfinder({
    super.key,
    required this.scanAnimation,
    this.size = 270.0,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        children: [
          // Corner Brackets
          CustomPaint(
            size: Size(size, size),
            painter: ScannerReticlePainter(),
          ),

          // Animated Laser Line
          AnimatedBuilder(
            animation: scanAnimation,
            builder: (context, _) {
              return Positioned(
                top: size * scanAnimation.value,
                left: 10,
                right: 10,
                child: Container(
                  height: 2.5,
                  decoration: BoxDecoration(
                    color: AppCupertinoTheme.primaryColor,
                    boxShadow: [
                      BoxShadow(
                        color: AppCupertinoTheme.primaryColor.withValues(alpha: 0.8),
                        blurRadius: 8,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
