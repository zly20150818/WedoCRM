# 创建测试用户的 PowerShell 脚本
# 使用 Supabase Auth API 创建测试用户

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Creating test user: admin@fincrm.com" -ForegroundColor Cyan
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

Write-Host "Creating user via Supabase Auth API..." -ForegroundColor Yellow
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

# 发送请求
try {
    $Response = Invoke-RestMethod -Uri "$SupabaseUrl/auth/v1/signup" `
        -Method Post `
        -Headers @{
            "apikey" = $SupabaseAnonKey
            "Content-Type" = "application/json"
        } `
        -Body $Body

    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "User created successfully!" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Login credentials:" -ForegroundColor Cyan
    Write-Host "Email: admin@fincrm.com" -ForegroundColor White
    Write-Host "Password: admin123" -ForegroundColor White
    Write-Host ""
    Write-Host "User ID: $($Response.user.id)" -ForegroundColor Gray
    Write-Host ""
} catch {
    $ErrorMessage = $_.Exception.Message
    $StatusCode = $_.Exception.Response.StatusCode.value__
    
    Write-Host ""
    
    # 检查是否是 422 错误（用户已存在）
    if ($StatusCode -eq 422 -or $ErrorMessage -like "*422*" -or $ErrorMessage -like "*User already registered*") {
        Write-Host "==========================================" -ForegroundColor Yellow
        Write-Host "User already exists!" -ForegroundColor Yellow
        Write-Host "==========================================" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "The user admin@fincrm.com is already registered." -ForegroundColor Cyan
        Write-Host "You can use these credentials to login:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Email: admin@fincrm.com" -ForegroundColor White
        Write-Host "Password: admin123" -ForegroundColor White
        Write-Host ""
        Write-Host "To check user role, run:" -ForegroundColor Gray
        Write-Host 'scripts\make-admin.bat' -ForegroundColor Gray
    } else {
        Write-Host "ERROR: Failed to create user" -ForegroundColor Red
        Write-Host $ErrorMessage -ForegroundColor Red
        Write-Host ""
        Write-Host "Status Code: $StatusCode" -ForegroundColor Gray
    }
}

Write-Host ""
Read-Host "Press Enter to exit"


