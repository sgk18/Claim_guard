import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/providers/app_state.dart';
import '../../core/theme/claimguard_theme.dart';

class ManagerOnboardingScreen extends StatefulWidget {
  final AppState state;

  const ManagerOnboardingScreen({super.key, required this.state});

  @override
  State<ManagerOnboardingScreen> createState() => _ManagerOnboardingScreenState();
}

class _ManagerOnboardingScreenState extends State<ManagerOnboardingScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController(text: 'Priya Sharma');
  final _companyController = TextEditingController(text: 'ABC Technologies Pvt Ltd');
  final _emailController = TextEditingController(text: 'priya.sharma@abctech.example.com');
  final _phoneController = TextEditingController(text: '+919876543210');

  bool _isSuccess = false;
  String? _generatedCode;
  String? _companyName;

  @override
  void dispose() {
    _nameController.dispose();
    _companyController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    final success = await widget.state.registerManager(
      companyName: _companyController.text.trim(),
      managerName: _nameController.text.trim(),
      email: _emailController.text.trim(),
      phone: _phoneController.text.trim(),
    );

    if (success && mounted) {
      setState(() {
        _isSuccess = true;
        _generatedCode = widget.state.session?.organization.activeJoinCode ?? 'CG-7K4P9X';
        _companyName = widget.state.session?.organization.name;
      });
    }
  }

  void _copyCode() {
    if (_generatedCode != null) {
      Clipboard.setData(ClipboardData(text: _generatedCode!));
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Join code $_generatedCode copied to clipboard'),
          backgroundColor: ClaimGuardTheme.slateDark,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isSuccess) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Organization Configured'),
          automaticallyImplyLeading: false,
        ),
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 12),
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: ClaimGuardTheme.riskLowBg,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(
                    Icons.check_circle_outline,
                    color: ClaimGuardTheme.riskLow,
                    size: 28,
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Workspace Ready',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w800,
                    color: ClaimGuardTheme.slateDark,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Your organization profile has been provisioned. Share this code with field staff to authorize device onboarding.',
                  style: TextStyle(fontSize: 13, height: 1.4, color: ClaimGuardTheme.slateMuted),
                ),
                const SizedBox(height: 28),

                // Join Code Display Box (Section 9)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: ClaimGuardTheme.surfaceWhite,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: ClaimGuardTheme.brandOrange, width: 1.8),
                    boxShadow: [
                      BoxShadow(
                        color: ClaimGuardTheme.brandOrange.withAlpha(15),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'COMPANY',
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: ClaimGuardTheme.slateMuted, letterSpacing: 0.5),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _companyName ?? 'ABC Technologies',
                        style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: ClaimGuardTheme.slateDark),
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'EMPLOYEE JOIN CODE',
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: ClaimGuardTheme.brandOrange, letterSpacing: 0.5),
                      ),
                      const SizedBox(height: 6),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            _generatedCode ?? 'CG-7K4P9X',
                            style: const TextStyle(
                              fontSize: 26,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 2.0,
                              color: ClaimGuardTheme.slateDark,
                              fontFamily: 'monospace',
                            ),
                          ),
                          IconButton(
                            onPressed: _copyCode,
                            icon: const Icon(Icons.copy, color: ClaimGuardTheme.brandOrange),
                            tooltip: 'Copy Code',
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        icon: const Icon(Icons.copy, size: 16),
                        label: const Text('Copy Code'),
                        onPressed: _copyCode,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: OutlinedButton.icon(
                        icon: const Icon(Icons.share, size: 16),
                        label: const Text('Share'),
                        onPressed: _copyCode,
                      ),
                    ),
                  ],
                ),

                const Spacer(),
                ElevatedButton(
                  onPressed: () {
                    // Enter Manager Dashboard
                    Navigator.of(context).popUntil((route) => route.isFirst);
                  },
                  child: const Text('Enter Manager Dashboard'),
                ),
                const SizedBox(height: 12),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Manager Onboarding'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Register Organization',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    color: ClaimGuardTheme.slateDark,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Setup your finance domain. Your credentials generate a secure, scoped session token without social accounts.',
                  style: TextStyle(fontSize: 13, height: 1.4, color: ClaimGuardTheme.slateMuted),
                ),
                const SizedBox(height: 24),

                if (widget.state.errorMessage != null) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: ClaimGuardTheme.riskHighBg,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: ClaimGuardTheme.riskHigh),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline, color: ClaimGuardTheme.riskHigh, size: 20),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            widget.state.errorMessage!,
                            style: const TextStyle(color: ClaimGuardTheme.riskHigh, fontSize: 12),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                // Full Name
                TextFormField(
                  controller: _nameController,
                  decoration: const InputDecoration(
                    labelText: 'Finance Manager Full Name',
                    hintText: 'e.g. Priya Sharma',
                  ),
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Name is required' : null,
                ),
                const SizedBox(height: 16),

                // Company Name
                TextFormField(
                  controller: _companyController,
                  decoration: const InputDecoration(
                    labelText: 'Company / Organization Name',
                    hintText: 'e.g. ABC Technologies Pvt Ltd',
                  ),
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Company name is required' : null,
                ),
                const SizedBox(height: 16),

                // Email
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(
                    labelText: 'Work Email Address',
                    hintText: 'priya.sharma@company.com',
                  ),
                ),
                const SizedBox(height: 16),

                // Phone
                TextFormField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(
                    labelText: 'Mobile Phone Number',
                    hintText: '+91 98765 43210',
                  ),
                ),
                const SizedBox(height: 32),

                ElevatedButton(
                  onPressed: widget.state.isLoading ? null : _submit,
                  child: widget.state.isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: ClaimGuardTheme.surfaceWhite),
                        )
                      : const Text('Create Organization & Join Code'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
