# GridX Platform - Start Script (PowerShell)

Write-Host "========================================" -ForegroundColor Green
Write-Host "GridX Platform Startup" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Backend
Write-Host "`n[1/3] Starting Backend..." -ForegroundColor Yellow
$backend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\aarya\Desktop\haryana\gridx-backend'; npm install; npm run seed; npm run dev" -PassThru

# Wait a bit
Start-Sleep -Seconds 2

# Frontend
Write-Host "[2/3] Starting Frontend..." -ForegroundColor Yellow
$frontend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\aarya\Desktop\haryana\gridx-frontend'; npm install; npm run dev" -PassThru

# Wait a bit
Start-Sleep -Seconds 2

# Open Browser
Write-Host "[3/3] Opening Browser..." -ForegroundColor Yellow
Start-Process "http://localhost:3000"

# Show info
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "GridX Platform Started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "`nFrontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Login: http://localhost:3000/login" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Health: http://localhost:3001/health" -ForegroundColor Cyan
Write-Host "`nDemo Credentials:" -ForegroundColor Yellow
Write-Host "Email: arjun@solargrid.in" -ForegroundColor White
Write-Host "Password: password123" -ForegroundColor White
Write-Host "`n========================================" -ForegroundColor Green
