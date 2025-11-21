class StepEntry {
  final String? id;
  final String userId;
  final DateTime date;
  final int steps;
  final double calories;
  final double distance;
  final bool goalAchieved;
  final int points;
  final String source;

  StepEntry({
    this.id,
    required this.userId,
    required this.date,
    required this.steps,
    this.calories = 0,
    this.distance = 0,
    this.goalAchieved = false,
    this.points = 0,
    this.source = 'manual',
  });

  factory StepEntry.fromJson(Map<String, dynamic> json) {
    return StepEntry(
      id: json['_id'],
      userId: json['user'],
      date: DateTime.parse(json['date']),
      steps: json['steps'] ?? 0,
      calories: (json['calories'] ?? 0).toDouble(),
      distance: (json['distance'] ?? 0).toDouble(),
      goalAchieved: json['goalAchieved'] ?? false,
      points: json['points'] ?? 0,
      source: json['source'] ?? 'manual',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) '_id': id,
      'user': userId,
      'date': date.toIso8601String(),
      'steps': steps,
      'calories': calories,
      'distance': distance,
      'goalAchieved': goalAchieved,
      'points': points,
      'source': source,
    };
  }
}

class Statistics {
  final TodayStats today;
  final PeriodStats weekly;
  final PeriodStats monthly;
  final BestDay? bestDay;

  Statistics({
    required this.today,
    required this.weekly,
    required this.monthly,
    this.bestDay,
  });

  factory Statistics.fromJson(Map<String, dynamic> json) {
    return Statistics(
      today: TodayStats.fromJson(json['today']),
      weekly: PeriodStats.fromJson(json['weekly']),
      monthly: PeriodStats.fromJson(json['monthly']),
      bestDay: json['bestDay'] != null ? BestDay.fromJson(json['bestDay']) : null,
    );
  }
}

class TodayStats {
  final int steps;
  final bool goalAchieved;
  final int points;

  TodayStats({
    required this.steps,
    required this.goalAchieved,
    required this.points,
  });

  factory TodayStats.fromJson(Map<String, dynamic> json) {
    return TodayStats(
      steps: json['steps'] ?? 0,
      goalAchieved: json['goalAchieved'] ?? false,
      points: json['points'] ?? 0,
    );
  }
}

class PeriodStats {
  final int totalSteps;
  final double avgSteps;
  final int totalPoints;
  final int daysActive;
  final int goalsAchieved;

  PeriodStats({
    required this.totalSteps,
    required this.avgSteps,
    required this.totalPoints,
    required this.daysActive,
    required this.goalsAchieved,
  });

  factory PeriodStats.fromJson(Map<String, dynamic> json) {
    return PeriodStats(
      totalSteps: json['totalSteps'] ?? 0,
      avgSteps: (json['avgSteps'] ?? 0).toDouble(),
      totalPoints: json['totalPoints'] ?? 0,
      daysActive: json['daysActive'] ?? 0,
      goalsAchieved: json['goalsAchieved'] ?? 0,
    );
  }
}

class BestDay {
  final DateTime date;
  final int steps;

  BestDay({
    required this.date,
    required this.steps,
  });

  factory BestDay.fromJson(Map<String, dynamic> json) {
    return BestDay(
      date: DateTime.parse(json['date']),
      steps: json['steps'] ?? 0,
    );
  }
}
