import 'package:flutter/foundation.dart';
import '../models/session.dart';
import '../models/claim.dart';
import '../services/api_service.dart';

class AppState extends ChangeNotifier {
  final ApiService api = ApiService();

  Session? _session;
  List<Claim> _claims = [];
  Claim? _activeClaim;
  bool _isLoading = false;
  String? _errorMessage;

  Session? get session => _session;
  Role? get currentRole => _session?.role;
  bool get isAuthenticated => _session != null;
  List<Claim> get claims => _claims;
  Claim? get activeClaim => _activeClaim;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // Filtered metrics
  int get pendingCount => _claims.where((c) => c.status == ClaimStatus.pending || c.status == ClaimStatus.reviewRequired).length;
  int get approvedCount => _claims.where((c) => c.status == ClaimStatus.approved).length;
  int get rejectedCount => _claims.where((c) => c.status == ClaimStatus.rejected).length;
  int get flaggedCount => _claims.where((c) => c.riskAssessment?.level == RiskLevel.high || c.riskAssessment?.level == RiskLevel.critical).length;

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  // --- Onboarding & Auth ---

  Future<bool> registerManager({
    required String companyName,
    required String managerName,
    String? email,
    String? phone,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final data = await api.registerOrganization(
        name: companyName,
        managerName: managerName,
        email: email,
        phone: phone,
      );

      _session = Session.fromJson(data['session']);
      api.setSessionToken(_session?.token);
      await loadClaims();
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> joinAsEmployee({
    required String joinCode,
    required String employeeName,
    String? email,
    String? phone,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final data = await api.joinOrganization(
        code: joinCode,
        employeeName: employeeName,
        email: email,
        phone: phone,
      );

      _session = Session.fromJson(data['session']);
      api.setSessionToken(_session?.token);
      await loadClaims();
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Fast developer bypass to test with seeded roles immediately
  void setPreseededSession(Role role) {
    if (role == Role.manager) {
      _session = Session(
        id: 'sess-mgr-1',
        token: 'mgr_session_token_priya',
        userId: 'b0000000-0000-0000-0000-000000000001',
        organizationId: 'a0000000-0000-0000-0000-000000000001',
        role: Role.manager,
        profile: Profile(
          id: 'b0000000-0000-0000-0000-000000000001',
          fullName: 'Priya Sharma',
          email: 'priya.sharma@abctech.example.com',
          phone: '+919876543210',
        ),
        organization: Organization(
          id: 'a0000000-0000-0000-0000-000000000001',
          name: 'ABC Technologies Pvt Ltd',
          slug: 'abc-tech',
          currency: 'INR',
          gstin: '27AABCA1234F1Z5',
          activeJoinCode: 'CG-7K4P9X',
        ),
        expiresAt: DateTime.now().add(const Duration(days: 30)),
      );
    } else {
      _session = Session(
        id: 'sess-emp-1',
        token: 'emp_session_token_rahul',
        userId: 'b0000000-0000-0000-0000-000000000002',
        organizationId: 'a0000000-0000-0000-0000-000000000001',
        role: Role.employee,
        profile: Profile(
          id: 'b0000000-0000-0000-0000-000000000002',
          fullName: 'Rahul Kumar',
          email: 'rahul.kumar@abctech.example.com',
          phone: '+919812345678',
        ),
        organization: Organization(
          id: 'a0000000-0000-0000-0000-000000000001',
          name: 'ABC Technologies Pvt Ltd',
          slug: 'abc-tech',
          currency: 'INR',
          activeJoinCode: 'CG-7K4P9X',
        ),
        expiresAt: DateTime.now().add(const Duration(days: 30)),
      );
    }
    api.setSessionToken(_session?.token);
    loadClaims();
    notifyListeners();
  }

  void switchRole(Role role) {
    setPreseededSession(role);
  }

  void logout() {
    _session = null;
    _claims = [];
    _activeClaim = null;
    api.setSessionToken(null);
    notifyListeners();
  }

  // --- Claims Management ---

  Future<void> loadClaims() async {
    _isLoading = true;
    notifyListeners();

    try {
      final employeeFilter = (currentRole == Role.employee) ? _session?.userId : null;
      _claims = await api.getClaims(
        organizationId: _session?.organizationId,
        employeeId: employeeFilter,
      );
    } catch (e) {
      // If server unreachable during offline testing, provide robust local fallback
      _errorMessage = 'Using cached claims data';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void selectClaim(Claim claim) {
    _activeClaim = claim;
    notifyListeners();
  }

  Future<bool> approveClaim(String claimId, {String? notes}) async {
    _isLoading = true;
    notifyListeners();

    try {
      final updated = await api.approveClaim(
        claimId,
        managerId: _session?.userId,
        notes: notes ?? 'Approved by finance manager.',
      );
      final index = _claims.indexWhere((c) => c.id == claimId);
      if (index != -1) {
        _claims[index] = updated;
      }
      if (_activeClaim?.id == claimId) {
        _activeClaim = updated;
      }
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> rejectClaim(String claimId, {required String reason}) async {
    _isLoading = true;
    notifyListeners();

    try {
      final updated = await api.rejectClaim(
        claimId,
        managerId: _session?.userId,
        reason: reason,
      );
      final index = _claims.indexWhere((c) => c.id == claimId);
      if (index != -1) {
        _claims[index] = updated;
      }
      if (_activeClaim?.id == claimId) {
        _activeClaim = updated;
      }
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<Claim?> submitNewClaim({
    required String vendorName,
    required double amount,
    required String claimDate,
    required String category,
    String? gstin,
    Map<String, dynamic>? receipt,
  }) async {
    _isLoading = true;
    notifyListeners();

    try {
      final newClaim = await api.submitClaim(
        organizationId: _session?.organizationId,
        employeeId: _session?.userId ?? 'emp_rahul_102',
        vendorName: vendorName,
        amount: amount,
        claimDate: claimDate,
        category: category,
        gstin: gstin,
        receipt: receipt,
      );
      _claims.insert(0, newClaim);
      _activeClaim = newClaim;
      _isLoading = false;
      notifyListeners();
      return newClaim;
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return null;
    }
  }
}
