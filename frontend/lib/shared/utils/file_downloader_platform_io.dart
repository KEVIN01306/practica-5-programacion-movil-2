import 'dart:io';
import 'dart:typed_data';
import 'package:gal/gal.dart';
import 'package:path_provider/path_provider.dart';

Future<String?> saveFilePlatform({
  required String filename,
  required Uint8List bytes,
  required String mimeType,
}) async {
  String? targetDirPath;

  // 1. Android: intentar ruta estándar de Descargas externa pública
  if (Platform.isAndroid) {
    final publicDownloads = Directory('/storage/emulated/0/Download');
    if (publicDownloads.existsSync()) {
      targetDirPath = publicDownloads.path;
    }
  }

  // 2. getDownloadsDirectory (macOS, Windows, Linux, Android)
  if (targetDirPath == null) {
    try {
      final downloadsDir = await getDownloadsDirectory();
      if (downloadsDir != null && downloadsDir.existsSync()) {
        targetDirPath = downloadsDir.path;
      }
    } catch (_) {}
  }

  // 3. macOS / Linux HOME/Downloads
  if (targetDirPath == null && (Platform.isMacOS || Platform.isLinux)) {
    final home = Platform.environment['HOME'];
    if (home != null && home.isNotEmpty) {
      final downloads = Directory('$home/Downloads');
      if (downloads.existsSync()) {
        targetDirPath = downloads.path;
      }
    }
  }

  // 4. Windows USERPROFILE\Downloads
  if (targetDirPath == null && Platform.isWindows) {
    final userProfile = Platform.environment['USERPROFILE'];
    if (userProfile != null && userProfile.isNotEmpty) {
      final downloads = Directory('$userProfile\\Downloads');
      if (downloads.existsSync()) {
        targetDirPath = downloads.path;
      }
    }
  }

  // 5. getApplicationDocumentsDirectory (iOS y entornos sandbox móvil)
  if (targetDirPath == null) {
    try {
      final docsDir = await getApplicationDocumentsDirectory();
      if (docsDir.existsSync()) {
        targetDirPath = docsDir.path;
      }
    } catch (_) {}
  }

  // 6. Fallback final al directorio temporal del sistema
  targetDirPath ??= Directory.systemTemp.path;

  final filePath = '$targetDirPath${Platform.pathSeparator}$filename';
  final file = File(filePath);
  await file.writeAsBytes(bytes, flush: true);
  return filePath;
}

/// Guarda la imagen en la galería pública (usando Gal) y en la carpeta pública de descargas
Future<String?> saveImagePlatform({
  required String filename,
  required Uint8List bytes,
}) async {
  bool savedToGallery = false;

  // 1. Intentar persistir en la galería pública con Gal
  try {
    final baseName = filename.toLowerCase().endsWith('.png')
        ? filename.substring(0, filename.length - 4)
        : filename;
    await Gal.putImageBytes(bytes, name: baseName, album: 'Inventario');
    savedToGallery = true;
  } catch (_) {
    // Si falla o no tiene permisos en ese momento, se continúa con la descarga en carpeta física
  }

  // 2. Persistir archivo físico en la carpeta pública de Descargas
  final filePath = await saveFilePlatform(
    filename: filename,
    bytes: bytes,
    mimeType: 'image/png',
  );

  if (savedToGallery && filePath != null) {
    return 'Galería pública (Álbum "Inventario") y en:\n\n$filePath';
  } else if (savedToGallery) {
    return 'Galería pública (Álbum "Inventario")';
  }

  return filePath;
}
