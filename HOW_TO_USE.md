# How to Use This Template / 如何使用此模板

## 🚀 快速开始 / Quick Start

### 1. 初始化项目 / Initialize Project

```bash
# 安装依赖 / Install dependencies
npm install

# 复制环境变量模板 / Copy environment template
cp .env.example .env.local
```

### 2. 配置 Supabase / Configure Supabase

```bash
# 编辑 .env.local，填入你的 Supabase 凭据
# Edit .env.local with your Supabase credentials

NEXT_PUBLIC_SUPABASE_URL=your_actual_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_key
```

### 3. 设置数据库 / Setup Database

在 Supabase SQL 编辑器中运行 `setup-database.sql`  
Run `setup-database.sql` in Supabase SQL Editor

### 4. 启动开发 / Start Development

```bash
npm run dev
```

访问 http://localhost:3000  
Visit http://localhost:3000

---

## 📚 开发场景示例 / Development Scenarios

### 场景 1: 添加一个新的业务页面 / Scenario 1: Adding a New Business Page

**需求 / Requirement**: 添加一个"产品列表"页面  
Add a "Products List" page

**步骤 / Steps**:

1️⃣ 创建页面文件 / Create page file:

```bash
mkdir app/products
```

创建 `app/products/page.tsx`:

```tsx
"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/components/language-provider"

export default function ProductsPage() {
  const { t } = useLanguage()

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t("products.title")}</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Product List</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Your product list content here */}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
```

2️⃣ 添加导航链接 / Add navigation link:

编辑 `components/sidebar.tsx`:

```tsx
import { Package } from "lucide-react"

const menuItems = [
  {
    title: "nav.dashboard",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "nav.products",  // 添加这个 / Add this
    href: "/products",
    icon: Package,
  },
  {
    title: "nav.settings",
    href: "/settings",
    icon: Settings,
  },
]
```

3️⃣ 添加翻译 / Add translations:

编辑 `components/language-provider.tsx`:

```tsx
const translations = {
  en: {
    // ... existing translations
    "nav.products": "Products",
    "products.title": "Products Management",
  },
  zh: {
    // ... existing translations
    "nav.products": "产品管理",
    "products.title": "产品管理",
  },
}
```

✅ 完成！/ Done! 访问 `/products` 查看新页面

---

### 场景 2: 添加数据表格 / Scenario 2: Adding a Data Table

**需求 / Requirement**: 在产品页面添加一个数据表格  
Add a data table to products page

**步骤 / Steps**:

1️⃣ 安装 table 组件 / Install table component:

```bash
npx shadcn@latest add table
```

2️⃣ 创建 Supabase 表 / Create Supabase table:

在 Supabase SQL Editor 运行 / Run in Supabase SQL Editor:

```sql
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = created_by);
```

3️⃣ 更新类型定义 / Update type definitions:

编辑 `lib/supabase/types.ts`:

```typescript
export interface Database {
  public: {
    Tables: {
      profiles: {
        // ... existing
      }
      products: {
        Row: {
          id: string
          name: string
          price: number
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          price: number
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          price?: number
          created_at?: string
          created_by?: string | null
        }
      }
    }
  }
}
```

4️⃣ 在页面中获取数据 / Fetch data in page:

```tsx
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { MainLayout } from "@/components/layout/main-layout"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const supabase = createClient()

  useEffect(() => {
    async function loadProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) setProducts(data)
    }
    
    loadProducts()
  }, [])

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Products</h1>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>${product.price}</TableCell>
                <TableCell>{new Date(product.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </MainLayout>
  )
}
```

✅ 完成！/ Done!

---

### 场景 3: 添加表单创建功能 / Scenario 3: Adding Form Creation

**需求 / Requirement**: 添加创建产品的表单  
Add form to create products

**步骤 / Steps**:

1️⃣ 安装必要组件 / Install required components:

```bash
npx shadcn@latest add dialog form
npm install react-hook-form zod @hookform/resolvers
```

2️⃣ 创建表单组件 / Create form component:

```tsx
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/auth-provider"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.string().min(0, "Price must be positive"),
})

export function CreateProductDialog({ onSuccess }) {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: "",
    },
  })

  async function onSubmit(values) {
    const { error } = await supabase
      .from('products')
      .insert({
        name: values.name,
        price: parseFloat(values.price),
        created_by: user.id,
      })

    if (!error) {
      setOpen(false)
      form.reset()
      onSuccess?.()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Product</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Create</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

3️⃣ 在页面中使用 / Use in page:

```tsx
import { CreateProductDialog } from "@/components/create-product-dialog"

export default function ProductsPage() {
  // ... existing code

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Products</h1>
          <CreateProductDialog onSuccess={loadProducts} />
        </div>
        
        {/* Table ... */}
      </div>
    </MainLayout>
  )
}
```

✅ 完成！/ Done!

---

## 🎨 自定义主题 / Customizing Theme

### 修改主色调 / Changing Primary Color

编辑 `app/globals.css`:

```css
:root {
  --primary: 221.2 83.2% 53.3%;  /* 蓝色 / Blue */
  /* 改为红色 / Change to red: */
  --primary: 0 84.2% 60.2%;
  
  /* 改为绿色 / Change to green: */
  --primary: 142 76% 36%;
  
  /* 改为紫色 / Change to purple: */
  --primary: 262 83% 58%;
}
```

### 使用 Tailwind 配色 / Using Tailwind Colors

你可以使用 [Tailwind Color Palette](https://tailwindcss.com/docs/customizing-colors) 并转换为 HSL：

1. 选择颜色 / Choose color
2. 转换为 HSL / Convert to HSL
3. 更新 CSS 变量 / Update CSS variable

---

## 🔐 常见认证场景 / Common Auth Scenarios

### 获取当前用户 / Getting Current User

```tsx
import { useAuth } from "@/components/auth-provider"

function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Please login</div>

  return <div>Hello, {user.firstName}!</div>
}
```

### 保护组件 / Protecting Components

```tsx
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

function ProtectedComponent() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return null

  return <div>Protected content</div>
}
```

### 基于角色的访问 / Role-Based Access

```tsx
import { useAuth } from "@/components/auth-provider"

function AdminComponent() {
  const { user } = useAuth()

  if (user?.role !== 'Admin') {
    return <div>Access denied</div>
  }

  return <div>Admin content</div>
}
```

---

## 📱 添加 shadcn/ui 组件 / Adding shadcn/ui Components

### 可用组件列表 / Available Components

```bash
# 表单组件 / Form Components
npx shadcn@latest add form input textarea select checkbox radio-group switch

# 数据展示 / Data Display
npx shadcn@latest add table card badge avatar

# 反馈 / Feedback
npx shadcn@latest add alert toast dialog

# 导航 / Navigation
npx shadcn@latest add dropdown-menu tabs breadcrumb

# 布局 / Layout
npx shadcn@latest add separator scroll-area

# 更多... / More...
npx shadcn@latest add button
```

---

## 🚀 部署 / Deployment

### Vercel 部署 / Deploy to Vercel

1. 推送代码到 GitHub / Push code to GitHub
2. 在 Vercel 导入项目 / Import project in Vercel
3. 添加环境变量 / Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. 部署 / Deploy

### 其他平台 / Other Platforms

确保设置 / Make sure to set:
- Node.js 版本: 18+ / Node.js version: 18+
- 构建命令 / Build command: `npm run build`
- 启动命令 / Start command: `npm run start`
- 环境变量 / Environment variables

---

## 📚 更多资源 / More Resources

- [Next.js 文档](https://nextjs.org/docs)
- [Supabase 文档](https://supabase.com/docs)
- [shadcn/ui 文档](https://ui.shadcn.com)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)

---

## 💡 提示和技巧 / Tips and Tricks

### 1. 使用 TypeScript 类型推断

```tsx
import type { Database } from "@/lib/supabase/types"

type Product = Database['public']['Tables']['products']['Row']
```

### 2. 创建可复用的 hooks

```tsx
// hooks/use-products.ts
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    const { data } = await supabase.from('products').select('*')
    setProducts(data || [])
    setLoading(false)
  }

  return { products, loading, refetch: loadProducts }
}
```

### 3. 使用环境变量

```typescript
// lib/config.ts
export const config = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  appName: "Your App Name",
  // ... more config
}
```

---

## ❓ 需要帮助？ / Need Help?

1. 查看 `TEMPLATE_README.md` 详细文档 / Check `TEMPLATE_README.md` for detailed docs
2. 查看 `QUICK_START.md` 快速入门 / Check `QUICK_START.md` for quick start
3. 查看 `PROJECT_OVERVIEW.md` 项目概览 / Check `PROJECT_OVERVIEW.md` for overview

---

**祝你构建成功！/ Happy Building!** 🚀

