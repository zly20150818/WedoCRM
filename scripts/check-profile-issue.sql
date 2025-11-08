-- 诊断 Profile 查询问题

-- 1. 检查 profiles 表结构
\d profiles

-- 2. 检查索引
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'profiles';

-- 3. 检查 RLS 策略
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 4. 测试查询速度（使用实际用户 ID）
EXPLAIN ANALYZE 
SELECT * FROM profiles 
WHERE id = '21c6c050-b882-4e98-8d39-065f4b7bda1a';

-- 5. 检查表数据量
SELECT COUNT(*) as total_profiles FROM profiles;

-- 6. 检查是否有慢查询
SELECT 
    query,
    calls,
    mean_exec_time,
    max_exec_time
FROM pg_stat_statements 
WHERE query LIKE '%profiles%'
ORDER BY mean_exec_time DESC
LIMIT 5;

