import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'package:flutter_image_compress/flutter_image_compress.dart';

/// Compresses an image file and returns a base64-encoded JPEG string
/// with the `data:image/jpeg;base64,` prefix expected by the server.
Future<String> compressAndEncodeBase64(String filePath) async {
  final result = await FlutterImageCompress.compressWithFile(
    filePath,
    minWidth: 1024,
    minHeight: 1024,
    quality: 70,
    format: CompressFormat.jpeg,
  );

  if (result == null) {
    // Fallback: read raw file bytes
    final bytes = await File(filePath).readAsBytes();
    return 'data:image/jpeg;base64,${base64Encode(bytes)}';
  }

  return 'data:image/jpeg;base64,${base64Encode(Uint8List.fromList(result))}';
}
