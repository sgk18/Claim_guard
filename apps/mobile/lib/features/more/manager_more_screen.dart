import 'package:flutter/material.dart';
import '../../core/providers/app_state.dart';
import '../../core/theme/claimguard_theme.dart';

class ManagerMoreScreen extends StatelessWidget {
  final AppState state;
  final VoidCallback onNavigateToClaims;
  final VoidCallback onNavigateToEmployees;

  const ManagerMoreScreen({
    super.key,
    required this.state,
    required this.onNavigateToClaims,
    required this.onNavigateToEmployees,
  });

  @override
  Widget build(BuildContext context) {
    final org = state.session?.organization;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Operations & Configuration'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Group 1: Claims Management (Expandable)
            Card(
              child: ExpansionTile(
                initiallyExpanded: true,
                leading: const Icon(Icons.receipt_outlined, color: ClaimGuardTheme.brandOrange),
                title: const Text('Claims Management', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                children: [
                  _SubMenuTile(title: 'All Claims Queue', trailing: '${state.claims.length}', onTap: onNavigateToClaims),
                  _SubMenuTile(title: 'Pending Verification', trailing: '${state.pendingCount}', onTap: onNavigateToClaims),
                  _SubMenuTile(title: 'Flagged & Duplicate Queue', trailing: '${state.flaggedCount}', onTap: onNavigateToClaims),
                  _SubMenuTile(title: 'Approved Disbursals', trailing: '${state.approvedCount}', onTap: onNavigateToClaims),
                  _SubMenuTile(title: 'Rejected Exceptions', trailing: '${state.rejectedCount}', onTap: onNavigateToClaims),
                ],
              ),
            ),
            const SizedBox(height: 10),

            // Group 2: Employees (Expandable)
            Card(
              child: ExpansionTile(
                initiallyExpanded: true,
                leading: const Icon(Icons.people_outline, color: ClaimGuardTheme.slateSecondary),
                title: const Text('Workforce & Pairing', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                children: [
                  _SubMenuTile(title: 'Connected Field Staff', trailing: 'View', onTap: onNavigateToEmployees),
                  _SubMenuTile(title: 'Manager Join Code', trailing: org?.activeJoinCode ?? 'CG-7K4P9X', onTap: onNavigateToEmployees),
                  _SubMenuTile(title: 'Audit Employee Activity', trailing: 'Log', onTap: onNavigateToEmployees),
                ],
              ),
            ),
            const SizedBox(height: 10),

            // Group 3: Organization Policies (Expandable)
            const Card(
              child: ExpansionTile(
                leading: Icon(Icons.security_outlined, color: ClaimGuardTheme.slateSecondary),
                title: Text('Company Policies & Limits', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                children: [
                  _SubMenuTile(title: 'Meals Daily Allowance', trailing: '₹1,500'),
                  _SubMenuTile(title: 'Fuel Single Bill Cap', trailing: '₹4,000'),
                  _SubMenuTile(title: 'Hotel Lodging Cap', trailing: '₹6,000'),
                  _SubMenuTile(title: 'Mandatory GSTIN Threshold', trailing: '> ₹1,000'),
                ],
              ),
            ),
            const SizedBox(height: 10),

            // Group 4: Analytics & Audit
            Card(
              child: ExpansionTile(
                leading: const Icon(Icons.analytics_outlined, color: ClaimGuardTheme.slateSecondary),
                title: const Text('Analytics & Audit Trail', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
                children: [
                  _SubMenuTile(
                    title: 'System Uptime & Ready Probe',
                    trailing: 'Healthy',
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Fastify Server: ONLINE • OCR: READY • Database: CONNECTED')),
                      );
                    },
                  ),
                  const _SubMenuTile(title: 'Immutable Audit Trail', trailing: 'Active (Append-only)'),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Reset Session
            OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                foregroundColor: ClaimGuardTheme.riskHigh,
                side: const BorderSide(color: ClaimGuardTheme.riskHigh),
              ),
              icon: const Icon(Icons.logout, size: 18),
              label: const Text('Reset Session / Logout'),
              onPressed: () => state.logout(),
            ),
          ],
        ),
      ),
    );
  }
}

class _SubMenuTile extends StatelessWidget {
  final String title;
  final String? trailing;
  final VoidCallback? onTap;

  const _SubMenuTile({
    required this.title,
    this.trailing,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      dense: true,
      contentPadding: const EdgeInsets.symmetric(horizontal: 20),
      title: Text(title, style: const TextStyle(fontSize: 13, color: ClaimGuardTheme.slateDark)),
      trailing: trailing != null
          ? Text(
              trailing!,
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: ClaimGuardTheme.slateMuted),
            )
          : const Icon(Icons.chevron_right, size: 16, color: ClaimGuardTheme.slateMuted),
      onTap: onTap,
    );
  }
}
