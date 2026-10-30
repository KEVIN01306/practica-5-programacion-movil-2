import 'dart:convert';
import 'dart:io';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/foundation.dart';
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

  /// Extrae el nombre simple de la carpeta de destino sin exponer la ruta del sistema
  static String extractFolderName(Uri uri) {
    try {
      if (!kIsWeb && uri.scheme == 'file') {
        final filePath = uri.toFilePath();
        final parentDir = File(filePath).parent;
        final segments = parentDir.path
            .split(Platform.pathSeparator)
            .where((s) => s.isNotEmpty)
            .toList();
        if (segments.isNotEmpty) {
          final rawName = segments.last;
          if (rawName.toLowerCase() == 'download' || rawName.toLowerCase() == 'downloads') {
            return 'Descargas';
          }
          if (rawName.toLowerCase() == 'documents' || rawName.toLowerCase() == 'documentos') {
            return 'Documentos';
          }
          return rawName;
        }
      } else if (uri.pathSegments.isNotEmpty) {
        final segments = uri.pathSegments.where((s) => s.isNotEmpty).toList();
        if (segments.length >= 2) {
          final rawName = Uri.decodeComponent(segments[segments.length - 2]);
          if (rawName.toLowerCase() == 'download' || rawName.toLowerCase() == 'downloads') {
            return 'Descargas';
          }
          return rawName;
        }
      }
    } catch (_) {}
    return 'seleccionada';
  }

  /// Permite al usuario seleccionar mediante FilePicker la carpeta y ubicación donde desea guardar el CSV.
  /// Muestra únicamente el nombre de la carpeta seleccionada sin exponer la ruta técnica del sistema.
  static Future<void> download({
    required BuildContext context,
    required String filename,
    required String content,
  }) async {
    try {
      final bytes = Uint8List.fromList(utf8.encode(content));
      final savedUri = await FilePicker.saveFile(
        dialogTitle: 'Seleccionar ubicación para guardar el reporte CSV',
        fileName: filename,
        bytes: bytes,
        mimeType: 'text/csv',
      );

      // Si el usuario canceló el selector de archivos, terminamos sin error
      if (savedUri == null) {
        return;
      }

      if (!context.mounted) return;

      final folderName = extractFolderName(savedUri);

      await showCupertinoAlert(
        context: context,
        title: 'Reporte Exportado',
        message: 'Se exportó el CSV con éxito en la carpeta $folderName.',
      );
    } catch (_) {
      // Fallback a guardado directo en carpeta pública de descargas
      try {
        await saveCsvPlatform(filename: filename, content: content);
        if (!context.mounted) return;

        await showCupertinoAlert(
          context: context,
          title: 'Reporte Exportado',
          message: 'Se exportó el CSV con éxito en la carpeta Descargas.',
        );
      } catch (e) {
        if (!context.mounted) return;
        await showCupertinoAlert(
          context: context,
          title: 'Error al Exportar',
          message: 'No se pudo exportar el archivo CSV: $e',
        );
      }
    }
  }
}
