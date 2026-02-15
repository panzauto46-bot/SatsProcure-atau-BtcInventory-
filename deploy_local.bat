@echo off
echo Deploying to Localhost...
npx hardhat run scripts/deploy.cjs --network localhost
pause
