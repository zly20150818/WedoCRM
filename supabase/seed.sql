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

-- ==================== 产品分类测试数据 ====================
<<<<<<< Current (Your changes)
INSERT INTO public.product_categories (name, name_cn, description) VALUES
  ('Electronics', '电子产品', 'Electronic components and devices'),
  ('Motors', '电机', 'Electric motors and related products'),
  ('Sensors', '传感器', 'Various types of sensors'),
  ('Controllers', '控制器', 'Control systems and controllers'),
  ('Cables', '电缆', 'Cables and wiring products'),
  ('Batteries', '电池', 'Battery products'),
  ('Displays', '显示器', 'Display screens and panels')
ON CONFLICT (id) DO NOTHING;

-- ==================== 产品测试数据 ====================
-- 注意：需要先创建产品分类
INSERT INTO public.products (
  part_number, 
  name, 
  name_cn, 
  description, 
  description_cn, 
  unit, 
  price_with_tax, 
  price_without_tax, 
  weight, 
  volume,
  hs_code,
  tax_refund_rate,
  packaging_info,
  is_active,
  category_id
) VALUES
  (
    'MTR-001',
    'AC Electric Motor 5HP',
    '5马力交流电机',
    'High efficiency 5 horsepower AC electric motor, suitable for industrial applications',
    '高效5马力交流电机，适用于工业应用',
    'PCS',
    1299.00,
    1150.00,
    25.500,
    0.125,
    '8501.10.00',
    13.00,
    'Wooden crate, 1 piece per crate, dimensions: 60x50x40cm',
    true,
    (SELECT id FROM public.product_categories WHERE name = 'Motors' LIMIT 1)
  ),
  (
    'SNS-101',
    'Temperature Sensor PT100',
    'PT100温度传感器',
    'High precision platinum resistance temperature sensor, -200°C to 850°C range',
    '高精度铂电阻温度传感器，测量范围-200°C至850°C',
    'PCS',
    85.00,
    75.00,
    0.050,
    0.001,
    '9025.19.00',
    13.00,
    'Anti-static bag, 50 pieces per box, dimensions: 30x20x15cm',
    true,
    (SELECT id FROM public.product_categories WHERE name = 'Sensors' LIMIT 1)
  ),
  (
    'CTL-202',
    'PLC Controller 24V DC',
    'PLC控制器24V直流',
    '16 input/16 output programmable logic controller with Ethernet connectivity',
    '16输入/16输出可编程逻辑控制器，带以太网连接',
    'SET',
    450.00,
    398.00,
    1.200,
    0.008,
    '8537.10.90',
    13.00,
    'Carton box with foam padding, 1 set per box, dimensions: 35x25x20cm',
    true,
    (SELECT id FROM public.product_categories WHERE name = 'Controllers' LIMIT 1)
  ),
  (
    'CBL-305',
    'Shielded Cable 4-Core 2.5mm²',
    '屏蔽电缆4芯2.5平方',
    'High quality shielded 4-core cable, 2.5mm² cross-section, suitable for industrial automation',
    '高品质4芯屏蔽电缆，2.5平方横截面，适用于工业自动化',
    'M',
    12.50,
    11.00,
    0.180,
    0.001,
    '8544.49.00',
    13.00,
    'Coil packaging, 100 meters per coil, carton box',
    true,
    (SELECT id FROM public.product_categories WHERE name = 'Cables' LIMIT 1)
  ),
  (
    'BAT-401',
    'Lithium Battery Pack 24V 100Ah',
    '锂电池组24V 100Ah',
    'High capacity lithium iron phosphate battery pack with BMS, 2000+ cycle life',
    '高容量磷酸铁锂电池组带BMS，循环寿命2000+次',
    'PCS',
    2800.00,
    2478.00,
    32.000,
    0.065,
    '8507.60.00',
    13.00,
    'Wooden box with cushioning, 1 piece per box, dimensions: 70x45x35cm',
    true,
    (SELECT id FROM public.product_categories WHERE name = 'Batteries' LIMIT 1)
  ),
  (
    'DSP-501',
    'TFT LCD Display 7 inch',
    '7寸TFT液晶显示屏',
    '7 inch color TFT display, 800x480 resolution, with touch screen',
    '7寸彩色TFT显示屏，分辨率800x480，带触摸屏',
    'PCS',
    180.00,
    159.00,
    0.350,
    0.005,
    '8531.20.00',
    13.00,
    'Anti-static bag with foam protection, 10 pieces per carton, dimensions: 40x30x25cm',
    true,
    (SELECT id FROM public.product_categories WHERE name = 'Displays' LIMIT 1)
  ),
  (
    'MTR-002',
    'Stepper Motor NEMA 23',
    'NEMA 23步进电机',
    'High torque NEMA 23 stepper motor, 2.8A rated current, 1.8° step angle',
    '高扭矩NEMA 23步进电机，额定电流2.8A，步进角1.8°',
    'PCS',
    65.00,
    57.50,
    0.850,
    0.003,
    '8501.10.00',
    13.00,
    'Individual box packaging, 20 pieces per carton, dimensions: 50x40x30cm',
    true,
    (SELECT id FROM public.product_categories WHERE name = 'Motors' LIMIT 1)
  ),
  (
    'SNS-102',
    'Ultrasonic Distance Sensor',
    '超声波距离传感器',
    'Ultrasonic ranging sensor, 2cm to 400cm detection range, IP67 rated',
    '超声波测距传感器，检测范围2cm至400cm，防护等级IP67',
    'PCS',
    38.00,
    33.60,
    0.120,
    0.002,
    '9031.80.00',
    13.00,
    'Individual box, 50 pieces per carton, dimensions: 35x30x20cm',
    true,
    (SELECT id FROM public.product_categories WHERE name = 'Sensors' LIMIT 1)
  )
ON CONFLICT (part_number) DO NOTHING;
=======
INSERT INTO public.product_categories (id, name, name_cn, description) VALUES
  ('cat-electronics', 'Electronics', '电子产品', 'Electronic components and devices'),
  ('cat-mechanical', 'Mechanical Parts', '机械部件', 'Mechanical components and hardware'),
  ('cat-textile', 'Textile Products', '纺织品', 'Textile and fabric products'),
  ('cat-chemical', 'Chemicals', '化工产品', 'Chemical products and materials'),
  ('cat-hardware', 'Hardware', '五金制品', 'Hardware and metal products')
ON CONFLICT (id) DO NOTHING;

-- ==================== 产品测试数据 ====================
INSERT INTO public.products (
  id, part_number, name, name_cn, description, description_cn, 
  unit, price_with_tax, price_without_tax, weight, volume, 
  hs_code, tax_refund_rate, packaging_info, is_active, category_id, notes
) VALUES
  (
    'prod-001',
    'LED-5050-RGB',
    'RGB LED Strip 5050',
    'RGB LED灯带5050',
    'High quality RGB LED strip with 5050 chips',
    '采用5050芯片的高品质RGB LED灯带',
    'M',
    120.00,
    106.19,
    0.150,
    0.002,
    '8539.50.00',
    13.00,
    'Roll, 5m per roll, 20 rolls per carton',
    true,
    'cat-electronics',
    'Popular product, high demand'
  ),
  (
    'prod-002',
    'BEAR-6204-2RS',
    'Deep Groove Ball Bearing 6204-2RS',
    '深沟球轴承6204-2RS',
    'Standard deep groove ball bearing with rubber seals',
    '带橡胶密封的标准深沟球轴承',
    'PCS',
    15.80,
    13.98,
    0.085,
    0.0003,
    '8482.10.10',
    13.00,
    'Box, 100 pcs per box, plastic tray inside',
    true,
    'cat-mechanical',
    'Standard specification, multiple suppliers available'
  ),
  (
    'prod-003',
    'TEX-CTN-WHT',
    'White Cotton Fabric',
    '白色纯棉面料',
    '100% cotton white fabric, 40s yarn count',
    '100%纯棉白色面料，40支纱',
    'M',
    28.50,
    25.22,
    0.280,
    0.015,
    '5208.11.00',
    13.00,
    'Roll, 50m per roll',
    true,
    'cat-textile',
    'Good quality, suitable for shirts'
  ),
  (
    'prod-004',
    'CHEM-SIL-IND',
    'Industrial Grade Silicone Oil',
    '工业级硅油',
    'Industrial grade silicone oil, 350 cSt viscosity',
    '工业级硅油，350厘沱粘度',
    'KG',
    45.00,
    39.82,
    0.970,
    0.001,
    '3910.00.10',
    13.00,
    'Drum, 200kg per drum',
    true,
    'cat-chemical',
    'Handle with care, hazardous material'
  ),
  (
    'prod-005',
    'HW-BOLT-M8-50',
    'Hex Bolt M8x50',
    '六角螺栓M8x50',
    'Stainless steel 304 hex bolt M8x50mm',
    '304不锈钢六角螺栓M8x50mm',
    'PCS',
    0.85,
    0.75,
    0.020,
    0.00001,
    '7318.15.00',
    13.00,
    'Box, 1000 pcs per box',
    true,
    'cat-hardware',
    'Standard specification'
  ),
  (
    'prod-006',
    'LED-DRIVER-24V',
    '24V LED Driver 60W',
    '24V LED驱动电源60W',
    'Switching power supply for LED, 24V 2.5A output',
    'LED开关电源，24V 2.5A输出',
    'PCS',
    65.00,
    57.52,
    0.420,
    0.0008,
    '8504.40.10',
    13.00,
    'Box, 20 pcs per carton',
    true,
    'cat-electronics',
    'CE certified, waterproof IP67'
  ),
  (
    'prod-007',
    'GEAR-WORM-20',
    'Worm Gear Set Ratio 1:20',
    '蜗轮蜗杆减速器1:20',
    'Worm gear reducer, ratio 1:20, aluminum housing',
    '蜗轮蜗杆减速器，速比1:20，铝合金外壳',
    'SET',
    280.00,
    247.79,
    3.500,
    0.006,
    '8483.40.90',
    13.00,
    'Carton, 1 set per carton with foam protection',
    true,
    'cat-mechanical',
    'Custom product, requires technical drawing'
  ),
  (
    'prod-008',
    'TEX-POLY-BLK',
    'Black Polyester Fabric',
    '黑色涤纶面料',
    'Polyester fabric, black color, 75D yarn',
    '涤纶面料，黑色，75D纱',
    'M',
    18.00,
    15.93,
    0.180,
    0.012,
    '5407.61.00',
    13.00,
    'Roll, 100m per roll',
    true,
    'cat-textile',
    'Quick dry, suitable for sportswear'
  ),
  (
    'prod-009',
    'CHEM-RESIN-EP',
    'Epoxy Resin AB Glue',
    '环氧树脂AB胶',
    'Two-component epoxy resin adhesive',
    '双组份环氧树脂胶粘剂',
    'KG',
    55.00,
    48.67,
    1.150,
    0.001,
    '3506.91.00',
    13.00,
    'Set, 5kg per set (A:B = 2:1)',
    true,
    'cat-chemical',
    'Mix ratio 2:1, curing time 24 hours'
  ),
  (
    'prod-010',
    'HW-NUT-M8-HEX',
    'Hex Nut M8',
    '六角螺母M8',
    'Stainless steel 304 hex nut M8',
    '304不锈钢六角螺母M8',
    'PCS',
    0.35,
    0.31,
    0.005,
    0.000005,
    '7318.16.00',
    13.00,
    'Box, 2000 pcs per box',
    true,
    'cat-hardware',
    'Standard specification, matches with M8 bolt'
  )
ON CONFLICT (id) DO NOTHING;
>>>>>>> Incoming (Background Agent changes)

