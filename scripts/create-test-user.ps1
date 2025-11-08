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
    Write-Host ""
    Write-Host "ERROR: Failed to create user" -ForegroundColor Red
    Write-Host $ErrorMessage -ForegroundColor Red
    Write-Host ""
    
    if ($ErrorMessage -like "*User already registered*") {
        Write-Host "The user admin@fincrm.com already exists." -ForegroundColor Yellow
        Write-Host "You can use these credentials to login:" -ForegroundColor Yellow
        Write-Host "Email: admin@fincrm.com" -ForegroundColor White
        Write-Host "Password: admin123" -ForegroundColor White
    }
}

Write-Host ""
Read-Host "Press Enter to exit"

