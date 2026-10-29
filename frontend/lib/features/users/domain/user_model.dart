import '../../auth/domain/auth_models.dart';

class User {
  final String id;
  final String email;
  final String firstName;
  final String lastName;
  final UserRole role;
  final bool isActive;
  final DateTime createdAt;

  const User({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.role,
    required this.isActive,
    required this.createdAt,
  });

  String get fullName => '$firstName $lastName'.trim();

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      email: json['email'] as String,
      firstName: json['firstName'] as String,
      lastName: json['lastName'] as String,
      role: UserRole.fromString((json['role'] ?? 'OPERATOR') as String),
      isActive: json['isActive'] as bool? ?? true,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'email': email,
    'firstName': firstName,
    'lastName': lastName,
    'role': role.value,
    'isActive': isActive,
    'createdAt': createdAt.toIso8601String(),
  };
}
