@echo off
setlocal
echo ========================================================
echo   ClaimGuard - Android APK Build Pipeline
echo ========================================================

set "JAVA_HOME=C:\Program Files\Android\Android Studio2\jbr"
set "PATH=%JAVA_HOME%\bin;%PATH%"
set "FLUTTER_ROOT=C:\flutter"
set "DART=%FLUTTER_ROOT%\bin\cache\dart-sdk\bin\dart.exe"
set "PKG=%FLUTTER_ROOT%\packages\flutter_tools\.dart_tool\package_config.json"
set "RUNNER=C:\projects\Claim_guard\scripts\run_flutter.dart"

echo [1/3] Java Version:
"%JAVA_HOME%\bin\java.exe" -version

echo.
echo [2/3] Building APK for android-arm64...
cd /d "C:\projects\Claim_guard\apps\mobile"
"%DART%" --packages="%PKG%" "%RUNNER%" build apk --debug --target-platform=android-arm64 --no-version-check --suppress-analytics

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] APK build failed with code %ERRORLEVEL%
    exit /b %ERRORLEVEL%
)

echo.
echo [3/3] Build completed successfully!
if exist "C:\projects\Claim_guard\apps\mobile\build\app\outputs\flutter-apk\app-debug.apk" (
    echo [SUCCESS] APK located at:
    dir "C:\projects\Claim_guard\apps\mobile\build\app\outputs\flutter-apk\app-debug.apk"
) else (
    echo [WARN] Searching for any generated APK in build output:
    dir /s /b "C:\projects\Claim_guard\apps\mobile\build\app\outputs\*.apk"
)
