-- ExportCRM 测试数据种子文件
-- 用于创建测试用户和初始数据
-- 在 Supabase Studio > SQL Editor 中运行此脚本

-- ==================== 创建测试用户 ====================
-- 注意：在 Supabase 中，用户需要通过 auth.users 表创建
-- 由于安全原因，无法直接通过 SQL 插入用户
-- 请在 Supabase Studio > Authentication > Users 中手动创建用户
-- 或者使用 Supabase CLI 创建用户

-- 创建测试用户的 SQL 函数（使用 service_role key）
-- 注意：此函数只能在服务器端调用，不能在前端调用

-- 创建测试用户的辅助函数（需要 service_role 权限）
CREATE OR REPLACE FUNCTION create_test_user(
  user_email TEXT,
  user_password TEXT,
  first_name TEXT,
  last_name TEXT,
  user_company TEXT DEFAULT NULL,
  user_role TEXT DEFAULT 'User'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
BEGIN
  -- 注意：此函数需要在服务器端使用 service_role key 调用
  -- 或者使用 Supabase Management API
  -- 这里只是示例，实际创建用户需要使用 Supabase Auth API
  
  -- 创建用户后，插入 profile
  -- user_id 应该从 auth.users 表中获取
  
  RETURN user_id;
END;
$$;

-- ==================== 创建测试用户 Profile（如果用户已存在） ====================
-- 如果用户已经通过 Supabase Auth 创建，可以使用以下 SQL 创建 profile

-- 示例：为已存在的用户创建 profile
-- 注意：需要替换 <USER_ID> 为实际的用户 ID（从 auth.users 表获取）

-- INSERT INTO public.profiles (id, email, first_name, last_name, company, role)
-- SELECT 
--   id,
--   email,
--   'Admin',
--   'User',
--   'ExportCRM',
--   'Admin'
-- FROM auth.users
-- WHERE email = 'admin@exportcrm.com'
-- ON CONFLICT (id) DO NOTHING;

-- ==================== 初始化角色数据 ====================
INSERT INTO public.roles (name, description) VALUES
  ('Admin', '系统管理员，拥有所有权限'),
  ('Manager', '经理，拥有管理权限'),
  ('User', '普通用户，基础权限')
ON CONFLICT (name) DO NOTHING;

-- ==================== 管理员创建说明 ====================
-- 第一个注册的用户将自动成为管理员
-- 请访问 /register 页面注册第一个用户
--
-- 后续注册的用户都将是普通用户（User 角色）
-- 管理员可以在系统中手动提升其他用户的权限

-- ==================== 测试数据说明 ====================
-- 
-- 要创建测试用户，请使用以下方法之一：
--
-- 方法 1: 使用 Supabase Studio
-- 1. 访问 http://localhost:54323
-- 2. 进入 Authentication > Users
-- 3. 点击 "Add user" > "Create new user"
-- 4. 输入邮箱和密码（例如：admin@exportcrm.com / password123）
-- 5. 取消勾选 "Auto Confirm User"（本地开发建议取消）
-- 6. 点击 "Create user"
-- 7. 创建后，在 SQL Editor 中运行以下 SQL 创建 profile：
--
-- INSERT INTO public.profiles (id, email, first_name, last_name, company, role)
-- SELECT id, email, 'Admin', 'User', 'ExportCRM', 'Admin'
-- FROM auth.users
-- WHERE email = 'admin@exportcrm.com';
--
-- 方法 2: 使用 Supabase CLI
-- npx supabase auth admin create-user --email admin@exportcrm.com --password password123
--
-- 方法 3: 使用注册页面
-- 访问 /register 页面，使用邮箱和密码注册新用户
-- 注意：本地开发时，Supabase 默认需要邮件确认，需要配置禁用邮件确认
--
-- ==================== 禁用邮件确认（本地开发） ====================
-- 在 supabase/config.toml 中配置：
-- [auth]
-- enable_signup = true
-- enable_confirmations = false

