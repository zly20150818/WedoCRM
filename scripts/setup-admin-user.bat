@echo off
REM 一键创建管理员用户的批处理脚本
REM 自动创建用户并设置为管理员角色

echo ==========================================
echo Setup Admin User
echo ==========================================
echo.

REM 使用 PowerShell 脚本实现完整功能
echo Running setup script...
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0setup-admin-user.ps1"

REM 检查执行结果
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Failed to setup admin user.
    pause
    exit /b 1
)

