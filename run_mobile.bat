@echo off
title ClaimGuard Flutter Mobile Web (Port 8080)
color 0F

echo ================================================================
echo   C L A I M G U A R D   M O B I L E   W E B   S E R V E R
echo ================================================================
echo.
echo Launching ClaimGuard Flutter Mobile Web on http://localhost:8080 ...
echo.
set "FLUTTER_ROOT=C:\flutter"
"C:\flutter\bin\cache\dart-sdk\bin\dart.exe" --packages="C:\flutter\packages\flutter_tools\.dart_tool\package_config.json" "%~dp0scripts\run_flutter.dart" run -d web-server --web-port 8080 --web-hostname 0.0.0.0 --no-version-check --suppress-analytics
pause
