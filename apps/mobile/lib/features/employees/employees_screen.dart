import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/providers/app_state.dart';
import '../../core/theme/claimguard_theme.dart';

class EmployeesScreen extends StatefulWidget {
  final AppState state;

  const EmployeesScreen({super.key, required this.state});

  @override
  State<EmployeesScreen> createState() => _EmployeesScreenState();
}

class _EmployeesScreenState extends State<EmployeesScreen> {
  String _searchQuery = '';
  List<Map<String, dynamic>> _employees = [];
  bool _isLoading = true;
  String? _joinCode;

  @override
  void initState() {
    super.initState();
    _fetchEmployees();
  }

  Future<void> _fetchEmployees() async {
    setState(() => _isLoading = true);
    final orgId = widget.state.session?.organizationId ?? 'a0000000-0000-0000-0000-000000000001';
    _joinCode = widget.state.session?.organization.activeJoinCode ?? 'CG-7K4P9X';

    try {
      final list = await widget.state.api.getEmployees(orgId);
      setState(() {
        _employees = list;
        _isLoading = false;
      });
    } catch (_) {
      // Seed fallback
      setState(() {
        _employees = [
          {
            'id': 'mem-1',
            'userId': 'b0000000-0000-0000-0000-000000000002',
            'role': 'EMPLOYEE',
            'department': 'Field Sales',
            'status': 'ACTIVE',
            'profile': {
              'fullName': 'Rahul Kumar',
              'email': 'rahul.kumar@abctech.example.com',
              'phone': '+91 98123 45678',
            },
          },
          {
            'id': 'mem-2',
            'userId': 'b0000000-0000-0000-0000-000000000003',
            'role': 'EMPLOYEE',
            'department': 'Logistics Support',
            'status': 'ACTIVE',
            'profile': {
              'fullName': 'Ananya Patel',
              'email': 'ananya.patel@abctech.example.com',
              'phone': '+91 98234 56789',
            },
          },
          {
            'id': 'mem-3',
            'userId': 'b0000000-0000-0000-0000-000000000004',
            'role': 'EMPLOYEE',
            'department': 'Quality Assurance',
            'status': 'SUSPENDED',
            'profile': {
              'fullName': 'Vikram Singh',
              'email': 'vikram.singh@abctech.example.com',
              'phone': '+91 98345 67890',
            },
          },
        ];
        _isLoading = false;
      });
    }
  }

  Future<void> _regenerateCode() async {
    final orgId = widget.state.session?.organizationId ?? 'a0000000-0000-0000-0000-000000000001';
    try {
      final newJc = await widget.state.api.regenerateJoinCode(orgId);
      if (!mounted) return;
      setState(() => _joinCode = newJc.code);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('New join code generated: ${newJc.code}')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to regenerate: $e')),
      );
    }
  }

  void _copyCode() {
    if (_joinCode != null) {
      Clipboard.setData(ClipboardData(text: _joinCode!));
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Join code $_joinCode copied to clipboard'),
          backgroundColor: ClaimGuardTheme.slateDark,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _employees.where((e) {
      final name = (e['profile']?['fullName'] ?? '').toString().toLowerCase();
      final dept = (e['department'] ?? '').toString().toLowerCase();
      final q = _searchQuery.toLowerCase();
      return name.contains(q) || dept.contains(q);
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Field Workforce'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchEmployees,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Join Code Management Card (Section 14)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: ClaimGuardTheme.surfaceWhite,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: ClaimGuardTheme.brandOrange, width: 1.5),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'ACTIVE JOIN CODE',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          color: ClaimGuardTheme.brandOrange,
                          letterSpacing: 0.5,
                        ),
                      ),
                      Row(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.copy, size: 18, color: ClaimGuardTheme.brandOrange),
                            tooltip: 'Copy Code',
                            onPressed: _copyCode,
                          ),
                          IconButton(
                            icon: const Icon(Icons.refresh, size: 18, color: ClaimGuardTheme.slateMuted),
                            tooltip: 'Regenerate Code',
                            onPressed: _regenerateCode,
                          ),
                        ],
                      ),
                    ],
                  ),
                  Text(
                    _joinCode ?? 'CG-7K4P9X',
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 2.0,
                      color: ClaimGuardTheme.slateDark,
                      fontFamily: 'monospace',
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Share this code with field employees to authorize app registration.',
                    style: TextStyle(fontSize: 11, color: ClaimGuardTheme.slateMuted),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),
            // Search Field
            TextField(
              onChanged: (val) => setState(() => _searchQuery = val),
              decoration: const InputDecoration(
                hintText: 'Search employees by name or department...',
                prefixIcon: Icon(Icons.search, size: 20, color: ClaimGuardTheme.slateMuted),
                contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              ),
            ),

            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Connected Staff',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: ClaimGuardTheme.slateDark),
                ),
                Text(
                  '${_employees.length} members',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: ClaimGuardTheme.slateMuted),
                ),
              ],
            ),
            const SizedBox(height: 12),

            if (_isLoading)
              const Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator(color: ClaimGuardTheme.brandOrange)))
            else if (filtered.isEmpty)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(32),
                  child: Text('No employees found', style: TextStyle(color: ClaimGuardTheme.slateMuted)),
                ),
              )
            else
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: filtered.length,
                itemBuilder: (_, index) {
                  final emp = filtered[index];
                  final profile = emp['profile'] ?? {};
                  final isSuspended = emp['status'] == 'SUSPENDED';

                  return Card(
                    child: Padding(
                      padding: const EdgeInsets.all(14.0),
                      child: Row(
                        children: [
                          CircleAvatar(
                            backgroundColor: isSuspended ? ClaimGuardTheme.slateBorder : ClaimGuardTheme.brandOrange.withAlpha(30),
                            child: Text(
                              (profile['fullName'] ?? 'E').toString().substring(0, 1),
                              style: TextStyle(
                                fontWeight: FontWeight.w800,
                                color: isSuspended ? ClaimGuardTheme.slateMuted : ClaimGuardTheme.brandOrange,
                              ),
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  profile['fullName'] ?? 'Employee',
                                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: ClaimGuardTheme.slateDark),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  '${emp['department']} • ${profile['phone'] ?? profile['email'] ?? ""}',
                                  style: const TextStyle(fontSize: 11, color: ClaimGuardTheme.slateMuted),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: isSuspended ? ClaimGuardTheme.riskHighBg : ClaimGuardTheme.riskLowBg,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              isSuspended ? 'SUSPENDED' : 'ACTIVE',
                              style: TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.w700,
                                color: isSuspended ? ClaimGuardTheme.riskHigh : ClaimGuardTheme.riskLow,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }
}
