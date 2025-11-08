# Quick Start Guide

## 5 分钟快速开始 / 5-Minute Quick Start

### 中文版

#### 第一步：安装依赖

```bash
npm install
```

#### 第二步：创建 Supabase 项目

1. 访问 [https://app.supabase.com](https://app.supabase.com)
2. 点击 "New Project"
3. 填写项目信息并创建

#### 第三步：设置环境变量

1. 复制 `.env.example` 为 `.env.local`
2. 在 Supabase 项目中，找到：Settings → API
3. 复制以下值到 `.env.local`：
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### 第四步：设置数据库

1. 在 Supabase 项目中，打开 SQL Editor
2. 复制 `setup-database.sql` 文件的全部内容
3. 粘贴并运行

#### 第五步：启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

#### 第六步：创建账户

1. 点击 "Sign Up" 或访问 [http://localhost:3000/register](http://localhost:3000/register)
2. 填写注册表单
3. 自动登录并跳转到仪表板

🎉 完成！你现在可以开始构建你的应用了。

---

### English Version

#### Step 1: Install Dependencies

```bash
npm install
```

#### Step 2: Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details and create

#### Step 3: Setup Environment Variables

1. Copy `.env.example` to `.env.local`
2. In your Supabase project, go to: Settings → API
3. Copy these values to `.env.local`:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### Step 4: Setup Database

1. In your Supabase project, open SQL Editor
2. Copy the entire contents of `setup-database.sql`
3. Paste and run

#### Step 5: Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

#### Step 6: Create Account

1. Click "Sign Up" or visit [http://localhost:3000/register](http://localhost:3000/register)
2. Fill in the registration form
3. You'll be automatically logged in and redirected to the dashboard

🎉 Done! You can now start building your application.

---

## 下一步 / Next Steps

### 添加新页面 / Adding New Pages

```tsx
// app/my-page/page.tsx
"use client"

import { MainLayout } from "@/components/layout/main-layout"

export default function MyPage() {
  return (
    <MainLayout>
      <h1>My New Page</h1>
    </MainLayout>
  )
}
```

### 自定义侧边栏 / Customizing Sidebar

编辑 `components/sidebar.tsx` / Edit `components/sidebar.tsx`:

```tsx
const menuItems = [
  {
    title: "nav.myPage",  // Add translation in language-provider.tsx
    href: "/my-page",
    icon: MyIcon,
  },
]
```

### 添加翻译 / Adding Translations

编辑 `components/language-provider.tsx` / Edit `components/language-provider.tsx`:

```tsx
const translations = {
  en: {
    "my.key": "My English Text",
  },
  zh: {
    "my.key": "我的中文文本",
  },
}
```

## 常见问题 / Troubleshooting

### "Supabase 配置未找到" / "Supabase configuration not found"

- 检查 `.env.local` 文件是否存在 / Check `.env.local` exists
- 重启开发服务器 / Restart dev server

### 登录失败 / Login Failed

- 确认 Supabase URL 和 Key 正确 / Verify Supabase URL and Key
- 检查数据库是否正确设置 / Check database setup
- 查看 Supabase Dashboard → Authentication / Check Supabase Dashboard → Authentication

## 需要帮助？/ Need Help?

- 查看 `TEMPLATE_README.md` (English) 或 `TEMPLATE_README_CN.md` (中文) 获取详细文档
- See `TEMPLATE_README.md` (English) or `TEMPLATE_README_CN.md` (Chinese) for detailed documentation

