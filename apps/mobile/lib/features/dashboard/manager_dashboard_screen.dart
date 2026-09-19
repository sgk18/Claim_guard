import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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
        subtitle: 'Finance Operations Console',
        role: Role.manager,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: ClaimGuardTheme.slateDark),
            tooltip: 'Refresh Queue',
            onPressed: () => state.loadClaims(),
          ),
          IconButton(
            icon: const Icon(Icons.swap_horiz_rounded, color: ClaimGuardTheme.brandOrange),
            tooltip: 'Switch to Employee View',
            onPressed: () => state.switchRole(Role.employee),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => state.loadClaims(),
        color: ClaimGuardTheme.brandOrange,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Organization Join Code Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: ClaimGuardTheme.surfaceWhite,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: ClaimGuardTheme.slateBorder),
                  boxShadow: ClaimGuardTheme.cardShadow,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Row(
                            children: [
                              Icon(Icons.key_rounded, size: 14, color: ClaimGuardTheme.slateMuted),
                              SizedBox(width: 5),
                              Text(
                                'ACTIVE STAFF JOIN CODE',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800,
                                  color: ClaimGuardTheme.slateMuted,
                                  letterSpacing: 0.6,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          GestureDetector(
                            onTap: () {
                              final code = org?.activeJoinCode ?? 'CG-7K4P9X';
                              Clipboard.setData(ClipboardData(text: code));
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text('Join code copied: $code')),
                              );
                            },
                            child: Row(
                              children: [
                                Text(
                                  org?.activeJoinCode ?? 'CG-7K4P9X',
                                  style: const TextStyle(
                                    fontSize: 22,
                                    fontWeight: FontWeight.w900,
                                    letterSpacing: 2.0,
                                    color: ClaimGuardTheme.brandOrange,
                                    fontFamily: 'monospace',
                                  ),
                                ),
                                const SizedBox(width: 8),
                                const Icon(Icons.copy_rounded, size: 16, color: ClaimGuardTheme.slateMuted),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: ClaimGuardTheme.brandOrangeSurface,
                        foregroundColor: ClaimGuardTheme.brandOrange,
                        minimumSize: const Size(110, 42),
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        side: const BorderSide(color: ClaimGuardTheme.brandOrangeLight),
                        elevation: 0,
                      ),
                      onPressed: onQuickScan,
                      icon: const Icon(Icons.document_scanner_rounded, size: 16),
                      label: const Text('Test Bill', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800)),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 14),

              // High-Risk Alert Banner (if flagged claims exist)
              if (state.flaggedCount > 0) ...[
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: ClaimGuardTheme.riskHighBg,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: ClaimGuardTheme.riskHighBorder, width: 1.2),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: ClaimGuardTheme.riskHigh.withAlpha(25),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.warning_amber_rounded, color: ClaimGuardTheme.riskHigh, size: 20),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${state.flaggedCount} High-Risk Claims Require Action',
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w800,
                                color: ClaimGuardTheme.riskHigh,
                              ),
                            ),
                            const SizedBox(height: 2),
                            const Text(
                              'Duplicate receipt hashes or amount anomalies detected by deterministic engine.',
                              style: TextStyle(fontSize: 11, color: ClaimGuardTheme.slateDark),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
              ],

              // Executive KPI Grid (2x2)
              Row(
                children: [
                  Expanded(
                    child: _KpiCard(
                      label: 'PENDING TRIAGE',
                      value: state.pendingCount.toString(),
                      subtext: 'Awaiting manager sign-off',
                      color: ClaimGuardTheme.brandOrange,
                      icon: Icons.hourglass_top_rounded,
                      bg: ClaimGuardTheme.brandOrangeSurface,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _KpiCard(
                      label: 'ANOMALIES & DUPS',
                      value: state.flaggedCount.toString(),
                      subtext: 'Flagged by audit rules',
                      color: ClaimGuardTheme.riskHigh,
                      icon: Icons.warning_amber_rounded,
                      bg: ClaimGuardTheme.riskHighBg,
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
                      subtext: 'Cleared for disbursement',
                      color: ClaimGuardTheme.riskLow,
                      icon: Icons.check_circle_rounded,
                      bg: ClaimGuardTheme.riskLowBg,
                    ),
                  ),
                  const SizedBox(width: 10),
                  const Expanded(
                    child: _KpiCard(
                      label: 'FIELD EMPLOYEES',
                      value: '12 Active',
                      subtext: '3 field departments',
                      color: ClaimGuardTheme.slateDark,
                      icon: Icons.groups_rounded,
                      bg: ClaimGuardTheme.canvasOffWhite,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // Section Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Priority Action Queue',
                    style: TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w900,
                      color: ClaimGuardTheme.slateDark,
                      letterSpacing: -0.3,
                    ),
                  ),
                  TextButton.icon(
                    onPressed: onViewAllClaims,
                    icon: const Icon(Icons.arrow_forward_rounded, size: 14),
                    label: const Text('View All', style: TextStyle(fontWeight: FontWeight.w800)),
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
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: ClaimGuardTheme.slateBorder),
                    boxShadow: ClaimGuardTheme.cardShadow,
                  ),
                  child: const Center(
                    child: Column(
                      children: [
                        Icon(Icons.done_all_rounded, color: ClaimGuardTheme.riskLow, size: 38),
                        SizedBox(height: 10),
                        Text(
                          'Queue Clear',
                          style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: ClaimGuardTheme.slateDark),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'All pending employee submissions have been audited.',
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
  final String subtext;
  final Color color;
  final Color bg;
  final IconData icon;

  const _KpiCard({
    required this.label,
    required this.value,
    required this.subtext,
    required this.color,
    required this.bg,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: ClaimGuardTheme.surfaceWhite,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ClaimGuardTheme.slateBorder),
        boxShadow: ClaimGuardTheme.cardShadow,
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
                  fontSize: 9.5,
                  fontWeight: FontWeight.w800,
                  color: ClaimGuardTheme.slateMuted,
                  letterSpacing: 0.5,
                ),
              ),
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: bg,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, size: 16, color: color),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            value,
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w900,
              color: color,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 3),
          Text(
            subtext,
            style: const TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w500,
              color: ClaimGuardTheme.slateMuted,
            ),
          ),
        ],
      ),
    );
  }
}
