# Development Workflow - Quick Reference

## 📋 开发阶段数据库工作流

### 基本原则

✅ **开发阶段**：直接修改 SQL 文件，重置数据库  
❌ **生产阶段**：创建新迁移文件，保护用户数据

---

## 🚀 快速开始

### 1. 修改数据库架构

直接编辑现有的迁移文件：

```
supabase/migrations/
├── 001_initial_schema.sql           # 主要表结构
├── 002_supplementary_tables.sql     # 补充表
└── 003_auto_create_profile.sql      # 触发器
```

**示例**：在 `001_initial_schema.sql` 中添加新列

```sql
-- 在 profiles 表中添加 avatar_url 列
ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
```

### 2. 修改测试数据（可选）

编辑 `supabase/seed.sql` 添加或修改测试数据：

```sql
-- 初始化角色数据
INSERT INTO public.roles (name, description) VALUES
  ('Admin', 'System administrator'),
  ('Manager', 'Manager role'),
  ('User', 'Standard user')
ON CONFLICT (name) DO NOTHING;
```

### 3. 重置数据库

使用快捷命令：

```powershell
# 方法 1: 使用 npm 脚本（推荐）
npm run db:reset

# 方法 2: 直接使用 Supabase CLI
supabase db reset
```

这会：
- ✅ 清空所有表和数据
- ✅ 重新运行所有迁移文件
- ✅ 运行 seed.sql（如果存在）

### 4. 更新 TypeScript 类型

```powershell
# 生成最新的类型定义
npm run db:types

# 或直接运行
supabase gen types typescript --local > lib/supabase/types.ts
```

### 5. 启动开发服务器

```powershell
# 自动关闭 3000 端口并启动
npm run dev:safe

# 或常规启动
npm run dev
```

---

## 📝 完整工作流示例

### 场景：添加用户头像功能

```powershell
# 1. 修改数据库架构
# 编辑 supabase/migrations/001_initial_schema.sql
# 添加: ALTER TABLE profiles ADD COLUMN avatar_url TEXT;

# 2. 重置数据库
npm run db:reset

# 3. 更新类型定义
npm run db:types

# 4. 启动开发服务器
npm run dev:safe
```

---

## 🛠️ 常用命令

### 数据库相关

```cmd
# 重置数据库（清空并重新初始化）
npm run db:reset

# 更新 TypeScript 类型
npm run db:types

# 查看 Supabase 状态
supabase status

# 查看数据库连接信息
supabase db url

# 如果 PowerShell 脚本无法执行，可以直接运行批处理文件
scripts\reset-db.bat
```

### 开发服务器

```powershell
# 安全启动（自动关闭 3000 端口）
npm run dev:safe

# 常规启动
npm run dev

# 生产构建
npm run build

# 启动生产服务器
npm start
```

### 清理缓存

```powershell
# 清理所有缓存
npm run clean

# 只清理 Next.js 缓存
npm run clean:cache
```

---

## ⚠️ 重要注意事项

### 开发阶段 ✅

- ✅ 直接修改现有的迁移文件
- ✅ 使用 `supabase db reset` 重置数据库
- ✅ 测试数据可以随时删除
- ✅ 快速迭代，不用担心数据丢失

### 生产阶段 ❌

- ❌ **禁止**修改已部署的迁移文件
- ❌ **禁止**使用 `db reset`（会删除用户数据）
- ✅ **必须**创建新的迁移文件
- ✅ **必须**测试后才能部署

---

## 🔄 迁移到生产的准备

当准备部署到生产环境时：

```powershell
# 1. 创建新的迁移文件（不要修改现有文件）
supabase migration new add_new_feature

# 2. 在新文件中编写 SQL
# supabase/migrations/20240101000000_add_new_feature.sql

# 3. 本地测试
supabase db reset

# 4. 推送到远程数据库
supabase db push
```

---

## 🐛 故障排除

### 数据库重置失败

```powershell
# 检查 Supabase 是否运行
supabase status

# 如果未运行，启动 Supabase
supabase start

# 重试重置
supabase db reset
```

### 端口被占用

```powershell
# 使用安全启动脚本（自动关闭端口）
npm run dev:safe

# 或手动关闭 3000 端口
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

### TypeScript 类型不匹配

```powershell
# 重新生成类型
npm run db:types

# 重启 TypeScript 服务器
# 在 VS Code 中: Ctrl+Shift+P > "TypeScript: Restart TS Server"
```

---

## 📚 相关文档

- [Supabase 集成指南](./SUPABASE_INTEGRATION.md)
- [Supabase 迁移指南](./SUPABASE_MIGRATION_GUIDE.md)
- [项目使用指南](./HOW_TO_USE.md)
- [开发规范](./.cursor/rules/dev.mdc)

---

## 💡 最佳实践

1. **频繁重置**：数据库架构变更后立即重置
2. **类型同步**：重置后记得更新 TypeScript 类型
3. **备份测试数据**：在 `seed.sql` 中维护常用测试数据
4. **使用脚本**：优先使用 npm 脚本而不是手动命令
5. **Git 提交**：迁移文件的变更要及时提交

---

## 🎯 开发检查清单

- [ ] 修改了 SQL 迁移文件
- [ ] 运行了 `npm run db:reset`
- [ ] 运行了 `npm run db:types`
- [ ] 测试了新的数据库架构
- [ ] 提交了变更到 Git

---

**祝开发顺利！🚀**

