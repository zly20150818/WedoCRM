-- ==================== ExportCRM 完整数据库初始化脚本 ====================
-- 整合了所有迁移文件（001-006）
-- 基于重构后的用户系统：完全使用 auth.users 的 user_metadata
-- 
-- 运行此脚本将创建完整的数据库结构
-- 
-- 📌 重要：用户信息存储在 auth.users.user_metadata 中
-- 不再使用 profiles 表！
--
-- ==================== 目录 ====================
-- 第一部分：用户系统和辅助函数
-- 第二部分：客户和线索管理
-- 第三部分：产品管理
-- 第四部分：供应商管理
-- 第五部分：项目管理
-- 第六部分：报价管理
-- 第七部分：订单管理
-- 第八部分：样品管理
-- 第九部分：发票和支付
-- 第十部分：采购订单
-- 第十一部分：审批系统
-- 第十二部分：通知系统
-- 第十三部分：工作流系统
-- 第十四部分：物流询价和费用
-- 第十五部分：RFQ 管理
-- 第十六部分：项目成本和利润
-- 第十七部分：异常处理
-- 第十八部分：其他业务表
-- 第十九部分：用户和系统设置
-- 第二十部分：外贸基础数据配置
-- 第二十一部分：存储桶配置
-- 第二十二部分：触发器
-- 第二十三部分：RLS 策略
-- 第二十四部分：索引

-- ==================== 第一部分：用户系统和辅助函数 ====================

-- 注意：不再创建 profiles 表，用户信息完全存储在 auth.users 的 user_metadata 中
-- user_metadata 结构：
-- {
--   "first_name": "张",
--   "last_name": "三",
--   "company": "ABC公司",
--   "role": "User", // User | Admin | Manager
--   "avatar": "https://...",
--   "is_active": true
-- }

-- 创建 updated_at 触发器函数
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建辅助函数：获取用户角色
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT COALESCE(raw_user_meta_data->>'role', 'User')
    FROM auth.users
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建辅助函数：检查用户是否激活
CREATE OR REPLACE FUNCTION public.is_user_active(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COALESCE((raw_user_meta_data->>'is_active')::BOOLEAN, true)
    FROM auth.users
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建辅助函数：检查用户是否为管理员
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COALESCE(raw_user_meta_data->>'role', 'User') = 'Admin'
    FROM auth.users
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建辅助函数：获取当前用户角色（使用 auth.uid()）
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN public.get_user_role(auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建辅助函数：检查当前用户是否为管理员
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.is_admin(auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器函数：当用户注册时，确保 user_metadata 中有正确的角色
-- 特殊规则：第一个注册的用户自动成为管理员
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  user_count INTEGER;
  updated_metadata JSONB;
BEGIN
  -- 检查当前用户数量（从 auth.users 表计数）
  SELECT COUNT(*) INTO user_count
  FROM auth.users
  WHERE id != NEW.id;
  
  -- 如果是第一个用户，设为 Admin，否则为 User
  IF user_count = 0 THEN
    user_role := 'Admin';
  ELSE
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'User');
  END IF;

  -- 构建完整的 user_metadata，确保所有必需字段都存在
  updated_metadata := jsonb_build_object(
    'first_name', COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    'last_name', COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'company', NEW.raw_user_meta_data->>'company',
    'role', user_role,
    'avatar', NEW.raw_user_meta_data->>'avatar',
    'is_active', COALESCE((NEW.raw_user_meta_data->>'is_active')::BOOLEAN, true)
  );

  -- 更新用户的 raw_user_meta_data
  NEW.raw_user_meta_data := updated_metadata;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器：当 auth.users 表中插入新用户时触发
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==================== 第二部分：客户和线索管理 ====================

-- 创建 customers 表（客户表）
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    customer_number TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    name_cn TEXT,
    type TEXT DEFAULT 'Prospect',
    industry TEXT,
    country TEXT NOT NULL,
    city TEXT,
    address TEXT,
    website TEXT,
    tax_id TEXT,
    rating INTEGER DEFAULT 0,
    credit_limit DECIMAL(15, 2) DEFAULT 0,
    payment_term TEXT DEFAULT 'T/T',
    currency TEXT DEFAULT 'USD',
    primary_contact TEXT,
    email TEXT,
    phone TEXT,
    tags TEXT[] DEFAULT '{}',
    source TEXT DEFAULT 'Other',
    notes TEXT,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 customer_contacts 表（客户联系人表）
CREATE TABLE IF NOT EXISTS public.customer_contacts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    customer_id TEXT NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    position TEXT,
    department TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    mobile TEXT,
    wechat TEXT,
    whatsapp TEXT,
    is_primary BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 leads 表（销售线索表）
CREATE TABLE IF NOT EXISTS public.leads (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    lead_number TEXT NOT NULL UNIQUE,
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    country TEXT NOT NULL,
    industry TEXT,
    source TEXT DEFAULT 'Other',
    status TEXT DEFAULT 'New',
    score INTEGER DEFAULT 0,
    notes TEXT,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    converted BOOLEAN DEFAULT false,
    converted_to_customer_id TEXT REFERENCES public.customers(id) ON DELETE SET NULL,
    converted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 第三部分：产品管理 ====================

-- 创建 product_categories 表（产品分类表）
CREATE TABLE IF NOT EXISTS public.product_categories (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    name_cn TEXT,
    description TEXT,
    parent_id TEXT REFERENCES public.product_categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 第五部分：项目管理 ====================

-- 创建 projects 表（项目表）
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    project_number TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    customer_id TEXT NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    customer_name TEXT NOT NULL,
    type TEXT DEFAULT 'Standard',
    status TEXT DEFAULT 'Lead',
    stage TEXT DEFAULT 'Inquiry',
    priority TEXT DEFAULT 'Normal',
    incoterm TEXT DEFAULT 'FOB',
    port_of_loading TEXT,
    port_of_destination TEXT,
    currency TEXT DEFAULT 'USD',
    exchange_rate DECIMAL(10, 4) DEFAULT 1.0,
    estimated_value DECIMAL(15, 2) DEFAULT 0,
    probability INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    expected_close_date TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 第四部分：供应商管理 ====================

-- 创建 suppliers 表（供应商表）
CREATE TABLE IF NOT EXISTS public.suppliers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    supplier_number TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    name_cn TEXT,
    type TEXT DEFAULT 'Manufacturer',
    country TEXT NOT NULL,
    city TEXT,
    address TEXT,
    website TEXT,
    tax_id TEXT,
    rating INTEGER DEFAULT 0,
    payment_term TEXT DEFAULT 'T/T',
    currency TEXT DEFAULT 'CNY',
    primary_contact TEXT,
    email TEXT,
    phone TEXT,
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 supplier_contacts 表（供应商联系人表）
CREATE TABLE IF NOT EXISTS public.supplier_contacts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    supplier_id TEXT NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    position TEXT,
    department TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    mobile TEXT,
    wechat TEXT,
    whatsapp TEXT,
    is_primary BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============== 此处移动创建 products 表 ===============
-- 创建 products 表（产品表）
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    sku TEXT NOT NULL UNIQUE,
    part_number TEXT,
    name TEXT NOT NULL,
    name_cn TEXT,
    description TEXT,
    description_cn TEXT,
    category_id TEXT REFERENCES public.product_categories(id) ON DELETE SET NULL,
    project_id TEXT REFERENCES public.projects(id) ON DELETE SET NULL,
    supplier_id TEXT REFERENCES public.suppliers(id) ON DELETE SET NULL,
    specs JSONB,
    unit TEXT DEFAULT 'pcs',
    moq INTEGER DEFAULT 1,
    price DECIMAL(15, 2),
    price_with_tax DECIMAL(15, 2),
    price_without_tax DECIMAL(15, 2),
    cost DECIMAL(15, 2),
    tax_refund_rate DECIMAL(5, 2),
    packaging_info TEXT,
    weight DECIMAL(15, 3),
    volume DECIMAL(15, 3),
    currency TEXT DEFAULT 'USD',
    images TEXT[] DEFAULT '{}',
    attachments TEXT[] DEFAULT '{}',
    hs_code TEXT,
    tags TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'Active',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 第六部分：报价管理 ====================

-- 创建 quotations 表（报价表）
CREATE TABLE IF NOT EXISTS public.quotations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    quotation_number TEXT NOT NULL UNIQUE,
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE RESTRICT,
    customer_id TEXT NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    customer_name TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    status TEXT DEFAULT 'Draft',
    currency TEXT DEFAULT 'USD',
    exchange_rate DECIMAL(10, 4) DEFAULT 1.0,
    incoterm TEXT DEFAULT 'FOB',
    port_of_loading TEXT,
    port_of_destination TEXT,
    shipping_method TEXT,
    payment_term TEXT DEFAULT 'T/T',
    validity_days INTEGER DEFAULT 30,
    delivery_days INTEGER DEFAULT 30,
    total_amount DECIMAL(15, 2) DEFAULT 0,
    discount DECIMAL(15, 2) DEFAULT 0,
    final_amount DECIMAL(15, 2) DEFAULT 0,
    notes TEXT,
    terms_and_conditions TEXT,
    prepared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    expired_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 quotation_items 表（报价项目表）
CREATE TABLE IF NOT EXISTS public.quotation_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    quotation_id TEXT NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_name_cn TEXT,
    description TEXT,
    specs JSONB,
    quantity INTEGER NOT NULL,
    unit TEXT DEFAULT 'pcs',
    unit_price DECIMAL(15, 2) NOT NULL,
    total_price DECIMAL(15, 2) NOT NULL,
    notes TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 第七部分：订单管理 ====================

-- 创建 orders 表（销售订单表）
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_number TEXT NOT NULL UNIQUE,
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE RESTRICT,
    customer_id TEXT NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    customer_name TEXT NOT NULL,
    quotation_id TEXT REFERENCES public.quotations(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'Confirmed',
    currency TEXT DEFAULT 'USD',
    exchange_rate DECIMAL(10, 4) DEFAULT 1.0,
    incoterm TEXT DEFAULT 'FOB',
    port_of_loading TEXT,
    port_of_destination TEXT,
    shipping_method TEXT,
    payment_term TEXT DEFAULT 'T/T',
    total_amount DECIMAL(15, 2) NOT NULL,
    paid_amount DECIMAL(15, 2) DEFAULT 0,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    order_date TIMESTAMPTZ DEFAULT NOW(),
    expected_delivery_date TIMESTAMPTZ,
    actual_delivery_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 order_items 表（订单项目表）
CREATE TABLE IF NOT EXISTS public.order_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL,
    unit TEXT DEFAULT 'pcs',
    unit_price DECIMAL(15, 2) NOT NULL,
    total_price DECIMAL(15, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 第八部分：样品管理 ====================

-- 创建 samples 表（样品表）
CREATE TABLE IF NOT EXISTS public.samples (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    sample_number TEXT NOT NULL UNIQUE,
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE RESTRICT,
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit TEXT DEFAULT 'pcs',
    status TEXT DEFAULT 'Requested',
    requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    supplier_id TEXT REFERENCES public.suppliers(id) ON DELETE SET NULL,
    cost DECIMAL(15, 2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    notes TEXT,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 第九部分：发票和支付 ====================

-- 创建 invoices 表（发票表）
CREATE TABLE IF NOT EXISTS public.invoices (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    invoice_number TEXT NOT NULL UNIQUE,
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
    customer_id TEXT NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    customer_name TEXT NOT NULL,
    type TEXT DEFAULT 'Commercial',
    status TEXT DEFAULT 'Draft',
    currency TEXT DEFAULT 'USD',
    total_amount DECIMAL(15, 2) NOT NULL,
    paid_amount DECIMAL(15, 2) DEFAULT 0,
    tax_amount DECIMAL(15, 2) DEFAULT 0,
    notes TEXT,
    issued_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    issue_date TIMESTAMPTZ DEFAULT NOW(),
    due_date TIMESTAMPTZ,
    paid_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 payments 表（支付记录表）
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    payment_number TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    related_type TEXT NOT NULL,
    related_id TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    exchange_rate DECIMAL(10, 4) DEFAULT 1.0,
    base_amount DECIMAL(15, 2) NOT NULL,
    base_currency TEXT DEFAULT 'CNY',
    method TEXT DEFAULT 'T/T',
    status TEXT DEFAULT 'Pending',
    reference_number TEXT,
    bank_name TEXT,
    account_number TEXT,
    notes TEXT,
    payer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    recorded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 第十部分：采购订单 ====================

-- 创建 purchase_orders 表（采购订单表）
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    po_number TEXT NOT NULL UNIQUE,
    project_id TEXT REFERENCES public.projects(id) ON DELETE SET NULL,
    supplier_id TEXT NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
    supplier_name TEXT NOT NULL,
    status TEXT DEFAULT 'Draft',
    currency TEXT DEFAULT 'CNY',
    exchange_rate DECIMAL(10, 4) DEFAULT 1.0,
    total_amount DECIMAL(15, 2) NOT NULL,
    paid_amount DECIMAL(15, 2) DEFAULT 0,
    payment_term TEXT DEFAULT 'T/T',
    notes TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    order_date TIMESTAMPTZ DEFAULT NOW(),
    expected_delivery_date TIMESTAMPTZ,
    actual_delivery_date TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 purchase_order_items 表（采购订单项目表）
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    po_id TEXT NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL,
    unit TEXT DEFAULT 'pcs',
    unit_price DECIMAL(15, 2) NOT NULL,
    total_price DECIMAL(15, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 第十一部分：审批系统 ====================

-- 创建 approval_flows 表（审批流程配置表）
CREATE TABLE IF NOT EXISTS public.approval_flows (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    rules JSONB NOT NULL,
    levels JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 approvals 表（审批记录表）
CREATE TABLE IF NOT EXISTS public.approvals (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    approval_number TEXT NOT NULL UNIQUE,
    flow_id TEXT REFERENCES public.approval_flows(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    related_id TEXT NOT NULL,
    related_type TEXT NOT NULL,
    related_data JSONB,
    amount DECIMAL(15, 2),
    currency TEXT DEFAULT 'CNY',
    requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    requester_name TEXT NOT NULL,
    request_reason TEXT,
    current_approver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    current_level INTEGER DEFAULT 1,
    status TEXT DEFAULT 'Pending',
    priority TEXT DEFAULT 'Normal',
    comments TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 approval_history 表（审批历史记录表）
CREATE TABLE IF NOT EXISTS public.approval_history (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    approval_id TEXT NOT NULL REFERENCES public.approvals(id) ON DELETE CASCADE,
    level INTEGER NOT NULL,
    approver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    approver_name TEXT NOT NULL,
    action TEXT NOT NULL,
    comments TEXT,
    snapshot JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 第十二部分：通知系统 ====================

-- 创建 notifications 表（通知记录表）
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    related_type TEXT,
    related_id TEXT,
    action_url TEXT,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    approval_id TEXT REFERENCES public.approvals(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 第十三部分：工作流系统 ====================

-- 创建 workflow_definitions 表（工作流定义表）
CREATE TABLE IF NOT EXISTS public.workflow_definitions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    version TEXT DEFAULT '1.0',
    description TEXT,
    json_schema JSONB NOT NULL,
    nodes JSONB[] DEFAULT '{}',
    edges JSONB[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 workflow_instances 表（工作流实例表）
CREATE TABLE IF NOT EXISTS public.workflow_instances (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    definition_id TEXT NOT NULL REFERENCES public.workflow_definitions(id) ON DELETE RESTRICT,
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE RESTRICT,
    status TEXT DEFAULT 'Active',
    current_context JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 创建 workflow_node_instances 表（工作流节点实例表）
CREATE TABLE IF NOT EXISTS public.workflow_node_instances (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    instance_id TEXT NOT NULL REFERENCES public.workflow_instances(id) ON DELETE CASCADE,
    node_id TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 workflow_actions 表（工作流操作表）
CREATE TABLE IF NOT EXISTS public.workflow_actions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    instance_id TEXT NOT NULL REFERENCES public.workflow_instances(id) ON DELETE CASCADE,
    node_id TEXT NOT NULL,
    action TEXT NOT NULL,
    performed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 第十四部分：物流询价和费用 ====================

-- 创建 logistics_inquiries 表（物流询价记录表）
CREATE TABLE IF NOT EXISTS public.logistics_inquiries (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    quotation_id TEXT NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
    inquiry_number TEXT NOT NULL UNIQUE,
    incoterm TEXT NOT NULL,
    port_of_loading TEXT,
    port_of_destination TEXT,
    shipping_method TEXT,
    total_weight DECIMAL(10, 2),
    total_volume DECIMAL(10, 3),
    package_count INTEGER,
    cargo_description TEXT,
    suppliers JSONB NOT NULL,
    template TEXT,
    status TEXT DEFAULT 'Draft',
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 logistics_quotes 表（物流服务商报价表）
CREATE TABLE IF NOT EXISTS public.logistics_quotes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    inquiry_id TEXT NOT NULL REFERENCES public.logistics_inquiries(id) ON DELETE CASCADE,
    supplier_id TEXT REFERENCES public.suppliers(id) ON DELETE SET NULL,
    supplier_name TEXT NOT NULL,
    items JSONB NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    currency TEXT DEFAULT 'CNY',
    valid_until TIMESTAMPTZ,
    is_selected BOOLEAN DEFAULT false,
    attachments TEXT[] DEFAULT '{}',
    notes TEXT,
    received_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 quotation_costs 表（报价费用表）
CREATE TABLE IF NOT EXISTS public.quotation_costs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    quotation_id TEXT NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    name_cn TEXT,
    amount DECIMAL(15, 2) DEFAULT 0,
    currency TEXT DEFAULT 'CNY',
    original_amount DECIMAL(15, 2),
    original_currency TEXT,
    exchange_rate DECIMAL(10, 4) DEFAULT 1.0,
    source TEXT DEFAULT 'manual',
    inquiry_id TEXT REFERENCES public.logistics_inquiries(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 logistics_suppliers 表（物流服务商表）
CREATE TABLE IF NOT EXISTS public.logistics_suppliers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    contact TEXT,
    email TEXT,
    phone TEXT,
    services TEXT[] DEFAULT '{}',
    routes TEXT[] DEFAULT '{}',
    rating DECIMAL(3, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 第十五部分：RFQ 管理 ====================

-- 创建 rfq_records 表（RFQ发送记录表）
CREATE TABLE IF NOT EXISTS public.rfq_records (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    rfq_number TEXT NOT NULL UNIQUE,
    sent_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    items JSONB NOT NULL,
    documents JSONB,
    currency TEXT DEFAULT 'USD',
    incoterm TEXT,
    port_of_loading TEXT,
    port_of_destination TEXT,
    status TEXT DEFAULT 'Sent',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 rfq_supplier_records 表（RFQ供应商记录表）
CREATE TABLE IF NOT EXISTS public.rfq_supplier_records (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    rfq_id TEXT NOT NULL REFERENCES public.rfq_records(id) ON DELETE CASCADE,
    supplier_id TEXT NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
    send_status TEXT DEFAULT 'Pending',
    send_error TEXT,
    sent_at TIMESTAMPTZ,
    reply_status TEXT DEFAULT 'NoReply',
    replied_at TIMESTAMPTZ,
    reply_content TEXT,
    reply_attachments JSONB,
    quotation JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(rfq_id, supplier_id)
);

-- ==================== 第十六部分：项目成本和利润 ====================

-- 创建 project_costs 表（项目成本表）
CREATE TABLE IF NOT EXISTS public.project_costs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency TEXT DEFAULT 'CNY',
    base_amount DECIMAL(15, 2) NOT NULL,
    base_currency TEXT DEFAULT 'CNY',
    exchange_rate DECIMAL(10, 4) DEFAULT 1.0,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 project_profit_reports 表（项目利润报告表）
CREATE TABLE IF NOT EXISTS public.project_profit_reports (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    period TEXT NOT NULL,
    revenue DECIMAL(15, 2) NOT NULL,
    cost DECIMAL(15, 2) NOT NULL,
    gross_profit DECIMAL(15, 2) NOT NULL,
    margin DECIMAL(5, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 project_profit_details 表（项目利润详细核算表）
CREATE TABLE IF NOT EXISTS public.project_profit_details (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    total_revenue DECIMAL(15, 2) DEFAULT 0,
    revenue JSONB NOT NULL,
    total_cost DECIMAL(15, 2) DEFAULT 0,
    costs JSONB NOT NULL,
    sample_cost DECIMAL(15, 2) DEFAULT 0,
    purchase_cost DECIMAL(15, 2) DEFAULT 0,
    shipping_cost DECIMAL(15, 2) DEFAULT 0,
    customs_cost DECIMAL(15, 2) DEFAULT 0,
    other_cost DECIMAL(15, 2) DEFAULT 0,
    gross_profit DECIMAL(15, 2) DEFAULT 0,
    net_profit DECIMAL(15, 2) DEFAULT 0,
    profit_margin DECIMAL(5, 2) DEFAULT 0,
    exchange_gain_loss DECIMAL(15, 2) DEFAULT 0,
    base_currency TEXT DEFAULT 'CNY',
    calculated_at TIMESTAMPTZ NOT NULL,
    calculated_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    status TEXT DEFAULT 'Draft',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 payment_reconciliations 表（收付款核销记录表）
CREATE TABLE IF NOT EXISTS public.payment_reconciliations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE RESTRICT,
    payment_in_id TEXT REFERENCES public.payments(id) ON DELETE SET NULL,
    invoice_id TEXT REFERENCES public.invoices(id) ON DELETE SET NULL,
    payment_out_id TEXT REFERENCES public.payments(id) ON DELETE SET NULL,
    purchase_order_id TEXT REFERENCES public.purchase_orders(id) ON DELETE SET NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency TEXT DEFAULT 'CNY',
    status TEXT DEFAULT 'Reconciled',
    difference DECIMAL(15, 2) DEFAULT 0,
    difference_reason TEXT,
    reconciled_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    reconciled_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 第十七部分：异常处理 ====================

-- 创建 exceptions 表（异常记录表）
CREATE TABLE IF NOT EXISTS public.exceptions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    exception_number TEXT NOT NULL UNIQUE,
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE RESTRICT,
    type TEXT NOT NULL,
    severity TEXT DEFAULT 'Medium',
    source_type TEXT NOT NULL,
    source_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    responsible_party TEXT,
    status TEXT DEFAULT 'Open',
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    solution TEXT,
    action_taken TEXT,
    impact JSONB,
    occurred_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    priority TEXT DEFAULT 'Normal',
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 exception_history 表（异常处理历史表）
CREATE TABLE IF NOT EXISTS public.exception_history (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    exception_id TEXT NOT NULL REFERENCES public.exceptions(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    from_value TEXT,
    to_value TEXT,
    performed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 exception_reminders 表（异常提醒表）
CREATE TABLE IF NOT EXISTS public.exception_reminders (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    exception_id TEXT NOT NULL REFERENCES public.exceptions(id) ON DELETE CASCADE,
    remind_at TIMESTAMPTZ NOT NULL,
    remind_type TEXT NOT NULL,
    message TEXT NOT NULL,
    is_sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 第十八部分：其他业务表 ====================

-- 创建 inspections 表（质检表）
CREATE TABLE IF NOT EXISTS public.inspections (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    po_id TEXT NOT NULL REFERENCES public.purchase_orders(id) ON DELETE RESTRICT,
    plan_date TIMESTAMPTZ NOT NULL,
    criteria TEXT NOT NULL,
    inspector_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    status TEXT DEFAULT 'Scheduled',
    passed BOOLEAN,
    defects JSONB,
    attachments TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 创建 sample_costs 表（样品成本表）
CREATE TABLE IF NOT EXISTS public.sample_costs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    sample_id TEXT NOT NULL REFERENCES public.samples(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency TEXT DEFAULT 'CNY',
    base_amount DECIMAL(15, 2) NOT NULL,
    base_currency TEXT DEFAULT 'CNY',
    exchange_rate DECIMAL(10, 4) DEFAULT 1.0,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 files 表（文件表）
CREATE TABLE IF NOT EXISTS public.files (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    path TEXT NOT NULL,
    size INTEGER NOT NULL,
    type TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    scope TEXT NOT NULL,
    ref_id TEXT,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 templates 表（模板表）
CREATE TABLE IF NOT EXISTS public.templates (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

