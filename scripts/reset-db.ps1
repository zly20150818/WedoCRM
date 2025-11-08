# 数据库重置脚本（PowerShell 版本）
# 重置 Supabase 数据库并显示管理员账号信息

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Resetting Database..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 执行数据库重置
supabase db reset

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "Database Reset Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Default Admin Account:" -ForegroundColor Cyan
Write-Host "  Email:    admin@fincrm.com" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host "  Role:     Admin" -ForegroundColor White
Write-Host ""
Write-Host "You can now login at:" -ForegroundColor Gray
Write-Host "  http://localhost:3000/login" -ForegroundColor Gray
Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

Read-Host "Press Enter to exit"

