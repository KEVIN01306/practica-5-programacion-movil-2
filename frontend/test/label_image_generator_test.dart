import 'package:flutter_test/flutter_test.dart';
import 'package:frontend/shared/utils/label_image_generator.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('LabelImageGenerator', () {
    const pngMagicHeader = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];

    test('generates valid PNG image for LabelExportType.qr', () async {
      final bytes = await LabelImageGenerator.generateLabelImage(
        productName: 'Taladro Percutor 750W',
        productCode: 'PRD-TLD001',
        type: LabelExportType.qr,
      );

      expect(bytes, isNotEmpty);
      expect(bytes.length, greaterThan(100));
      // Verify PNG magic header
      expect(bytes.sublist(0, 8), equals(pngMagicHeader));
    });

    test('generates valid PNG image for LabelExportType.barcode', () async {
      final bytes = await LabelImageGenerator.generateLabelImage(
        productName: 'Taladro Percutor 750W',
        productCode: 'PRD-TLD001',
        type: LabelExportType.barcode,
      );

      expect(bytes, isNotEmpty);
      expect(bytes.length, greaterThan(100));
      expect(bytes.sublist(0, 8), equals(pngMagicHeader));
    });

    test('generates valid PNG image for LabelExportType.both', () async {
      final bytes = await LabelImageGenerator.generateLabelImage(
        productName: 'Taladro Percutor 750W',
        productCode: 'PRD-TLD001',
        type: LabelExportType.both,
      );

      expect(bytes, isNotEmpty);
      expect(bytes.length, greaterThan(100));
      expect(bytes.sublist(0, 8), equals(pngMagicHeader));
    });
  });
}
