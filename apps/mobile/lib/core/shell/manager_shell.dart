import 'package:flutter/material.dart';
import '../models/claim.dart';
import '../providers/app_state.dart';
import '../theme/claimguard_theme.dart';
import '../../features/dashboard/manager_dashboard_screen.dart';
import '../../features/claims/claims_list_screen.dart';
import '../../features/claims/claim_detail_screen.dart';
import '../../features/receipt_scanner/receipt_scanner_screen.dart';
import '../../features/employees/employees_screen.dart';
import '../../features/more/manager_more_screen.dart';

class ManagerShell extends StatefulWidget {
  final AppState state;

  const ManagerShell({super.key, required this.state});

  @override
  State<ManagerShell> createState() => _ManagerShellState();
}

class _ManagerShellState extends State<ManagerShell> {
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
      ManagerDashboardScreen(
        state: widget.state,
        onQuickScan: () => setState(() => _currentIndex = 2),
        onViewAllClaims: () => setState(() => _currentIndex = 1),
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
      EmployeesScreen(
        state: widget.state,
      ),
      ManagerMoreScreen(
        state: widget.state,
        onNavigateToClaims: () => setState(() => _currentIndex = 1),
        onNavigateToEmployees: () => setState(() => _currentIndex = 3),
      ),
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
                _ManagerNavItem(
                  icon: Icons.dashboard_rounded,
                  label: 'Dashboard',
                  isSelected: _currentIndex == 0,
                  onTap: () => setState(() => _currentIndex = 0),
                ),
                _ManagerNavItem(
                  icon: Icons.rule_folder_rounded,
                  label: 'Claims',
                  isSelected: _currentIndex == 1,
                  badgeCount: widget.state.pendingCount > 0 ? widget.state.pendingCount : null,
                  isAlertBadge: widget.state.flaggedCount > 0,
                  onTap: () => setState(() => _currentIndex = 1),
                ),
                _ManagerScanNavItem(
                  isSelected: _currentIndex == 2,
                  onTap: () => setState(() => _currentIndex = 2),
                ),
                _ManagerNavItem(
                  icon: Icons.group_rounded,
                  label: 'Staff',
                  isSelected: _currentIndex == 3,
                  onTap: () => setState(() => _currentIndex = 3),
                ),
                _ManagerNavItem(
                  icon: Icons.tune_rounded,
                  label: 'More',
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

class _ManagerNavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;
  final int? badgeCount;
  final bool isAlertBadge;

  const _ManagerNavItem({
    required this.icon,
    required this.label,
    required this.isSelected,
    required this.onTap,
    this.badgeCount,
    this.isAlertBadge = false,
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
                      decoration: BoxDecoration(
                        color: isAlertBadge ? ClaimGuardTheme.riskHigh : ClaimGuardTheme.brandOrange,
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

class _ManagerScanNavItem extends StatelessWidget {
  final bool isSelected;
  final VoidCallback onTap;

  const _ManagerScanNavItem({required this.isSelected, required this.onTap});

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
            Icon(Icons.document_scanner_rounded, size: 18, color: Colors.white),
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
