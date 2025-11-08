-- 修复缺失的用户 Profile
-- 用于解决注册后刷新页面一直加载的问题

-- 查看所有 auth 用户
SELECT 
  u.id,
  u.email,
  u.created_at as auth_created,
  p.id as profile_id,
  p.first_name,
  p.last_name
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- 为缺失 profile 的用户创建 profile
INSERT INTO public.profiles (id, email, first_name, last_name, role, is_active)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'first_name', 'User'),
  COALESCE(u.raw_user_meta_data->>'last_name', ''),
  CASE 
    WHEN (SELECT COUNT(*) FROM public.profiles) = 0 THEN 'Admin'
    ELSE COALESCE(u.raw_user_meta_data->>'role', 'User')
  END,
  true
FROM auth.users u
WHERE u.id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
  last_name = COALESCE(EXCLUDED.last_name, profiles.last_name),
  updated_at = NOW();

-- 验证结果
SELECT 
  u.id,
  u.email,
  p.first_name,
  p.last_name,
  p.role,
  p.is_active
FROM auth.users u
INNER JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

