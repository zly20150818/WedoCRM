# Scripts Directory - 脚本目录

本目录包含 FinCRM 项目的实用脚本，提供批处理文件（.bat）和 PowerShell（.ps1）两种版本。

## 📋 可用脚本

### 1. 启动开发服务器 - `start-dev`

自动关闭 3000 端口并启动 Next.js 开发服务器。

**使用方法**：

```cmd
# 使用 npm 脚本（推荐）
npm run dev:safe

# 直接运行批处理文件
scripts\start-dev.bat

# 或使用 PowerShell 版本
scripts\start-dev.ps1
npm run dev:safe:ps1
```

**功能**：
- ✅ 自动检查 3000 端口是否被占用
- ✅ 自动关闭占用进程
- ✅ 启动开发服务器

---

### 2. 重置数据库 - `reset-db`

清空本地数据库并重新运行所有迁移和种子数据。

**使用方法**：

```cmd
# 使用 npm 脚本（推荐）
npm run db:reset

# 直接运行批处理文件
scripts\reset-db.bat

# 或使用 PowerShell 版本
scripts\reset-db.ps1
npm run db:reset:ps1
```

**功能**：
- ✅ 安全确认机制（防止误操作）
- ✅ 清空所有数据库数据
- ✅ 重新运行迁移文件
- ✅ 运行种子数据
- ✅ 可选更新 TypeScript 类型

**⚠️ 警告**：此操作会删除所有本地数据库数据！仅用于开发环境。

---

### 3. 清理缓存 - `clean`

清理 Next.js 构建缓存和 node_modules 缓存。

**使用方法**：

```cmd
# 使用 npm 脚本（推荐）
npm run clean

# 直接运行批处理文件
scripts\clean.bat

# 或使用 PowerShell 版本
scripts\clean.ps1
npm run clean:ps1

# 只清理特定缓存
npm run clean:cache
```

**功能**：
- ✅ 清理 `.next` 目录
- ✅ 清理 `node_modules/.cache` 目录
- ✅ 解决构建错误和缓存问题

---

### 4. Supabase 健康检查 - `supabase-health-check`

检查所有 Supabase 服务的运行状态。

**使用方法**：

```cmd
# 使用 npm 脚本（推荐）
npm run supabase:health

# 直接运行批处理文件
scripts\supabase-health-check.bat

# 或使用 PowerShell 版本
scripts\supabase-health-check.ps1
```

**功能**：
- ✅ 检查 Supabase 服务状态
- ✅ 检查 API 健康状态
- ✅ 检查数据库连接
- ✅ 检查 Docker 容器状态

---

### 5. Supabase 重启 - `supabase-restart`

安全地重启 Supabase 服务。

**使用方法**：

```cmd
# 使用 npm 脚本（推荐）
npm run supabase:restart

# 直接运行批处理文件
scripts\supabase-restart.bat

# 或使用 PowerShell 版本
scripts\supabase-restart.ps1
```

**功能**：
- ✅ 停止所有 Supabase 服务
- ✅ 等待服务完全停止
- ✅ 重新启动服务
- ✅ 运行健康检查验证

---

### 6. Supabase 监控 - `supabase-monitor`

持续监控 Supabase 服务，自动重启失败的服务。

**使用方法**：

```cmd
# 使用 npm 脚本（推荐）
npm run supabase:monitor

# 直接运行批处理文件
scripts\supabase-monitor.bat

# 或使用 PowerShell 版本（自定义参数）
scripts\supabase-monitor.ps1 -IntervalSeconds 30 -MaxFailures 2
```

**参数说明**：
- `IntervalSeconds`: 检查间隔（默认 60 秒）
- `MaxFailures`: 失败多少次后自动重启（默认 3 次）

**功能**：
- ✅ 定期检查 API 健康状态
- ✅ 失败时自动重启服务
- ✅ 后台运行保持稳定
- ✅ 适合长时间开发

---

### 7. 创建测试用户 - `create-test-user`

创建默认测试用户（admin@fincrm.com）并设置为管理员角色。

**使用方法**：

```cmd
# 直接运行批处理文件
scripts\create-test-user.bat

# 或使用 PowerShell 版本（推荐）
powershell -ExecutionPolicy Bypass -File scripts\create-test-user.ps1
```

**功能**：
- ✅ 自动创建测试用户 admin@fincrm.com
- ✅ 密码：admin123
- ✅ 设置为 Admin 角色
- ✅ 自动设置公司信息

**注意**：
- ⚠️ 如果用户已存在，脚本会提示错误（这是正常的）
- ⚠️ 创建后需要手动升级为 Admin（或运行 `make-admin.bat`）

---

### 8. 升级为管理员 - `make-admin`

将指定用户升级为管理员角色。

**使用方法**：

```cmd
# 直接运行批处理文件
scripts\make-admin.bat
```

**功能**：
- ✅ 将 admin@fincrm.com 升级为 Admin 角色
- ✅ 设置管理员信息

---

### 9. 完整启动开发环境 - `start-dev-with-supabase`

启动开发服务器前自动检查并修复 Supabase。

**使用方法**：

```cmd
# 使用 npm 脚本（推荐）
npm run dev:full

# 直接运行批处理文件
scripts\start-dev-with-supabase.bat

# 或使用 PowerShell 版本
scripts\start-dev-with-supabase.ps1
```

**功能**：
- ✅ 检查并关闭 3000 端口
- ✅ 检查 Supabase 运行状态
- ✅ 自动启动 Supabase（如果未运行）
- ✅ 健康检查（确保 API 可用）
- ✅ 启动 Next.js 开发服务器

---

## 🚀 快速参考

### 常用工作流

#### 开发服务器启动

```cmd
# 标准启动（最安全，包含 Supabase 检查）
npm run dev:full

# 或快速启动（只关闭端口）
npm run dev:safe
```

#### Supabase 管理

```cmd
# 检查 Supabase 健康状态
npm run supabase:health

# Supabase 出问题时重启
npm run supabase:restart

# 长时间开发时启用监控（单独终端）
npm run supabase:monitor
```

#### 数据库开发流程

```cmd
# 1. 修改 SQL 文件
# 编辑 supabase/migrations/*.sql

# 2. 重置数据库
npm run db:reset

# 3. 创建测试用户
powershell -ExecutionPolicy Bypass -File scripts\create-test-user.ps1

# 4. 更新类型
npm run db:types

# 5. 启动开发服务器
npm run dev:safe
```

#### 首次设置流程

```cmd
# 1. 安装依赖
npm install

# 2. 启动 Supabase
supabase start

# 3. 创建测试用户
powershell -ExecutionPolicy Bypass -File scripts\create-test-user.ps1

# 4. 升级为管理员（如果需要）
scripts\make-admin.bat

# 5. 启动开发服务器
npm run dev:full
```

#### 清理缓存后重启

```cmd
# 1. 清理缓存
npm run clean

# 2. 重新启动
npm run dev:safe
```

---

## 📝 脚本对比

| 脚本 | .bat 版本 | .ps1 版本 | npm 命令 |
|------|----------|----------|----------|
| 启动开发服务器 | ✅ `start-dev.bat` | ✅ `start-dev.ps1` | `npm run dev:safe` |
| 完整启动（含 Supabase） | ✅ `start-dev-with-supabase.bat` | ✅ `start-dev-with-supabase.ps1` | `npm run dev:full` |
| 重置数据库 | ✅ `reset-db.bat` | ✅ `reset-db.ps1` | `npm run db:reset` |
| 清理缓存 | ✅ `clean.bat` | ✅ `clean.ps1` | `npm run clean` |
| Supabase 健康检查 | ✅ `supabase-health-check.bat` | ✅ `supabase-health-check.ps1` | `npm run supabase:health` |
| Supabase 重启 | ✅ `supabase-restart.bat` | ✅ `supabase-restart.ps1` | `npm run supabase:restart` |
| Supabase 监控 | ✅ `supabase-monitor.bat` | ✅ `supabase-monitor.ps1` | `npm run supabase:monitor` |

### 推荐使用

| 优先级 | 方式 | 优点 |
|--------|------|------|
| 🥇 第一选择 | `npm run xxx` | 最简单，跨平台 |
| 🥈 第二选择 | `scripts\xxx.bat` | 不需要 npm，Windows 原生支持 |
| 🥉 第三选择 | `scripts\xxx.ps1` | 功能最强大，但可能需要配置执行策略 |

---

## ⚙️ PowerShell 执行策略

如果 PowerShell 脚本无法执行，请参考 [Windows 脚本执行故障排除指南](../WINDOWS_SCRIPT_TROUBLESHOOTING.md)。

### 快速解决方案

#### 方式 1: 使用批处理文件（推荐）

```cmd
scripts\start-dev.bat
scripts\reset-db.bat
scripts\clean.bat
```

#### 方式 2: 临时绕过执行策略

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-dev.ps1
```

#### 方式 3: 永久修改执行策略（仅当前用户）

```powershell
# 以管理员身份运行
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 🐛 故障排除

### 端口已被占用

```cmd
# 使用 start-dev 脚本会自动处理
npm run dev:safe

# 或使用完整启动
npm run dev:full
```

### Supabase 服务停止或 API 失败

```cmd
# 1. 检查健康状态
npm run supabase:health

# 2. 重启服务
npm run supabase:restart

# 3. 查看日志
docker logs supabase_kong_FinCRM
```

### 数据库重置失败

```cmd
# 检查 Supabase 是否运行
npm run supabase:health

# 如果未运行，重启
npm run supabase:restart

# 重试
npm run db:reset
```

### Supabase 频繁崩溃

```cmd
# 启用自动监控（在单独的终端窗口）
npm run supabase:monitor

# 或增加 Docker 资源
# 打开 Docker Desktop → Settings → Resources
# CPU: 至少 4 核
# Memory: 至少 6 GB
```

### 缓存清理失败

```cmd
# 确保没有进程占用文件
# 关闭所有终端和开发服务器

# 手动删除
rmdir /s /q .next
rmdir /s /q node_modules\.cache
```

---

## 📚 相关文档

- **[Supabase 优化指南](../docs/supabase-optimization.md)** - Docker 稳定性优化 🔥
- [开发工作流程](../DEVELOPMENT_WORKFLOW.md) - 完整的开发指南
- [Windows 脚本故障排除](../WINDOWS_SCRIPT_TROUBLESHOOTING.md) - PowerShell 执行问题
- [Supabase 集成指南](../SUPABASE_INTEGRATION.md) - 数据库配置
- [开发规范](../.cursor/rules/dev.mdc) - 代码规范

---

## 💡 最佳实践

1. **使用完整启动脚本**：`npm run dev:full` 替代 `npm run dev`
2. **开发前检查 Supabase**：`npm run supabase:health`
3. **长时间开发启用监控**：`npm run supabase:monitor`（单独终端）
4. **遇到 fetch failed 错误**：`npm run supabase:restart`
5. **定期清理缓存**：遇到奇怪的构建错误时
6. **开发时频繁重置数据库**：保持数据库架构同步

---

## 🔧 自定义脚本

如果需要添加新脚本：

1. 创建批处理文件版本（`.bat`）
2. 创建 PowerShell 版本（`.ps1`）
3. 在 `package.json` 中添加 npm 脚本
4. 更新本 README

---

**需要帮助？** 查看 [WINDOWS_SCRIPT_TROUBLESHOOTING.md](../WINDOWS_SCRIPT_TROUBLESHOOTING.md)

