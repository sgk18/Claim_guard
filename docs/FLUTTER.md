# ClaimGuard Flutter Developer Guide

This document covers running, debugging, and testing the **ClaimGuard** Flutter mobile application.

---

## 1. Environment & Setup

- **Flutter SDK**: 3.44.1 (Dart 3.12.1) installed at `C:\flutter`
- **Application Directory**: `apps/mobile/`
- **Entry Point**: `lib/main.dart`

### Dependencies (`pubspec.yaml`)

```yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter
  http: ^1.2.0
  intl: ^0.20.2

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0
```

*Note: `intl` is pinned to `^0.20.2` to match `flutter_localizations` in Flutter 3.44.*

---

## 2. Running the Application

### Running on Android Emulator

1. Start an Android Virtual Device (AVD) via Android Studio or command-line:
   ```bash
   emulator -avd Pixel_7_API_34
   ```
2. Run the application:
   ```bash
   cd apps/mobile
   flutter run -d emulator-5554
   ```

### Running on Chrome / Web (Fast Preview)

```bash
cd apps/mobile
flutter run -d chrome --web-port 8080
```

### Running on Windows Desktop

```bash
cd apps/mobile
flutter run -d windows
```

---

## 3. Connecting to the Fastify Backend

The application communicates with the standalone ClaimGuard backend on port `3001`:

| Platform | Host URL Configured | Notes |
|---|---|---|
| **Android Emulator** | `http://10.0.2.2:3001/api/v1` | Standard loopback alias to host machine |
| **iOS Simulator / Desktop / Web** | `http://localhost:3001/api/v1` | Local loopback |
| **Physical Mobile Device** | `http://<YOUR_LAN_IP>:3001/api/v1` | Connect PC and phone to same Wi-Fi |

---

## 4. Code Quality & Static Analysis

Static analysis checks models, widgets, null safety, and linting rules across all source files:

```bash
cd apps/mobile
C:\flutter\bin\cache\dart-sdk\bin\dart.exe analyze lib test
```

Expected result:
```
Analyzing lib, test...
No issues found!
```

---

## 5. Automated Tests

The mobile test suite tests domain serialization, reactive state mutations, and widget hierarchies:

- **Unit Tests**: `test/unit/state_and_models_test.dart`
  - Session and Organization JSON parsing
  - Claim, line items, and risk assessment parsing
  - Reactive state initialization with seeded sessions
  - Role switching transitions
  - Evidence state string parsing (`VERIFIED`, `LIKELY VALID`, `REVIEW REQUIRED`, `SUSPICIOUS`, `UNABLE TO VERIFY`)
- **Widget Tests**: `test/widget/onboarding_and_routing_test.dart`
  - RoleSelectionScreen renders Employee and Manager cards
  - EvidenceBadge renders appropriate theme colors for evidence states
  - BrandHeader shows correct role badge and organization title

Run tests with Flutter:
```bash
cd apps/mobile
flutter test
```
