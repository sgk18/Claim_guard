import 'package:flutter/material.dart';
import '../../core/models/claim.dart';
import '../../core/models/session.dart';
import '../../core/providers/app_state.dart';
import '../../core/theme/claimguard_theme.dart';
import '../../core/widgets/brand_header.dart';
import '../../core/widgets/claim_card.dart';

class EmployeeDashboardScreen extends StatelessWidget {
  final AppState state;
  final VoidCallback onScanTap;
  final Function(Claim) onClaimTap;

  const EmployeeDashboardScreen({
    super.key,
    required this.state,
    required this.onScanTap,
    required this.onClaimTap,
  });

  @override
  Widget build(BuildContext context) {
    final session = state.session;
    final recentClaims = state.claims.take(5).toList();

    return Scaffold(
      appBar: BrandHeader(
        title: session?.organization.name ?? 'ClaimGuard',
        subtitle: 'Field Operations Portal',
        role: Role.employee,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: ClaimGuardTheme.slateDark),
            tooltip: 'Refresh Claims',
            onPressed: () => state.loadClaims(),
          ),
          IconButton(
            icon: const Icon(Icons.logout_outlined, color: ClaimGuardTheme.slateMuted),
            tooltip: 'Reset Session',
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
              // Welcome Hero
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: ClaimGuardTheme.slateDark,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'WELCOME BACK',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: ClaimGuardTheme.brandOrangeLight,
                        letterSpacing: 0.8,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      session?.profile.fullName ?? 'Rahul Kumar',
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: ClaimGuardTheme.surfaceWhite,
                        letterSpacing: -0.2,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      session?.organization.name ?? 'ABC Technologies Pvt Ltd',
                      style: const TextStyle(
                        fontSize: 12,
                        color: ClaimGuardTheme.slateBorder,
                      ),
                    ),
                    const SizedBox(height: 18),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: ClaimGuardTheme.brandOrange,
                        minimumSize: const Size(double.infinity, 44),
                      ),
                      onPressed: onScanTap,
                      icon: const Icon(Icons.camera_alt_outlined, size: 18),
                      label: const Text('Submit Receipt Bill'),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),
              // Status Metric Cards
              Row(
                children: [
                  Expanded(
                    child: _StatusTile(
                      label: 'PENDING',
                      count: state.pendingCount,
                      color: ClaimGuardTheme.riskMedium,
                      bg: ClaimGuardTheme.riskMediumBg,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _StatusTile(
                      label: 'APPROVED',
                      count: state.approvedCount,
                      color: ClaimGuardTheme.riskLow,
                      bg: ClaimGuardTheme.riskLowBg,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _StatusTile(
                      label: 'REJECTED',
                      count: state.rejectedCount,
                      color: ClaimGuardTheme.riskHigh,
                      bg: ClaimGuardTheme.riskHighBg,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 24),
              // Recent Claims Section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Recent Submissions',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: ClaimGuardTheme.slateDark,
                    ),
                  ),
                  Text(
                    '${state.claims.length} total',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: ClaimGuardTheme.slateMuted,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              if (state.isLoading)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(32.0),
                    child: CircularProgressIndicator(color: ClaimGuardTheme.brandOrange),
                  ),
                )
              else if (recentClaims.isEmpty)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(32),
                  decoration: BoxDecoration(
                    color: ClaimGuardTheme.surfaceWhite,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: ClaimGuardTheme.slateBorder),
                  ),
                  child: Column(
                    children: [
                      const Icon(Icons.receipt_long_outlined, size: 40, color: ClaimGuardTheme.slateMuted),
                      const SizedBox(height: 12),
                      const Text(
                        'No Expense Claims Yet',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: ClaimGuardTheme.slateDark),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Tap the button below to scan your first field invoice.',
                        style: TextStyle(fontSize: 12, color: ClaimGuardTheme.slateMuted),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      OutlinedButton(
                        onPressed: onScanTap,
                        child: const Text('Scan Invoice'),
                      ),
                    ],
                  ),
                )
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: recentClaims.length,
                  itemBuilder: (_, index) {
                    final claim = recentClaims[index];
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

class _StatusTile extends StatelessWidget {
  final String label;
  final int count;
  final Color color;
  final Color bg;

  const _StatusTile({
    required this.label,
    required this.count,
    required this.color,
    required this.bg,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withAlpha(80), width: 1),
      ),
      child: Column(
        children: [
          Text(
            count.toString(),
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w900,
              color: color,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.5,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
