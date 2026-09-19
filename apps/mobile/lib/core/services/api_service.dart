import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../models/session.dart';
import '../models/claim.dart';

class ApiService {
  // Use 10.0.2.2 for Android emulator or localhost for web/desktop/test
  static String get baseUrl {
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:3001/api/v1';
    }
    return 'http://localhost:3001/api/v1';
  }

  String? _sessionToken;

  void setSessionToken(String? token) {
    _sessionToken = token;
  }

  Map<String, String> get _headers {
    final map = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (_sessionToken != null) {
      map['Authorization'] = 'Bearer $_sessionToken';
    }
    return map;
  }

  // --- Organization & Join Code APIs ---

  Future<Map<String, dynamic>> registerOrganization({
    required String name,
    required String managerName,
    String? email,
    String? phone,
    String currency = 'INR',
    String? gstin,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/organizations'),
      headers: _headers,
      body: jsonEncode({
        'name': name,
        'managerName': managerName,
        'email': email,
        'phone': phone,
        'currency': currency,
        'gstin': gstin,
      }),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode >= 400 || data['success'] != true) {
      throw Exception(data['error'] ?? 'Failed to register organization');
    }
    return data['data'];
  }

  Future<Map<String, dynamic>> joinOrganization({
    required String code,
    required String employeeName,
    String? email,
    String? phone,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/organizations/join'),
      headers: _headers,
      body: jsonEncode({
        'code': code.trim().toUpperCase(),
        'employeeName': employeeName,
        'email': email,
        'phone': phone,
      }),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode >= 400 || data['success'] != true) {
      throw Exception(data['error'] ?? 'Failed to join organization');
    }
    return data['data'];
  }

  Future<JoinCode> regenerateJoinCode(String organizationId) async {
    final response = await http.post(
      Uri.parse('$baseUrl/organizations/join-code/regenerate'),
      headers: _headers,
      body: jsonEncode({'organizationId': organizationId}),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode >= 400 || data['success'] != true) {
      throw Exception(data['error'] ?? 'Failed to regenerate join code');
    }
    return JoinCode.fromJson(data['data']);
  }

  Future<bool> revokeJoinCode(String organizationId, String code) async {
    final response = await http.post(
      Uri.parse('$baseUrl/organizations/join-code/revoke'),
      headers: _headers,
      body: jsonEncode({'organizationId': organizationId, 'code': code}),
    );

    final data = jsonDecode(response.body);
    return data['success'] == true;
  }

  Future<List<Map<String, dynamic>>> getEmployees(String organizationId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/organizations/$organizationId/employees'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);
    if (data['success'] == true && data['data'] is List) {
      return List<Map<String, dynamic>>.from(data['data']);
    }
    return [];
  }

  Future<bool> suspendEmployee(String organizationId, String employeeId) async {
    final response = await http.post(
      Uri.parse('$baseUrl/organizations/$organizationId/employees/$employeeId/suspend'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);
    return data['success'] == true;
  }

  Future<bool> removeEmployee(String organizationId, String employeeId) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/organizations/$organizationId/employees/$employeeId'),
      headers: _headers,
    );

    final data = jsonDecode(response.body);
    return data['success'] == true;
  }

  // --- Claims APIs ---

  Future<List<Claim>> getClaims({String? organizationId, String? employeeId, String? status}) async {
    final queryParams = <String, String>{};
    if (organizationId != null) queryParams['organizationId'] = organizationId;
    if (employeeId != null) queryParams['employeeId'] = employeeId;
    if (status != null) queryParams['status'] = status;

    final uri = Uri.parse('$baseUrl/claims').replace(queryParameters: queryParams.isNotEmpty ? queryParams : null);
    final response = await http.get(uri, headers: _headers);

    final data = jsonDecode(response.body);
    if (data['success'] == true && data['data'] is List) {
      return (data['data'] as List).map((c) => Claim.fromJson(c)).toList();
    }
    return [];
  }

  Future<Claim?> getClaimById(String id) async {
    final response = await http.get(Uri.parse('$baseUrl/claims/$id'), headers: _headers);
    final data = jsonDecode(response.body);
    if (data['success'] == true && data['data'] != null) {
      return Claim.fromJson(data['data']);
    }
    return null;
  }

  Future<Claim> submitClaim({
    String? organizationId,
    required String employeeId,
    required String vendorName,
    required double amount,
    required String claimDate,
    required String category,
    String? gstin,
    Map<String, dynamic>? receipt,
    String? employeeNotes,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/claims'),
      headers: _headers,
      body: jsonEncode({
        'organizationId': organizationId,
        'employeeId': employeeId,
        'vendorName': vendorName,
        'amount': amount,
        'claimDate': claimDate,
        'category': category,
        'gstin': gstin,
        'receipt': receipt,
        'employeeNotes': employeeNotes,
      }),
    );

    final data = jsonDecode(response.body);
    if (response.statusCode >= 400 || data['success'] != true) {
      throw Exception(data['error']?['message'] ?? 'Failed to submit claim');
    }
    return Claim.fromJson(data['data']);
  }

  Future<Claim> confirmClaim(String claimId, Map<String, dynamic> confirmedData) async {
    final response = await http.post(
      Uri.parse('$baseUrl/claims/$claimId/confirm'),
      headers: _headers,
      body: jsonEncode(confirmedData),
    );

    final data = jsonDecode(response.body);
    if (data['success'] != true) {
      throw Exception(data['error']?['message'] ?? 'Failed to confirm claim');
    }
    return Claim.fromJson(data['data']);
  }

  Future<Claim> approveClaim(String claimId, {String? managerId, String? notes}) async {
    final response = await http.post(
      Uri.parse('$baseUrl/claims/$claimId/approve'),
      headers: _headers,
      body: jsonEncode({'managerId': managerId, 'notes': notes}),
    );

    final data = jsonDecode(response.body);
    if (data['success'] != true) {
      throw Exception(data['error']?['message'] ?? 'Failed to approve claim');
    }
    return Claim.fromJson(data['data']);
  }

  Future<Claim> rejectClaim(String claimId, {String? managerId, required String reason}) async {
    final response = await http.post(
      Uri.parse('$baseUrl/claims/$claimId/reject'),
      headers: _headers,
      body: jsonEncode({'managerId': managerId, 'reason': reason}),
    );

    final data = jsonDecode(response.body);
    if (data['success'] != true) {
      throw Exception(data['error']?['message'] ?? 'Failed to reject claim');
    }
    return Claim.fromJson(data['data']);
  }

  Future<Claim> requestClarification(String claimId, {String? managerId, required String question}) async {
    final response = await http.post(
      Uri.parse('$baseUrl/claims/$claimId/clarification'),
      headers: _headers,
      body: jsonEncode({'managerId': managerId, 'question': question}),
    );

    final data = jsonDecode(response.body);
    if (data['success'] != true) {
      throw Exception(data['error']?['message'] ?? 'Failed to request clarification');
    }
    return Claim.fromJson(data['data']);
  }

  // --- Receipt Upload & Analysis ---

  Future<Map<String, dynamic>> analyzeReceipt(List<int> bytes, String fileName) async {
    final response = await http.post(
      Uri.parse('$baseUrl/receipts/analyze'),
      headers: _headers,
      body: jsonEncode({
        'fileName': fileName,
        'imageBytes': base64Encode(bytes),
      }),
    );

    final data = jsonDecode(response.body);
    if (data['success'] == true && data['data'] != null) {
      return data['data'];
    }
    throw Exception(data['error'] ?? 'Receipt analysis failed');
  }
}
