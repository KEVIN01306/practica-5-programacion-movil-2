// ignore_for_file: avoid_web_libraries_in_flutter, deprecated_member_use

import 'dart:html' as html;
import 'dart:typed_data';

Future<String?> saveFilePlatform({
  required String filename,
  required Uint8List bytes,
  required String mimeType,
}) async {
  final blob = html.Blob([bytes], mimeType);
  final url = html.Url.createObjectUrlFromBlob(blob);
  html.AnchorElement(href: url)
    ..setAttribute('download', filename)
    ..click();
  html.Url.revokeObjectUrl(url);
  return filename;
}

Future<String?> saveImagePlatform({
  required String filename,
  required Uint8List bytes,
}) async {
  return saveFilePlatform(
    filename: filename,
    bytes: bytes,
    mimeType: 'image/png',
  );
}
