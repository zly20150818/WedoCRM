@echo off
REM 自动关闭 3000 端口并启动开发服务器

echo ======================================
echo   FinCRM Development Server Starter
echo ======================================
echo.

echo Checking port 3000...

REM 查找占用 3000 端口的进程
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    set PID=%%a
    goto :FoundProcess
)

REM 如果没有找到进程
echo [OK] Port 3000 is available.
goto :StartServer

:FoundProcess
echo [WARNING] Port 3000 is occupied by PID: %PID%
echo Closing port 3000...

REM 关闭进程
taskkill /F /PID %PID% >nul 2>&1

if %errorlevel% equ 0 (
    echo [OK] Port 3000 closed successfully.
    timeout /t 1 /nobreak >nul
) else (
    echo [ERROR] Failed to close port 3000. Please close it manually.
    pause
    exit /b 1
)

:StartServer
echo.
echo Starting development server...
echo ======================================
echo.

REM 启动开发服务器
npm run dev

