import 'package:flutter/material.dart';
import '../../core/models/claim.dart';
import '../../core/models/session.dart';
import '../../core/providers/app_state.dart';
import '../../core/theme/claimguard_theme.dart';
import '../../core/widgets/brand_header.dart';
import '../../core/widgets/claim_card.dart';

class ManagerDashboardScreen extends StatelessWidget {
  final AppState state;
  final VoidCallback onQuickScan;
  final VoidCallback onViewAllClaims;
  final Function(Claim) onClaimTap;

  const ManagerDashboardScreen({
    super.key,
    required this.state,
    required this.onQuickScan,
    required this.onViewAllClaims,
    required this.onClaimTap,
  });

  @override
  Widget build(BuildContext context) {
    final session = state.session;
    final org = session?.organization;
    final pendingOrFlagged = state.claims
        .where((c) => c.status == ClaimStatus.pending || c.status == ClaimStatus.reviewRequired)
        .take(5)
        .toList();

    return Scaffold(
      appBar: BrandHeader(
        title: org?.name ?? 'ABC Technologies',
        subtitle: 'Finance Controller Workspace',
        role: Role.manager,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: ClaimGuardTheme.slateDark),
            tooltip: 'Refresh Queue',
            onPressed: () => state.loadClaims(),
          ),
          IconButton(
            icon: const Icon(Icons.logout_outlined, color: ClaimGuardTheme.slateMuted),
            tooltip: 'Logout',
            onPressed: () => state.logout(),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => state.loadClaims(),
        color: ClaimGuardTheme.brandOrange,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Organization Banner with Join Code
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: ClaimGuardTheme.surfaceWhite,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: ClaimGuardTheme.slateBorder),
                  boxShadow: [
                    BoxShadow(
                      color: ClaimGuardTheme.slateDark.withAlpha(8),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'ORGANIZATION CODE',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: ClaimGuardTheme.slateMuted,
                            letterSpacing: 0.5,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          org?.activeJoinCode ?? 'CG-7K4P9X',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 1.5,
                            color: ClaimGuardTheme.brandOrange,
                            fontFamily: 'monospace',
                          ),
                        ),
                      ],
                    ),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        minimumSize: const Size(120, 40),
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                      ),
                      onPressed: onQuickScan,
                      icon: const Icon(Icons.document_scanner_outlined, size: 16),
                      label: const Text('Quick Scan', style: TextStyle(fontSize: 12)),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),
              // Executive KPI Grid
              Row(
                children: [
                  Expanded(
                    child: _KpiCard(
                      label: 'PENDING TRIAGE',
                      value: state.pendingCount.toString(),
                      color: ClaimGuardTheme.brandOrange,
                      icon: Icons.hourglass_top_outlined,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _KpiCard(
                      label: 'HIGH RISK / DUPS',
                      value: state.flaggedCount.toString(),
                      color: ClaimGuardTheme.riskHigh,
                      icon: Icons.warning_amber_rounded,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: _KpiCard(
                      label: 'APPROVED CLAIMS',
                      value: state.approvedCount.toString(),
                      color: ClaimGuardTheme.riskLow,
                      icon: Icons.check_circle_outline,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _KpiCard(
                      label: 'FIELD STAFF',
                      value: '12 Active',
                      color: ClaimGuardTheme.slateDark,
                      icon: Icons.people_outline,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 26),
              // Section Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Pending Review Queue',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: ClaimGuardTheme.slateDark,
                    ),
                  ),
                  TextButton(
                    onPressed: onViewAllClaims,
                    child: const Text('View All Queue'),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              if (state.isLoading)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(32.0),
                    child: CircularProgressIndicator(color: ClaimGuardTheme.brandOrange),
                  ),
                )
              else if (pendingOrFlagged.isEmpty)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(28),
                  decoration: BoxDecoration(
                    color: ClaimGuardTheme.surfaceWhite,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: ClaimGuardTheme.slateBorder),
                  ),
                  child: const Center(
                    child: Column(
                      children: [
                        Icon(Icons.done_all_rounded, color: ClaimGuardTheme.riskLow, size: 36),
                        SizedBox(height: 8),
                        Text(
                          'Queue Clear',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: ClaimGuardTheme.slateDark),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'All pending expenses have been processed.',
                          style: TextStyle(fontSize: 12, color: ClaimGuardTheme.slateMuted),
                        ),
                      ],
                    ),
                  ),
                )
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: pendingOrFlagged.length,
                  itemBuilder: (_, index) {
                    final claim = pendingOrFlagged[index];
                    return ClaimCard(
                      claim: claim,
                      onTap: () => onClaimTap(claim),
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _KpiCard extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  final IconData icon;

  const _KpiCard({
    required this.label,
    required this.value,
    required this.color,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ClaimGuardTheme.surfaceWhite,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: ClaimGuardTheme.slateBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  color: ClaimGuardTheme.slateMuted,
                  letterSpacing: 0.5,
                ),
              ),
              Icon(icon, size: 16, color: color),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            value,
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w900,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
