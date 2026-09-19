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

    // Calculate total claimed amount
    final totalClaimed = state.claims.fold<double>(0.0, (sum, c) => sum + c.amount);

    return Scaffold(
      appBar: BrandHeader(
        title: session?.organization.name ?? 'ClaimGuard',
        subtitle: 'Field Expense Portal',
        role: Role.employee,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: ClaimGuardTheme.slateDark),
            tooltip: 'Refresh Claims',
            onPressed: () => state.loadClaims(),
          ),
          IconButton(
            icon: const Icon(Icons.swap_horiz_rounded, color: ClaimGuardTheme.brandOrange),
            tooltip: 'Switch to Manager View',
            onPressed: () => state.switchRole(Role.manager),
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
              // Premium Dark Fintech Hero Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  gradient: ClaimGuardTheme.heroGradient,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: ClaimGuardTheme.floatingShadow,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 32,
                              height: 32,
                              decoration: BoxDecoration(
                                color: ClaimGuardTheme.surfaceWhite.withAlpha(25),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Icon(
                                Icons.person_rounded,
                                color: ClaimGuardTheme.surfaceWhite,
                                size: 18,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  session?.profile.fullName ?? 'Rahul Kumar',
                                  style: const TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w800,
                                    color: ClaimGuardTheme.surfaceWhite,
                                  ),
                                ),
                                Text(
                                  session?.organization.name ?? 'ABC Technologies',
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: ClaimGuardTheme.surfaceWhite.withAlpha(160),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: ClaimGuardTheme.riskLow.withAlpha(40),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: ClaimGuardTheme.riskLow.withAlpha(100)),
                          ),
                          child: const Row(
                            children: [
                              CircleAvatar(radius: 3, backgroundColor: ClaimGuardTheme.riskLow),
                              SizedBox(width: 5),
                              Text(
                                'ACTIVE ONBOARDED',
                                style: TextStyle(
                                  color: ClaimGuardTheme.riskLow,
                                  fontSize: 9,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 22),

                    // Big Balance Display
                    Text(
                      'TOTAL CLAIMS SUBMITTED',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        color: ClaimGuardTheme.surfaceWhite.withAlpha(140),
                        letterSpacing: 0.8,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '₹${totalClaimed.toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.w900,
                        color: ClaimGuardTheme.surfaceWhite,
                        letterSpacing: -0.8,
                      ),
                    ),
                    const SizedBox(height: 18),

                    // Primary Scan CTA Button
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: ClaimGuardTheme.brandOrange,
                        foregroundColor: ClaimGuardTheme.surfaceWhite,
                        minimumSize: const Size(double.infinity, 50),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                        elevation: 0,
                      ),
                      onPressed: onScanTap,
                      icon: const Icon(Icons.document_scanner_rounded, size: 20),
                      label: const Text(
                        'Scan & Submit Receipt',
                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Policy Limits Pill Banner
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: ClaimGuardTheme.surfaceWhite,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: ClaimGuardTheme.slateBorder),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.info_outline_rounded, size: 16, color: ClaimGuardTheme.brandOrange),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Policy: Fuel max ₹4,000 • Meals ₹1,500/day • GSTIN required > ₹1,000',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: ClaimGuardTheme.slateSecondary),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Status Metric Cards Row
              Row(
                children: [
                  Expanded(
                    child: _StatusTile(
                      icon: Icons.hourglass_top_rounded,
                      label: 'PENDING',
                      count: state.pendingCount,
                      color: ClaimGuardTheme.riskMedium,
                      bg: ClaimGuardTheme.riskMediumBg,
                      border: ClaimGuardTheme.riskMediumBorder,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _StatusTile(
                      icon: Icons.check_circle_rounded,
                      label: 'APPROVED',
                      count: state.approvedCount,
                      color: ClaimGuardTheme.riskLow,
                      bg: ClaimGuardTheme.riskLowBg,
                      border: ClaimGuardTheme.riskLowBorder,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _StatusTile(
                      icon: Icons.cancel_rounded,
                      label: 'REJECTED',
                      count: state.rejectedCount,
                      color: ClaimGuardTheme.riskHigh,
                      bg: ClaimGuardTheme.riskHighBg,
                      border: ClaimGuardTheme.riskHighBorder,
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
                      fontSize: 17,
                      fontWeight: FontWeight.w900,
                      color: ClaimGuardTheme.slateDark,
                      letterSpacing: -0.3,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: ClaimGuardTheme.slateBorder.withAlpha(60),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '${state.claims.length} total',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: ClaimGuardTheme.slateMuted,
                      ),
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
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: ClaimGuardTheme.slateBorder),
                    boxShadow: ClaimGuardTheme.cardShadow,
                  ),
                  child: Column(
                    children: [
                      Container(
                        width: 56,
                        height: 56,
                        decoration: const BoxDecoration(
                          color: ClaimGuardTheme.brandOrangeSurface,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.receipt_long_rounded, size: 28, color: ClaimGuardTheme.brandOrange),
                      ),
                      const SizedBox(height: 14),
                      const Text(
                        'No Expense Claims Yet',
                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: ClaimGuardTheme.slateDark),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Scan your fuel, travel, or meal receipts to initiate verification.',
                        style: TextStyle(fontSize: 12, color: ClaimGuardTheme.slateMuted),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 18),
                      OutlinedButton.icon(
                        onPressed: onScanTap,
                        icon: const Icon(Icons.camera_alt_outlined, size: 16),
                        label: const Text('Scan First Invoice'),
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
  final IconData icon;
  final String label;
  final int count;
  final Color color;
  final Color bg;
  final Color border;

  const _StatusTile({
    required this.icon,
    required this.label,
    required this.count,
    required this.color,
    required this.bg,
    required this.border,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: border, width: 1.2),
        boxShadow: [
          BoxShadow(
            color: color.withAlpha(12),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Icon(icon, size: 18, color: color),
          const SizedBox(height: 6),
          Text(
            count.toString(),
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w900,
              color: color,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.5,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
