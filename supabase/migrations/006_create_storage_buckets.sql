-- ==================== 创建存储桶 ====================

-- 创建 avatars 存储桶（用于用户头像）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,  -- 公开存储桶，可以直接访问头像
  5242880,  -- 5MB 文件大小限制
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- 创建 documents 存储桶（用于文档存储）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,  -- 私有存储桶，需要认证访问
  52428800,  -- 50MB 文件大小限制
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'application/x-zip-compressed',
    'text/plain',
    'text/csv',
    'application/octet-stream'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- 创建 products 存储桶（用于产品图片和附件）
-- 设置为公开，以便直接访问图片
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  true,  -- 公开存储桶，可以直接访问图片
  52428800,  -- 50MB 文件大小限制
  ARRAY[
    -- 图片类型
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    -- 文档类型
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    -- 压缩文件
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    -- 文本文件
    'text/plain',
    'text/csv',
    -- 其他
    'application/octet-stream'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ==================== 配置存储桶 RLS 策略 ====================

-- 注意：storage.objects 表的 RLS 通常已经默认启用
-- 如果未启用，需要在 Supabase Dashboard 中手动启用，或使用超级用户权限
-- 这里我们直接创建策略，如果 RLS 未启用，策略创建可能会失败，但不会影响存储桶的创建

-- ==================== Avatars 存储桶策略 ====================

-- Avatars: 所有人都可以查看（公开访问）
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Avatars: 用户可以上传自己的头像
-- 文件路径格式：avatars/{user_id}-{timestamp}.{ext}
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

-- Avatars: 用户可以更新自己的头像
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

-- Avatars: 用户可以删除自己的头像
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

-- ==================== Documents 存储桶策略 ====================

-- Documents: 只有认证用户才能查看
DROP POLICY IF EXISTS "Authenticated users can view documents" ON storage.objects;
CREATE POLICY "Authenticated users can view documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);

-- Documents: 认证用户可以上传文档
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);

-- Documents: 认证用户可以更新文档
DROP POLICY IF EXISTS "Authenticated users can update documents" ON storage.objects;
CREATE POLICY "Authenticated users can update documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);

-- Documents: 认证用户可以删除文档
DROP POLICY IF EXISTS "Authenticated users can delete documents" ON storage.objects;
CREATE POLICY "Authenticated users can delete documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);

-- ==================== Products 存储桶策略 ====================

-- Products: 所有人都可以查看（因为图片需要公开访问）
DROP POLICY IF EXISTS "Products bucket is publicly readable" ON storage.objects;
CREATE POLICY "Products bucket is publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- Products: 认证用户可以上传文件到 products 存储桶
DROP POLICY IF EXISTS "Authenticated users can upload to products bucket" ON storage.objects;
CREATE POLICY "Authenticated users can upload to products bucket"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
);

-- Products: 认证用户可以更新文件
DROP POLICY IF EXISTS "Authenticated users can update product files" ON storage.objects;
CREATE POLICY "Authenticated users can update product files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
);

-- Products: 认证用户可以删除文件
DROP POLICY IF EXISTS "Authenticated users can delete from products bucket" ON storage.objects;
CREATE POLICY "Authenticated users can delete from products bucket"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
);

-- ==================== 创建存储桶的辅助函数（可选） ====================

-- 注意：以下辅助函数是可选的，仅用于更严格的权限控制
-- 如果不需要路径验证，可以跳过此函数的创建
-- 当前策略允许所有认证用户管理 products 存储桶中的文件

-- 创建一个函数来验证产品文件路径格式
-- 此函数用于验证文件路径是否符合预期格式：products/{product_id}/{filename} 或 products/{product_id}/attachments/{filename}
-- 如果创建函数时遇到权限问题，可以注释掉以下代码，不影响存储桶的基本功能
DO $$
BEGIN
  -- 尝试创建函数，如果失败则忽略（使用 DO 块来捕获错误）
  CREATE OR REPLACE FUNCTION public.validate_product_file_path(file_path TEXT)
  RETURNS BOOLEAN AS $func$
  BEGIN
    -- 验证路径格式：products/{product_id}/{filename} 或 products/{product_id}/attachments/{filename}
    RETURN file_path ~ '^products/[^/]+/(attachments/)?[^/]+$';
  END;
  $func$ LANGUAGE plpgsql IMMUTABLE;
EXCEPTION
  WHEN OTHERS THEN
    -- 如果创建失败，记录警告但不中断迁移
    RAISE NOTICE 'Could not create validate_product_file_path function: %', SQLERRM;
END $$;

-- 如果需要更严格的权限控制（基于文件路径验证），可以使用以下策略：
-- 注意：这需要先成功创建上面的 validate_product_file_path 函数
-- 
-- DROP POLICY IF EXISTS "Authenticated users can upload to products bucket" ON storage.objects;
-- CREATE POLICY "Users can only upload to own product folders"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'products' 
--   AND auth.role() = 'authenticated'
--   AND public.validate_product_file_path(name)
-- );
--
-- DROP POLICY IF EXISTS "Authenticated users can delete from products bucket" ON storage.objects;
-- CREATE POLICY "Users can only delete own product files"
-- ON storage.objects FOR DELETE
-- USING (
--   bucket_id = 'products' 
--   AND auth.role() = 'authenticated'
--   AND public.validate_product_file_path(name)
-- );

