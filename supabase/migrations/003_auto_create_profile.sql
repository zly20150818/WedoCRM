-- 自动创建用户 Profile 的触发器
-- 当用户在 auth.users 表中创建时，自动在 profiles 表中创建对应的 profile

-- 创建函数：当用户注册时自动创建 profile
-- 特殊规则：第一个注册的用户自动成为管理员
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  user_count INTEGER;
BEGIN
  -- 检查当前用户数量
  SELECT COUNT(*) INTO user_count
  FROM public.profiles;
  
  -- 如果是第一个用户，设为 Admin，否则为 User
  IF user_count = 0 THEN
    user_role := 'Admin';
  ELSE
    user_role := 'User';
  END IF;

  INSERT INTO public.profiles (id, email, first_name, last_name, role, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    user_role,
    true
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, profiles.last_name),
    -- 不更新 role，防止通过注册绕过权限控制
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器：当 auth.users 表中插入新用户时触发
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 为已存在的用户创建 profile（如果还没有）
INSERT INTO public.profiles (id, email, first_name, last_name, role, is_active)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'first_name', 'User'),
  COALESCE(raw_user_meta_data->>'last_name', ''),
  COALESCE(raw_user_meta_data->>'role', 'User'),
  true
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

