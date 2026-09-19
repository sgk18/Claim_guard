# ClaimGuard Android APK Build & Packaging Guide

This guide provides step-by-step instructions for compiling, signing, and deploying the **ClaimGuard** Flutter mobile application on Android devices and emulators.

---

## 1. Prerequisites & Toolchain Verification

| Requirement | Recommended Version | Detected Environment Path |
|---|---|---|
| **Flutter SDK** | 3.24.x – 3.44.x | `C:\flutter` |
| **Dart SDK** | 3.5.x – 3.12.x | `C:\flutter\bin\cache\dart-sdk\bin\dart.exe` |
| **Java Development Kit (JDK)** | OpenJDK 17, 21, or 26 | `C:\Program Files\Eclipse Adoptium\jdk-26.0.1.7-hotspot` |
| **Android SDK / Command-line Tools** | API Level 34 (Android 14) | Installed via Android Studio or CLI |

### Installing Android SDK on Windows via Winget

If you do not have Android Studio or the Android SDK installed:

```powershell
# Install Android Studio via Windows Package Manager
winget install Google.AndroidStudio

# Or install Command-line tools
winget install Google.AndroidSDK.CommandLineTools
```

### Environment Variables Setup

Ensure the following variables are set in your user or system environment:

```powershell
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Eclipse Adoptium\jdk-26.0.1.7-hotspot", "User")
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")
$env:PATH += ";$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\cmdline-tools\latest\bin;C:\flutter\bin"
```

Accept Android SDK licenses:
```bash
flutter doctor --android-licenses
```

---

## 2. Android Project Configuration

The ClaimGuard Android configuration is located in `apps/mobile/android/`:

- **Application ID / Namespace**: `com.claimguard.app`
- **Minimum SDK (`minSdkVersion`)**: `21` (Android 5.0 Lollipop - supports 99.4% of active devices)
- **Target SDK (`targetSdkVersion`)**: `34` (Android 14)
- **Compile SDK (`compileSdkVersion`)**: `34`

### Permissions Configured (`apps/mobile/android/app/src/main/AndroidManifest.xml`)

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.claimguard.app">

    <!-- Network communication with ClaimGuard Fastify backend -->
    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>

    <!-- Camera hardware for receipt scanning -->
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <uses-permission android:name="android.permission.CAMERA"/>

    <!-- Gallery receipt selection -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
```

---

## 3. Building Debug APK

Debug APKs are unsigned and pre-configured with developer debugging hooks. Use this build for rapid emulator and USB-debugging tests.

```bash
cd apps/mobile

# Resolve dependencies
flutter pub get

# Compile debug APK
flutter build apk --debug
```

### Output Location

The compiled debug APK will be created at:
```
apps/mobile/build/app/outputs/flutter-apk/app-debug.apk
```

---

## 4. Building Release APK (Signed Production)

For testing release performance and deploying to corporate mobile device managers (MDMs) or the Google Play Store:

### Step 4.1: Generate a Keystore

Generate a 2048-bit RSA key using Java's `keytool`:

```powershell
keytool -genkey -v -keystore claimguard-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias claimguard
```
Store `claimguard-release.jks` in a secure location (e.g., `apps/mobile/android/keystore/claimguard-release.jks`). **Never commit the `.jks` file to version control.**

### Step 4.2: Configure `key.properties`

Create `apps/mobile/android/key.properties`:

```properties
storePassword=YourKeystorePasswordHere
keyPassword=YourKeyPasswordHere
keyAlias=claimguard
storeFile=../keystore/claimguard-release.jks
```

### Step 4.3: Compile Release APK

```bash
cd apps/mobile

# Build unified release APK
flutter build apk --release

# Or build split per-ABI APKs (smaller file sizes for armeabi-v7a, arm64-v8a, x86_64)
flutter build apk --release --split-per-abi
```

### Output Location

- **Unified APK**: `apps/mobile/build/app/outputs/flutter-apk/app-release.apk`
- **Per-ABI APKs**:
  - `app-armeabi-v7a-release.apk` (32-bit ARM)
  - `app-arm64-v8a-release.apk` (64-bit ARM - standard modern devices)
  - `app-x86_64-release.apk` (Intel/AMD Android emulators)

---

## 5. Installing on Device or Emulator

### Connect Physical Device via USB

1. Enable **Developer Options** on your Android device:
   - Go to **Settings** > **About Phone** > Tap **Build Number** 7 times.
2. Go to **Settings** > **Developer Options** > Enable **USB Debugging**.
3. Connect the device via USB cable and authorize your PC.

### Verify ADB Connection

```bash
adb devices
```
Expected output:
```
List of devices attached
988a1b424d55    device
```

### Install APK

```bash
adb install -r apps/mobile/build/app/outputs/flutter-apk/app-debug.apk
```

### Launch App via ADB

```bash
adb shell monkey -p com.claimguard.app -c android.intent.category.LAUNCHER 1
```

---

## 6. Local Network Configuration for Emulators

When testing against a locally running ClaimGuard Fastify server (`http://localhost:3001`):

- **Android Emulator**: Uses IP alias `http://10.0.2.2:3001/api/v1` to communicate with the host PC. The ClaimGuard mobile app automatically defaults to `http://10.0.2.2:3001/api/v1` when running on Android.
- **Physical Device**: Update `apps/mobile/lib/core/providers/app_state.dart` with your PC's local LAN IP (e.g., `http://192.168.1.150:3001/api/v1`), and ensure your PC firewall allows inbound connections on port 3001.

---

## 7. Troubleshooting Build Issues

| Issue | Cause | Fix |
|---|---|---|
| `Execution failed for task ':app:checkDebugAarMetadata'` | Incompatible `compileSdkVersion` | Check that `compileSdkVersion 34` matches dependencies in `apps/mobile/android/app/build.gradle`. |
| `Gradle lock held by another process` | Previous Gradle daemon hung | Kill the Gradle daemon: `taskkill /F /IM java.exe` and re-run. |
| `Cleartext HTTP traffic not permitted` | Android 9+ blocks plaintext HTTP by default | For production, deploy backend with HTTPS. For development against `10.0.2.2`, `android:usesCleartextTraffic="true"` is enabled in `debug/AndroidManifest.xml`. |
| `flutter.bat lock on Windows` | Non-interactive batch redirection handle 9 | Run Dart SDK directly: `C:\flutter\bin\cache\dart-sdk\bin\dart.exe` or execute `flutter build apk` inside interactive PowerShell/CMD console. |
