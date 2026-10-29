import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../constants/api_endpoints.dart';
import '../storage/session_storage.dart';

class ApiException implements Exception {
  final String message;
  final String? code;
  final int statusCode;

  ApiException(this.message, {this.code, required this.statusCode});

  @override
  String toString() => message;
}

class ApiResponse<T> {
  final bool isSuccess;
  final String message;
  final T? data;
  final Map<String, dynamic>? meta;
  final int? count;

  ApiResponse({
    required this.isSuccess,
    required this.message,
    this.data,
    this.meta,
    this.count,
  });
}

class ApiClient {
  static ApiClient? _instance;
  static ApiClient get instance => _instance ??= ApiClient._();

  final http.Client _client = http.Client();
  final Duration _timeout = const Duration(seconds: 15);

  ApiClient._();

  Map<String, String> _buildHeaders([Map<String, String>? extra]) {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    final token = SessionStorage.instance.token;
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }

    if (extra != null) {
      headers.addAll(extra);
    }
    return headers;
  }

  Uri _buildUri(String path, [Map<String, dynamic>? queryParams]) {
    final fullUrl = path.startsWith('http') ? path : '${ApiEndpoints.baseUrl}$path';
    final uri = Uri.parse(fullUrl);
    if (queryParams != null && queryParams.isNotEmpty) {
      final stringParams = queryParams.map(
        (key, value) => MapEntry(key, value.toString()),
      );
      return uri.replace(queryParameters: {
        ...uri.queryParameters,
        ...stringParams,
      });
    }
    return uri;
  }

  Future<ApiResponse<dynamic>> get(
    String path, {
    Map<String, dynamic>? queryParams,
    Map<String, String>? headers,
  }) async {
    try {
      final uri = _buildUri(path, queryParams);
      final response = await _client
          .get(uri, headers: _buildHeaders(headers))
          .timeout(_timeout);
      return _handleResponse(response);
    } on SocketException {
      throw ApiException(
        'No se pudo conectar con el servidor. Verifica tu conexión de red.',
        statusCode: 0,
      );
    } on http.ClientException {
      throw ApiException(
        'Falla de conexión con el backend.',
        statusCode: 0,
      );
    }
  }

  Future<ApiResponse<dynamic>> post(
    String path, {
    dynamic body,
    Map<String, String>? headers,
  }) async {
    try {
      final uri = _buildUri(path);
      final response = await _client
          .post(
            uri,
            headers: _buildHeaders(headers),
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(_timeout);
      return _handleResponse(response);
    } on SocketException {
      throw ApiException(
        'No se pudo conectar con el servidor. Verifica tu conexión de red.',
        statusCode: 0,
      );
    } on http.ClientException {
      throw ApiException(
        'Falla de conexión con el backend.',
        statusCode: 0,
      );
    }
  }

  Future<ApiResponse<dynamic>> put(
    String path, {
    dynamic body,
    Map<String, String>? headers,
  }) async {
    try {
      final uri = _buildUri(path);
      final response = await _client
          .put(
            uri,
            headers: _buildHeaders(headers),
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(_timeout);
      return _handleResponse(response);
    } on SocketException {
      throw ApiException(
        'No se pudo conectar con el servidor. Verifica tu conexión.',
        statusCode: 0,
      );
    }
  }

  Future<ApiResponse<dynamic>> patch(
    String path, {
    dynamic body,
    Map<String, String>? headers,
  }) async {
    try {
      final uri = _buildUri(path);
      final response = await _client
          .patch(
            uri,
            headers: _buildHeaders(headers),
            body: body != null ? jsonEncode(body) : null,
          )
          .timeout(_timeout);
      return _handleResponse(response);
    } on SocketException {
      throw ApiException(
        'No se pudo conectar con el servidor. Verifica tu conexión.',
        statusCode: 0,
      );
    }
  }

  Future<ApiResponse<dynamic>> delete(
    String path, {
    Map<String, String>? headers,
  }) async {
    try {
      final uri = _buildUri(path);
      final response = await _client
          .delete(uri, headers: _buildHeaders(headers))
          .timeout(_timeout);
      return _handleResponse(response);
    } on SocketException {
      throw ApiException(
        'No se pudo conectar con el servidor.',
        statusCode: 0,
      );
    }
  }

  ApiResponse<dynamic> _handleResponse(http.Response response) {
    dynamic decoded;
    try {
      if (response.body.isNotEmpty) {
        decoded = jsonDecode(response.body);
      }
    } catch (_) {
      decoded = null;
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (decoded is Map<String, dynamic>) {
        return ApiResponse<dynamic>(
          isSuccess: true,
          message: (decoded['message'] ?? 'Operación exitosa') as String,
          data: decoded['data'],
          meta: decoded['meta'] is Map<String, dynamic> ? decoded['meta'] as Map<String, dynamic> : null,
          count: decoded['count'] is int ? decoded['count'] as int : null,
        );
      }
      return ApiResponse<dynamic>(
        isSuccess: true,
        message: 'Operación exitosa',
        data: decoded,
      );
    }

    // Handle Error
    String errorMessage = 'Ocurrió un error en la solicitud (${response.statusCode})';
    String? errorCode;

    if (decoded is Map<String, dynamic>) {
      if (decoded['message'] != null) {
        errorMessage = decoded['message'].toString();
      }
      if (decoded['code'] != null) {
        errorCode = decoded['code'].toString();
      }
    }

    if (response.statusCode == 401) {
      // Token expired or invalid
      if (errorCode == 'TOKEN_EXPIRED') {
        errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.';
      } else {
        errorMessage = errorMessage.isNotEmpty ? errorMessage : 'Credenciales inválidas o no autorizado';
      }
    } else if (response.statusCode == 403) {
      errorMessage = 'No tienes permisos para realizar esta acción';
    }

    throw ApiException(
      errorMessage,
      code: errorCode,
      statusCode: response.statusCode,
    );
  }
}
