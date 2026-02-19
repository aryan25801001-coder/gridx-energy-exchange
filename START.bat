@echo off
cd /d C:\Users\aarya\Desktop\haryana\gridx-backend
call npm install
call npm run seed
start cmd /k npm run dev

timeout /t 3 /nobreak

cd /d C:\Users\aarya\Desktop\haryana\gridx-frontend
call npm install
start cmd /k npm run dev

timeout /t 3 /nobreak

start "" http://localhost:3000

echo.
echo ========================================
echo GridX Platform Started!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Login: http://localhost:3000/login
echo Backend: http://localhost:3001
echo Health: http://localhost:3001/health
echo.
echo Demo: arjun@solargrid.in / password123
echo.
echo ========================================
