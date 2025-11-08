@echo off
REM 清理 Next.js 构建缓存和 node_modules
REM 用于解决构建错误和缓存问题

echo ======================================
echo   清理 Next.js 构建缓存
echo ======================================
echo.

REM 清理 .next 目录
if exist ".next" (
    echo [INFO] 清理 .next 目录...
    rmdir /s /q ".next"
    echo [OK] .next 目录已清理
) else (
    echo [INFO] .next 目录不存在，跳过
)

REM 清理 node_modules\.cache
if exist "node_modules\.cache" (
    echo [INFO] 清理 node_modules\.cache...
    rmdir /s /q "node_modules\.cache"
    echo [OK] node_modules\.cache 已清理
) else (
    echo [INFO] node_modules\.cache 不存在，跳过
)

echo.
echo ======================================
echo [OK] 清理完成！
echo ======================================
echo.
echo 下一步：
echo 1. 运行 'npm run dev:safe' 重新启动开发服务器
echo 2. 如果问题仍然存在，尝试删除 node_modules 并重新安装：
echo    rmdir /s /q node_modules
echo    npm install
echo.

pause

