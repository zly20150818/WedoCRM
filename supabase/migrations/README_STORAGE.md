# 存储桶迁移说明

## 概述

本迁移文件（`006_create_storage_buckets.sql`）会自动创建和配置 Supabase Storage 存储桶及其权限策略。

## 包含的存储桶

### 1. `avatars` - 用户头像
- **类型**: 公开（Public）
- **文件大小限制**: 5MB
- **允许的文件类型**: JPEG, PNG, GIF, WebP
- **权限**: 
  - 所有人可以查看
  - 认证用户可以上传、更新、删除

### 2. `documents` - 文档存储
- **类型**: 私有（Private）
- **文件大小限制**: 50MB
- **允许的文件类型**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, ZIP, TXT, CSV
- **权限**: 
  - 只有认证用户可以查看、上传、更新、删除

### 3. `products` - 产品图片和附件
- **类型**: 公开（Public）
- **文件大小限制**: 50MB
- **允许的文件类型**: 
  - 图片: JPEG, PNG, GIF, WebP, SVG
  - 文档: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
  - 压缩文件: ZIP, RAR, 7Z
  - 文本: TXT, CSV
- **权限**: 
  - 所有人可以查看（图片需要公开访问）
  - 认证用户可以上传、更新、删除

## 使用方法

### 方式 1: 通过 Supabase CLI（推荐）

```bash
# 重置数据库（会应用所有迁移）
supabase db reset

# 或者只应用新迁移
supabase migration up
```

### 方式 2: 通过 Supabase Dashboard

1. 访问 Supabase Dashboard
2. 进入 SQL Editor
3. 复制 `006_create_storage_buckets.sql` 文件内容
4. 在 SQL Editor 中执行

### 方式 3: 通过 Supabase CLI 应用到远程数据库

```bash
# 推送到远程数据库
supabase db push
```

## 验证

迁移执行后，可以通过以下方式验证：

### 1. 检查存储桶是否创建

在 Supabase Dashboard 中：
- 进入 **Storage** 页面
- 应该能看到 `avatars`、`documents`、`products` 三个存储桶

### 2. 检查 RLS 策略

在 Supabase Dashboard 中：
- 进入 **Storage** > **Policies**
- 应该能看到每个存储桶的 SELECT、INSERT、UPDATE、DELETE 策略

### 3. 通过 SQL 查询验证

```sql
-- 查看所有存储桶
SELECT id, name, public, file_size_limit 
FROM storage.buckets;

-- 查看存储对象的 RLS 策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage';
```

## 权限策略说明

### Products 存储桶策略

- **公开读取**: 所有人都可以查看产品图片，无需认证
- **认证上传**: 只有认证用户可以上传文件
- **认证更新**: 只有认证用户可以更新文件
- **认证删除**: 只有认证用户可以删除文件

### 更严格的权限控制（可选）

如果需要更严格的权限控制（例如，只允许用户删除自己上传的文件），可以修改策略使用文件路径验证：

```sql
-- 示例：只允许用户删除自己上传的文件
CREATE POLICY "Users can only delete own product files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

## 故障排除

### 问题 1: 迁移失败，提示存储桶已存在

**解决方案**: 迁移文件使用了 `ON CONFLICT (id) DO NOTHING`，如果存储桶已存在，会自动跳过。

### 问题 2: 策略创建失败，提示策略已存在

**解决方案**: 迁移文件使用了 `DROP POLICY IF EXISTS`，会先删除已存在的策略再创建新的。

### 问题 3: 无法上传文件，提示权限不足

**解决方案**: 
1. 检查用户是否已登录（认证状态）
2. 检查文件类型是否在允许的 MIME 类型列表中
3. 检查文件大小是否超过限制
4. 检查 RLS 策略是否正确创建

## 注意事项

1. **公开存储桶**: `avatars` 和 `products` 存储桶是公开的，所有人都可以访问其中的文件。请确保不要上传敏感信息。

2. **文件大小限制**: 
   - Avatars: 5MB
   - Documents: 50MB
   - Products: 50MB

3. **MIME 类型限制**: 每个存储桶都有允许的 MIME 类型列表。上传不符合类型的文件会被拒绝。

4. **RLS 策略**: 所有存储对象都启用了 RLS（Row Level Security），确保只有授权的用户才能访问。

## 后续步骤

迁移完成后：
1. 测试上传功能
2. 验证文件访问权限
3. 根据需要调整权限策略

