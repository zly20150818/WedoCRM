# 图片到代码转换 - 快速参考指南

## 流程图

```
图片/设计稿
    ↓
[1. 分析阶段]
    ├── 识别UI元素
    ├── 识别数据字段
    ├── 识别功能需求
    └── 创建分析文档
    ↓
[2. 探索阶段]
    ├── 查找相似实现
    ├── 了解项目结构
    ├── 了解数据库结构
    └── 了解UI规范
    ↓
[3. 设计阶段]
    ├── 设计数据库迁移
    ├── 设计页面路由
    ├── 设计数据加载策略
    └── 设计组件层次
    ↓
[4. 实现阶段]
    ├── 创建数据库迁移
    ├── 创建主页面组件
    ├── 创建子组件
    └── 实现功能
    ↓
[5. 优化阶段]
    ├── 检查代码错误
    ├── 修复问题
    ├── 优化性能
    └── 测试功能
    ↓
完成
```

## 工具使用清单

### 阶段1：分析

| 工具 | 用途 | 使用场景 |
|------|------|----------|
| `write` | 创建分析文档 | 创建需求分析文档 |

### 阶段2：探索

| 工具 | 用途 | 使用场景 |
|------|------|----------|
| `codebase_search` | 语义搜索 | 查找相似功能实现 |
| `grep` | 模式搜索 | 查找组件、表定义 |
| `read_file` | 读取文件 | 查看现有实现、文档 |
| `glob_file_search` | 文件搜索 | 查找特定类型文件 |
| `list_dir` | 列出目录 | 查看项目结构 |

### 阶段3：设计

| 工具 | 用途 | 使用场景 |
|------|------|----------|
| `read_file` | 读取文件 | 查看数据库结构、路由结构 |
| `write` | 创建文档 | 记录设计决策 |

### 阶段4：实现

| 工具 | 用途 | 使用场景 |
|------|------|----------|
| `run_terminal_cmd` | 执行命令 | 创建目录 |
| `write` | 创建文件 | 创建页面、组件、迁移文件 |
| `todo_write` | 任务管理 | 跟踪任务进度 |

### 阶段5：优化

| 工具 | 用途 | 使用场景 |
|------|------|----------|
| `read_lints` | 检查错误 | 验证代码质量 |
| `search_replace` | 修改文件 | 修复错误、优化代码 |
| `read_file` | 读取文件 | 验证修改 |

## 关键文件读取清单

### 必读文件

1. **相似实现**
   - `app/projects/[id]/page.tsx` - 详情页面实现
   - `app/projects/[id]/_components/overview-tab.tsx` - 标签页实现

2. **数据库结构**
   - `supabase/migrations/001_initial_schema_complete.sql` - 数据库表定义
   - `supabase/migrations/002_initial_schema_part2.sql` - RLS策略

3. **项目规范**
   - `docs/development/coding-standards.md` - 代码规范
   - `docs/development/HOW_TO_USE.md` - 使用指南

4. **UI组件**
   - `components/ui/tabs.tsx` - 标签页组件
   - `components/ui/card.tsx` - 卡片组件
   - `components/ui/button.tsx` - 按钮组件

### 参考文件

1. **列表页面**
   - `app/suppliers/page.tsx` - 了解数据结构

2. **相关组件**
   - `components/ui/star-rating.tsx` - 评分组件
   - `components/ui/textarea.tsx` - 文本域组件

## 数据库设计 checklist

- [ ] 识别缺失字段
- [ ] 设计新表和字段
- [ ] 创建迁移文件
- [ ] 添加索引
- [ ] 启用RLS
- [ ] 创建RLS策略
- [ ] 添加触发器
- [ ] 添加注释

## 组件实现 checklist

- [ ] 定义TypeScript类型
- [ ] 实现数据加载函数
- [ ] 创建主页面组件
- [ ] 创建子组件
- [ ] 实现布局
- [ ] 实现功能
- [ ] 处理错误
- [ ] 处理空值
- [ ] 实现响应式设计
- [ ] 遵循UI规范

## 代码质量 checklist

- [ ] 检查lint错误
- [ ] 修复类型错误
- [ ] 优化代码结构
- [ ] 验证所有导入
- [ ] 测试所有功能
- [ ] 验证响应式设计
- [ ] 检查性能

## 常见模式

### 数据加载模式

```typescript
async function loadData(id: string) {
  const supabase = await createClient()
  
  const [supplier, contacts, bankAccounts] = await Promise.all([
    supabase.from("suppliers").select("*").eq("id", id).single(),
    supabase.from("supplier_contacts").select("*").eq("supplier_id", id),
    supabase.from("supplier_bank_accounts").select("*").eq("supplier_id", id),
  ])
  
  return { supplier, contacts, bankAccounts }
}
```

### 页面组件模式

```typescript
export default async function DetailPage({ params }: { params: { id: string } }) {
  const data = await loadData(params.id)
  if (!data) return notFound()
  
  return (
    <MainLayout>
      <Header />
      <Tabs>
        <TabsContent value="overview">
          <OverviewTab data={data} />
        </TabsContent>
      </Tabs>
    </MainLayout>
  )
}
```

### 标签页组件模式

```typescript
export default function OverviewTab({ data }: { data: DataType }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Content */}
        </CardContent>
      </Card>
    </div>
  )
}
```

## 最佳实践

1. **先分析后编码** - 充分理解需求
2. **先探索后实现** - 了解项目结构
3. **先设计后编码** - 设计数据库和组件
4. **先实现后优化** - 先完成功能再优化
5. **先检查后提交** - 检查代码质量

## 避免的常见错误

1. ❌ 直接开始编码，没有充分理解需求
2. ❌ 忽略现有代码库的模式和规范
3. ❌ 不处理错误和空值
4. ❌ 忽略响应式设计
5. ❌ 不检查代码质量

## 时间估算

| 阶段 | 时间占比 | 说明 |
|------|----------|------|
| 分析 | 20% | 理解需求、创建文档 |
| 探索 | 15% | 查找相似实现、了解项目 |
| 设计 | 15% | 设计数据库、组件结构 |
| 实现 | 40% | 编写代码 |
| 优化 | 10% | 检查错误、优化代码 |

## 快速命令参考

```bash
# 创建目录
mkdir -p app/suppliers/[id]/_components

# 查看文件
cat app/suppliers/[id]/page.tsx

# 检查错误
npm run lint

# 运行开发服务器
npm run dev
```

## 相关文档

- [完整开发指南](./IMAGE_TO_CODE_GUIDE.md) - 详细流程说明
- [代码规范](./coding-standards.md) - UI和代码规范
- [使用指南](./HOW_TO_USE.md) - 项目使用指南
