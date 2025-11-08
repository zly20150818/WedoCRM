@echo off
REM 启动开发服务器（包含 Supabase 健康检查）

powershell -ExecutionPolicy Bypass -File "%~dp0start-dev-with-supabase.ps1"

