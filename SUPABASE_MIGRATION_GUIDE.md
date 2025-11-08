# Supabase 迁移指南：从 Token 认证到 Supabase Auth

## 概述

本项目已从传统的 Token 认证迁移到 Supabase Auth（基于 Cookie 的认证）。本文档说明已完成的迁移工作。

## 已完成的迁移

### ✅ 1. 移除 Token 认证相关代码

- ❌ **已移除**：`localStorage` / `sessionStorage` 存储 token
- ❌ **已移除**：手动 token 验证逻辑
- ❌ **已移除**：自定义 Session 管理
- ✅ **已实现**：Supabase Auth 基于 Cookie 的会话管理

### ✅ 2. 认证流程更新

**旧方式（Token）**：
```typescript
// ❌ 旧代码（已移除）
const token = localStorage.getItem('token')
fetch('/api/users', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

**新方式（Supabase）**：
```typescript
// ✅ 新代码
const { data, error } = await supabase.auth.getSession()
// Cookie 自动管理，无需手动处理
```

### ✅ 3. 文件更新清单

#### 已更新的文件：
- ✅ `components/auth-provider.tsx` - 使用 Supabase Auth
- ✅ `lib/supabase/client.ts` - 浏览器端 Supabase 客户端
- ✅ `lib/supabase/server.ts` - 服务器端 Supabase 客户端
- ✅ `lib/supabase/middleware.ts` - 中间件会话管理
- ✅ `middleware.ts` - Next.js 中间件配置
- ✅ `app/login/page.tsx` - 登录页面
- ✅ `app/register/page.tsx` - 注册页面
- ✅ `app/layout.tsx` - 修复语法错误，更新元数据

#### 已创建的 Supabase 集成文件：
- ✅ `lib/supabase/types.ts` - TypeScript 类型定义
- ✅ `lib/supabase/storage.ts` - Storage 工具函数
- ✅ `lib/supabase/examples.ts` - 使用示例

### ✅ 4. 数据库架构

**旧架构（Prisma Schema）**：
```prisma
model User {
  id       String @id
  email    String
  password String  // ❌ 明文密码（不安全）
  // ...
}

model Session {
  id        String @id
  userId    String
  token     String  // ❌ 自定义 token
  expiresAt DateTime
}
```

**新架构（Supabase）**：
```sql
-- ✅ Supabase 自动管理
-- auth.users (Supabase 自动创建)
-- - id (UUID)
-- - email
-- - encrypted_password (自动加密)

-- ✅ 业务数据表
-- public.profiles
-- - id (引用 auth.users.id)
-- - first_name, last_name, role, etc.
```

## 常见问题解决

### Q1: 语法错误 `Invalid or unexpected token`

**原因**：Next.js 构建缓存问题

**解决方案**：
```powershell
# 1. 停止开发服务器 (Ctrl+C)

# 2. 清理构建缓存
.\scripts\clean.ps1

# 或手动清理：
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules/.cache

# 3. 重新启动
npm run dev
```

### Q2: 登录后仍然重定向到登录页

**原因**：中间件配置问题

**解决方案**：
- 检查 `lib/supabase/middleware.ts` 是否正确配置
- 确保 `.env.local` 中的 Supabase 配置正确
- 检查 Supabase 服务是否运行：`supabase status`

### Q3: 用户已登录但显示未认证

**原因**：Profile 未创建

**解决方案**：
1. 在 Supabase Studio 中检查 `profiles` 表
2. 运行自动创建 profile 的迁移脚本：
   ```sql
   -- 运行 supabase/migrations/003_auto_create_profile.sql
   ```
3. 或手动创建 profile（参考 `supabase/TEST_USER_GUIDE.md`）

### Q4: 环境变量未找到

**错误**：`Supabase 配置未找到，请检查环境变量配置`

**解决方案**：
1. 创建 `.env.local` 文件
2. 添加配置：
   ```env
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```
3. 运行 `supabase status` 获取密钥
4. 或运行 `.\supabase\setup-env.ps1` 自动配置

## 迁移检查清单

- [x] 移除所有 `localStorage.getItem('token')` 相关代码
- [x] 移除所有 `sessionStorage` token 存储
- [x] 移除自定义 Session 模型的使用
- [x] 更新认证提供者使用 Supabase Auth
- [x] 更新登录/注册页面
- [x] 配置 Supabase 中间件
- [x] 创建数据库迁移脚本
- [x] 更新错误处理
- [x] 修复语法错误
- [x] 创建测试用户指南

## 下一步

1. **创建测试用户**：参考 `supabase/TEST_USER_GUIDE.md`
2. **运行数据库迁移**：`supabase db reset`
3. **测试认证流程**：
   - 注册新用户
   - 登录
   - 登出
   - 会话持久化

## 技术栈对比

| 功能 | 旧方式（Token） | 新方式（Supabase） |
|------|----------------|-------------------|
| 认证 | 自定义 Token | Supabase Auth |
| 会话管理 | localStorage + 后端验证 | Cookie（自动） |
| 密码存储 | 需要自己加密 | Supabase 自动加密 |
| 用户管理 | 需要自己实现 | Supabase 提供 |
| 安全性 | 需要自己维护 | Supabase 维护 |

## 参考文档

- [Supabase 集成指南](./SUPABASE_INTEGRATION.md)
- [测试用户创建指南](./supabase/TEST_USER_GUIDE.md)
- [用户架构说明](./supabase/USER_ARCHITECTURE.md)
- [Supabase 官方文档](https://supabase.com/docs)

