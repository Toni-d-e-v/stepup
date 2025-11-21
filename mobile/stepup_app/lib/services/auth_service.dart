import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/user_model.dart';
import '../utils/constants.dart';
import 'api_service.dart';

class AuthService {
  final ApiService _apiService = ApiService();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  User? _currentUser;

  User? get currentUser => _currentUser;

  Future<User> register({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    required String role,
  }) async {
    try {
      final response = await _apiService.post(
        '${AppConstants.authEndpoint}/register',
        {
          'firstName': firstName,
          'lastName': lastName,
          'email': email,
          'password': password,
          'role': role,
        },
        requiresAuth: false,
      );

      final token = response['token'];
      await _storage.write(key: AppConstants.tokenKey, value: token);
      _apiService.setToken(token);

      _currentUser = User.fromJson(response);
      await _storage.write(
        key: AppConstants.userKey,
        value: json.encode(_currentUser!.toJson()),
      );

      return _currentUser!;
    } catch (e) {
      throw Exception('Registration failed: $e');
    }
  }

  Future<User> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _apiService.post(
        '${AppConstants.authEndpoint}/login',
        {
          'email': email,
          'password': password,
        },
        requiresAuth: false,
      );

      final token = response['token'];
      await _storage.write(key: AppConstants.tokenKey, value: token);
      _apiService.setToken(token);

      _currentUser = User.fromJson(response);
      await _storage.write(
        key: AppConstants.userKey,
        value: json.encode(_currentUser!.toJson()),
      );

      return _currentUser!;
    } catch (e) {
      throw Exception('Login failed: $e');
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: AppConstants.tokenKey);
    await _storage.delete(key: AppConstants.userKey);
    _apiService.clearToken();
    _currentUser = null;
  }

  Future<bool> isLoggedIn() async {
    final token = await _storage.read(key: AppConstants.tokenKey);
    return token != null;
  }

  Future<void> loadUserFromStorage() async {
    final token = await _storage.read(key: AppConstants.tokenKey);
    final userJson = await _storage.read(key: AppConstants.userKey);

    if (token != null && userJson != null) {
      _apiService.setToken(token);
      _currentUser = User.fromJson(json.decode(userJson));
    }
  }

  Future<User> getCurrentUserProfile() async {
    try {
      final response = await _apiService.get(
        '${AppConstants.authEndpoint}/me',
      );

      _currentUser = User.fromJson(response);
      await _storage.write(
        key: AppConstants.userKey,
        value: json.encode(_currentUser!.toJson()),
      );

      return _currentUser!;
    } catch (e) {
      throw Exception('Failed to get user profile: $e');
    }
  }

  Future<User> updateProfile({
    String? firstName,
    String? lastName,
    int? dailyStepGoal,
    String? avatar,
  }) async {
    try {
      final body = <String, dynamic>{};
      if (firstName != null) body['firstName'] = firstName;
      if (lastName != null) body['lastName'] = lastName;
      if (dailyStepGoal != null) body['dailyStepGoal'] = dailyStepGoal;
      if (avatar != null) body['avatar'] = avatar;

      final response = await _apiService.put(
        '${AppConstants.authEndpoint}/profile',
        body,
      );

      _currentUser = User.fromJson(response);
      await _storage.write(
        key: AppConstants.userKey,
        value: json.encode(_currentUser!.toJson()),
      );

      return _currentUser!;
    } catch (e) {
      throw Exception('Failed to update profile: $e');
    }
  }
}
