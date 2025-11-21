import 'user_model.dart';

class Group {
  final String id;
  final String name;
  final String type;
  final String description;
  final List<User>? members;
  final User? admin;
  final int totalSteps;
  final DateTime createdAt;

  Group({
    required this.id,
    required this.name,
    required this.type,
    this.description = '',
    this.members,
    this.admin,
    this.totalSteps = 0,
    required this.createdAt,
  });

  factory Group.fromJson(Map<String, dynamic> json) {
    return Group(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? '',
      type: json['type'] ?? 'custom',
      description: json['description'] ?? '',
      members: json['members'] != null
          ? (json['members'] as List).map((m) => User.fromJson(m)).toList()
          : null,
      admin: json['admin'] != null ? User.fromJson(json['admin']) : null,
      totalSteps: json['totalSteps'] ?? 0,
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'type': type,
      'description': description,
      'members': members?.map((m) => m.toJson()).toList(),
      'admin': admin?.toJson(),
      'totalSteps': totalSteps,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  int get memberCount => members?.length ?? 0;

  String get typeDisplay {
    switch (type) {
      case 'class':
        return 'Class';
      case 'generation':
        return 'Generation';
      case 'all_students':
        return 'All Students';
      case 'all_professors':
        return 'All Professors';
      default:
        return 'Custom';
    }
  }
}
