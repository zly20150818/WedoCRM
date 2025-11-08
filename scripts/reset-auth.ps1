# 重置所有认证数据的脚本
# 删除所有用户并重新创建管理员

Write-Host "==========================================" -ForegroundColor Red
Write-Host "Reset Authentication Data" -ForegroundColor Red
Write-Host "==========================================" -ForegroundColor Red
Write-Host ""
Write-Host "WARNING: This will delete ALL users!" -ForegroundColor Yellow
Write-Host ""

# 确认操作
$confirmation = Read-Host "Type 'YES' to continue"
if ($confirmation -ne "YES") {
    Write-Host "Operation cancelled." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 0
}

Write-Host ""
Write-Host "Step 1: Deleting all users from auth.users..." -ForegroundColor Yellow

$env:PGPASSWORD = "postgres"

# 删除所有用户
$result = psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -c "DELETE FROM auth.users; SELECT COUNT(*) FROM auth.users;"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ All users deleted" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to delete users" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Step 2: Verifying profiles are also cleared..." -ForegroundColor Yellow

# 由于有外键约束，profiles 应该会自动删除
$profileCount = psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -t -A -c "SELECT COUNT(*) FROM public.profiles;"

Write-Host "Profiles remaining: $profileCount" -ForegroundColor Gray

if ($profileCount -gt 0) {
    Write-Host "Cleaning up profiles..." -ForegroundColor Yellow
    psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -c "DELETE FROM public.profiles;"
}

Write-Host ""
Write-Host "Step 3: Creating new admin user..." -ForegroundColor Yellow

# 等待一秒让数据库完成清理
Start-Sleep -Seconds 1

# 调用创建管理员用户的脚本
& "$PSScriptRoot\setup-admin-user.ps1"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "Reset Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Visit: http://localhost:3000/clear-auth" -ForegroundColor White
Write-Host "2. Wait for the browser cache to clear" -ForegroundColor White
Write-Host "3. Login with: admin@fincrm.com / admin123" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to exit"

