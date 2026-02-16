@echo off
chcp 65001 >nul
title 🚀 SatsProcure - App Launcher
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
echo  ║         SatsProcure - App Launcher v2.0               ║
echo  ║         Escrow ^& Partial Payments Edition             ║
echo  ║                                                      ║
echo  ╚══════════════════════════════════════════════════════╝
echo.

:: ─────────────────────────────────────────
:: Step 1: Check Node.js
:: ─────────────────────────────────────────
echo  [1/5] Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    color 0C
    echo  [ERROR] Node.js not found! Please install Node.js first.
    echo  Download: https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do echo         Node.js %%i detected ✓
echo.

:: ─────────────────────────────────────────
:: Step 2: Install dependencies (if needed)
:: ─────────────────────────────────────────
echo  [2/5] Checking dependencies...
if not exist "node_modules" (
    echo         Installing npm packages...
    call npm install
    echo         Dependencies installed ✓
) else (
    echo         node_modules found ✓
)
echo.

:: ─────────────────────────────────────────
:: Step 3: Kill any existing processes on ports
:: ─────────────────────────────────────────
echo  [3/5] Cleaning up old processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8545 ^| findstr LISTENING 2^>nul') do (
    taskkill /PID %%a /F >nul 2>nul
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING 2^>nul') do (
    taskkill /PID %%a /F >nul 2>nul
)
echo         Ports 8545 ^& 5173 cleared ✓
echo.

:: ─────────────────────────────────────────
:: Step 4: Start Hardhat Node + Deploy
:: ─────────────────────────────────────────
echo  [4/5] Starting Hardhat Blockchain Node...
start "Hardhat Node" /min cmd /c "cd /d "%~dp0" && npx hardhat node"

:: Wait for node to be ready
echo         Waiting for node to start...
timeout /t 5 /nobreak >nul

:: Deploy contract
echo         Deploying SatsProcure contract...
call npx hardhat run scripts/deploy.cjs --network localhost >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo         Contract deployed successfully ✓
) else (
    echo         Contract deployment had issues, retrying...
    timeout /t 3 /nobreak >nul
    call npx hardhat run scripts/deploy.cjs --network localhost >nul 2>nul
    echo         Retry complete ✓
)
echo.

:: ─────────────────────────────────────────
:: Step 5: Start Frontend
:: ─────────────────────────────────────────
echo  [5/5] Starting Frontend Dev Server...
start "SatsProcure Frontend" /min cmd /c "cd /d "%~dp0" && npx vite --host"

:: Wait for frontend
timeout /t 4 /nobreak >nul

echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║                                                      ║
echo  ║   ✅ SatsProcure is READY!                           ║
echo  ║                                                      ║
echo  ║   🌐 Frontend:  http://localhost:5173                 ║
echo  ║   ⛓  Blockchain: http://localhost:8545                ║
echo  ║   📄 Contract:  0x5FbDB231...64180aa3                ║
echo  ║                                                      ║
echo  ║   Features:                                          ║
echo  ║   • Escrow Mechanism (funds held in contract)        ║
echo  ║   • Partial Payments (installments)                  ║
echo  ║   • Confirm Receipt (release escrow)                 ║
echo  ║   • Auto-Refund on Cancel                            ║
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
taskkill /FI "WINDOWTITLE eq Hardhat Node*" /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq SatsProcure Frontend*" /F >nul 2>nul

:: Also kill by port
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8545 ^| findstr LISTENING 2^>nul') do (
    taskkill /PID %%a /F >nul 2>nul
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING 2^>nul') do (
    taskkill /PID %%a /F >nul 2>nul
)

echo  All services stopped. Goodbye! 👋
timeout /t 2 /nobreak >nul
