class LeaderboardEntry {
  final int rank;
  final String userId;
  final String firstName;
  final String lastName;
  final String role;
  final String? avatar;
  final int steps;
  final int? totalSteps;
  final int? points;
  final int? totalPoints;
  final int? daysActive;
  final int? goalsAchieved;
  final double? avgSteps;
  final bool? goalAchieved;

  LeaderboardEntry({
    required this.rank,
    required this.userId,
    required this.firstName,
    required this.lastName,
    required this.role,
    this.avatar,
    this.steps = 0,
    this.totalSteps,
    this.points,
    this.totalPoints,
    this.daysActive,
    this.goalsAchieved,
    this.avgSteps,
    this.goalAchieved,
  });

  factory LeaderboardEntry.fromJson(Map<String, dynamic> json) {
    return LeaderboardEntry(
      rank: json['rank'] ?? 0,
      userId: json['userId'] ?? json['_id'] ?? '',
      firstName: json['firstName'] ?? '',
      lastName: json['lastName'] ?? '',
      role: json['role'] ?? 'student',
      avatar: json['avatar'],
      steps: json['steps'] ?? 0,
      totalSteps: json['totalSteps'],
      points: json['points'],
      totalPoints: json['totalPoints'],
      daysActive: json['daysActive'],
      goalsAchieved: json['goalsAchieved'],
      avgSteps: json['avgSteps']?.toDouble(),
      goalAchieved: json['goalAchieved'],
    );
  }

  String get fullName => '$firstName $lastName';

  String get initials {
    return '${firstName.isNotEmpty ? firstName[0] : ''}${lastName.isNotEmpty ? lastName[0] : ''}'.toUpperCase();
  }
}

class MyRank {
  final int rank;
  final int totalUsers;
  final int steps;
  final String period;

  MyRank({
    required this.rank,
    required this.totalUsers,
    required this.steps,
    required this.period,
  });

  factory MyRank.fromJson(Map<String, dynamic> json) {
    return MyRank(
      rank: json['rank'] ?? 0,
      totalUsers: json['totalUsers'] ?? 0,
      steps: json['steps'] ?? 0,
      period: json['period'] ?? 'weekly',
    );
  }
}
