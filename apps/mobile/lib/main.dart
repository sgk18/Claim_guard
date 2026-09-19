import 'package:flutter/material.dart';
import 'core/models/session.dart';
import 'core/providers/app_state.dart';
import 'core/theme/claimguard_theme.dart';
import 'core/shell/employee_shell.dart';
import 'core/shell/manager_shell.dart';
import 'features/onboarding/role_selection_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ClaimGuardApp());
}

class ClaimGuardApp extends StatefulWidget {
  const ClaimGuardApp({super.key});

  @override
  State<ClaimGuardApp> createState() => _ClaimGuardAppState();
}

class _ClaimGuardAppState extends State<ClaimGuardApp> {
  final AppState _appState = AppState();

  @override
  void initState() {
    super.initState();
    _appState.addListener(_onStateChange);
  }

  @override
  void dispose() {
    _appState.removeListener(_onStateChange);
    _appState.dispose();
    super.dispose();
  }

  void _onStateChange() {
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ClaimGuard',
      debugShowCheckedModeBanner: false,
      theme: ClaimGuardTheme.lightTheme,
      home: _resolveRootScreen(),
    );
  }

  Widget _resolveRootScreen() {
    // 1. Unauthenticated -> Role Selection & Onboarding
    if (!_appState.isAuthenticated) {
      return RoleSelectionScreen(state: _appState);
    }

    // 2. Authenticated as Manager -> Manager Shell
    if (_appState.currentRole == Role.manager) {
      return ManagerShell(state: _appState);
    }

    // 3. Authenticated as Employee -> Employee Shell
    return EmployeeShell(state: _appState);
  }
}
