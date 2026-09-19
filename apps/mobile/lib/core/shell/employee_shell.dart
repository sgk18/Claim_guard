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
      _NotificationStubScreen(state: widget.state),
      _ProfileStubScreen(state: widget.state),
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
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.receipt_long_outlined),
            activeIcon: Icon(Icons.receipt_long),
            label: 'Claims',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.camera_alt_outlined),
            activeIcon: Icon(Icons.camera_alt),
            label: 'Scan',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.notifications_none_outlined),
            activeIcon: Icon(Icons.notifications),
            label: 'Alerts',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            activeIcon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}

class _NotificationStubScreen extends StatelessWidget {
  final AppState state;
  const _NotificationStubScreen({required this.state});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Notifications & Alerts')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          ListTile(
            leading: Icon(Icons.check_circle_outline, color: ClaimGuardTheme.riskLow),
            title: Text('Claim CLM-4471 Approved', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
            subtitle: Text('Reimbursement for INR 1,240 authorized by finance manager.'),
          ),
          Divider(),
          ListTile(
            leading: Icon(Icons.info_outline, color: ClaimGuardTheme.brandOrange),
            title: Text('Organization Policy Notice', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
            subtitle: Text('Fuel expenses exceeding INR 4,000 require itemized tax invoice.'),
          ),
        ],
      ),
    );
  }
}

class _ProfileStubScreen extends StatelessWidget {
  final AppState state;
  const _ProfileStubScreen({required this.state});

  @override
  Widget build(BuildContext context) {
    final profile = state.session?.profile;
    final org = state.session?.organization;

    return Scaffold(
      appBar: AppBar(title: const Text('Employee Profile')),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            CircleAvatar(
              radius: 36,
              backgroundColor: ClaimGuardTheme.brandOrange.withAlpha(30),
              child: Text(
                (profile?.fullName ?? 'R').substring(0, 1),
                style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: ClaimGuardTheme.brandOrange),
              ),
            ),
            const SizedBox(height: 14),
            Text(
              profile?.fullName ?? 'Rahul Kumar',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: ClaimGuardTheme.slateDark),
            ),
            const SizedBox(height: 4),
            Text(
              '${org?.name} • Field Representative',
              style: const TextStyle(fontSize: 12, color: ClaimGuardTheme.slateMuted),
            ),
            const SizedBox(height: 32),
            OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                foregroundColor: ClaimGuardTheme.riskHigh,
                side: const BorderSide(color: ClaimGuardTheme.riskHigh),
              ),
              icon: const Icon(Icons.logout),
              label: const Text('Reset Session / Logout'),
              onPressed: () => state.logout(),
            ),
          ],
        ),
      ),
    );
  }
}
