enum Environment { dev, staging, prod }

class Env {
  static Environment current = Environment.dev;

  /// Override for dev when testing on physical device (set to Mac's local IP)
  static String? devHostOverride;

  static String get baseUrl {
    switch (current) {
      case Environment.dev:
        final host = devHostOverride ?? 'http://10.0.2.2:5000';
        return host;
      case Environment.staging:
        return 'https://staging-api.obidientmovement.com';
      case Environment.prod:
        return 'https://apiv2.obidients.com';
    }
  }

  static String get apiUrl => '$baseUrl/api';

  static String get wsUrl => baseUrl;

  static bool get isDev => current == Environment.dev;
  static bool get isProd => current == Environment.prod;
}
