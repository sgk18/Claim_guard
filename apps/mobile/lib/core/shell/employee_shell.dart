import 'package:flutter/material.dart';
import '../models/claim.dart';
import '../providers/app_state.dart';
import '../theme/claimguard_theme.dart';
import '../../features/dashboard/employee_dashboard_screen.dart';
import '../../features/claims/claims_list_screen.dart';
import '../../features/claims/claim_detail_screen.dart';
import '../../features/receipt_scanner/receipt_scanner_screen.dart';

class EmployeeShell extends StatefulWidget {
  final AppState state;

  const EmployeeShell({super.key, required this.state});

  @override
  State<EmployeeShell> createState() => _EmployeeShellState();
}

class _EmployeeShellState extends State<EmployeeShell> {
  int _currentIndex = 0;

  void _navigateToClaimDetail(Claim claim) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => ClaimDetailScreen(claim: claim, state: widget.state),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final screens = [
      EmployeeDashboardScreen(
        state: widget.state,
        onScanTap: () => setState(() => _currentIndex = 2),
        onClaimTap: _navigateToClaimDetail,
      ),
      ClaimsListScreen(
        state: widget.state,
        onClaimTap: _navigateToClaimDetail,
      ),
      ReceiptScannerScreen(
        state: widget.state,
        onClaimSubmitted: (c) => setState(() => _currentIndex = 1),
      ),
      _NotificationScreen(state: widget.state),
      _ProfileScreen(state: widget.state),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: ClaimGuardTheme.surfaceWhite,
          border: Border(top: BorderSide(color: ClaimGuardTheme.slateBorder)),
          boxShadow: [
            BoxShadow(
              color: Color(0x080F172A),
              blurRadius: 8,
              offset: Offset(0, -2),
            ),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _NavItem(
                  icon: Icons.home_rounded,
                  label: 'Home',
                  isSelected: _currentIndex == 0,
                  onTap: () => setState(() => _currentIndex = 0),
                ),
                _NavItem(
                  icon: Icons.receipt_long_rounded,
                  label: 'Claims',
                  isSelected: _currentIndex == 1,
                  badgeCount: widget.state.pendingCount > 0 ? widget.state.pendingCount : null,
                  onTap: () => setState(() => _currentIndex = 1),
                ),
                _ScanNavItem(
                  isSelected: _currentIndex == 2,
                  onTap: () => setState(() => _currentIndex = 2),
                ),
                _NavItem(
                  icon: Icons.notifications_rounded,
                  label: 'Alerts',
                  isSelected: _currentIndex == 3,
                  onTap: () => setState(() => _currentIndex = 3),
                ),
                _NavItem(
                  icon: Icons.person_rounded,
                  label: 'Profile',
                  isSelected: _currentIndex == 4,
                  onTap: () => setState(() => _currentIndex = 4),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;
  final int? badgeCount;

  const _NavItem({
    required this.icon,
    required this.label,
    required this.isSelected,
    required this.onTap,
    this.badgeCount,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(12),
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                Icon(
                  icon,
                  size: 22,
                  color: isSelected ? ClaimGuardTheme.brandOrange : ClaimGuardTheme.slateMuted,
                ),
                if (badgeCount != null)
                  Positioned(
                    right: -6,
                    top: -4,
                    child: Container(
                      padding: const EdgeInsets.all(3),
                      decoration: const BoxDecoration(
                        color: ClaimGuardTheme.brandOrange,
                        shape: BoxShape.circle,
                      ),
                      constraints: const BoxConstraints(minWidth: 14, minHeight: 14),
                      child: Text(
                        badgeCount.toString(),
                        textAlign: TextAlign.center,
                        style: const TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: Colors.white),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 3),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                color: isSelected ? ClaimGuardTheme.slateDark : ClaimGuardTheme.slateMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ScanNavItem extends StatelessWidget {
  final bool isSelected;
  final VoidCallback onTap;

  const _ScanNavItem({required this.isSelected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          gradient: ClaimGuardTheme.brandGradient,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: ClaimGuardTheme.brandOrange.withAlpha(80),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.camera_alt_rounded, size: 18, color: Colors.white),
            SizedBox(width: 6),
            Text(
              'SCAN',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w900,
                color: Colors.white,
                letterSpacing: 0.8,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _NotificationScreen extends StatelessWidget {
  final AppState state;
  const _NotificationScreen({required this.state});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications & Alerts', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          _NotificationCard(
            icon: Icons.check_circle_rounded,
            iconColor: ClaimGuardTheme.riskLow,
            title: 'Claim CLM-4471 Approved',
            subtitle: 'Reimbursement of ₹1,240 authorized by finance manager.',
            time: '12m ago',
            tag: 'APPROVED',
            tagColor: ClaimGuardTheme.riskLow,
          ),
          SizedBox(height: 10),
          _NotificationCard(
            icon: Icons.shield_rounded,
            iconColor: ClaimGuardTheme.brandOrange,
            title: 'Policy Limit Notice',
            subtitle: 'Fuel claims exceeding ₹4,000 require itemized tax invoice and odometer log.',
            time: '2h ago',
            tag: 'POLICY',
            tagColor: ClaimGuardTheme.brandOrange,
          ),
          SizedBox(height: 10),
          _NotificationCard(
            icon: Icons.sync_rounded,
            iconColor: ClaimGuardTheme.infoBlue,
            title: 'Audit Sync Complete',
            subtitle: '12 expense records reconciled with central Supabase ledger.',
            time: '1d ago',
            tag: 'SYSTEM',
            tagColor: ClaimGuardTheme.infoBlue,
          ),
        ],
      ),
    );
  }
}

class _NotificationCard extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String title;
  final String subtitle;
  final String time;
  final String tag;
  final Color tagColor;

  const _NotificationCard({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.subtitle,
    required this.time,
    required this.tag,
    required this.tagColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: ClaimGuardTheme.surfaceWhite,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: ClaimGuardTheme.slateBorder),
        boxShadow: ClaimGuardTheme.cardShadow,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: iconColor.withAlpha(25),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: iconColor, size: 20),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        title,
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: ClaimGuardTheme.slateDark),
                      ),
                    ),
                    Text(
                      time,
                      style: const TextStyle(fontSize: 10, color: ClaimGuardTheme.slateMuted, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: const TextStyle(fontSize: 12, color: ClaimGuardTheme.slateSecondary, height: 1.4),
                ),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: tagColor.withAlpha(20),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    tag,
                    style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: tagColor),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ProfileScreen extends StatelessWidget {
  final AppState state;
  const _ProfileScreen({required this.state});

  @override
  Widget build(BuildContext context) {
    final profile = state.session?.profile;
    final org = state.session?.organization;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Employee Account', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Profile Badge Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: ClaimGuardTheme.surfaceWhite,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: ClaimGuardTheme.slateBorder),
                boxShadow: ClaimGuardTheme.cardShadow,
              ),
              child: Column(
                children: [
                  Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      gradient: ClaimGuardTheme.heroGradient,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: ClaimGuardTheme.cardShadow,
                    ),
                    child: Center(
                      child: Text(
                        (profile?.fullName ?? 'R').substring(0, 1).toUpperCase(),
                        style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: ClaimGuardTheme.brandOrange),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  Text(
                    profile?.fullName ?? 'Rahul Kumar',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: ClaimGuardTheme.slateDark),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${org?.name ?? "ABC Tech Solutions"} • Field Representative',
                    style: const TextStyle(fontSize: 12, color: ClaimGuardTheme.slateMuted, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: ClaimGuardTheme.riskLow.withAlpha(20),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: ClaimGuardTheme.riskLow.withAlpha(60)),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.verified_user_rounded, size: 14, color: ClaimGuardTheme.riskLow),
                        SizedBox(width: 6),
                        Text(
                          'KYC VERIFIED & ACTIVE',
                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: ClaimGuardTheme.riskLow),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Policy & Spending Allowance Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: ClaimGuardTheme.surfaceWhite,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: ClaimGuardTheme.slateBorder),
                boxShadow: ClaimGuardTheme.cardShadow,
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'AUTHORIZED POLICY CEILINGS',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: ClaimGuardTheme.slateDark, letterSpacing: 0.6),
                  ),
                  SizedBox(height: 14),
                  _AllowanceRow(label: 'Monthly Reimbursable Cap', value: '₹50,000 / mo'),
                  Divider(height: 16, color: ClaimGuardTheme.slateBorder),
                  _AllowanceRow(label: 'Single Bill Limit (Meals)', value: '₹1,500'),
                  Divider(height: 16, color: ClaimGuardTheme.slateBorder),
                  _AllowanceRow(label: 'Single Bill Limit (Fuel)', value: '₹4,000'),
                  Divider(height: 16, color: ClaimGuardTheme.slateBorder),
                  _AllowanceRow(label: 'Single Bill Limit (Hotel)', value: '₹6,000'),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Session Logout
            OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                foregroundColor: ClaimGuardTheme.riskHigh,
                side: const BorderSide(color: ClaimGuardTheme.riskHigh, width: 1.5),
                minimumSize: const Size(double.infinity, 48),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              icon: const Icon(Icons.logout_rounded, size: 18),
              label: const Text('Reset Session / Switch Account', style: TextStyle(fontWeight: FontWeight.w800)),
              onPressed: () => state.logout(),
            ),
          ],
        ),
      ),
    );
  }
}

class _AllowanceRow extends StatelessWidget {
  final String label;
  final String value;

  const _AllowanceRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, color: ClaimGuardTheme.slateSecondary, fontWeight: FontWeight.w500)),
        Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: ClaimGuardTheme.slateDark)),
      ],
    );
  }
}
