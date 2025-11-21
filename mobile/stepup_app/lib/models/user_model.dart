class User {
  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String role;
  final int totalSteps;
  final int totalPoints;
  final int dailyStepGoal;
  final String? avatar;
  final List<Badge>? badges;

  User({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.role,
    this.totalSteps = 0,
    this.totalPoints = 0,
    this.dailyStepGoal = 10000,
    this.avatar,
    this.badges,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['_id'] ?? json['id'] ?? '',
      firstName: json['firstName'] ?? '',
      lastName: json['lastName'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 'student',
      totalSteps: json['totalSteps'] ?? 0,
      totalPoints: json['totalPoints'] ?? 0,
      dailyStepGoal: json['dailyStepGoal'] ?? 10000,
      avatar: json['avatar'],
      badges: json['badges'] != null
          ? (json['badges'] as List).map((b) => Badge.fromJson(b)).toList()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'firstName': firstName,
      'lastName': lastName,
      'email': email,
      'role': role,
      'totalSteps': totalSteps,
      'totalPoints': totalPoints,
      'dailyStepGoal': dailyStepGoal,
      'avatar': avatar,
      'badges': badges?.map((b) => b.toJson()).toList(),
    };
  }

  String get fullName => '$firstName $lastName';

  bool get isStudent => role == 'student';
  bool get isProfessor => role == 'professor';
}

class Badge {
  final String name;
  final String icon;
  final DateTime earnedAt;

  Badge({
    required this.name,
    required this.icon,
    required this.earnedAt,
  });

  factory Badge.fromJson(Map<String, dynamic> json) {
    return Badge(
      name: json['name'] ?? '',
      icon: json['icon'] ?? '',
      earnedAt: DateTime.parse(json['earnedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'icon': icon,
      'earnedAt': earnedAt.toIso8601String(),
    };
  }
}
