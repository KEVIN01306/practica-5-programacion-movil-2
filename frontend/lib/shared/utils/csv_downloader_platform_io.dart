import 'dart:io';
import 'package:path_provider/path_provider.dart';

Future<String?> saveCsvPlatform({
  required String filename,
  required String content,
}) async {
  String? targetDirPath;

  // 1. Intentar getDownloadsDirectory (macOS, Windows, Linux, Android)
  try {
    final downloadsDir = await getDownloadsDirectory();
    if (downloadsDir != null && downloadsDir.existsSync()) {
      targetDirPath = downloadsDir.path;
    }
  } catch (_) {}

  // 2. Si es Android, intentar ruta estándar de Descargas externa pública
  if (targetDirPath == null && Platform.isAndroid) {
    final publicDownloads = Directory('/storage/emulated/0/Download');
    if (publicDownloads.existsSync()) {
      targetDirPath = publicDownloads.path;
    }
  }

  // 3. Si es macOS / Linux y no se obtuvo por path_provider, consultar variable HOME
  if (targetDirPath == null && (Platform.isMacOS || Platform.isLinux)) {
    final home = Platform.environment['HOME'];
    if (home != null && home.isNotEmpty) {
      final downloads = Directory('$home/Downloads');
      if (downloads.existsSync()) {
        targetDirPath = downloads.path;
      }
    }
  }

  // 4. Si es Windows, consultar USERPROFILE/Downloads
  if (targetDirPath == null && Platform.isWindows) {
    final userProfile = Platform.environment['USERPROFILE'];
    if (userProfile != null && userProfile.isNotEmpty) {
      final downloads = Directory('$userProfile\\Downloads');
      if (downloads.existsSync()) {
        targetDirPath = downloads.path;
      }
    }
  }

  // 5. Intentar getApplicationDocumentsDirectory (iOS y entornos sandbox móvil)
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
  await file.writeAsString(content, flush: true);
  return filePath;
}
