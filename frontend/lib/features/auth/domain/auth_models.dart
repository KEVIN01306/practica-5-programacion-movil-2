enum UserRole {
  admin('ADMIN'),
  operator('OPERATOR');

  final String value;
  const UserRole(this.value);

  static UserRole fromString(String val) {
    if (val.toUpperCase() == 'ADMIN') return UserRole.admin;
    return UserRole.operator;
  }
}

class AuthUser {
  final String id;
  final String name;
  final String email;
  final UserRole role;

  const AuthUser({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
  });

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      id: json['id'] as String,
      name: (json['name'] ?? '${json['firstName'] ?? ''} ${json['lastName'] ?? ''}').toString().trim(),
      email: json['email'] as String,
      role: UserRole.fromString((json['role'] ?? 'OPERATOR') as String),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'email': email,
    'role': role.value,
  };
}
