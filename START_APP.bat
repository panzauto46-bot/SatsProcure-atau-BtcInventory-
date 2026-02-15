@echo off
echo ===================================================
echo   SatsProcure - One Click Launcher
echo   Starting Local Blockchain & Frontend...
echo ===================================================

:: 1. Start Hardhat Node in a new window
start "SatsProcure Blockchain" cmd /k "npx hardhat node"

:: Wait 5 seconds for blockchain to initialize
timeout /t 5 /nobreak >nul

:: 2. Start Frontend in a new window
start "SatsProcure Frontend" cmd /k "npm run dev"

:: Wait 3 seconds for vite to start
timeout /t 3 /nobreak >nul

:: 3. Open Browser
echo Opening Website...
start http://localhost:5173

echo.
echo ===================================================
echo   DONE! App is running.
echo   - Blockchain is running in one window.
echo   - Frontend is running in another window.
echo   - Wallet Setup:
echo     Import Private Key to MetaMask:
echo     0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
echo ===================================================
pause
