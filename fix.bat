@echo off
echo ========================================
echo   FinCRM Quick Fix Script
echo ========================================
echo.
echo Stopping Node processes...
taskkill /F /IM node.exe >nul 2>&1

echo Cleaning cache...
if exist .next (
    rmdir /s /q .next
    echo   - Removed .next
)
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo   - Removed node_modules\.cache
)

echo.
echo Cache cleaned successfully!
echo.
echo Starting development server...
echo Visit: http://localhost:3000
echo.
npm run dev

