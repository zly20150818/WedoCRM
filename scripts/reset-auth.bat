@echo off
REM 重置所有认证数据

echo ==========================================
echo Reset Authentication Data
echo ==========================================
echo.
echo WARNING: This will delete ALL users!
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0reset-auth.ps1"

