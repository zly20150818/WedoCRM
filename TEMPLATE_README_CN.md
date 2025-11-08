# Next.js 基础模板 - 集成 Supabase 认证

这是一个干净、可用于生产环境的基础模板，用于构建基于 Next.js 15、Supabase 认证和现代 UI 的 Web 应用程序。

## 功能特性

### 核心功能
- ✅ **Supabase 认证** - 完整的认证流程，包括登录、注册和会话管理
- ✅ **受保护的路由** - 基于中间件的路由保护
- ✅ **响应式布局** - 可折叠的侧边栏和标题栏，支持移动端
- ✅ **主题支持** - 明暗模式，支持系统偏好检测
- ✅ **纯英文界面** - 简洁的英文界面，无国际化复杂度
- ✅ **用户资料管理** - 基础的个人资料页面，支持编辑
- ✅ **设置页面** - 全面的设置界面，包含多个选项卡
- ✅ **现代 UI 组件** - 基于 shadcn/ui 和 Radix UI 构建

### 重要说明
- ⚠️ **无国际化功能** - 为简化起见，此模板仅使用英文。如需多语言支持，需要自行添加。
- ⚠️ **简洁专注** - 专注于核心功能，不包含业务逻辑。

### 技术栈
- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **UI 组件**: shadcn/ui, Radix UI
- **认证**: Supabase Auth
- **数据库**: Supabase (PostgreSQL)
- **状态管理**: React Context API
- **表单处理**: React Hook Form
- **验证**: Zod

## 快速开始

### 前置要求
- Node.js 18+ 
- npm 或 yarn 或 pnpm
- Supabase 账户（免费套餐即可）

### 安装步骤

1. **克隆或下载此模板**

```bash
git clone <your-repo-url>
cd <your-project>
```

2. **安装依赖**

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

3. **设置 Supabase**

在 [Supabase 控制台](https://app.supabase.com/) 创建一个新项目。

4. **配置环境变量**

在根目录创建 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=你的_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_supabase_anon_key
```

你可以在 Supabase 项目设置的 API 部分找到这些值。

5. **设置数据库**

在 Supabase SQL 编辑器中运行 `setup-database.sql` 文件的内容。

6. **运行开发服务器**

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用程序。

### 安装后的首要步骤

1. 访问 `/register` 创建新账户
2. 检查 Supabase Auth 控制台，确认用户已创建
3. 使用凭据登录
4. 浏览仪表板、个人资料和设置页面

## 项目结构

```
├── app/                      # Next.js app 目录
│   ├── dashboard/           # 主仪表板页面
│   ├── login/              # 登录页面
│   ├── register/           # 注册页面
│   ├── profile/            # 用户资料页面
│   ├── settings/           # 设置页面
│   ├── layout.tsx          # 根布局（包含提供者）
│   ├── page.tsx            # 主页（重定向到登录/仪表板）
│   └── globals.css         # 全局样式
├── components/              # React 组件
│   ├── layout/             
│   │   └── main-layout.tsx # 主布局（包含侧边栏和标题栏）
│   ├── ui/                 # shadcn/ui 组件
│   ├── auth-provider.tsx   # 认证上下文
│   ├── header.tsx          # 标题栏组件
│   ├── sidebar.tsx         # 侧边栏导航
│   └── theme-provider.tsx  # 主题上下文
├── lib/                     # 工具函数
│   ├── supabase/           
│   │   ├── client.ts       # 客户端组件的 Supabase 客户端
│   │   ├── server.ts       # 服务端组件的 Supabase 客户端
│   │   ├── middleware.ts   # Supabase 中间件工具
│   │   └── types.ts        # 数据库类型
│   └── utils.ts            # 通用工具
├── middleware.ts            # Next.js 中间件（用于认证）
└── tailwind.config.ts      # Tailwind 配置
```

## 核心组件

### 认证提供者 (`components/auth-provider.tsx`)

管理认证状态并提供登录/注册/退出函数：

```tsx
const { user, login, register, logout, isLoading, isAuthenticated } = useAuth()
```

### 主布局 (`components/layout/main-layout.tsx`)

用侧边栏和标题栏包装需要认证的页面：

```tsx
import { MainLayout } from "@/components/layout/main-layout"

export default function YourPage() {
  return (
    <MainLayout>
      <div>你的内容</div>
    </MainLayout>
  )
}
```

## 添加新页面

1. 在 `app/` 中为你的页面创建新目录
2. 添加 `page.tsx` 文件
3. 如果需要认证，用 `MainLayout` 包装你的内容
4. 如果需要，在 `components/sidebar.tsx` 中添加导航链接

示例：

```tsx
// app/my-page/page.tsx
"use client"

import { MainLayout } from "@/components/layout/main-layout"

export default function MyPage() {
  return (
    <MainLayout>
      <h1>我的新页面</h1>
    </MainLayout>
  )
}
```

## 自定义

### 主题颜色

编辑 `app/globals.css` 来自定义色彩方案：

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96%;
  /* ... 其他颜色 */
}
```

### 侧边栏菜单项

编辑 `components/sidebar.tsx`：

```tsx
const menuItems = [
  {
    title: "My Page",  // 直接使用英文
    href: "/my-page",
    icon: MyIcon,
  },
]
```

### 如果需要添加国际化

虽然本模板不包含国际化功能，但如果你需要添加，可以使用以下方案：

1. **使用 next-intl** （推荐）

```bash
npm install next-intl
```

2. **使用 react-i18next**

```bash
npm install react-i18next i18next
```

3. **自行实现简单的 Context**

创建类似 `language-provider.tsx` 的文件，包含翻译字典和切换逻辑。

## 数据库结构

模板包含一个基本的 `profiles` 表。你可以根据需要扩展它或添加新表。

### 扩展 Profiles 表

```sql
ALTER TABLE profiles ADD COLUMN phone TEXT;
ALTER TABLE profiles ADD COLUMN address TEXT;
```

别忘了在 `lib/supabase/types.ts` 中更新 TypeScript 类型。

## 认证流程

1. 用户访问受保护的路由
2. 中间件检查有效的会话
3. 如果没有会话，重定向到 `/login`
4. 登录后，用户被重定向到 `/dashboard`
5. 会话在页面刷新后保持
6. 退出登录清除会话并重定向到 `/login`

## 安全考虑

- profiles 表启用了行级安全（RLS）
- 用户只能读取和更新自己的资料
- 认证令牌存储在 HTTP-only cookies 中
- 中间件在每次请求时验证会话

## 部署

### Vercel（推荐）

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 在 Vercel 控制台添加环境变量
4. 部署

### 其他平台

确保：
- 设置环境变量
- 配置构建命令：`npm run build`
- 配置启动命令：`npm run start`
- 设置 Node.js 版本为 18+

## 故障排除

### "Supabase 配置未找到"
- 检查 `.env.local` 是否存在并有正确的值
- 添加环境变量后重启开发服务器

### 认证不工作
- 验证 Supabase URL 和 anon key 是否正确
- 检查 Supabase 控制台的认证错误
- 确保已创建 profiles 表和触发器

### 数据库错误
- 在 Supabase SQL 编辑器中运行 SQL 设置脚本
- 检查 RLS 策略是否启用
- 验证表权限

## 许可证

MIT 许可证 - 可自由用于任何项目。

## 支持

如有问题：
- 查看 [Next.js 文档](https://nextjs.org/docs)
- 查看 [Supabase 文档](https://supabase.com/docs)
- 查看代码注释了解实现细节

---

使用 Next.js 和 Supabase 用 ❤️ 构建

