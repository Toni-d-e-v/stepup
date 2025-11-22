import '../models/step_model.dart';
import '../utils/constants.dart';
import 'api_service.dart';

class StepService {
  final ApiService _apiService = ApiService();

  Future<StepEntry> addSteps({
    required DateTime date,
    required int steps,
    String source = 'manual',
  }) async {
    try {
      final response = await _apiService.post(
        AppConstants.stepsEndpoint,
        {
          'date': date.toIso8601String(),
          'steps': steps,
          'source': source,
        },
      );

      return StepEntry.fromJson(response);
    } catch (e) {
      throw Exception('Failed to add steps: $e');
    }
  }

  Future<List<StepEntry>> getSteps({
    DateTime? startDate,
    DateTime? endDate,
    int limit = 30,
  }) async {
    try {
      final queryParams = <String, String>{
        'limit': limit.toString(),
      };

      if (startDate != null) {
        queryParams['startDate'] = startDate.toIso8601String();
      }
      if (endDate != null) {
        queryParams['endDate'] = endDate.toIso8601String();
      }

      final response = await _apiService.get(
        AppConstants.stepsEndpoint,
        queryParams: queryParams,
      );

      final List<dynamic> stepsList = (response as List<dynamic>);
      return stepsList.map((step) => StepEntry.fromJson(step as Map<String, dynamic>)).toList();
    } catch (e) {
      throw Exception('Failed to get steps: $e');
    }
  }

  Future<Statistics> getStatistics() async {
    try {
      final response = await _apiService.get(
        '${AppConstants.stepsEndpoint}/statistics',
      );

      return Statistics.fromJson(response);
    } catch (e) {
      throw Exception('Failed to get statistics: $e');
    }
  }

  Future<List<StepEntry>> getUserSteps({
    required String userId,
    int limit = 7,
  }) async {
    try {
      final response = await _apiService.get(
        '${AppConstants.stepsEndpoint}/user/$userId',
        queryParams: {'limit': limit.toString()},
      );

      final List<dynamic> stepsList = (response as List<dynamic>);
      return stepsList.map((step) => StepEntry.fromJson(step as Map<String, dynamic>)).toList();
    } catch (e) {
      throw Exception('Failed to get user steps: $e');
    }
  }
}
