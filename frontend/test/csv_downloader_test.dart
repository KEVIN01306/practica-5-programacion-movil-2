import 'package:flutter_test/flutter_test.dart';
import 'package:frontend/shared/utils/csv_downloader.dart';

void main() {
  group('CsvDownloader', () {
    test('generateFileName generates format YYYY-MM-DD_HH-mm-ss_<tipo_de_reporte>.csv', () {
      final fileName = CsvDownloader.generateFileName('inventario_general');
      final regex = RegExp(r'^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}_inventario_general\.csv$');
      expect(regex.hasMatch(fileName), isTrue, reason: 'Filename $fileName does not match expected format');
    });

    test('generateFileName generates format for historial_movimientos', () {
      final fileName = CsvDownloader.generateFileName('historial_movimientos');
      final regex = RegExp(r'^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}_historial_movimientos\.csv$');
      expect(regex.hasMatch(fileName), isTrue, reason: 'Filename $fileName does not match expected format');
    });

    test('extractFolderName extracts simple folder name without path', () {
      final uri = Uri.file('/Users/test/Downloads/inventario.csv');
      final folder = CsvDownloader.extractFolderName(uri);
      expect(folder, equals('Descargas'));
      expect(folder.contains('/'), isFalse);
    });

    test('extractFolderName handles documents folder', () {
      final uri = Uri.file('/Users/test/Documents/inventario.csv');
      final folder = CsvDownloader.extractFolderName(uri);
      expect(folder, equals('Documentos'));
      expect(folder.contains('/'), isFalse);
    });

    test('extractFolderName handles custom folder', () {
      final uri = Uri.file('/Users/test/Reportes_Empresa/inventario.csv');
      final folder = CsvDownloader.extractFolderName(uri);
      expect(folder, equals('Reportes_Empresa'));
      expect(folder.contains('/'), isFalse);
    });
  });
}
