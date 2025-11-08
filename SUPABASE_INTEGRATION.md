# Supabase 本地部署指南（Windows + Docker）

本文档说明如何在 Windows 环境下使用 Docker 本地部署 Supabase，并将 ExportCRM（外贸出口管理系统）与 Supabase 集成。

## 1. 安装依赖

依赖已添加到 `package.json`，在 PowerShell 中运行以下命令安装：

```powershell
# 使用 yarn
yarn install

# 或使用 npm
npm install
```

## 2. 设置 Supabase 项目
 

使用 Supabase 开源版本在本地运行，完全免费且数据完全由您控制。

### 2.1 安装 Docker Desktop（必需）

1. 下载并安装 [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
2. 启动 Docker Desktop，确保状态栏显示 Docker 正在运行
3. 验证安装：
   ```powershell
   docker --version
   docker ps
   ```

**注意**: 
- 确保启用 WSL 2（Windows Subsystem for Linux 2）
- Docker Desktop 需要虚拟化支持，确保 BIOS 中启用了虚拟化
- 如果遇到问题，参考 [Docker Desktop 故障排除指南](https://docs.docker.com/desktop/troubleshoot/overview/)

### 2.2 安装 Supabase CLI

**方式 A: 使用 npm（推荐）**
```powershell
npm install -g supabase
```

**方式 B: 使用 Scoop**
```powershell
# 安装 Scoop（如果还没有）
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-WebRequest -UseBasicParsing https://get.scoop.sh | Invoke-Expression

# 安装 Supabase
scoop bucket add supabase https://github.com/supabase/supabase
scoop install supabase
```

**方式 C: 使用 Chocolatey**
```powershell
choco install supabase
```

验证安装：
```powershell
supabase --version
```

### 2.3 初始化 Supabase 项目

在项目根目录打开 PowerShell 或命令提示符：

```powershell
# 进入项目目录（如果还没有）
cd D:\FinCRM

# 初始化 Supabase（如果还没有初始化）
supabase init

# 启动本地 Supabase 服务（包括 PostgreSQL、Auth、Storage 等）
supabase start
```

**首次启动可能需要几分钟**，Docker 会下载所需的镜像。

启动成功后，您会看到类似以下输出：

```
Started supabase local development setup.

         API URL: http://localhost:54321
     GraphQL URL: http://localhost:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**重要**: 请保存输出的 `anon key` 和 `service_role key`，稍后需要配置到环境变量中。

### 2.4 访问本地 Supabase Studio

打开浏览器访问 `http://localhost:54323`，这是本地 Supabase Dashboard，您可以：
- 查看和管理数据库表
- 运行 SQL 查询
- 管理 Storage Buckets
- 查看 API 文档
- 测试认证功能
- 查看实时日志

### 2.5 常用命令

```powershell
# 查看服务状态和配置信息
supabase status

# 停止所有服务（数据会保留）
supabase stop

# 重启服务
supabase start

# 重置数据库（清除所有数据并重新运行迁移）
supabase db reset

# 查看日志
supabase logs

# 查看特定服务的日志
docker logs supabase-auth-<container-id>
```

### 2.6 Windows 特定注意事项

1. **防火墙提示**: 首次启动时，Windows 防火墙可能会询问是否允许 Docker 访问网络，请选择"允许"

2. **端口占用**: 如果端口 54321-54324 被占用，可以：
   - 检查占用端口的进程：`netstat -ano | findstr :54321`
   - 修改 `supabase/config.toml` 中的端口配置

3. **WSL 2 要求**: Docker Desktop 需要 WSL 2，如果未安装：
   ```powershell
   # 以管理员身份运行 PowerShell
   wsl --install
   # 重启电脑后完成安装
   ```

4. **数据持久化**: Supabase 数据存储在 Docker 卷中，即使重启电脑数据也会保留。要完全清除数据：
   ```powershell
   supabase stop
   docker volume prune
   ```

## 3. 配置环境变量（Windows）

在项目根目录创建 `.env.local` 文件，使用 `supabase start` 命令输出的值：

```env
# 本地 Supabase API URL
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321

# 本地 Supabase Anon Key（从 supabase start 输出中复制）
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 可选：Service Role Key（仅在服务器端使用）
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**快速获取配置信息**：

```powershell
# 方法 1: 运行 status 命令查看
supabase status

# 方法 2: 查看启动时的输出（已保存）
# 方法 3: 使用 PowerShell 脚本自动配置（见下方）
```

**自动配置环境变量脚本**：

创建 `setup-env.ps1` 文件：

```powershell
# 获取 Supabase 状态
$status = supabase status 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "错误: Supabase 未运行，请先运行 'supabase start'" -ForegroundColor Red
    exit 1
}

# 提取配置信息
$apiUrl = ($status | Select-String "API URL").ToString().Split(":")[1].Trim()
$anonKey = ($status | Select-String "anon key").ToString().Split(":")[1].Trim()

# 创建 .env.local
@"
# Supabase 本地配置（自动生成）
NEXT_PUBLIC_SUPABASE_URL=$apiUrl
NEXT_PUBLIC_SUPABASE_ANON_KEY=$anonKey
"@ | Out-File -FilePath .env.local -Encoding utf8

Write-Host "✅ 已创建 .env.local 文件" -ForegroundColor Green
Write-Host "   API URL: $apiUrl" -ForegroundColor Gray
Write-Host "   请检查文件内容是否正确" -ForegroundColor Yellow
```

运行脚本：
```powershell
.\setup-env.ps1
```

**注意**: 
- 本地开发时，API URL 固定为 `http://localhost:54321`
- Anon Key 和 Service Role Key 每次启动可能不同（如果重置了 Docker 卷）
- 如果重置了数据库，需要重新获取密钥并更新 `.env.local`

## 4. 设置数据库（Windows）

### 方式 A: 使用 Supabase Studio（推荐）

1. 访问 `http://localhost:54323` 打开本地 Supabase Studio
2. 点击左侧菜单的 "SQL Editor"
3. 点击 "New query"
4. 复制 `supabase/migrations/001_initial_schema.sql` 文件的内容
5. 粘贴到 SQL Editor 中
6. 点击 "Run" 执行 SQL 脚本

### 方式 B: 使用 Supabase CLI（推荐）

```powershell
# 将迁移文件应用到本地数据库（会自动运行 supabase/migrations/ 目录下的所有迁移文件）
supabase db reset
```

**注意**: `db reset` 会清除所有数据并重新运行迁移，适合开发环境。

### 方式 C: 手动运行 SQL 文件

如果您安装了 PostgreSQL 客户端工具：

```powershell
# 使用 psql 直接连接数据库
psql postgresql://postgres:postgres@localhost:54322/postgres -f supabase/migrations/001_initial_schema.sql
```

或者使用 Docker：

```powershell
docker exec -i supabase_db_exportcrm psql -U postgres -d postgres < supabase/migrations/001_initial_schema.sql
```

迁移脚本将创建以下表：
- `profiles` - 用户资料
- `clients` - 客户信息（包含国家、地址、信用等级等）
- `products` - 产品信息（包含SKU、库存、价格等）
- `orders` - 订单信息（包含订单号、数量、金额、状态等）
- `logistics` - 物流信息（包含物流单号、承运商、运输状态等）
- `order_alerts` - 订单预警（包含订单异常、物流预警等）

## 5. 设置 Storage Buckets（Windows）

### 方式 A: 使用 Supabase Studio（推荐）

1. 访问 `http://localhost:54323` 打开本地 Supabase Studio
2. 点击左侧菜单的 "Storage"
3. 点击 "New bucket" 创建存储桶

创建以下存储桶：

1. **avatars** - 用户头像
   - 名称: `avatars`
   - 设置为公开（Public）
   - 启用 RLS（Row Level Security）

2. **documents** - 文档存储
   - 名称: `documents`
   - 设置为私有（Private）
   - 启用 RLS

### 方式 B: 使用 SQL 脚本

在 Supabase Studio 的 SQL Editor 中运行以下 SQL：

```sql
-- 创建 avatars 存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 创建 documents 存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;
```

### Storage RLS 策略示例

```sql
-- Avatars: 所有用户都可以查看，但只能上传自己的
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Documents: 只有认证用户才能访问
CREATE POLICY "Authenticated users can view documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');
```

## 6. 功能模块集成

### 6.1 用户认证 (Auth)

已集成 Supabase Auth，使用 Cookie-based 认证：

- ✅ 登录 (`/login`)
- ✅ 注册 (`/register`)
- ✅ 登出
- ✅ 会话管理

### 6.2 数据库操作 (Database)

使用 Supabase PostgreSQL 数据库：

- ✅ 用户资料管理 (`profiles` 表)
- ✅ 客户管理 (`clients` 表)
- ✅ 资产管理 (`assets` 表)
- ✅ 产品管理 (`products` 表)
- ✅ 交易记录 (`transactions` 表)
- ✅ 风险预警 (`risk_alerts` 表)

### 6.3 文件存储 (Storage)

使用 Supabase Storage：

- ✅ 用户头像上传 (`lib/supabase/storage.ts`)
- ✅ 文档上传和管理

### 6.4 Edge Functions（可选）

对于复杂的业务逻辑（如风险计算），可以创建 Supabase Edge Functions：

1. 在 Supabase Dashboard > Edge Functions 中创建新函数
2. 使用 Deno 编写函数逻辑
3. 从 Next.js 应用中调用

示例 Edge Function 调用：

```typescript
const { data, error } = await supabase.functions.invoke('calculate-risk', {
  body: { clientId: 'xxx' }
})
```

## 7. 使用示例

### 客户端组件中使用 Supabase

```typescript
import { createClient } from "@/lib/supabase/client"

export default function MyComponent() {
  const supabase = createClient()
  
  // 查询数据
  const { data, error } = await supabase
    .from('clients')
    .select('*')
  
  return <div>...</div>
}
```

### 服务器组件中使用 Supabase

```typescript
import { createClient } from "@/lib/supabase/server"

export default async function MyServerComponent() {
  const supabase = await createClient()
  
  // 查询数据
  const { data, error } = await supabase
    .from('clients')
    .select('*')
  
  return <div>...</div>
}
```

### 上传文件

```typescript
import { uploadAvatar } from "@/lib/supabase/storage"

const handleUpload = async (file: File) => {
  const { url, error } = await uploadAvatar(userId, file)
  if (error) {
    console.error('Upload failed:', error)
  } else {
    console.log('File uploaded:', url)
  }
}
```

## 8. 安全注意事项

1. **环境变量**: 永远不要将 `.env.local` 提交到版本控制
2. **RLS 策略**: 确保所有表都启用了 Row Level Security
3. **API 密钥**: 只在客户端使用 Anon Key，Service Role Key 仅在服务器端使用
4. **文件上传**: 验证文件类型和大小，防止恶意文件上传

## 9. 故障排除

### 本地部署常见问题

#### Docker 未运行
```powershell
# 检查 Docker 是否运行
docker ps

# 如果 Docker 未运行，启动 Docker Desktop
# 从开始菜单启动 Docker Desktop，或运行：
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

#### 端口被占用
如果端口 54321-54324 被占用，可以：

```powershell
# 检查端口占用情况
netstat -ano | findstr :54321

# 查看占用端口的进程
Get-Process -Id <PID>

# 修改 supabase/config.toml 修改端口配置
# 或停止占用端口的进程
```

#### 重置所有数据
```powershell
# 停止并删除所有容器和数据
supabase stop --no-backup

# 重新启动
supabase start
```

#### 查看详细日志
```powershell
# 查看所有服务日志
supabase logs

# 查看特定服务的日志（先查看容器名称）
docker ps
docker logs <container-name>
```

### 认证问题

- 检查 `.env.local` 文件是否存在且配置正确
- 确认 `NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321`
- 运行 `supabase status` 查看当前配置并对比 `.env.local`
- 检查浏览器控制台的错误信息（F12 打开开发者工具）
- 确认 Supabase 服务已启动：`supabase start`
- 如果密钥不匹配，运行 `.\supabase\setup-env.ps1` 重新生成 `.env.local`

### 数据库查询问题

- 确认 RLS 策略正确配置
- 检查用户是否有正确的权限
- 访问 `http://localhost:54323` 查看数据库和表结构
- 确认迁移文件已正确应用
- 检查 SQL Editor 中的错误信息

### Storage 问题

- 确认存储桶已创建（在 `http://localhost:54323` > Storage 中检查）
- 检查 RLS 策略是否正确
- 验证文件大小和类型限制
- 检查 Docker 卷是否正确挂载：
  ```powershell
  docker volume ls | findstr supabase
  ```

## 10. 下一步

- [ ] 将现有页面连接到 Supabase 数据库
- [ ] 实现数据 CRUD 操作
- [ ] 添加实时数据订阅（Realtime）
- [ ] 创建 Edge Functions 处理复杂业务逻辑
- [ ] 设置数据库备份策略

