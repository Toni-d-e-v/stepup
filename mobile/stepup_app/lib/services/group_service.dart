import '../models/group_model.dart';
import '../models/leaderboard_model.dart';
import '../utils/constants.dart';
import 'api_service.dart';

class GroupService {
  final ApiService _apiService = ApiService();

  Future<List<Group>> getGroups({String? type}) async {
    try {
      final queryParams = <String, String>{};
      if (type != null) queryParams['type'] = type;

      final response = await _apiService.get(
        AppConstants.groupsEndpoint,
        queryParams: queryParams.isNotEmpty ? queryParams : null,
      );

      final List<dynamic> groupsList = response is List ? response : (response as List<dynamic>);
      return groupsList.map((group) => Group.fromJson(group as Map<String, dynamic>)).toList();
    } catch (e) {
      throw Exception('Failed to get groups: $e');
    }
  }

  Future<Group> createGroup({
    required String name,
    required String type,
    String? description,
  }) async {
    try {
      final response = await _apiService.post(
        AppConstants.groupsEndpoint,
        {
          'name': name,
          'type': type,
          if (description != null) 'description': description,
        },
      );

      return Group.fromJson(response);
    } catch (e) {
      throw Exception('Failed to create group: $e');
    }
  }

  Future<Group> getGroup(String groupId) async {
    try {
      final response = await _apiService.get(
        '${AppConstants.groupsEndpoint}/$groupId',
      );

      return Group.fromJson(response);
    } catch (e) {
      throw Exception('Failed to get group: $e');
    }
  }

  Future<void> joinGroup(String groupId) async {
    try {
      await _apiService.post(
        '${AppConstants.groupsEndpoint}/$groupId/join',
        {},
      );
    } catch (e) {
      throw Exception('Failed to join group: $e');
    }
  }

  Future<void> leaveGroup(String groupId) async {
    try {
      await _apiService.post(
        '${AppConstants.groupsEndpoint}/$groupId/leave',
        {},
      );
    } catch (e) {
      throw Exception('Failed to leave group: $e');
    }
  }

  Future<List<LeaderboardEntry>> getGroupLeaderboard(String groupId) async {
    try {
      final response = await _apiService.get(
        '${AppConstants.groupsEndpoint}/$groupId/leaderboard',
      );

      final List<dynamic> leaderboardList = response is List ? response : (response as List<dynamic>);
      return leaderboardList.map((entry) => LeaderboardEntry.fromJson(entry as Map<String, dynamic>)).toList();
    } catch (e) {
      throw Exception('Failed to get group leaderboard: $e');
    }
  }
}
