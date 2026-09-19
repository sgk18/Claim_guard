import 'package:flutter/material.dart';
import '../../core/models/session.dart';
import '../../core/providers/app_state.dart';
import '../../core/theme/claimguard_theme.dart';
import 'manager_onboarding_screen.dart';
import 'employee_onboarding_screen.dart';

class RoleSelectionScreen extends StatelessWidget {
  final AppState state;

  const RoleSelectionScreen({super.key, required this.state});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 24),
              // Brand Shield Icon
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: ClaimGuardTheme.brandOrange,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.shield_outlined,
                  color: ClaimGuardTheme.surfaceWhite,
                  size: 28,
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                'ClaimGuard',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.5,
                  color: ClaimGuardTheme.slateDark,
                ),
              ),
              const SizedBox(height: 6),
              const Text(
                'Financial integrity & expense verification platform for modern field workforces.',
                style: TextStyle(
                  fontSize: 14,
                  height: 1.4,
                  color: ClaimGuardTheme.slateMuted,
                ),
              ),
              const Spacer(),

              // Role Card 1: Manager
              _RoleCard(
                title: 'Finance Manager',
                subtitle: 'Register organization, generate join codes, configure policy limits, and triage claims.',
                icon: Icons.business_outlined,
                isPrimary: true,
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => ManagerOnboardingScreen(state: state),
                    ),
                  );
                },
              ),
              const SizedBox(height: 16),

              // Role Card 2: Employee
              _RoleCard(
                title: 'Field Employee',
                subtitle: 'Join with company code, scan receipt invoices, verify line items, and track payments.',
                icon: Icons.receipt_long_outlined,
                isPrimary: false,
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => EmployeeOnboardingScreen(state: state),
                    ),
                  );
                },
              ),

              const SizedBox(height: 28),
              // Pre-seeded quick test actions for evaluators
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: ClaimGuardTheme.slateBorder.withAlpha(40),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: ClaimGuardTheme.slateBorder, width: 1),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'DEVELOPER & TEST BENCH',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: ClaimGuardTheme.slateMuted,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            style: OutlinedButton.styleFrom(
                              minimumSize: const Size(0, 38),
                              padding: const EdgeInsets.symmetric(horizontal: 8),
                            ),
                            onPressed: () {
                              state.setPreseededSession(Role.manager);
                            },
                            child: const Text('Open as Manager', style: TextStyle(fontSize: 12)),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: OutlinedButton(
                            style: OutlinedButton.styleFrom(
                              minimumSize: const Size(0, 38),
                              padding: const EdgeInsets.symmetric(horizontal: 8),
                            ),
                            onPressed: () {
                              state.setPreseededSession(Role.employee);
                            },
                            child: const Text('Open as Employee', style: TextStyle(fontSize: 12)),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}

class _RoleCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final bool isPrimary;
  final VoidCallback onTap;

  const _RoleCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.isPrimary,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: ClaimGuardTheme.surfaceWhite,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isPrimary ? ClaimGuardTheme.brandOrange : ClaimGuardTheme.slateBorder,
            width: isPrimary ? 1.8 : 1.2,
          ),
          boxShadow: [
            BoxShadow(
              color: ClaimGuardTheme.slateDark.withAlpha(12),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: isPrimary ? ClaimGuardTheme.brandOrange.withAlpha(20) : ClaimGuardTheme.slateBorder.withAlpha(40),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                icon,
                color: isPrimary ? ClaimGuardTheme.brandOrange : ClaimGuardTheme.slateDark,
                size: 22,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: ClaimGuardTheme.slateDark,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 12,
                      height: 1.3,
                      color: ClaimGuardTheme.slateMuted,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.chevron_right,
              color: ClaimGuardTheme.slateMuted,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }
}
