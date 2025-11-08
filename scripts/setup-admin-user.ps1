# 一键创建管理员用户的 PowerShell 脚本
# 自动创建用户并设置为管理员角色

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Setup Admin User" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Supabase 本地配置
$SupabaseUrl = "http://127.0.0.1:54321"
$EnvFile = ".env.local"

# 检查 .env.local 文件是否存在
if (-not (Test-Path $EnvFile)) {
    Write-Host "ERROR: .env.local file not found!" -ForegroundColor Red
    Write-Host "Please make sure Supabase is running and .env.local exists" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# 读取 ANON_KEY
$SupabaseAnonKey = Get-Content $EnvFile | Select-String "NEXT_PUBLIC_SUPABASE_ANON_KEY" | ForEach-Object { $_.ToString().Split('=')[1].Trim() }

if (-not $SupabaseAnonKey) {
    Write-Host "ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY not found in .env.local" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Step 1: Creating user via Supabase Auth API..." -ForegroundColor Yellow
Write-Host ""

# 创建用户请求体
$Body = @{
    email = "admin@fincrm.com"
    password = "admin123"
    data = @{
        first_name = "System"
        last_name = "Admin"
        company = "FinCRM"
    }
} | ConvertTo-Json

$UserId = $null
$UserExists = $false

# 发送请求
try {
    $Response = Invoke-RestMethod -Uri "$SupabaseUrl/auth/v1/signup" `
        -Method Post `
        -Headers @{
            "apikey" = $SupabaseAnonKey
            "Content-Type" = "application/json"
        } `
        -Body $Body

    $UserId = $Response.user.id
    Write-Host "✓ User created successfully!" -ForegroundColor Green
    Write-Host "  User ID: $UserId" -ForegroundColor Gray
    Write-Host ""
    
} catch {
    $ErrorMessage = $_.Exception.Message
    $StatusCode = $_.Exception.Response.StatusCode.value__
    
    # 检查是否是 422 错误（用户已存在）
    if ($StatusCode -eq 422 -or $ErrorMessage -like "*422*" -or $ErrorMessage -like "*User already registered*") {
        Write-Host "✓ User already exists" -ForegroundColor Yellow
        $UserExists = $true
        
        # 从数据库获取用户 ID
        Write-Host "  Getting user ID from database..." -ForegroundColor Gray
        $env:PGPASSWORD = "postgres"
        $UserIdResult = psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -t -A -c "SELECT id FROM auth.users WHERE email = 'admin@fincrm.com';"
        
        if ($UserIdResult) {
            $UserId = $UserIdResult.Trim()
            Write-Host "  User ID: $UserId" -ForegroundColor Gray
        }
        Write-Host ""
    } else {
        Write-Host "✗ ERROR: Failed to create user" -ForegroundColor Red
        Write-Host "  $ErrorMessage" -ForegroundColor Red
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# 如果成功获取到用户 ID，继续升级为管理员
if ($UserId) {
    Write-Host "Step 2: Upgrading to Admin role..." -ForegroundColor Yellow
    Write-Host ""
    
    $env:PGPASSWORD = "postgres"
    
    try {
        # 更新 profile 为管理员
        $UpdateResult = psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -c "UPDATE public.profiles SET role = 'Admin', first_name = 'System', last_name = 'Admin', company = 'FinCRM' WHERE email = 'admin@fincrm.com'; SELECT email, first_name, last_name, company, role FROM public.profiles WHERE email = 'admin@fincrm.com';"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Successfully upgraded to Admin!" -ForegroundColor Green
            Write-Host ""
            Write-Host $UpdateResult
        } else {
            Write-Host "✗ Failed to upgrade user role" -ForegroundColor Red
        }
    } catch {
        Write-Host "✗ ERROR: Failed to update profile" -ForegroundColor Red
        Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "✗ ERROR: Could not get user ID" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Admin user is ready to use:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Email:    admin@fincrm.com" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host "  Role:     Admin" -ForegroundColor White
Write-Host ""
Write-Host "You can now login at:" -ForegroundColor Gray
Write-Host "  http://localhost:3000/login" -ForegroundColor Gray
Write-Host ""

Read-Host "Press Enter to exit"

