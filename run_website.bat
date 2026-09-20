@echo off
setlocal
title ClaimGuard Web Portal (Next.js - Port 3000)
echo ========================================================
echo   ClaimGuard Web Experience (Port 3000)
echo   Employee & Manager Web Portals
echo ========================================================
echo.
echo Starting Next.js development server on http://localhost:3000...
echo.
cd /d "C:\projects\Claim_guard"
call npx next dev -p 3000
pause
