@echo off
REM GridX Setup Script for Windows

echo 🚀 GridX Setup Script
echo ====================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not installed. Install from https://nodejs.org
    exit /b 1
)

REM Check Python
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Python not installed. Install from https://python.org
    exit /b 1
)

REM Check Docker
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker not installed. Install from https://docker.com
    exit /b 1
)

echo ✓ All prerequisites found
echo.

REM Backend setup
echo 📦 Setting up Backend...
cd gridx-backend
call npm install
if not exist .env (
    copy .env.example .env
)
cd ..
echo ✓ Backend ready
echo.

REM Frontend setup
echo 🎨 Setting up Frontend...
cd gridx-frontend
call npm install
if not exist .env.local (
    copy .env.example .env.local
)
cd ..
echo ✓ Frontend ready
echo.

REM AI setup
echo 🤖 Setting up AI Service...
cd gridx-ai
python -m venv venv
call venv\Scripts\activate.bat
pip install -r requirements.txt
call venv\Scripts\deactivate.bat
cd ..
echo ✓ AI service ready
echo.

REM Start Docker
echo Starting services with Docker Compose...
docker-compose up --build -d

echo.
echo ✅ Setup complete!
echo.
echo Services running:
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:3001
echo   AI:        http://localhost:8000
echo   Database:  localhost:5432
echo.
echo View logs: docker-compose logs -f
echo Stop: docker-compose down
