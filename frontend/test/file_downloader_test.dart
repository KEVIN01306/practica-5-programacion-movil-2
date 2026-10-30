import 'package:flutter_test/flutter_test.dart';
import 'package:frontend/shared/utils/file_downloader.dart';

void main() {
  group('FileDownloader', () {
    test('sanitizeFileName cleans illegal filesystem characters', () {
      final dirty = 'Producto: "Especial" / Modelo <X> | 2026? *';
      final clean = FileDownloader.sanitizeFileName(dirty);
      expect(clean.contains(':'), isFalse);
      expect(clean.contains('"'), isFalse);
      expect(clean.contains('/'), isFalse);
      expect(clean.contains('<'), isFalse);
      expect(clean.contains('>'), isFalse);
      expect(clean.contains('|'), isFalse);
      expect(clean.contains('?'), isFalse);
      expect(clean.contains('*'), isFalse);
      expect(clean, isNotEmpty);
    });

    test('generateTimestampedName formats timestamp correctly', () {
      final name = FileDownloader.generateTimestampedName(
        prefix: 'Martillo_PRD-001_QR',
        extension: 'png',
      );
      final regex = RegExp(r'^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}_Martillo_PRD-001_QR\.png$');
      expect(regex.hasMatch(name), isTrue, reason: 'Generated name $name does not match expected format');
    });

    test('generateTimestampedName handles leading dot in extension', () {
      final name = FileDownloader.generateTimestampedName(
        prefix: 'Reporte',
        extension: '.csv',
      );
      expect(name.endsWith('.csv'), isTrue);
      expect(name.endsWith('..csv'), isFalse);
    });
  });
}
