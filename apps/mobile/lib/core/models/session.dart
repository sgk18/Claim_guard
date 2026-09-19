enum Role { manager, employee, admin }

class Organization {
  final String id;
  final String name;
  final String slug;
  final String currency;
  final String? gstin;
  final String? activeJoinCode;

  Organization({
    required this.id,
    required this.name,
    required this.slug,
    this.currency = 'INR',
    this.gstin,
    this.activeJoinCode,
  });

  factory Organization.fromJson(Map<String, dynamic> json) {
    return Organization(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      slug: json['slug'] ?? '',
      currency: json['currency'] ?? 'INR',
      gstin: json['gstin'],
      activeJoinCode: json['activeJoinCode'],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'slug': slug,
    'currency': currency,
    'gstin': gstin,
    'activeJoinCode': activeJoinCode,
  };
}

class Profile {
  final String id;
  final String fullName;
  final String? email;
  final String? phone;
  final String? avatarUrl;

  Profile({
    required this.id,
    required this.fullName,
    this.email,
    this.phone,
    this.avatarUrl,
  });

  factory Profile.fromJson(Map<String, dynamic> json) {
    return Profile(
      id: json['id'] ?? '',
      fullName: json['fullName'] ?? json['name'] ?? '',
      email: json['email'],
      phone: json['phone'],
      avatarUrl: json['avatarUrl'],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'fullName': fullName,
    'email': email,
    'phone': phone,
    'avatarUrl': avatarUrl,
  };
}

class JoinCode {
  final String id;
  final String organizationId;
  final String code;
  final String status;
  final int maxUses;
  final int timesUsed;
  final DateTime expiresAt;

  JoinCode({
    required this.id,
    required this.organizationId,
    required this.code,
    required this.status,
    required this.maxUses,
    required this.timesUsed,
    required this.expiresAt,
  });

  factory JoinCode.fromJson(Map<String, dynamic> json) {
    return JoinCode(
      id: json['id'] ?? '',
      organizationId: json['organizationId'] ?? '',
      code: json['code'] ?? '',
      status: json['status'] ?? 'ACTIVE',
      maxUses: json['maxUses'] ?? 100,
      timesUsed: json['timesUsed'] ?? 0,
      expiresAt: DateTime.tryParse(json['expiresAt'] ?? '') ?? DateTime.now().add(const Duration(days: 30)),
    );
  }
}

class Session {
  final String id;
  final String token;
  final String userId;
  final String organizationId;
  final Role role;
  final Profile profile;
  final Organization organization;
  final DateTime expiresAt;

  Session({
    required this.id,
    required this.token,
    required this.userId,
    required this.organizationId,
    required this.role,
    required this.profile,
    required this.organization,
    required this.expiresAt,
  });

  factory Session.fromJson(Map<String, dynamic> json) {
    final roleStr = (json['role'] ?? 'EMPLOYEE').toString().toUpperCase();
    final role = roleStr == 'MANAGER' ? Role.manager : Role.employee;

    return Session(
      id: json['id'] ?? '',
      token: json['token'] ?? '',
      userId: json['userId'] ?? '',
      organizationId: json['organizationId'] ?? '',
      role: role,
      profile: Profile.fromJson(json['profile'] ?? {}),
      organization: Organization.fromJson(json['organization'] ?? {}),
      expiresAt: DateTime.tryParse(json['expiresAt'] ?? '') ?? DateTime.now().add(const Duration(days: 30)),
    );
  }
}
