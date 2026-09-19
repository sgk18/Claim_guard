import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:claimguard/main.dart';
import 'package:claimguard/core/models/claim.dart';
import 'package:claimguard/core/widgets/evidence_badge.dart';

void main() {
  group('ClaimGuard Widget & Navigation Tests', () {
    testWidgets('Renders RoleSelectionScreen on launch when unauthenticated', (tester) async {
      await tester.pumpWidget(const ClaimGuardApp());
      await tester.pumpAndSettle();

      expect(find.text('ClaimGuard'), findsOneWidget);
      expect(find.text('Finance Manager'), findsOneWidget);
      expect(find.text('Field Employee'), findsOneWidget);
      expect(find.text('Open as Manager'), findsOneWidget);
      expect(find.text('Open as Employee'), findsOneWidget);
    });

    testWidgets('EvidenceBadge renders evidence states accurately', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                EvidenceBadge(state: AuthenticityState.verified),
                EvidenceBadge(state: AuthenticityState.suspicious),
                EvidenceBadge(state: AuthenticityState.reviewRequired),
              ],
            ),
          ),
        ),
      );

      expect(find.text('VERIFIED'), findsOneWidget);
      expect(find.text('SUSPICIOUS'), findsOneWidget);
      expect(find.text('REVIEW REQUIRED'), findsOneWidget);
    });

    testWidgets('Tapping Open as Manager switches to Manager Dashboard', (tester) async {
      await tester.pumpWidget(const ClaimGuardApp());
      await tester.pumpAndSettle();

      final managerBtn = find.text('Open as Manager');
      expect(managerBtn, findsOneWidget);
      await tester.tap(managerBtn);
      await tester.pumpAndSettle();

      expect(find.text('MANAGER'), findsOneWidget);
      expect(find.text('Quick Scan'), findsOneWidget);
      expect(find.text('PENDING TRIAGE'), findsOneWidget);
    });

    testWidgets('Tapping Open as Employee switches to Employee Dashboard', (tester) async {
      await tester.pumpWidget(const ClaimGuardApp());
      await tester.pumpAndSettle();

      final employeeBtn = find.text('Open as Employee');
      expect(employeeBtn, findsOneWidget);
      await tester.tap(employeeBtn);
      await tester.pumpAndSettle();

      expect(find.text('EMPLOYEE'), findsOneWidget);
      expect(find.text('Submit Receipt Bill'), findsOneWidget);
    });
  });
}
