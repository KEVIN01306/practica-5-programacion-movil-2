import 'dart:io';

Future<String?> saveCsvPlatform({
  required String filename,
  required String content,
}) async {
  String? targetDirPath;
  final env = Platform.environment;

  if (Platform.isMacOS || Platform.isLinux) {
    final home = env['HOME'];
    if (home != null && home.isNotEmpty) {
      final downloads = Directory('$home/Downloads');
      if (downloads.existsSync()) {
        targetDirPath = downloads.path;
      } else {
        targetDirPath = home;
      }
    }
  } else if (Platform.isWindows) {
    final userProfile = env['USERPROFILE'];
    if (userProfile != null && userProfile.isNotEmpty) {
      final downloads = Directory('$userProfile\\Downloads');
      if (downloads.existsSync()) {
        targetDirPath = downloads.path;
      } else {
        targetDirPath = userProfile;
      }
    }
  }

  targetDirPath ??= Directory.systemTemp.path;

  final filePath = '$targetDirPath${Platform.pathSeparator}$filename';
  final file = File(filePath);
  await file.writeAsString(content, flush: true);
  return filePath;
}
