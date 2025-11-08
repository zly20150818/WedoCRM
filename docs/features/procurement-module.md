# 采购模块功能说明

## 模块概述

采购模块用于管理供应商信息和采购订单，支持完整的采购流程管理。

## 核心功能

### 1. 供应商管理 (`/suppliers`)

**功能特性：**
- ✅ 供应商列表展示（名称、国家、分类、评级、状态）
- ✅ 创建和编辑供应商信息
- ✅ 供应商搜索（按名称、国家、分类）
- ✅ 供应商评级（0-5星）
- ✅ 供应商状态管理（Active、Inactive、Blacklisted）
- ✅ 删除供应商（级联删除联系人）

**数据库表：**
- `suppliers` - 供应商主表
- `supplier_contacts` - 供应商联系人表
- `product_suppliers` - 产品供应商关联表

### 2. 采购订单管理 (`/purchase-orders`)

**功能特性：**
- ✅ 采购订单列表展示
- ✅ 创建和编辑采购订单
- ✅ 多明细项管理（动态添加/删除）
- ✅ 关联项目和供应商
- ✅ 多币种支持和汇率管理
- ✅ 订单状态跟踪
- ✅ 质检状态管理
- ✅ 采购订单搜索

**采购订单状态：**
- Pending（待处理）
- Approved（已批准）
- Ordered（已下单）
- PartiallyReceived（部分收货）
- Received（已收货）
- Cancelled（已取消）
- Completed（已完成）

**质检状态：**
- No QC（无质检）
- QC Pending（质检中）
- QC Passed（质检通过）
- QC Failed（质检不通过）

**数据库表：**
- `purchase_orders` - 采购订单主表
- `purchase_requests` - 采购请求表
- `product_suppliers` - 产品供应商报价

### 3. 高级表单功能

采购订单对话框实现了复杂表单的最佳实践：

**全屏显示模式：**
- ✅ 支持全屏和标准模式切换
- ✅ 默认全屏，适合字段多的复杂表单
- ✅ 固定顶部操作按钮，滚动时始终可见

**数据持久化：**
- ✅ 自动保存草稿到 localStorage
- ✅ 防抖机制（1秒）避免频繁保存
- ✅ 关闭后重新打开自动恢复草稿
- ✅ 手动保存草稿按钮
- ✅ 清空表单按钮
- ✅ 成功提交后自动清除草稿
- ✅ 仅在新建模式启用（编辑模式不使用草稿）

**用户体验：**
- ✅ 动态计算订单总金额
- ✅ 表单验证和错误提示
- ✅ 加载状态显示
- ✅ Toast 通知反馈
- ✅ 响应式布局

## 导航菜单

侧边栏新增菜单项：
- **Suppliers** - 供应商管理
- **Purchase Orders** - 采购订单管理

## 数据库改进

### 1. RLS 策略补充

新增以下表的 RLS 策略（`005_add_missing_rls_policies.sql`）：
- `supplier_contacts` - 供应商联系人
- `purchase_requests` - 采购请求
- `product_categories` - 产品分类
- `quotation_items` - 报价明细
- `product_suppliers` - 产品供应商关联

### 2. 自动创建管理员账号

**重要改进：**
每次执行 `supabase db reset` 后，自动创建默认管理员账号：

```
Email:    admin@fincrm.com
Password: admin123
Role:     Admin
```

**实现方式：**
- 在 `supabase/seed.sql` 中添加自动创建逻辑
- 使用 bcrypt 加密密码
- 同时创建 `auth.users`、`auth.identities` 和 `public.profiles`
- 如果用户已存在，自动更新为管理员角色

**使用命令：**
```bash
# PowerShell
npm run db:reset:ps1

# CMD
npm run db:reset

# 或直接运行
supabase db reset
```

## 技术实现

### 前端技术栈
- React 19 + Next.js 15 (App Router)
- TypeScript
- React Hook Form + Zod 验证
- shadcn/ui 组件库
- Tailwind CSS

### 后端技术栈
- Supabase (PostgreSQL + Auth)
- Row Level Security (RLS)
- Server Components

### 代码规范
- ✅ UI 文本使用英文
- ✅ 代码注释使用中文
- ✅ TypeScript 类型完整
- ✅ 错误处理完善
- ✅ 遵循项目开发规范

## 文件结构

```
FinCRM/
├── app/
│   ├── suppliers/
│   │   └── page.tsx              # 供应商列表页面
│   └── purchase-orders/
│       └── page.tsx              # 采购订单列表页面
├── components/
│   ├── suppliers/
│   │   └── supplier-dialog.tsx   # 供应商对话框
│   └── purchase-orders/
│       └── purchase-order-dialog.tsx  # 采购订单对话框（复杂表单）
├── supabase/
│   ├── migrations/
│   │   ├── 004_optimize_profiles_rls.sql   # Profiles RLS 优化
│   │   └── 005_add_missing_rls_policies.sql # 补充 RLS 策略
│   └── seed.sql                  # 自动创建管理员账号
└── scripts/
    ├── reset-db.bat              # 数据库重置脚本（CMD）
    └── reset-db.ps1              # 数据库重置脚本（PowerShell）
```

## 测试步骤

1. **重置数据库**
   ```bash
   npm run db:reset:ps1
   ```

2. **登录系统**
   - 访问：http://localhost:3000/login
   - 账号：admin@fincrm.com
   - 密码：admin123

3. **测试供应商管理**
   - 点击侧边栏 "Suppliers"
   - 创建新供应商
   - 编辑供应商信息
   - 搜索供应商
   - 删除供应商

4. **测试采购订单**
   - 点击侧边栏 "Purchase Orders"
   - 创建新采购订单
   - 添加多个采购明细
   - 测试全屏模式切换
   - 测试草稿保存（关闭后重新打开）
   - 查看订单列表和状态

## 待完善功能

以下功能已预留但未完全实现：
- [ ] 采购订单详情页面
- [ ] 采购订单文档生成（PDF）
- [ ] 供应商联系人管理
- [ ] 采购请求审批流程
- [ ] 收货和质检详细记录
- [ ] 采购统计和报表

## 注意事项

1. **安全性**
   - 默认管理员密码仅用于开发环境
   - 生产环境必须修改默认密码
   - localStorage 不存储敏感信息

2. **数据一致性**
   - 删除供应商会级联删除其联系人
   - 删除供应商前需确保没有关联的采购订单
   - 采购订单必须关联有效的项目和供应商

3. **性能优化**
   - 采购订单列表使用索引优化查询
   - 草稿保存使用防抖机制减少写入
   - 图片和附件上传需配置 Supabase Storage

## 更新日志

### 2024-11-08
- ✅ 实现供应商管理模块
- ✅ 实现采购订单管理模块
- ✅ 添加复杂表单最佳实践（全屏+草稿）
- ✅ 补充 RLS 策略
- ✅ 自动创建管理员账号功能
- ✅ 更新侧边栏导航菜单
- ✅ 提交代码到 Git

