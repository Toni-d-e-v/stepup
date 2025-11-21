class AppConstants {
  // API Configuration
  static const String baseUrl = 'http://localhost:3000/api';

  // Endpoints
  static const String authEndpoint = '/auth';
  static const String stepsEndpoint = '/steps';
  static const String leaderboardEndpoint = '/leaderboard';
  static const String groupsEndpoint = '/groups';

  // Storage Keys
  static const String tokenKey = 'auth_token';
  static const String userKey = 'user_data';

  // Step Goals
  static const int defaultStepGoal = 10000;

  // Pagination
  static const int pageSize = 20;

  // Colors
  static const primaryColor = 0xFF6C63FF;
  static const secondaryColor = 0xFF4CAF50;
  static const errorColor = 0xFFE53935;
  static const warningColor = 0xFFFFA726;
  static const successColor = 0xFF66BB6A;

  // App Info
  static const String appName = 'StepUp';
  static const String appVersion = '1.0.0';
}
