import 'package:dio/dio.dart';

/// Typed API exceptions for consistent error handling across the app.
class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic data;

  const ApiException({
    required this.message,
    this.statusCode,
    this.data,
  });

  factory ApiException.fromDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return const ApiException(
          message: 'Connection timed out. Check your internet.',
          statusCode: 408,
        );
      case DioExceptionType.connectionError:
        return const ApiException(
          message: 'No internet connection.',
        );
      case DioExceptionType.badResponse:
        final response = error.response;
        final data = response?.data;
        final message = data is Map
            ? (data['message'] as String?) ?? 'Something went wrong'
            : 'Something went wrong';
        return ApiException(
          message: message,
          statusCode: response?.statusCode,
          data: data,
        );
      case DioExceptionType.cancel:
        return const ApiException(message: 'Request cancelled');
      default:
        return ApiException(message: error.message ?? 'Unexpected error');
    }
  }

  bool get isUnauthorized => statusCode == 401;
  bool get isForbidden => statusCode == 403;
  bool get isNotFound => statusCode == 404;
  bool get isTooManyRequests => statusCode == 429;

  /// Backend errorType field (e.g. 'EMAIL_NOT_FOUND', 'EMAIL_NOT_VERIFIED').
  String? get errorType =>
      data is Map ? data['errorType'] as String? : null;

  /// Human-readable error message for display in UI.
  String get userMessage => message;

  @override
  String toString() => message;
}
