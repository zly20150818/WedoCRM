# 📋 列表页模板 - 快速参考

## 🚀 快速开始（3 步）

```bash
# 1. 复制模板
cp components/templates/list-page-template.tsx app/your-page/page.tsx

# 2. 修改 CONFIG 对象（表名、字段等）

# 3. 运行
npm run dev
```

---

## 📝 配置速查表

### 基本配置

```typescript
const CONFIG = {
  title: "页面标题",
  createButtonText: "创建按钮",
  createRoute: "/路由/new",
  table: "表名",           // 📌 修改这里
  idField: "id",
}
```

### 搜索配置

```typescript
search: {
  enabled: true,
  placeholder: "搜索提示",
  fields: ["字段1", "字段2"],  // 📌 修改搜索字段
}
```

### 状态标签

```typescript
statusTabs: {
  enabled: true,
  field: "status",          // 📌 状态字段名
  options: [
    { value: "all", label: "全部" },
    { value: "Active", label: "激活" },  // 📌 添加状态
  ],
}
```

### 筛选器

#### 下拉选择

```typescript
{
  type: "select",
  field: "customer_id",     // 📌 字段名
  label: "筛选客户",
  placeholder: "全部客户",
  icon: Filter,
  relation: {
    table: "customers",     // 📌 关联表
    valueField: "id",
    labelField: "name",
  },
}
```

#### 日期范围

```typescript
{
  type: "dateRange",
  field: "created_at",      // 📌 日期字段
  label: "创建日期",
  icon: CalendarIcon,
}
```

### 表格列

#### 基本列

```typescript
{
  key: "name",              // 📌 字段名
  label: "名称",            // 📌 列标题
  sortable: true,
}
```

#### 链接列

```typescript
{
  key: "order_number",
  label: "订单号",
  sortable: true,
  render: (value: string) => (
    <span className="font-medium text-blue-600">{value}</span>
  ),
}
```

#### 金额列

```typescript
{
  key: "amount",
  label: "金额",
  sortable: true,
  render: (value: number) => `$${value.toLocaleString()}`,
}
```

#### 日期列

```typescript
{
  key: "created_at",
  label: "创建日期",
  sortable: true,
  render: (value: string) => 
    value ? format(new Date(value), "yyyy-MM-dd") : "-",
}
```

#### 状态徽章列

```typescript
{
  key: "status",
  label: "状态",
  sortable: true,
  render: (value: string) => {
    const colors: Record<string, string> = {
      Active: "bg-green-100 text-green-800",
      Inactive: "bg-gray-100 text-gray-800",
    }
    return <Badge className={colors[value]}>{value}</Badge>
  },
}
```

#### 百分比列

```typescript
{
  key: "progress",
  label: "进度",
  sortable: true,
  render: (value: number) => (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 bg-gray-200 rounded-full">
        <div className="h-full bg-blue-500" style={{ width: `${value}%` }} />
      </div>
      <span>{value}%</span>
    </div>
  ),
}
```

#### 评分列

```typescript
{
  key: "rating",
  label: "评分",
  sortable: true,
  render: (value: number) => (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={i < value ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
      ))}
    </div>
  ),
}
```

### 操作按钮

```typescript
actions: [
  {
    icon: Eye,
    label: "查看",
    href: (row) => `/path/${row.id}`,     // 📌 修改路径
    variant: "ghost",
  },
  {
    icon: Edit,
    label: "编辑",
    href: (row) => `/path/${row.id}/edit`,
    variant: "ghost",
  },
]
```

---

## 🎨 常用状态颜色

```typescript
const statusColors: Record<string, string> = {
  // 成功/完成
  Success: "bg-green-100 text-green-800",
  Completed: "bg-green-100 text-green-800",
  Active: "bg-green-100 text-green-800",
  Delivered: "bg-green-100 text-green-800",
  
  // 进行中
  Processing: "bg-blue-100 text-blue-800",
  InProgress: "bg-blue-100 text-blue-800",
  
  // 等待/挂起
  Pending: "bg-yellow-100 text-yellow-800",
  Waiting: "bg-yellow-100 text-yellow-800",
  
  // 取消/失败
  Canceled: "bg-red-100 text-red-800",
  Failed: "bg-red-100 text-red-800",
  Rejected: "bg-red-100 text-red-800",
  
  // 草稿/未激活
  Draft: "bg-gray-100 text-gray-800",
  Inactive: "bg-gray-100 text-gray-800",
}
```

---

## 🔍 常用图标

```typescript
import {
  Search,        // 搜索
  Plus,          // 添加
  Eye,           // 查看
  Edit,          // 编辑
  Trash2,        // 删除
  Filter,        // 筛选
  Calendar,      // 日期
  User,          // 用户
  Users,         // 用户组
  Building2,     // 公司
  Package,       // 产品
  ShoppingCart,  // 订单
  FileText,      // 文档
  DollarSign,    // 金额
  MapPin,        // 位置
  Phone,         // 电话
  Mail,          // 邮件
  Star,          // 评分
  Tag,           // 标签
  Clock,         // 时间
  CheckCircle,   // 成功
  XCircle,       // 失败
  AlertCircle,   // 警告
  Info,          // 信息
} from "lucide-react"
```

---

## 📋 完整示例模板（复制即用）

```typescript
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Eye, Edit } from "lucide-react"

const CONFIG = {
  title: "YOUR_TITLE",                    // 📌 修改
  createButtonText: "Create New Item",    // 📌 修改
  createRoute: "/your-route/new",         // 📌 修改
  table: "your_table",                    // 📌 修改
  idField: "id",
  
  search: {
    enabled: true,
    placeholder: "Search...",             // 📌 修改
    fields: ["field1", "field2"],         // 📌 修改
  },
  
  statusTabs: {
    enabled: true,
    field: "status",                      // 📌 修改
    options: [
      { value: "all", label: "All" },
      { value: "Active", label: "Active" },  // 📌 修改
    ],
  },
  
  columns: [
    { key: "field1", label: "LABEL1", sortable: true },  // 📌 修改
    { key: "field2", label: "LABEL2", sortable: true },  // 📌 修改
  ],
  
  pagination: { pageSize: 20 },
  defaultSort: { field: "created_at", direction: "desc" as const },
}

export default function YourPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    loadData()
  }, [searchTerm, selectedStatus, currentPage])

  const loadData = async () => {
    setLoading(true)
    try {
      let query = supabase.from(CONFIG.table).select("*", { count: "exact" })

      if (searchTerm) {
        const searchFields = CONFIG.search.fields.map(f => `${f}.ilike.%${searchTerm}%`).join(",")
        query = query.or(searchFields)
      }

      if (selectedStatus !== "all") {
        query = query.eq(CONFIG.statusTabs.field, selectedStatus)
      }

      const from = (currentPage - 1) * CONFIG.pagination.pageSize
      const to = from + CONFIG.pagination.pageSize - 1
      query = query.range(from, to)

      const { data: results, error, count } = await query

      if (error) throw error
      setData(results || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(totalCount / CONFIG.pagination.pageSize)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{CONFIG.title}</h1>
        <Button onClick={() => router.push(CONFIG.createRoute)}>
          <Plus className="mr-2 h-4 w-4" />
          {CONFIG.createButtonText}
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={CONFIG.search.placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {CONFIG.statusTabs.options.map((option) => (
            <Button
              key={option.value}
              variant={selectedStatus === option.value ? "default" : "outline"}
              onClick={() => setSelectedStatus(option.value)}
              className="rounded-full"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {CONFIG.columns.map((column: any) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
              <TableHead>ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={CONFIG.columns.length + 1} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={CONFIG.columns.length + 1} className="text-center py-8">
                  No data found
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={row[CONFIG.idField]}>
                  {CONFIG.columns.map((column: any) => (
                    <TableCell key={column.key}>{row[column.key] || "-"}</TableCell>
                  ))}
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => router.push(`/path/${row.id}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between px-6 py-4 border-t">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * CONFIG.pagination.pageSize + 1} to{" "}
            {Math.min(currentPage * CONFIG.pagination.pageSize, totalCount)} of {totalCount} results
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>
              Previous
            </Button>
            <Button variant="outline" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## 🛠️ 使用生成器

```bash
# 交互式生成列表页
node scripts/generate-list-page.js

# 按照提示输入：
# - 表名
# - 页面标题
# - 路由路径
# - 搜索字段
# - 状态字段和值
# - 显示列
```

---

## 📚 完整文档

详细说明请查看：`components/templates/README.md`

---

## ⚡ 常见问题

**Q: 如何添加更多筛选器？**  
A: 在 `filters` 数组中添加配置对象

**Q: 如何自定义列显示？**  
A: 使用 `render` 函数返回自定义 JSX

**Q: 如何添加批量操作？**  
A: 添加复选框列和批量操作按钮

**Q: 如何导出数据？**  
A: 添加导出按钮，调用 Supabase 查询后转换为 CSV/Excel

---

💡 **提示：** 将此文件保存为书签，方便快速查阅！
