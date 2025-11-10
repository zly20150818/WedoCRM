# 📋 列表页面模板使用指南

## 概述

这是一个基于 `docs/screen.png` 布局设计的可复用列表页模板，包含了现代 CRM 系统列表页的所有常见功能。

## 功能特性

✅ **搜索功能** - 支持多字段模糊搜索  
✅ **状态标签筛选** - 快速切换不同状态  
✅ **高级筛选器** - 支持下拉选择、日期范围等  
✅ **数据表格** - 带排序功能的数据表格  
✅ **自定义渲染** - 灵活的列渲染函数  
✅ **操作按钮** - 查看、编辑、删除等操作  
✅ **分页** - 完整的分页功能  
✅ **关联查询** - 支持自动加载关联表数据  
✅ **响应式设计** - 适配移动端和桌面端  

## 快速开始

### 步骤 1：复制模板文件

```bash
# 例如创建订单列表页
cp components/templates/list-page-template.tsx app/orders/page.tsx
```

### 步骤 2：修改配置对象

打开复制的文件，找到 `CONFIG` 对象，根据你的需求修改：

```typescript
const CONFIG = {
  // 页面基本信息
  title: "Sales Orders",              // 页面标题
  createButtonText: "Create New Order", // 创建按钮文本
  createRoute: "/orders/new",          // 创建页面路由
  
  // Supabase 表配置
  table: "orders",                     // 📝 修改为你的表名
  idField: "id",                       // 主键字段
  
  // ... 其他配置
}
```

### 步骤 3：配置表格列

```typescript
columns: [
  {
    key: "order_number",        // 📝 数据库字段名
    label: "ORDER #",           // 📝 列标题
    sortable: true,             // 是否可排序
    render: (value, row) => {   // 📝 可选：自定义渲染
      return <span className="font-medium">{value}</span>
    },
  },
  // 添加更多列...
]
```

### 步骤 4：运行和测试

```bash
npm run dev
# 访问 http://localhost:3000/orders
```

## 详细配置说明

### 1. 基本配置

```typescript
{
  title: "页面标题",
  createButtonText: "创建按钮文本",
  createRoute: "/create-route",
  table: "your_table_name",    // 📝 Supabase 表名
  idField: "id",                // 主键字段
}
```

### 2. 搜索配置

```typescript
search: {
  enabled: true,                              // 是否启用搜索
  placeholder: "Search by Order # or Name",   // 搜索框占位符
  fields: ["order_number", "customer_name"],  // 📝 要搜索的字段
}
```

**示例：** 搜索客户时，可能需要搜索名称、邮箱、电话
```typescript
fields: ["name", "email", "phone"]
```

### 3. 状态标签配置

```typescript
statusTabs: {
  enabled: true,           // 是否启用状态标签
  field: "status",         // 📝 状态字段名
  options: [
    { value: "all", label: "All Statuses" },
    { value: "Pending", label: "Pending" },      // 📝 修改为你的状态值
    { value: "Processing", label: "Processing" },
    // 添加更多状态...
  ],
}
```

### 4. 筛选器配置

#### 下拉选择筛选器

```typescript
{
  type: "select",
  field: "customer_id",              // 📝 字段名
  label: "Filter by Customer",       // 标签
  placeholder: "All Customers",      // 占位符
  icon: Filter,                      // 图标（可选）
  relation: {                        // 关联表配置
    table: "customers",              // 📝 关联表名
    valueField: "id",                // 值字段
    labelField: "name",              // 显示字段
  },
}
```

#### 日期范围筛选器

```typescript
{
  type: "dateRange",
  field: "expected_delivery_date",   // 📝 日期字段名
  label: "Delivery Date Range",      // 标签
  icon: CalendarIcon,                // 图标（可选）
}
```

### 5. 表格列配置

#### 基本列

```typescript
{
  key: "customer_name",    // 📝 字段名
  label: "CUSTOMER",       // 列标题
  sortable: true,          // 是否可排序
}
```

#### 带自定义渲染的列

```typescript
{
  key: "total_amount",
  label: "TOTAL AMOUNT",
  sortable: true,
  render: (value: number) => {
    return `$${value.toLocaleString()}`  // 格式化为货币
  },
}
```

#### 状态徽章列

```typescript
{
  key: "status",
  label: "STATUS",
  sortable: true,
  render: (value: string) => {
    const colors: Record<string, string> = {
      Pending: "bg-yellow-100 text-yellow-800",
      Active: "bg-green-100 text-green-800",
      Canceled: "bg-red-100 text-red-800",
    }
    return (
      <Badge className={colors[value]}>
        {value}
      </Badge>
    )
  },
}
```

#### 日期列

```typescript
{
  key: "created_at",
  label: "CREATED",
  sortable: true,
  render: (value: string) => {
    return value ? format(new Date(value), "yyyy-MM-dd") : "-"
  },
}
```

### 6. 操作按钮配置

```typescript
actions: [
  {
    icon: Eye,                          // 图标
    label: "View",                      // 标签（工具提示）
    href: (row) => `/orders/${row.id}`, // 📝 跳转路径
    variant: "ghost",                   // 按钮样式
  },
  {
    icon: Edit,
    label: "Edit",
    href: (row) => `/orders/${row.id}/edit`,
    variant: "ghost",
  },
]
```

### 7. 分页配置

```typescript
pagination: {
  pageSize: 10,                      // 每页显示数量
  pageSizeOptions: [10, 20, 50, 100], // 可选的页面大小
}
```

### 8. 默认排序

```typescript
defaultSort: {
  field: "created_at",    // 📝 排序字段
  direction: "desc",      // 排序方向：asc 或 desc
}
```

## 完整示例

### 示例 1：客户列表页

```typescript
// app/customers/page.tsx
"use client"

import ListPageTemplate from "@/components/templates/list-page-template"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, Star } from "lucide-react"

const CONFIG = {
  title: "Customers",
  createButtonText: "Create New Customer",
  createRoute: "/customers/new",
  
  table: "customers",
  idField: "id",
  
  search: {
    enabled: true,
    placeholder: "Search by name, email, or company",
    fields: ["name", "email", "company"],
  },
  
  statusTabs: {
    enabled: true,
    field: "type",
    options: [
      { value: "all", label: "All Types" },
      { value: "Prospect", label: "Prospect" },
      { value: "Customer", label: "Customer" },
      { value: "Partner", label: "Partner" },
    ],
  },
  
  filters: [
    {
      type: "select",
      field: "country",
      label: "Filter by Country",
      placeholder: "All Countries",
      icon: MapPin,
      relation: {
        table: "customers",
        valueField: "country",
        labelField: "country",
      },
    },
  ],
  
  columns: [
    {
      key: "customer_number",
      label: "CUSTOMER #",
      sortable: true,
      render: (value: string) => (
        <span className="font-medium text-blue-600">{value}</span>
      ),
    },
    {
      key: "name",
      label: "NAME",
      sortable: true,
    },
    {
      key: "company",
      label: "COMPANY",
      sortable: true,
    },
    {
      key: "country",
      label: "COUNTRY",
      sortable: true,
    },
    {
      key: "rating",
      label: "RATING",
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < value ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
            />
          ))}
        </div>
      ),
    },
    {
      key: "type",
      label: "TYPE",
      sortable: true,
      render: (value: string) => {
        const colors: Record<string, string> = {
          Prospect: "bg-gray-100 text-gray-800",
          Customer: "bg-green-100 text-green-800",
          Partner: "bg-blue-100 text-blue-800",
        }
        return <Badge className={colors[value]}>{value}</Badge>
      },
    },
  ],
  
  actions: [
    {
      icon: Eye,
      label: "View",
      href: (row: any) => `/customers/${row.id}`,
      variant: "ghost",
    },
    {
      icon: Edit,
      label: "Edit",
      href: (row: any) => `/customers/${row.id}/edit`,
      variant: "ghost",
    },
  ],
  
  pagination: {
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },
  
  defaultSort: {
    field: "created_at",
    direction: "desc",
  },
}

export default function CustomersPage() {
  return <ListPageTemplate config={CONFIG} />
}
```

### 示例 2：产品列表页

```typescript
// app/products/page.tsx
"use client"

import ListPageTemplate from "@/components/templates/list-page-template"
import { Badge } from "@/components/ui/badge"
import { Package, Tag } from "lucide-react"

const CONFIG = {
  title: "Products",
  createButtonText: "Create New Product",
  createRoute: "/products/new",
  
  table: "products",
  idField: "id",
  
  search: {
    enabled: true,
    placeholder: "Search by SKU or product name",
    fields: ["sku", "name", "name_cn"],
  },
  
  statusTabs: {
    enabled: true,
    field: "status",
    options: [
      { value: "all", label: "All Status" },
      { value: "Active", label: "Active" },
      { value: "Inactive", label: "Inactive" },
      { value: "Discontinued", label: "Discontinued" },
    ],
  },
  
  filters: [
    {
      type: "select",
      field: "category_id",
      label: "Filter by Category",
      placeholder: "All Categories",
      icon: Tag,
      relation: {
        table: "product_categories",
        valueField: "id",
        labelField: "name",
      },
    },
  ],
  
  columns: [
    {
      key: "sku",
      label: "SKU",
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm font-medium">{value}</span>
      ),
    },
    {
      key: "name",
      label: "PRODUCT NAME",
      sortable: true,
    },
    {
      key: "unit",
      label: "UNIT",
      sortable: false,
    },
    {
      key: "price",
      label: "PRICE",
      sortable: true,
      render: (value: number, row: any) => (
        <span>${value?.toLocaleString()} {row.currency}</span>
      ),
    },
    {
      key: "moq",
      label: "MOQ",
      sortable: true,
    },
    {
      key: "status",
      label: "STATUS",
      sortable: true,
      render: (value: string) => {
        const colors: Record<string, string> = {
          Active: "bg-green-100 text-green-800",
          Inactive: "bg-gray-100 text-gray-800",
          Discontinued: "bg-red-100 text-red-800",
        }
        return <Badge className={colors[value]}>{value}</Badge>
      },
    },
  ],
  
  actions: [
    {
      icon: Eye,
      label: "View",
      href: (row: any) => `/products/${row.id}`,
      variant: "ghost",
    },
    {
      icon: Edit,
      label: "Edit",
      href: (row: any) => `/products/${row.id}/edit`,
      variant: "ghost",
    },
  ],
  
  pagination: {
    pageSize: 20,
    pageSizeOptions: [20, 50, 100],
  },
  
  defaultSort: {
    field: "created_at",
    direction: "desc",
  },
}

export default function ProductsPage() {
  return <ListPageTemplate config={CONFIG} />
}
```

### 示例 3：项目列表页

```typescript
// app/projects/page.tsx
"use client"

import ListPageTemplate from "@/components/templates/list-page-template"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Users, CalendarIcon } from "lucide-react"
import { format } from "date-fns"

const CONFIG = {
  title: "Projects",
  createButtonText: "Create New Project",
  createRoute: "/projects/new",
  
  table: "projects",
  idField: "id",
  
  search: {
    enabled: true,
    placeholder: "Search by project number or name",
    fields: ["project_number", "name", "customer_name"],
  },
  
  statusTabs: {
    enabled: true,
    field: "stage",
    options: [
      { value: "all", label: "All Stages" },
      { value: "Inquiry", label: "Inquiry" },
      { value: "Quotation", label: "Quotation" },
      { value: "Negotiation", label: "Negotiation" },
      { value: "Won", label: "Won" },
      { value: "Lost", label: "Lost" },
    ],
  },
  
  filters: [
    {
      type: "select",
      field: "customer_id",
      label: "Filter by Customer",
      placeholder: "All Customers",
      icon: Users,
      relation: {
        table: "customers",
        valueField: "id",
        labelField: "name",
      },
    },
    {
      type: "dateRange",
      field: "expected_close_date",
      label: "Expected Close Date",
      icon: CalendarIcon,
    },
  ],
  
  columns: [
    {
      key: "project_number",
      label: "PROJECT #",
      sortable: true,
      render: (value: string) => (
        <span className="font-medium text-blue-600">{value}</span>
      ),
    },
    {
      key: "name",
      label: "PROJECT NAME",
      sortable: true,
    },
    {
      key: "customer_name",
      label: "CUSTOMER",
      sortable: true,
    },
    {
      key: "estimated_value",
      label: "EST. VALUE",
      sortable: true,
      render: (value: number, row: any) => (
        <span>${value?.toLocaleString()} {row.currency}</span>
      ),
    },
    {
      key: "probability",
      label: "PROBABILITY",
      sortable: true,
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500"
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="text-sm">{value}%</span>
        </div>
      ),
    },
    {
      key: "stage",
      label: "STAGE",
      sortable: true,
      render: (value: string) => {
        const colors: Record<string, string> = {
          Inquiry: "bg-gray-100 text-gray-800",
          Quotation: "bg-blue-100 text-blue-800",
          Negotiation: "bg-yellow-100 text-yellow-800",
          Won: "bg-green-100 text-green-800",
          Lost: "bg-red-100 text-red-800",
        }
        return <Badge className={colors[value]}>{value}</Badge>
      },
    },
  ],
  
  actions: [
    {
      icon: Eye,
      label: "View",
      href: (row: any) => `/projects/${row.id}`,
      variant: "ghost",
    },
    {
      icon: Edit,
      label: "Edit",
      href: (row: any) => `/projects/${row.id}/edit`,
      variant: "ghost",
    },
  ],
  
  pagination: {
    pageSize: 10,
    pageSizeOptions: [10, 20, 50],
  },
  
  defaultSort: {
    field: "created_at",
    direction: "desc",
  },
}

export default function ProjectsPage() {
  return <ListPageTemplate config={CONFIG} />
}
```

## 高级技巧

### 1. 添加批量操作

```typescript
// 在配置中添加批量操作
bulkActions: [
  {
    label: "Delete Selected",
    action: async (selectedIds: string[]) => {
      // 执行批量删除
    },
  },
]
```

### 2. 自定义空状态

```typescript
emptyState: {
  icon: Package,
  title: "No orders found",
  description: "Create your first order to get started",
  action: {
    label: "Create Order",
    href: "/orders/new",
  },
}
```

### 3. 添加导出功能

```typescript
export: {
  enabled: true,
  formats: ["csv", "xlsx"],
  filename: "orders-export",
}
```

## 常见问题

### Q: 如何添加更多筛选器？

在 `filters` 数组中添加新的配置对象即可。

### Q: 如何自定义列的渲染？

使用 `render` 函数返回自定义的 JSX。

### Q: 如何处理关联数据？

使用 `relation` 配置，模板会自动加载关联表数据。

### Q: 如何添加自定义操作按钮？

在 `actions` 数组中添加新的按钮配置。

## 最佳实践

1. ✅ 保持配置对象清晰、有注释
2. ✅ 为每个列提供合适的渲染函数
3. ✅ 合理设置分页大小
4. ✅ 添加适当的筛选器提高用户体验
5. ✅ 使用有意义的字段名和标签

## 相关资源

- [Supabase 文档](https://supabase.com/docs)
- [shadcn/ui 组件库](https://ui.shadcn.com/)
- [Next.js 文档](https://nextjs.org/docs)

---

**Happy Coding! 🚀**
