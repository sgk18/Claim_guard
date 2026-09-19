import 'package:flutter/material.dart';
import '../models/claim.dart';
import '../providers/app_state.dart';
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
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard_outlined),
            activeIcon: Icon(Icons.dashboard),
            label: 'Dashboard',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.rule_folder_outlined),
            activeIcon: Icon(Icons.rule_folder),
            label: 'Claims',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.document_scanner_outlined),
            activeIcon: Icon(Icons.document_scanner),
            label: 'Scan',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.group_outlined),
            activeIcon: Icon(Icons.group),
            label: 'Employees',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.more_horiz_outlined),
            activeIcon: Icon(Icons.more_horiz),
            label: 'More',
          ),
        ],
      ),
    );
  }
}
