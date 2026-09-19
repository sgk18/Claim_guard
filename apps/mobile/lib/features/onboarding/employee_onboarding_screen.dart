import 'package:flutter/material.dart';
import '../../core/providers/app_state.dart';
import '../../core/theme/claimguard_theme.dart';

class EmployeeOnboardingScreen extends StatefulWidget {
  final AppState state;

  const EmployeeOnboardingScreen({super.key, required this.state});

  @override
  State<EmployeeOnboardingScreen> createState() => _EmployeeOnboardingScreenState();
}

class _EmployeeOnboardingScreenState extends State<EmployeeOnboardingScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController(text: 'Rahul Kumar');
  final _codeController = TextEditingController(text: 'CG-7K4P9X');
  final _emailController = TextEditingController(text: 'rahul.kumar@abctech.example.com');
  final _phoneController = TextEditingController(text: '+919812345678');

  @override
  void dispose() {
    _nameController.dispose();
    _codeController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    final success = await widget.state.joinAsEmployee(
      joinCode: _codeController.text.trim(),
      employeeName: _nameController.text.trim(),
      email: _emailController.text.trim(),
      phone: _phoneController.text.trim(),
    );

    if (success && mounted) {
      Navigator.of(context).popUntil((route) => route.isFirst);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Employee Onboarding'),
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
                  'Join Organization',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    color: ClaimGuardTheme.slateDark,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Enter the authorization code provided by your finance manager to connect your mobile device.',
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

                // Join Code Field (Prominent)
                TextFormField(
                  controller: _codeController,
                  textCapitalization: TextCapitalization.characters,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 2.0,
                    fontFamily: 'monospace',
                  ),
                  decoration: const InputDecoration(
                    labelText: 'Manager Join Code',
                    hintText: 'CG-XXXXXX',
                    prefixIcon: Icon(Icons.vpn_key_outlined, color: ClaimGuardTheme.brandOrange),
                  ),
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) return 'Join code is required';
                    if (!v.trim().toUpperCase().startsWith('CG-')) return 'Format must be CG-XXXXXX';
                    return null;
                  },
                ),
                const SizedBox(height: 18),

                // Full Name
                TextFormField(
                  controller: _nameController,
                  decoration: const InputDecoration(
                    labelText: 'Employee Full Name',
                    hintText: 'e.g. Rahul Kumar',
                    prefixIcon: Icon(Icons.person_outline, color: ClaimGuardTheme.slateSecondary),
                  ),
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Full name is required' : null,
                ),
                const SizedBox(height: 18),

                // Email
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(
                    labelText: 'Work Email Address (Optional)',
                    hintText: 'rahul.kumar@abctech.example.com',
                    prefixIcon: Icon(Icons.email_outlined, color: ClaimGuardTheme.slateSecondary),
                  ),
                ),
                const SizedBox(height: 18),

                // Phone
                TextFormField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(
                    labelText: 'Mobile Phone Number',
                    hintText: '+91 98123 45678',
                    prefixIcon: Icon(Icons.phone_android_outlined, color: ClaimGuardTheme.slateSecondary),
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
                      : const Text('Verify Code & Start Session'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
