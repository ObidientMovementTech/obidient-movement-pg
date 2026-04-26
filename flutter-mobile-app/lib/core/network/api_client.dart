import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../config/env.dart';
import '../storage/secure_storage.dart';
import 'api_endpoints.dart';

/// Global callback invoked when a 401 is received (token expired / invalid).
/// Set by the auth layer to trigger logout + redirect to login.
typedef OnUnauthorized = void Function();

class ApiClient {
  late final Dio _dio;
  final OnUnauthorized? onUnauthorized;
  bool _isRefreshing = false;

  ApiClient({this.onUnauthorized}) {
    _dio = Dio(
      BaseOptions(
        baseUrl: Env.baseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Type': 'mobile',
        },
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await SecureStorage.getToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          if (error.response?.statusCode == 401 &&
              !error.requestOptions.path.contains('/auth/refresh') &&
              !error.requestOptions.path.contains('/auth/login')) {
            // Try refresh before giving up
            final retried = await _tryRefreshAndRetry(error);
            if (retried != null) {
              return handler.resolve(retried);
            }
            // Refresh failed — force logout
            await SecureStorage.clearAll();
            onUnauthorized?.call();
          }
          handler.next(error);
        },
      ),
    );

    if (Env.isDev) {
      _dio.interceptors.add(
        LogInterceptor(
          requestBody: true,
          responseBody: true,
          logPrint: (obj) => debugPrint(obj.toString()),
        ),
      );
    }
  }

  /// Attempt to refresh token and retry the failed request.
  Future<Response?> _tryRefreshAndRetry(DioException error) async {
    if (_isRefreshing) return null;
    _isRefreshing = true;

    try {
      final refreshToken = await SecureStorage.getRefreshToken();
      if (refreshToken == null) return null;

      final refreshRes = await Dio(BaseOptions(
        baseUrl: Env.baseUrl,
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Type': 'mobile',
        },
      )).post(
        ApiEndpoints.refreshToken,
        data: {'refreshToken': refreshToken},
      );

      final data = refreshRes.data as Map<String, dynamic>;
      final newToken = data['token'] as String?;
      final newRefresh = data['refreshToken'] as String?;

      if (newToken != null) {
        await SecureStorage.setToken(newToken);
        if (newRefresh != null) {
          await SecureStorage.setRefreshToken(newRefresh);
        }

        // Retry the original request with new token
        final opts = error.requestOptions;
        opts.headers['Authorization'] = 'Bearer $newToken';
        return await _dio.fetch(opts);
      }
    } catch (_) {
      // Refresh failed
    } finally {
      _isRefreshing = false;
    }
    return null;
  }

  /// Update base URL at runtime (e.g. when switching environments).
  void updateBaseUrl() {
    _dio.options.baseUrl = Env.baseUrl;
  }

  // ── HTTP methods ───────────────────────────────────────────────

  Future<Response> get(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) =>
      _dio.get(path, queryParameters: queryParameters);

  Future<Response> post(
    String path, {
    dynamic data,
  }) =>
      _dio.post(path, data: data);

  Future<Response> put(
    String path, {
    dynamic data,
  }) =>
      _dio.put(path, data: data);

  Future<Response> patch(
    String path, {
    dynamic data,
  }) =>
      _dio.patch(path, data: data);

  Future<Response> delete(
    String path, {
    dynamic data,
  }) =>
      _dio.delete(path, data: data);

  /// For multipart file uploads.
  Future<Response> upload(
    String path, {
    required FormData formData,
  }) =>
      _dio.post(
        path,
        data: formData,
        options: Options(contentType: 'multipart/form-data'),
      );
}
