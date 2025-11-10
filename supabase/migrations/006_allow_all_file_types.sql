-- ⚠️ WARNING: This migration allows ALL file types
-- ⚠️ 警告: 此迁移允许所有文件类型
-- 
-- RISKS / 风险:
-- - Security: Malicious files, viruses, scripts
-- - Performance: Large files, bandwidth consumption
-- - Compliance: Data protection regulations
-- - Cost: Uncontrolled storage growth
--
-- RECOMMENDATIONS / 建议:
-- 1. Only use for internal systems with trusted users
-- 2. Implement file scanning (virus detection)
-- 3. Add strict access controls
-- 4. Monitor and audit file uploads
-- 5. Set up alerts for suspicious activity
--
-- If you need this, consider:
-- - Using a more permissive whitelist instead (see 005_add_additional_mime_types.sql)
-- - Implementing file validation in application code
-- - Adding virus scanning service
--
-- 如果确实需要，请考虑:
-- - 使用更宽松的白名单（见 005_add_additional_mime_types.sql）
-- - 在应用代码中实现文件验证
-- - 添加病毒扫描服务

-- Allow all file types for documents bucket
-- Set allowed_mime_types to NULL to allow all types
UPDATE storage.buckets
SET allowed_mime_types = NULL
WHERE id = 'documents';

-- Optional: Also allow all types for products bucket
-- UPDATE storage.buckets
-- SET allowed_mime_types = NULL
-- WHERE id = 'products';

-- Note: Avatars bucket should remain restricted to image types only
-- 注意: 头像存储桶应保持仅允许图片类型

