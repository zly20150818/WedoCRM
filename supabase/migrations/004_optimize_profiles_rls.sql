-- ==================== 优化 Profiles 表的 RLS 策略 ====================
-- 目的：提高 profile 查询速度，避免超时

-- 1. 删除现有的严格策略
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- 2. 创建更宽松的策略（适合开发环境和小型团队）
-- 注意：在生产环境中，可能需要更严格的策略

-- 允许所有认证用户查看所有 profiles（适合小型团队协作）
CREATE POLICY "Authenticated users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- 用户只能更新自己的 profile
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- 用户只能插入自己的 profile（或者触发器自动创建）
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 3. 添加索引以提高查询性能
-- profiles.id 已经是主键，自动有索引
-- 添加 email 索引以支持按邮箱查询
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 添加 role 索引以支持按角色查询
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 添加 is_active 索引以支持筛选活跃用户
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);

-- 4. 添加注释说明
COMMENT ON POLICY "Authenticated users can view all profiles" ON public.profiles IS 
'允许所有认证用户查看所有 profiles，适合小型团队。生产环境可能需要更严格的策略。';

COMMENT ON INDEX idx_profiles_email IS '支持按邮箱查询 profiles';
COMMENT ON INDEX idx_profiles_role IS '支持按角色筛选用户';
COMMENT ON INDEX idx_profiles_is_active IS '支持筛选活跃用户';

