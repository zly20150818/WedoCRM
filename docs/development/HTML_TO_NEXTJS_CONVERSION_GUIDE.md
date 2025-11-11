# HTML 转 Next.js 组件开发指南

## 概述
本文档详细记录了如何将一个静态 HTML 页面转换为 Next.js/React 组件的完整开发流程。以 Supplier Management 页面为例。

---

## 开发流程总览

### 阶段 1: 需求分析与理解 (Analysis)

#### 1.1 HTML 结构分析
**目标**: 理解 HTML 页面的结构和功能

**分析内容**:
- 页面布局结构（Header、Main、Footer）
- 关键 UI 组件（表格、搜索栏、分页、按钮）
- 交互功能（搜索、筛选、排序、分页）
- 样式特点（配色、间距、响应式）
- 特殊组件（星级评分）

**关键发现**:
```html
- 使用 Tailwind CSS
- Material Symbols 图标
- 响应式设计
- 暗色模式支持
- 星级评分显示（4.5/5.0）
- 表格布局
- 分页组件
```

#### 1.2 功能需求梳理
**核心功能**:
1. 供应商列表展示
2. 搜索功能（按名称、产品）
3. 筛选功能
4. 分页功能
5. 查看详情
6. 星级评分显示

---

### 阶段 2: 项目探索 (Exploration)

#### 2.1 读取项目文档和规范
**工具调用**: `read_file`

**读取文件**:
1. `docs/development/coding-standards.md` - 编码规范
2. `docs/development/HOW_TO_USE.md` - 使用指南

**关键信息**:
- UI 配色规范（使用 CSS 变量）
- 组件命名规范（kebab-case/camelCase/PascalCase）
- TypeScript 类型定义要求
- 不允许硬编码色值

#### 2.2 分析现有页面实现
**工具调用**: `read_file`

**读取文件**:
1. `app/customers/page.tsx` - 客户列表页
2. `app/projects/page.tsx` - 项目列表页
3. `components/templates/list-page-template.tsx` - 列表页模板

**学习内容**:
- 数据获取方式（Supabase）
- 状态管理（useState, useEffect）
- 组件结构（MainLayout）
- 表格实现方式
- 分页实现方式

#### 2.3 检查数据库结构
**工具调用**: `codebase_search`, `grep`, `read_file`

**搜索内容**:
- suppliers 表结构
- 字段类型和约束
- 关联关系

**关键发现**:
```sql
- rating: INTEGER (0-10 或 0-5)
- type: TEXT (产品/服务类型)
- primary_contact: TEXT (联系人)
- email, phone: TEXT
```

#### 2.4 检查布局和组件
**工具调用**: `read_file`

**读取文件**:
1. `components/layout/main-layout.tsx` - 主布局
2. `components/header.tsx` - 头部导航
3. `app/globals.css` - 全局样式

**关键信息**:
- 使用 MainLayout 包裹页面
- Header 已包含 Suppliers 导航项
- 使用设计系统的 CSS 变量

---

### 阶段 3: 设计实现方案 (Design)

#### 3.1 组件拆分
**决策**:
1. **StarRating 组件** - 可复用的星级评分组件
   - 位置: `components/ui/star-rating.tsx`
   - 功能: 显示 0-5 星，支持半星

2. **SuppliersPage 组件** - 供应商列表页
   - 位置: `app/suppliers/page.tsx`
   - 功能: 数据获取、展示、交互

#### 3.2 技术选型
**使用现有技术栈**:
- Next.js App Router (客户端组件)
- Supabase (数据获取)
- shadcn/ui 组件库
- Tailwind CSS (样式)
- TypeScript (类型安全)

#### 3.3 数据映射
**HTML → 数据库字段映射**:
```
Company Name → suppliers.name
Main Product/Service → suppliers.type
Contact Person → suppliers.primary_contact
Email → suppliers.email
Phone → suppliers.phone
Rating → suppliers.rating (需要转换 0-10 → 0-5)
Action → 路由跳转 /suppliers/:id
```

---

### 阶段 4: 实现开发 (Implementation)

#### 4.1 创建 StarRating 组件
**工具调用**: `write`

**文件**: `components/ui/star-rating.tsx`

**实现要点**:
1. 支持 0-5 星评分
2. 自动处理 0-10 转 0-5 (如果 rating > 5)
3. 支持半星显示
4. 使用 SVG 实现星星图标
5. 响应暗色模式

**关键代码逻辑**:
```typescript
// 评分标准化
const normalizedRating = rating > maxRating ? rating / 2 : rating

// 计算星星数量
const fullStars = Math.floor(clampedRating)
const hasHalfStar = clampedRating % 1 >= 0.5
const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0)
```

#### 4.2 创建 Suppliers 页面
**工具调用**: `write`

**文件**: `app/suppliers/page.tsx`

**实现步骤**:

1. **设置基础结构**
   - 导入必要组件和 hooks
   - 定义数据类型
   - 设置状态管理

2. **实现数据获取**
   ```typescript
   const loadData = async () => {
     let query = supabase
       .from("suppliers")
       .select("id, name, type, primary_contact, email, phone, rating", { count: "exact" })
       .eq("is_active", true)
     
     // 搜索功能
     if (searchTerm) {
       query = query.or(`name.ilike.%${searchTerm}%,type.ilike.%${searchTerm}%`)
     }
     
     // 分页
     query = query.range(from, to)
   }
   ```

3. **实现 UI 布局**
   - 页面标题和创建按钮
   - 卡片容器（工具栏 + 表格 + 分页）
   - 搜索栏
   - 表格
   - 分页组件

4. **样式匹配 HTML**
   - 使用 `rounded-xl border border-border bg-card shadow-sm`
   - 表头使用 `bg-muted/50`
   - 单元格使用 `px-6 py-4`
   - 分页使用图标按钮

#### 4.3 优化和修复
**工具调用**: `read_lints`, `search_replace`

**修复内容**:
1. 修复 TypeScript 类型检查问题
2. 优化样式匹配 HTML 设计
3. 改进分页组件（添加页码按钮）
4. 处理空状态和加载状态

#### 4.4 应用到模板
**工具调用**: `read_file`, `search_replace`

**文件**: `components/templates/list-page-template.tsx`

**改进内容**:
1. 更新布局结构（卡片容器）
2. 更新表格样式（表头、单元格）
3. 更新分页组件（图标按钮、页码）
4. 优化工具栏布局
5. 改进操作按钮显示（单个操作显示为链接）

---

## 工具调用详细记录

### 读取文件 (read_file)
```
1. docs/development/coding-standards.md
2. app/customers/page.tsx
3. app/projects/page.tsx
4. components/templates/list-page-template.tsx
5. components/layout/main-layout.tsx
6. components/header.tsx
7. app/globals.css
8. supabase/migrations/001_initial_schema_complete.sql (部分)
```

### 代码搜索 (codebase_search)
```
1. "What is the database schema for suppliers table?"
2. "How is the rating field used in suppliers table?"
```

### 文本搜索 (grep)
```
1. pattern: "suppliers" (查找所有 suppliers 相关代码)
2. pattern: "from \"lucide-react\"" (查看图标使用方式)
```

### 文件操作
```
1. write: components/ui/star-rating.tsx (新建)
2. write: app/suppliers/page.tsx (新建)
3. search_replace: components/templates/list-page-template.tsx (修改)
```

### 代码检查 (read_lints)
```
1. app/suppliers/page.tsx
2. components/ui/star-rating.tsx
3. components/templates/list-page-template.tsx
```

---

## 思考过程 (Thinking Process)

### 1. HTML 到 React 的转换思路

**静态 HTML → 动态 React 组件**:
```
静态表格行 → map() 渲染动态数据
硬编码数据 → Supabase 数据获取
内联样式 → Tailwind CSS 类名
Material Symbols → Lucide React 图标
原生 HTML → shadcn/ui 组件
```

### 2. 组件设计决策

**为什么创建 StarRating 组件?**
- 可复用性: 其他页面也可能需要显示评分
- 封装性: 隐藏实现细节（SVG、半星逻辑）
- 一致性: 保证全站评分显示一致

**为什么使用卡片容器?**
- 视觉层次: 将工具栏、表格、分页组织在一起
- 一致性: 符合设计系统规范
- 响应式: 更好的移动端体验

### 3. 样式转换策略

**HTML Tailwind → 项目 Tailwind**:
```
硬编码颜色 → CSS 变量 (text-foreground, bg-card)
固定值 → 设计系统值 (rounded-xl, border-border)
Material Symbols → Lucide React 图标
自定义样式 → shadcn/ui 组件样式
```

### 4. 数据处理策略

**评分字段处理**:
- 问题: 数据库可能是 0-10，但显示需要 0-5
- 解决方案: 组件内部自动转换
- 优点: 数据层和显示层解耦

**搜索功能实现**:
- 使用 Supabase 的 `ilike` 进行模糊搜索
- 支持多字段搜索（name, type, primary_contact）
- 搜索时重置到第一页

---

## 文件变更记录

### 新建文件
1. **components/ui/star-rating.tsx**
   - 星级评分组件
   - 支持 0-5 星，半星显示
   - 自动处理评分转换

2. **app/suppliers/page.tsx**
   - 供应商列表页
   - 数据获取和展示
   - 搜索、分页功能

### 修改文件
1. **components/templates/list-page-template.tsx**
   - 更新布局结构（卡片容器）
   - 更新表格样式
   - 更新分页组件
   - 优化工具栏布局

---

## 经验总结 (Lessons Learned)

### 1. 开发前准备
✅ **必须做的**:
- 阅读项目文档和编码规范
- 分析现有类似页面实现
- 检查数据库结构
- 理解设计系统

❌ **避免做的**:
- 直接开始编码
- 硬编码样式值
- 忽略现有组件库
- 不检查数据库约束

### 2. 组件设计原则
✅ **最佳实践**:
- 组件单一职责
- 可复用性优先
- 使用 TypeScript 类型
- 遵循设计系统

❌ **避免**:
- 过度耦合
- 硬编码数据
- 忽略类型安全
- 违反设计规范

### 3. 样式处理
✅ **推荐做法**:
- 使用 CSS 变量
- 遵循设计系统
- 使用 shadcn/ui 组件
- 响应式设计

❌ **避免**:
- 硬编码颜色值
- 忽略暗色模式
- 不遵循间距规范
- 过度自定义样式

### 4. 数据获取
✅ **最佳实践**:
- 使用 Supabase 客户端
- 错误处理
- 加载状态
- 空状态处理

❌ **避免**:
- 忽略错误处理
- 没有加载状态
- 不处理空数据
- 硬编码数据

### 5. 代码质量
✅ **必须做的**:
- 运行 linter 检查
- 修复所有错误
- 遵循 TypeScript 规范
- 添加注释

❌ **避免**:
- 忽略 linter 错误
- 使用 `any` 类型
- 缺少错误处理
- 不添加注释

---

## 开发检查清单

### 阶段 1: 分析
- [ ] 理解 HTML 结构
- [ ] 识别功能需求
- [ ] 分析技术栈
- [ ] 确定数据来源

### 阶段 2: 探索
- [ ] 阅读项目文档
- [ ] 分析现有页面
- [ ] 检查数据库结构
- [ ] 理解设计系统

### 阶段 3: 设计
- [ ] 组件拆分
- [ ] 技术选型
- [ ] 数据映射
- [ ] API 设计

### 阶段 4: 实现
- [ ] 创建组件
- [ ] 实现功能
- [ ] 样式匹配
- [ ] 错误处理

### 阶段 5: 优化
- [ ] 代码检查
- [ ] 性能优化
- [ ] 用户体验
- [ ] 文档更新

---

## 常见问题解决

### Q1: 如何处理 HTML 中的 Material Symbols 图标?
**A**: 使用 Lucide React 图标库，它是项目中使用的图标库。

### Q2: 如何处理评分显示（0-10 vs 0-5）?
**A**: 在组件内部自动转换，如果 rating > 5，则除以 2。

### Q3: 如何匹配 HTML 的样式?
**A**: 使用项目的设计系统（CSS 变量、Tailwind 类名），而不是硬编码值。

### Q4: 如何处理空状态?
**A**: 检查数据长度，显示友好的空状态消息。

### Q5: 如何实现分页?
**A**: 使用 Supabase 的 `range()` 方法，结合状态管理实现分页。

---

## 后续优化建议

### 功能增强
1. 添加筛选功能（按类型、国家等）
2. 添加排序功能（按名称、评分等）
3. 添加导出功能
4. 添加批量操作

### 性能优化
1. 添加数据缓存
2. 实现虚拟滚动（大量数据）
3. 优化搜索性能（防抖）
4. 添加加载骨架屏

### 用户体验
1. 添加操作反馈（Toast）
2. 添加确认对话框
3. 改进错误提示
4. 添加键盘快捷键

---

## 参考资料

### 项目文档
- `docs/development/coding-standards.md` - 编码规范
- `docs/development/HOW_TO_USE.md` - 使用指南

### 相关页面
- `app/customers/page.tsx` - 客户列表页
- `app/projects/page.tsx` - 项目列表页

### 组件库
- [shadcn/ui](https://ui.shadcn.com/) - UI 组件库
- [Lucide React](https://lucide.dev/) - 图标库
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架

---

## 总结

将 HTML 转换为 Next.js 组件是一个系统性的过程，需要：
1. **深入理解** HTML 结构和功能
2. **充分探索** 项目结构和规范
3. **合理设计** 组件架构和数据流
4. **仔细实现** 每个功能点
5. **持续优化** 代码质量和用户体验

遵循这个流程，可以高效、高质量地完成 HTML 到 Next.js 的转换工作。

