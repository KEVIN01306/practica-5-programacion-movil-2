import 'dart:typed_data';
import 'package:flutter/cupertino.dart';

import '../widgets/cupertino_components.dart';
import 'csv_downloader.dart';
import 'file_downloader_platform_stub.dart'
    if (dart.library.html) 'file_downloader_platform_web.dart'
    if (dart.library.io) 'file_downloader_platform_io.dart';

class FileDownloader {
  /// Limpia caracteres no permitidos en sistemas de archivos
  static String sanitizeFileName(String input) {
    final sanitized = input
        .replaceAll(RegExp(r'[\\/:*?"<>|]'), '_')
        .replaceAll(RegExp(r'\s+'), '_')
        .trim();
    return sanitized.isEmpty ? 'archivo' : sanitized;
  }

  /// Genera un nombre de archivo con marca de tiempo: `YYYY-MM-DD_HH-mm-ss_<identificador>.<ext>`
  static String generateTimestampedName({
    required String prefix,
    required String extension,
  }) {
    final now = DateTime.now();
    final y = now.year.toString().padLeft(4, '0');
    final m = now.month.toString().padLeft(2, '0');
    final d = now.day.toString().padLeft(2, '0');
    final h = now.hour.toString().padLeft(2, '0');
    final min = now.minute.toString().padLeft(2, '0');
    final s = now.second.toString().padLeft(2, '0');
    final cleanPrefix = sanitizeFileName(prefix);
    final cleanExt = extension.startsWith('.') ? extension : '.$extension';
    return '$y-$m-${d}_$h-$min-${s}_$cleanPrefix$cleanExt';
  }

  /// Descarga y persiste una imagen tanto en la galería pública del dispositivo (vía Gal)
  /// como en la carpeta pública de descargas (Download), mostrando un mensaje amigable sin rutas técnicas.
  static Future<String?> downloadImage({
    required BuildContext context,
    required String filename,
    required Uint8List bytes,
    String title = 'Imagen Guardada',
  }) async {
    try {
      final savedLocation = await saveImagePlatform(
        filename: filename,
        bytes: bytes,
      );
      if (!context.mounted) return savedLocation;

      await showCupertinoAlert(
        context: context,
        title: title,
        message: 'Se guardó exitosamente en el álbum "Inventario".',
      );
      return savedLocation;
    } catch (e) {
      if (!context.mounted) return null;
      await showCupertinoAlert(
        context: context,
        title: 'Error al Guardar Imagen',
        message: 'No se pudo guardar la imagen: $e',
      );
      return null;
    }
  }

  /// Descarga y persiste un archivo binario genérico en carpetas públicas
  static Future<String?> downloadBytes({
    required BuildContext context,
    required String filename,
    required Uint8List bytes,
    required String mimeType,
    String title = 'Descarga Exitosa',
    String? successMessage,
  }) async {
    try {
      final savedPath = await saveFilePlatform(
        filename: filename,
        bytes: bytes,
        mimeType: mimeType,
      );
      if (!context.mounted) return savedPath;

      await showCupertinoAlert(
        context: context,
        title: title,
        message: successMessage ?? 'Se exportó el archivo con éxito en la carpeta Descargas.',
      );
      return savedPath;
    } catch (e) {
      if (!context.mounted) return null;
      await showCupertinoAlert(
        context: context,
        title: 'Error al Descargar',
        message: 'No se pudo descargar el archivo: $e',
      );
      return null;
    }
  }

  /// Descarga y persiste un archivo CSV permitiendo al usuario escoger la carpeta con FilePicker
  static Future<String?> downloadText({
    required BuildContext context,
    required String filename,
    required String content,
    required String mimeType,
    String title = 'Reporte Exportado',
    String? successMessage,
  }) async {
    await CsvDownloader.download(
      context: context,
      filename: filename,
      content: content,
    );
    return filename;
  }
}
