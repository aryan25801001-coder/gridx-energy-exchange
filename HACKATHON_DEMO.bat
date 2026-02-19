@echo off
echo ==========================================
echo   GRIDX HACKATHON EMERGENCY START
echo ==========================================

REM Kill any existing processes
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM python.exe /T >nul 2>&1

echo [1/3] Starting AI Service (Port 8000)...
start /B cmd /c "cd gridx-ai && python main.py"

echo [2/3] Starting Backend API (Port 3001)...
start /B cmd /c "cd gridx-backend && npm run dev"

echo [3/3] Starting Frontend Dashboard (Port 3000)...
echo Pre-building frontend for safety...
cd gridx-frontend
start /B cmd /c "npm run dev"

echo ==========================================
echo   ALL SERVICES ARE BOOTING
echo   Please Wait 10-20 seconds...
echo   Open: http://localhost:3000
echo ==========================================
pause
