# Windows 脚本执行故障排除指南

## 问题：PowerShell 脚本无法执行

### 常见错误信息

```
无法加载文件，因为在此系统上禁止运行脚本
File cannot be loaded because running scripts is disabled on this system
```

---

## 解决方案

### ✅ 方案 1: 使用批处理文件（推荐）⭐

我们已经为您准备了 `.bat` 版本的脚本，**更兼容，更容易执行**：

```cmd
# 启动开发服务器（使用 .bat 文件）
npm run dev:safe

# 重置数据库（使用 .bat 文件）
npm run db:reset

# 或直接运行
scripts\start-dev.bat
scripts\reset-db.bat
```

### ✅ 方案 2: 临时绕过执行策略

每次运行时使用 `-ExecutionPolicy Bypass` 参数：

```powershell
# PowerShell 版本（如果需要）
npm run dev:safe:ps1
npm run db:reset:ps1

# 或直接运行
powershell -ExecutionPolicy Bypass -File .\scripts\start-dev.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\reset-db.ps1
```

### ✅ 方案 3: 永久修改执行策略（仅当前用户）

**注意**：这会修改系统设置，但只影响当前用户。

1. **以管理员身份打开 PowerShell**
   - 按 `Win + X`，选择 "Windows PowerShell (管理员)"

2. **运行以下命令**：

```powershell
# 设置当前用户的执行策略为 RemoteSigned
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 确认更改
Get-ExecutionPolicy -List
```

3. **验证设置**：

```
        Scope ExecutionPolicy
        ----- ---------------
MachinePolicy       Undefined
   UserPolicy       Undefined
      Process       Undefined
  CurrentUser    RemoteSigned  # 应该显示这个
 LocalMachine       Undefined
```

4. **之后就可以直接运行 PowerShell 脚本了**：

```powershell
.\scripts\start-dev.ps1
.\scripts\reset-db.ps1
```

---

## 各种执行策略说明

| 策略 | 说明 | 推荐 |
|------|------|------|
| `Restricted` | 禁止所有脚本运行（Windows 默认） | ❌ |
| `AllSigned` | 只运行签名的脚本 | ❌ |
| `RemoteSigned` | 本地脚本可运行，远程脚本需签名 | ✅ 推荐 |
| `Unrestricted` | 所有脚本都可运行（有警告） | ⚠️ 不推荐 |
| `Bypass` | 无限制，无警告 | ⚠️ 临时使用 |

---

## 快速参考

### 推荐使用方式（按优先级）

#### 1. 使用 npm 脚本 + 批处理文件（最简单）⭐

```cmd
npm run dev:safe      # 启动开发服务器
npm run db:reset      # 重置数据库
npm run db:types      # 更新类型
```

#### 2. 直接运行批处理文件

```cmd
scripts\start-dev.bat
scripts\reset-db.bat
```

#### 3. 使用 PowerShell 版本（如果已设置执行策略）

```powershell
npm run dev:safe:ps1
npm run db:reset:ps1
```

---

## 可用脚本清单

| 脚本 | 批处理版本 (.bat) | PowerShell 版本 (.ps1) | npm 命令 |
|------|------------------|----------------------|----------|
| 启动开发服务器 | `start-dev.bat` | `start-dev.ps1` | `npm run dev:safe` |
| 重置数据库 | `reset-db.bat` | `reset-db.ps1` | `npm run db:reset` |
| 清理缓存 | ❌ | `clean.ps1` | `npm run clean` |

---

## 测试脚本是否正常工作

### 测试批处理文件

```cmd
# 测试 start-dev.bat
scripts\start-dev.bat

# 测试 reset-db.bat
scripts\reset-db.bat
```

### 测试 PowerShell 脚本

```powershell
# 检查执行策略
Get-ExecutionPolicy -List

# 测试运行（使用 Bypass）
powershell -ExecutionPolicy Bypass -File .\scripts\start-dev.ps1

# 如果设置了 RemoteSigned，可以直接运行
.\scripts\start-dev.ps1
```

---

## 常见问题

### Q1: 批处理文件和 PowerShell 脚本有什么区别？

**批处理文件 (.bat)**
- ✅ 更兼容，Windows 原生支持
- ✅ 不需要修改执行策略
- ✅ 可以直接双击运行
- ❌ 功能相对简单

**PowerShell 脚本 (.ps1)**
- ✅ 功能更强大
- ✅ 更好的错误处理
- ✅ 更友好的输出格式
- ❌ 可能需要修改执行策略

**推荐**：优先使用批处理文件（.bat），功能够用且更稳定。

### Q2: 为什么有两个版本的脚本？

为了兼容性！您可以：
- 默认使用 `.bat` 版本（更稳定）
- 如果需要更好的体验，配置后使用 `.ps1` 版本

### Q3: 我应该修改执行策略吗？

**不是必须的**！使用 `.bat` 文件或 `npm run` 命令就够用了。

只有在以下情况才需要修改：
- 经常直接运行 PowerShell 脚本
- 想要更好的交互体验
- 已经了解执行策略的安全影响

---

## 安全提示

1. ⚠️ **不要**设置执行策略为 `Unrestricted`
2. ✅ **推荐**使用 `RemoteSigned`（如果要修改的话）
3. ✅ **更安全**的方式是使用批处理文件或每次指定 `-ExecutionPolicy Bypass`
4. ⚠️ 只从可信来源运行脚本

---

## 完整工作流示例

### 方式 1: 使用批处理文件（推荐）

```cmd
# 1. 修改数据库 SQL 文件
# 编辑 supabase/migrations/001_initial_schema.sql

# 2. 重置数据库
npm run db:reset

# 3. 更新类型
npm run db:types

# 4. 启动开发服务器
npm run dev:safe
```

### 方式 2: 直接运行批处理文件

```cmd
# 重置数据库
scripts\reset-db.bat

# 启动开发服务器
scripts\start-dev.bat
```

### 方式 3: 使用 PowerShell（如果已配置）

```powershell
# 重置数据库
.\scripts\reset-db.ps1

# 启动开发服务器
.\scripts\start-dev.ps1
```

---

## 需要帮助？

如果以上方法都不行，请检查：

1. ✅ Supabase 是否正在运行？
   ```cmd
   supabase status
   ```

2. ✅ Node.js 和 npm 是否安装？
   ```cmd
   node --version
   npm --version
   ```

3. ✅ 当前目录是否在项目根目录？
   ```cmd
   dir
   ```

---

**总结**：优先使用 `npm run dev:safe` 和 `npm run db:reset`，这些命令会自动选择最合适的脚本版本！✅

