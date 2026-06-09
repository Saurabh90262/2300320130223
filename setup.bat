@echo off
REM Colors using FINDSTR for visualization
REM Colors: 1=Blue, 2=Green, 3=Cyan, 4=Red, 5=Purple, 6=Yellow, 7=White, 8=Gray

echo.
echo === AffordMed Notification System - Setup ===
echo.

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo [OK] Node.js found: %NODE_VERSION%

REM Setup Backend
echo.
echo === Setting up Backend ===
cd notification_app_be

if not exist .env (
    copy .env.example .env
    echo [OK] Created .env from .env.example
)

call npm install
echo [OK] Backend dependencies installed

REM Setup Frontend
echo.
echo === Setting up Frontend ===
cd ..\notification_app_fe

if not exist .env.local (
    copy .env.example .env.local
    echo [OK] Created .env.local from .env.example
)

call npm install
echo [OK] Frontend dependencies installed

echo.
echo === Next Steps ===
echo 1. Start MongoDB: mongod
echo 2. Start Redis: redis-server
echo 3. Start Backend: cd notification_app_be ^&^& npm run dev
echo 4. Start Frontend: cd notification_app_fe ^&^& npm run dev
echo 5. Open browser: http://localhost:3000
echo.
echo [OK] Setup complete!
