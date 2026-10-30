import 'dart:typed_data';

Future<String?> saveFilePlatform({
  required String filename,
  required Uint8List bytes,
  required String mimeType,
}) => throw UnsupportedError('Plataforma no soportada para descarga de archivos.');

Future<String?> saveImagePlatform({
  required String filename,
  required Uint8List bytes,
}) => throw UnsupportedError('Plataforma no soportada para guardar imágenes.');
