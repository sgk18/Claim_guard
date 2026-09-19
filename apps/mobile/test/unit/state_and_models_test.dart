import 'package:flutter_test/flutter_test.dart';
import 'package:claimguard/core/models/session.dart';
import 'package:claimguard/core/models/claim.dart';
import 'package:claimguard/core/providers/app_state.dart';

void main() {
  group('ClaimGuard Domain Models & State Tests', () {
    test('Session and Organization JSON parsing maintains integrity', () {
      final json = {
        'id': 'sess-101',
        'token': 'cg_sess_test123',
        'userId': 'usr-001',
        'organizationId': 'org-001',
        'role': 'MANAGER',
        'profile': {
          'id': 'usr-001',
          'fullName': 'Priya Sharma',
          'email': 'priya@abctech.example.com',
          'phone': '+919876543210',
        },
        'organization': {
          'id': 'org-001',
          'name': 'ABC Technologies',
          'slug': 'abc-tech',
          'currency': 'INR',
          'activeJoinCode': 'CG-7K4P9X',
        },
      };

      final session = Session.fromJson(json);
      expect(session.id, 'sess-101');
      expect(session.role, Role.manager);
      expect(session.organization.name, 'ABC Technologies');
      expect(session.organization.activeJoinCode, 'CG-7K4P9X');
      expect(session.profile.fullName, 'Priya Sharma');
    });

    test('JoinCode formats follow CG-XXXXXX pattern and active state', () {
      final json = {
        'id': 'jc-1',
        'organizationId': 'org-001',
        'code': 'CG-7K4P9X',
        'status': 'ACTIVE',
        'maxUses': 100,
        'timesUsed': 3,
        'expiresAt': '2026-10-19T00:00:00.000Z',
      };

      final joinCode = JoinCode.fromJson(json);
      expect(joinCode.code.startsWith('CG-'), isTrue);
      expect(joinCode.status, 'ACTIVE');
      expect(joinCode.timesUsed, 3);
      expect(joinCode.maxUses, 100);
    });

    test('Evidence-based Authenticity States deserialize accurately', () {
      final verifiedJson = {
        'id': 'risk-1',
        'score': 12,
        'level': 'LOW',
        'authenticityState': 'VERIFIED',
        'recommendedAction': 'APPROVE',
        'summary': 'Valid GSTIN and match',
      };

      final verifiedRisk = RiskAssessment.fromJson(verifiedJson);
      expect(verifiedRisk.authenticityState, AuthenticityState.verified);
      expect(verifiedRisk.score, 12);
      expect(verifiedRisk.recommendedAction, 'APPROVE');

      final suspiciousJson = {
        'id': 'risk-2',
        'score': 85,
        'level': 'CRITICAL',
        'authenticityState': 'SUSPICIOUS',
        'recommendedAction': 'REJECT',
        'summary': 'Duplicate detected',
      };

      final suspiciousRisk = RiskAssessment.fromJson(suspiciousJson);
      expect(suspiciousRisk.authenticityState, AuthenticityState.suspicious);
      expect(suspiciousRisk.level, RiskLevel.critical);
      expect(suspiciousRisk.recommendedAction, 'REJECT');
    });

    test('AppState manages role switching and pre-seeded authentication', () {
      final state = AppState();
      expect(state.isAuthenticated, isFalse);

      // Authenticate as Manager
      state.setPreseededSession(Role.manager);
      expect(state.isAuthenticated, isTrue);
      expect(state.currentRole, Role.manager);
      expect(state.session?.profile.fullName, 'Priya Sharma');

      // Logout
      state.logout();
      expect(state.isAuthenticated, isFalse);
      expect(state.session, isNull);

      // Authenticate as Employee
      state.setPreseededSession(Role.employee);
      expect(state.isAuthenticated, isTrue);
      expect(state.currentRole, Role.employee);
      expect(state.session?.profile.fullName, 'Rahul Kumar');
    });

    test('ReceiptLineItem correctly parses items and totals', () {
      final item = ReceiptLineItem.fromJson({
        'item': 'Diesel Fuel (30L)',
        'quantity': 30,
        'rate': 95.5,
        'amount': 2865.0,
      });

      expect(item.item, 'Diesel Fuel (30L)');
      expect(item.quantity, 30);
      expect(item.amount, 2865.0);
    });
  });
}
