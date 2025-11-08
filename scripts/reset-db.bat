@echo off
REM 数据库重置脚本（Windows CMD 版本）
REM 重置 Supabase 数据库并显示管理员账号信息

echo ==========================================
echo Resetting Database...
echo ==========================================
echo.

REM 执行数据库重置
call supabase db reset

echo.
echo ==========================================
echo Database Reset Complete!
echo ==========================================
echo.
echo Default Admin Account:
echo   Email:    admin@fincrm.com
echo   Password: admin123
echo   Role:     Admin
echo.
echo You can now login at:
echo   http://localhost:3000/login
echo.
echo ==========================================
echo.

pause
