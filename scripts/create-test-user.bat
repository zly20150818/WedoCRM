@echo off
REM 创建测试用户脚本
REM 使用 curl 调用 Supabase Auth API 创建测试用户

echo ==========================================
echo Creating test user: admin@fincrm.com
echo ==========================================
echo.

REM 检查 curl 是否可用
where curl >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: curl is not installed or not in PATH
    echo Please install curl or use PowerShell script instead
    pause
    exit /b 1
)

REM 读取环境变量
set "SUPABASE_URL=http://127.0.0.1:54321"
set "SUPABASE_ANON_KEY="

REM 从 .env.local 读取 ANON_KEY（如果存在）
if exist ".env.local" (
    for /f "tokens=2 delims==" %%a in ('findstr "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local') do set "SUPABASE_ANON_KEY=%%a"
)

if "%SUPABASE_ANON_KEY%"=="" (
    echo ERROR: SUPABASE_ANON_KEY not found in .env.local
    echo Please make sure Supabase is running and .env.local exists
    pause
    exit /b 1
)

echo Creating user via Supabase Auth API...
echo.

REM 创建测试用户
curl -X POST "%SUPABASE_URL%/auth/v1/signup" ^
  -H "apikey: %SUPABASE_ANON_KEY%" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@fincrm.com\",\"password\":\"admin123\",\"data\":{\"first_name\":\"System\",\"last_name\":\"Admin\",\"company\":\"FinCRM\"}}"

echo.
echo.
echo ==========================================
echo User created successfully!
echo ==========================================
echo.
echo Login credentials:
echo Email: admin@fincrm.com
echo Password: admin123
echo.
echo Note: The user will be automatically set as Admin role by the database trigger.
echo.
pause

