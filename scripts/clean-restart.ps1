# 清理并重启开发服务器
# 解决构建缓存和语法错误问题

Write-Host "🧹 Cleaning build cache..." -ForegroundColor Yellow

# 关闭 3000 和 3001 端口
Write-Host "Checking ports 3000 and 3001..." -ForegroundColor Cyan
@(3000, 3001) | ForEach-Object {
    $port = $_
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "Closing port $port..." -ForegroundColor Yellow
        $process | ForEach-Object {
            try {
                Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
            } catch {
                # Ignore errors
            }
        }
        Start-Sleep -Milliseconds 500
    }
}

# 删除 .next 缓存
if (Test-Path ".next") {
    Write-Host "Removing .next directory..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force .next
}

# 删除 node_modules/.cache
if (Test-Path "node_modules\.cache") {
    Write-Host "Removing node_modules/.cache..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force node_modules\.cache
}

Write-Host "✅ Cache cleaned!" -ForegroundColor Green
Write-Host ""

# 重启开发服务器
Write-Host "🚀 Starting development server..." -ForegroundColor Green
npm run dev

