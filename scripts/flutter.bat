@echo off
setlocal
set FLUTTER_ROOT=C:\flutter
set DART=%FLUTTER_ROOT%\bin\cache\dart-sdk\bin\dart.exe
set PKG=%FLUTTER_ROOT%\packages\flutter_tools\.dart_tool\package_config.json
set SNAPSHOT=%FLUTTER_ROOT%\bin\cache\flutter_tools.snapshot
set PATH=%FLUTTER_ROOT%\bin;%FLUTTER_ROOT%\bin\cache\dart-sdk\bin;%PATH%
"%DART%" --packages="%PKG%" "%SNAPSHOT%" %*
