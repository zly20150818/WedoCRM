@echo off
REM Supabase 监控脚本 (CMD 版本)

echo Starting Supabase Monitor...
echo Press Ctrl+C to stop
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0supabase-monitor.ps1" -IntervalSeconds 60 -MaxFailures 3

