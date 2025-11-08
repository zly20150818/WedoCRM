@echo off
REM 快速重置本地数据库脚本

echo ======================================
echo     Database Reset Script (Dev)
echo ======================================
echo.

echo [WARNING] This will delete all data in your local database!
echo.

set /p confirm="Are you sure you want to reset the database? (yes/no): "

if /i not "%confirm%"=="yes" (
    echo [INFO] Database reset cancelled.
    pause
    exit /b 0
)

echo.
echo Resetting database...

REM 重置数据库
supabase db reset

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Database reset failed!
    echo Please make sure Supabase is running: supabase start
    pause
    exit /b 1
)

echo.
echo [OK] Database reset successfully!
echo.

set /p updateTypes="Do you want to update TypeScript types? (yes/no): "

if /i "%updateTypes%"=="yes" (
    echo.
    echo Generating TypeScript types...
    supabase gen types typescript --local > lib\supabase\types.ts
    echo [OK] TypeScript types updated!
)

echo.
echo ======================================
echo [OK] All operations completed!
echo ======================================
echo.
echo You can now start the development server:
echo   npm run dev:safe
echo   or: scripts\start-dev.bat
echo.

pause

