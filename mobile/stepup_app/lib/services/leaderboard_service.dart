import '../models/leaderboard_model.dart';
import '../utils/constants.dart';
import 'api_service.dart';

class LeaderboardService {
  final ApiService _apiService = ApiService();

  Future<List<LeaderboardEntry>> getDailyLeaderboard({
    String? role,
    String? groupId,
  }) async {
    try {
      final queryParams = <String, String>{};
      if (role != null) queryParams['role'] = role;
      if (groupId != null) queryParams['groupId'] = groupId;

      final response = await _apiService.get(
        '${AppConstants.leaderboardEndpoint}/daily',
        queryParams: queryParams.isNotEmpty ? queryParams : null,
      );

      if (response is List) {
        return response.map((entry) => LeaderboardEntry.fromJson(entry)).toList();
      } else {
        throw Exception('Unexpected response format');
      }
    } catch (e) {
      throw Exception('Failed to get daily leaderboard: $e');
    }
  }

  Future<List<LeaderboardEntry>> getWeeklyLeaderboard({
    String? role,
    String? groupId,
  }) async {
    try {
      final queryParams = <String, String>{};
      if (role != null) queryParams['role'] = role;
      if (groupId != null) queryParams['groupId'] = groupId;

      final response = await _apiService.get(
        '${AppConstants.leaderboardEndpoint}/weekly',
        queryParams: queryParams.isNotEmpty ? queryParams : null,
      );

      if (response is List) {
        return response.map((entry) => LeaderboardEntry.fromJson(entry)).toList();
      } else {
        throw Exception('Unexpected response format');
      }
    } catch (e) {
      throw Exception('Failed to get weekly leaderboard: $e');
    }
  }

  Future<List<LeaderboardEntry>> getMonthlyLeaderboard({
    String? role,
    String? groupId,
  }) async {
    try {
      final queryParams = <String, String>{};
      if (role != null) queryParams['role'] = role;
      if (groupId != null) queryParams['groupId'] = groupId;

      final response = await _apiService.get(
        '${AppConstants.leaderboardEndpoint}/monthly',
        queryParams: queryParams.isNotEmpty ? queryParams : null,
      );

      if (response is List) {
        return response.map((entry) => LeaderboardEntry.fromJson(entry)).toList();
      } else {
        throw Exception('Unexpected response format');
      }
    } catch (e) {
      throw Exception('Failed to get monthly leaderboard: $e');
    }
  }

  Future<MyRank> getMyRank({String period = 'weekly'}) async {
    try {
      final response = await _apiService.get(
        '${AppConstants.leaderboardEndpoint}/myrank',
        queryParams: {'period': period},
      );

      return MyRank.fromJson(response);
    } catch (e) {
      throw Exception('Failed to get my rank: $e');
    }
  }
}
