import 'package:flutter/cupertino.dart';
import '../widgets/cupertino_components.dart';
import 'csv_downloader_platform_stub.dart'
    if (dart.library.html) 'csv_downloader_platform_web.dart'
    if (dart.library.io) 'csv_downloader_platform_io.dart';

class CsvDownloader {
  /// Genera un nombre de archivo con formato: `YYYY-MM-DD_HH-mm-ss_<tipo_de_reporte>.csv`
  static String generateFileName(String reportType) {
    final now = DateTime.now();
    final year = now.year.toString().padLeft(4, '0');
    final month = now.month.toString().padLeft(2, '0');
    final day = now.day.toString().padLeft(2, '0');
    final hour = now.hour.toString().padLeft(2, '0');
    final minute = now.minute.toString().padLeft(2, '0');
    final second = now.second.toString().padLeft(2, '0');
    return '$year-$month-${day}_$hour-$minute-${second}_$reportType.csv';
  }

  /// Descarga directamente el archivo CSV en Web o guarda en disco en plataformas nativas/desktop.
  /// Muestra una alerta Cupertino (`showCupertinoAlert`) indicando que el archivo se descargó exitosamente.
  static Future<void> download({
    required BuildContext context,
    required String filename,
    required String content,
  }) async {
    try {
      final savedPath = await saveCsvPlatform(filename: filename, content: content);
      if (!context.mounted) return;

      final message = (savedPath != null && savedPath != filename)
          ? 'El archivo "$filename" se ha descargado exitosamente en:\n$savedPath'
          : 'El archivo "$filename" se ha descargado exitosamente.';

      await showCupertinoAlert(
        context: context,
        title: 'Descarga Exitosa',
        message: message,
      );
    } catch (e) {
      if (!context.mounted) return;
      await showCupertinoAlert(
        context: context,
        title: 'Error al Exportar',
        message: 'No se pudo descargar el archivo "$filename": $e',
      );
    }
  }
}
