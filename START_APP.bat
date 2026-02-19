@echo off
chcp 65001 >nul
title SatsProcure - App Launcher
color 0A

echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║                                                      ║
echo  ║       ██████╗  █████╗ ████████╗███████╗              ║
echo  ║       ██╔════╝██╔══██╗╚══██╔══╝██╔════╝              ║
echo  ║       ███████╗███████║   ██║   ███████╗              ║
echo  ║       ╚════██║██╔══██║   ██║   ╚════██║              ║
echo  ║       ███████║██║  ██║   ██║   ███████║              ║
echo  ║       ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝              ║
echo  ║                                                      ║
echo  ║         SatsProcure - App Launcher v3.0               ║
echo  ║         Bitcoin Native (Xverse) Edition               ║
echo  ║                                                      ║
echo  ╚══════════════════════════════════════════════════════╝
echo.

:: ─────────────────────────────────────────
:: Step 1: Check Node.js
:: ─────────────────────────────────────────
echo  [1/3] Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    color 0C
    echo  [ERROR] Node.js not found! Please install Node.js first.
    echo  Download: https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do echo         Node.js %%i detected
echo.

:: ─────────────────────────────────────────
:: Step 2: Install dependencies (if needed)
:: ─────────────────────────────────────────
echo  [2/3] Checking dependencies...
if not exist "node_modules" (
    echo         Installing npm packages...
    call npm install
    echo         Dependencies installed
) else (
    echo         node_modules found
)
echo.

:: ─────────────────────────────────────────
:: Step 3: Start Frontend
:: ─────────────────────────────────────────
echo  [3/3] Starting Frontend Dev Server...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING 2^>nul') do (
    taskkill /PID %%a /F >nul 2>nul
)
start "SatsProcure Frontend" /min cmd /c "cd /d "%~dp0" && npx vite --host"

:: Wait for frontend
timeout /t 4 /nobreak >nul

echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║                                                      ║
echo  ║   SatsProcure is READY!                              ║
echo  ║                                                      ║
echo  ║   Frontend:  http://localhost:5173                    ║
echo  ║   Wallet:    Xverse (Bitcoin Native)                 ║
echo  ║   Network:   Bitcoin Testnet                         ║
echo  ║                                                      ║
echo  ╚══════════════════════════════════════════════════════╝
echo.

:: Open browser automatically
echo  Opening browser...
timeout /t 2 /nobreak >nul
start http://localhost:5173

echo.
echo  ─────────────────────────────────────────────────
echo   Press any key to STOP all services and exit...
echo  ─────────────────────────────────────────────────
pause >nul

:: ─────────────────────────────────────────
:: Cleanup: Stop all services
:: ─────────────────────────────────────────
echo.
echo  Stopping services...
taskkill /FI "WINDOWTITLE eq SatsProcure Frontend*" /F >nul 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING 2^>nul') do (
    taskkill /PID %%a /F >nul 2>nul
)

echo  All services stopped. Goodbye!
timeout /t 2 /nobreak >nul
