@echo off
REM 清理并重启开发服务器

echo Cleaning build cache...

REM 关闭 3000 和 3001 端口
echo Checking ports...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do taskkill /F /PID %%a >nul 2>&1

REM 删除缓存目录
if exist .next (
    echo Removing .next directory...
    rmdir /s /q .next
)

if exist node_modules\.cache (
    echo Removing node_modules/.cache...
    rmdir /s /q node_modules\.cache
)

echo Cache cleaned!
echo.
echo Starting development server...
npm run dev

