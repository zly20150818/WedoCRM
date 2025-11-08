# Project Overview - Next.js Base Template

## 项目概述 / Project Summary

这是一个干净的 Next.js 基础模板，已集成 Supabase 认证、现代 UI 组件和完整的用户管理系统。

This is a clean Next.js base template with integrated Supabase authentication, modern UI components, and complete user management system.

## 已包含的功能 / Included Features

### ✅ 认证系统 / Authentication System
- 用户注册和登录 / User registration and login
- 会话管理 / Session management
- 受保护的路由 / Protected routes
- 自动重定向 / Automatic redirects
- 退出登录 / Logout functionality

### ✅ 用户界面 / User Interface
- 响应式布局 / Responsive layout
- 可折叠侧边栏 / Collapsible sidebar
- 全功能标题栏 / Full-featured header
- 明暗主题切换 / Light/dark theme toggle
- 纯英文界面 / English-only UI (no i18n)

### ✅ 页面 / Pages
- 🏠 主页（自动重定向）/ Home (auto-redirect)
- 🔐 登录页面 / Login page
- 📝 注册页面 / Registration page
- 📊 仪表板 / Dashboard
- 👤 个人资料 / User profile
- ⚙️ 设置 / Settings

### ✅ 组件库 / Component Library
- shadcn/ui 组件 / shadcn/ui components
- Radix UI 基础组件 / Radix UI primitives
- 自定义布局组件 / Custom layout components
- 可重用的 UI 元素 / Reusable UI elements

## 项目结构 / Project Structure

```
FinCRM/
├── app/                          # Next.js 应用目录 / Next.js app directory
│   ├── dashboard/               # ✅ 仪表板页面 / Dashboard page
│   ├── login/                   # ✅ 登录页面 / Login page
│   ├── register/                # ✅ 注册页面 / Registration page
│   ├── profile/                 # ✅ 个人资料页面 / Profile page
│   ├── settings/                # ✅ 设置页面 / Settings page
│   ├── layout.tsx               # 根布局 / Root layout
│   ├── page.tsx                 # 主页 / Home page
│   └── globals.css              # 全局样式 / Global styles
│
├── components/                   # React 组件 / React components
│   ├── layout/
│   │   └── main-layout.tsx      # ✅ 主布局组件 / Main layout
│   ├── ui/                      # ✅ UI 组件库 / UI component library
│   ├── auth-provider.tsx        # ✅ 认证上下文 / Auth context
│   ├── header.tsx               # ✅ 标题栏 / Header
│   ├── sidebar.tsx              # ✅ 侧边栏 / Sidebar
│   ├── language-provider.tsx    # ✅ 语言上下文 / Language context
│   └── theme-provider.tsx       # ✅ 主题上下文 / Theme context
│
├── lib/                         # 工具库 / Utility libraries
│   ├── supabase/
│   │   ├── client.ts           # ✅ Supabase 客户端 / Supabase client
│   │   ├── middleware.ts       # ✅ 认证中间件 / Auth middleware
│   │   └── types.ts            # ✅ 类型定义 / Type definitions
│   └── utils.ts                # ✅ 工具函数 / Utility functions
│
├── middleware.ts                # ✅ Next.js 中间件 / Next.js middleware
├── tailwind.config.ts          # ✅ Tailwind 配置 / Tailwind config
├── package.json                # ✅ 依赖管理 / Dependencies
│
├── setup-database.sql          # ✅ 数据库设置脚本 / DB setup script
├── .env.example                # ✅ 环境变量示例 / Env example
├── QUICK_START.md              # ✅ 快速开始指南 / Quick start guide
├── TEMPLATE_README.md          # ✅ 英文文档 / English docs
└── TEMPLATE_README_CN.md       # ✅ 中文文档 / Chinese docs
```

## 已移除的内容 / Removed Content

为了创建一个干净的基础模板，以下业务相关的内容已被移除：

The following business-specific content has been removed to create a clean base template:

### ❌ 已删除的页面 / Deleted Pages
- 用户管理 / Users Management
- 权限管理 / Permissions Management
- 客户线索 / Leads Management
- 资产管理 / Assets Management
- 订单管理 / Orders Management
- 产品管理 / Products Management
- 交易记录 / Transactions
- 风险管理 / Risk Management
- 合规管理 / Compliance
- 报表分析 / Reports & Analytics

### 🧹 清理的组件 / Cleaned Components
- 简化的侧边栏菜单 / Simplified sidebar menu (只保留 Dashboard 和 Settings)
- 简化的标题栏 / Simplified header (移除业务相关按钮 / removed business buttons)
- 移除国际化 / Removed i18n (直接使用英文 / directly use English)

## 技术栈 / Tech Stack

### 前端 / Frontend
- **框架 / Framework**: Next.js 15 (App Router)
- **语言 / Language**: TypeScript
- **样式 / Styling**: Tailwind CSS
- **UI 库 / UI Library**: shadcn/ui, Radix UI
- **图标 / Icons**: Lucide React

### 后端 / Backend
- **认证 / Authentication**: Supabase Auth
- **数据库 / Database**: Supabase (PostgreSQL)
- **API**: Supabase REST API

### 开发工具 / Development Tools
- **包管理器 / Package Manager**: npm/yarn/pnpm
- **代码检查 / Linting**: ESLint
- **类型检查 / Type Checking**: TypeScript

## 核心功能说明 / Core Features Explained

### 1. 认证流程 / Authentication Flow

```
用户访问 → 检查会话 → 未登录重定向 → 登录 → 创建会话 → 访问受保护页面
User visit → Check session → Redirect if not logged in → Login → Create session → Access protected pages
```

### 2. 路由保护 / Route Protection

中间件自动保护所有非公开路由，公开路由包括：
Middleware automatically protects all non-public routes. Public routes include:
- `/` (主页 / home)
- `/login` (登录 / login)
- `/register` (注册 / register)

### 3. 数据流 / Data Flow

```
组件 → Supabase Client → Supabase Database → 返回数据 → 更新 UI
Component → Supabase Client → Supabase Database → Return data → Update UI
```

### 4. 主题系统 / Theme System

使用 `next-themes` 实现，支持：
Implemented with `next-themes`, supports:
- 明亮模式 / Light mode
- 暗黑模式 / Dark mode
- 系统自动 / System auto

### 5. 语言 / Language

**无国际化功能 / No Internationalization**
- 所有UI文本直接使用英文 / All UI text in English
- 简化代码结构 / Simplified code structure
- 如需多语言，可自行添加 next-intl 或 react-i18next / Add next-intl or react-i18next if needed

## 开发指南 / Development Guide

### 添加新页面 / Adding New Page

1. 在 `app/` 创建新目录 / Create new directory in `app/`
2. 添加 `page.tsx` / Add `page.tsx`
3. 使用 `MainLayout` 包装（如需认证）/ Wrap with `MainLayout` (if auth needed)

### 添加新组件 / Adding New Component

1. 在 `components/` 创建组件文件 / Create component file in `components/`
2. 使用 TypeScript 定义 props / Define props with TypeScript
3. 导入并使用 / Import and use

### 添加 UI 组件 / Adding UI Component

使用 shadcn/ui CLI：
Use shadcn/ui CLI:

```bash
npx shadcn@latest add [component-name]
```

### 修改样式 / Modifying Styles

编辑 `app/globals.css` 中的 CSS 变量：
Edit CSS variables in `app/globals.css`:

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96%;
  /* ... */
}
```

## 部署清单 / Deployment Checklist

- [ ] 设置环境变量 / Set environment variables
- [ ] 在 Supabase 运行数据库脚本 / Run database script in Supabase
- [ ] 测试认证流程 / Test authentication flow
- [ ] 配置自定义域名（可选）/ Configure custom domain (optional)
- [ ] 启用 Supabase RLS 策略 / Enable Supabase RLS policies
- [ ] 部署到 Vercel/其他平台 / Deploy to Vercel/other platform

## 性能优化建议 / Performance Optimization Tips

1. **图片优化 / Image Optimization**
   - 使用 Next.js Image 组件 / Use Next.js Image component
   - 使用 WebP 格式 / Use WebP format

2. **代码分割 / Code Splitting**
   - 使用动态导入 / Use dynamic imports
   - 懒加载组件 / Lazy load components

3. **缓存策略 / Caching Strategy**
   - 利用 Supabase 缓存 / Leverage Supabase caching
   - 使用 SWR 或 React Query / Use SWR or React Query

## 安全建议 / Security Recommendations

1. **环境变量 / Environment Variables**
   - 不要提交 `.env.local` / Don't commit `.env.local`
   - 使用强密钥 / Use strong keys

2. **数据库安全 / Database Security**
   - 启用 RLS / Enable RLS
   - 设置正确的策略 / Set proper policies
   - 定期备份 / Regular backups

3. **认证安全 / Authentication Security**
   - 使用强密码策略 / Use strong password policy
   - 启用邮箱验证（生产环境）/ Enable email verification (production)
   - 考虑启用 2FA / Consider enabling 2FA

## 支持和贡献 / Support and Contribution

### 获取帮助 / Getting Help
- 查看文档 / Check documentation
- 搜索已有问题 / Search existing issues
- 创建新问题 / Create new issue

### 贡献代码 / Contributing
欢迎提交 Pull Request！
Pull Requests are welcome!

## 许可证 / License

MIT License - 可自由用于任何项目
MIT License - Free to use for any project

---

**模板版本 / Template Version**: 1.0.0  
**创建日期 / Created**: 2024  
**适用于 / Suitable for**: 任何需要认证的 Next.js 项目 / Any Next.js project requiring authentication

