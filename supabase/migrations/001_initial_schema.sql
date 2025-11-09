-- ExportCRM Supabase 数据库迁移脚本
-- 基于 Prisma Schema 重构的外贸出口管理系统数据库架构
-- 在 Supabase Dashboard > SQL Editor 中运行此脚本

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== 第一部分：用户和系统表 ====================

-- 创建 profiles 表（用户资料表，与 Supabase auth.users 集成）
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    company TEXT,
    role TEXT DEFAULT 'User',
    avatar TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 roles 表（角色表）
CREATE TABLE IF NOT EXISTS public.roles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 user_roles 关联表（用户-角色多对多）
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id TEXT REFERENCES public.roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- 创建 audit_logs 表（审计日志）
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    operation TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    before JSONB,
    after JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT
);

-- ==================== 第二部分：客户和联系人 ====================

-- 创建 customers 表（客户表）
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    company_full_name TEXT,
    email TEXT,
    phone TEXT,
    country TEXT,
    address TEXT,
    credit_level TEXT,
    tax_id TEXT,
    currency TEXT DEFAULT 'USD',
    language TEXT DEFAULT 'en',
    nda_url TEXT,
    company_logo TEXT,
    segment TEXT,
    grade TEXT,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'Active',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 contacts 表（联系人表）
CREATE TABLE IF NOT EXISTS public.contacts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    customer_id TEXT NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    title TEXT,
    email TEXT,
    phone TEXT,
    wechat TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 leads 表（线索/潜在客户表）
CREATE TABLE IF NOT EXISTS public.leads (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    title TEXT,
    email TEXT,
    phone TEXT,
    source TEXT,
    status TEXT DEFAULT 'New',
    priority TEXT DEFAULT 'Medium',
    estimated_value DECIMAL(15, 2),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    notes TEXT,
    last_contacted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 communication_logs 表（沟通记录表）
CREATE TABLE IF NOT EXISTS public.communication_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    customer_id TEXT NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    channel TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ==================== 第三部分：产品分类 ====================

-- 创建 product_categories 表（产品分类表）
CREATE TABLE IF NOT EXISTS public.product_categories (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    name_cn TEXT,
    description TEXT,
    parent_id TEXT REFERENCES public.product_categories(id) ON DELETE NO ACTION,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 第四部分：项目和里程碑 ====================

-- 创建 projects 表（项目表）
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    project_number TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    customer_id TEXT NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    lead_id TEXT REFERENCES public.leads(id) ON DELETE SET NULL,
    project_type TEXT DEFAULT 'Customized',
    stage_flow TEXT,
    target_margin DECIMAL(5, 2),
    budget DECIMAL(15, 2),
    budget_currency TEXT DEFAULT 'CNY',
    estimated_value DECIMAL(15, 2),
    currency TEXT DEFAULT 'USD',
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    status TEXT DEFAULT 'Active',
    stage TEXT DEFAULT 'Prospecting',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 milestones 表（里程碑表）
CREATE TABLE IF NOT EXISTS public.milestones (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    planned_at TIMESTAMPTZ NOT NULL,
    actual_at TIMESTAMPTZ,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 project_documents 表（项目文档表）
CREATE TABLE IF NOT EXISTS public.project_documents (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    path TEXT NOT NULL,
    size INTEGER NOT NULL,
    type TEXT NOT NULL,
    category TEXT DEFAULT 'Other',
    tags TEXT[] DEFAULT '{}',
    version TEXT DEFAULT '1.0',
    parent_id TEXT REFERENCES public.project_documents(id) ON DELETE SET NULL,
    is_latest BOOLEAN DEFAULT true,
    description TEXT,
    visibility TEXT DEFAULT 'Project',
    status TEXT DEFAULT 'Active',
    uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    archived_at TIMESTAMPTZ
);

-- ==================== 第五部分：产品 ====================

-- 创建 products 表（产品表）
-- 注意：此表必须在 projects 表创建之后创建，因为 products 表引用了 projects 表
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    part_number TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    name_cn TEXT NOT NULL,
    description TEXT,
    description_cn TEXT,
    unit TEXT DEFAULT 'PCS',
    price_with_tax DECIMAL(15, 2),
    price_without_tax DECIMAL(15, 2),
    weight DECIMAL(10, 3),
    volume DECIMAL(10, 3),
    hs_code TEXT,
    tax_refund_rate DECIMAL(5, 2),
    packaging_info TEXT,
    images TEXT DEFAULT '[]',
    attachments TEXT DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    category_id TEXT REFERENCES public.product_categories(id) ON DELETE SET NULL,
    default_supplier_id TEXT,
    project_id TEXT REFERENCES public.projects(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 第六部分：销售相关表 ====================

-- 创建 quotations 表（报价表）
CREATE TABLE IF NOT EXISTS public.quotations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    quotation_number TEXT NOT NULL UNIQUE,
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE RESTRICT,
    customer_id TEXT NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    currency TEXT DEFAULT 'USD',
    base_currency TEXT DEFAULT 'CNY',
    exchange_rate DECIMAL(10, 4) DEFAULT 7.0,
    exchange_date TIMESTAMPTZ DEFAULT NOW(),
    incoterm TEXT,
    port_of_loading TEXT,
    port_of_destination TEXT,
    shipping_method TEXT,
    valid_until TIMESTAMPTZ NOT NULL,
    delivery_date TIMESTAMPTZ,
    status TEXT DEFAULT 'Draft',
    version TEXT DEFAULT '1.0',
    notes TEXT,
    terms TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ
);

-- 创建 quotation_items 表（报价明细表）
CREATE TABLE IF NOT EXISTS public.quotation_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    quotation_id TEXT NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
    part_number TEXT NOT NULL,
    description TEXT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    base_unit_price DECIMAL(15, 2) NOT NULL,
    tax_rate DECIMAL(5, 2) DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 contracts 表（合同表）
CREATE TABLE IF NOT EXISTS public.contracts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    contract_number TEXT NOT NULL UNIQUE,
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE RESTRICT,
    quotation_id TEXT REFERENCES public.quotations(id) ON DELETE SET NULL,
    pi_id TEXT,
    customer_id TEXT REFERENCES public.customers(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    parties JSONB NOT NULL,
    terms TEXT NOT NULL,
    total_value DECIMAL(15, 2),
    currency TEXT DEFAULT 'USD',
    base_total_value DECIMAL(15, 2),
    base_currency TEXT DEFAULT 'CNY',
    exchange_rate DECIMAL(10, 4) DEFAULT 7.0,
    exchange_date TIMESTAMPTZ DEFAULT NOW(),
    effective_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ,
    status TEXT DEFAULT 'Draft',
    signed_at TIMESTAMPTZ,
    signed_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 customer_pos 表（客户PO表）
CREATE TABLE IF NOT EXISTS public.customer_pos (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    po_number TEXT NOT NULL UNIQUE,
    project_id TEXT REFERENCES public.projects(id) ON DELETE SET NULL,
    customer_id TEXT NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    quotation_id TEXT REFERENCES public.quotations(id) ON DELETE SET NULL,
    items JSONB NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    base_total_amount DECIMAL(15, 2) NOT NULL,
    base_currency TEXT DEFAULT 'CNY',
    exchange_rate DECIMAL(10, 4) DEFAULT 7.0,
    exchange_date TIMESTAMPTZ DEFAULT NOW(),
    payment_terms TEXT,
    delivery_terms TEXT,
    incoterm TEXT,
    delivery_date TIMESTAMPTZ,
    status TEXT DEFAULT 'Received',
    attachments JSONB,
    notes TEXT,
    received_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 proforma_invoices 表（形式发票表）
CREATE TABLE IF NOT EXISTS public.proforma_invoices (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    pi_number TEXT NOT NULL UNIQUE,
    project_id TEXT REFERENCES public.projects(id) ON DELETE SET NULL,
    customer_id TEXT NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    quotation_id TEXT REFERENCES public.quotations(id) ON DELETE SET NULL,
    customer_po_id TEXT REFERENCES public.customer_pos(id) ON DELETE SET NULL,
    items JSONB NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    base_total_amount DECIMAL(15, 2) NOT NULL,
    base_currency TEXT DEFAULT 'CNY',
    exchange_rate DECIMAL(10, 4) DEFAULT 7.0,
    exchange_date TIMESTAMPTZ DEFAULT NOW(),
    payment_terms TEXT,
    delivery_terms TEXT,
    incoterm TEXT,
    port_of_loading TEXT,
    port_of_destination TEXT,
    delivery_date TIMESTAMPTZ,
    bank_info JSONB,
    status TEXT DEFAULT 'Draft',
    valid_until TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    attachments JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 sales_orders 表（销售订单表）
CREATE TABLE IF NOT EXISTS public.sales_orders (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_number TEXT NOT NULL UNIQUE,
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE RESTRICT,
    contract_id TEXT NOT NULL REFERENCES public.contracts(id) ON DELETE RESTRICT,
    customer_id TEXT REFERENCES public.customers(id) ON DELETE SET NULL,
    items JSONB NOT NULL,
    currency TEXT DEFAULT 'USD',
    base_currency TEXT DEFAULT 'CNY',
    exchange_rate DECIMAL(10, 4) DEFAULT 7.0,
    exchange_date TIMESTAMPTZ DEFAULT NOW(),
    delivery_date TIMESTAMPTZ,
    incoterms TEXT,
    status TEXT DEFAULT 'Pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ
);

-- ==================== 第六部分：供应商和采购 ====================

-- 创建 suppliers 表（供应商表）
CREATE TABLE IF NOT EXISTS public.suppliers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    country TEXT,
    address TEXT,
    category TEXT,
    status TEXT DEFAULT 'Active',
    rating DECIMAL(3, 2) DEFAULT 0.0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 supplier_contacts 表（供应商联系人表）
CREATE TABLE IF NOT EXISTS public.supplier_contacts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    supplier_id TEXT NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    title TEXT,
    email TEXT,
    phone TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 purchase_requests 表（请购单表）
CREATE TABLE IF NOT EXISTS public.purchase_requests (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    request_id TEXT NOT NULL UNIQUE,
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE RESTRICT,
    requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    items JSONB NOT NULL,
    reason TEXT NOT NULL,
    budget DECIMAL(15, 2),
    status TEXT DEFAULT 'Pending',
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 purchase_orders 表（采购订单表）
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    po_number TEXT NOT NULL UNIQUE,
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE RESTRICT,
    supplier_id TEXT NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
    sales_order_id TEXT REFERENCES public.sales_orders(id) ON DELETE SET NULL,
    purchase_request_id TEXT REFERENCES public.purchase_requests(id) ON DELETE SET NULL,
    items JSONB NOT NULL,
    currency TEXT DEFAULT 'CNY',
    base_currency TEXT DEFAULT 'CNY',
    exchange_rate DECIMAL(10, 4) DEFAULT 1.0,
    exchange_date TIMESTAMPTZ DEFAULT NOW(),
    delivery_date TIMESTAMPTZ,
    terms TEXT,
    status TEXT DEFAULT 'Pending',
    notes TEXT,
    received_at TIMESTAMPTZ,
    received_by TEXT,
    storage_location TEXT,
    receiving_photos JSONB,
    receiving_notes TEXT,
    qc_status TEXT,
    qc_checked_at TIMESTAMPTZ,
    qc_checked_by TEXT,
    qc_passed BOOLEAN,
    qc_issues TEXT,
    qc_photos JSONB,
    qc_action TEXT,
    qc_checklist JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 product_suppliers 表（产品供应商关联表）
CREATE TABLE IF NOT EXISTS public.product_suppliers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    supplier_id TEXT NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
    supplier_part_number TEXT,
    unit_price DECIMAL(15, 2) NOT NULL,
    currency TEXT DEFAULT 'CNY',
    moq INTEGER,
    lead_time INTEGER,
    tax_rate DECIMAL(5, 2) DEFAULT 0.0,
    priority INTEGER DEFAULT 0,
    is_preferred BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    last_quoted_at TIMESTAMPTZ,
    quotation_ref TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, supplier_id)
);

-- ==================== 第七部分：财务相关表 ====================

-- 创建 invoices 表（发票表）
CREATE TABLE IF NOT EXISTS public.invoices (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    invoice_number TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE RESTRICT,
    ref_id TEXT,
    sales_order_id TEXT REFERENCES public.sales_orders(id) ON DELETE SET NULL,
    purchase_order_id TEXT REFERENCES public.purchase_orders(id) ON DELETE SET NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    base_amount DECIMAL(15, 2) NOT NULL,
    base_currency TEXT DEFAULT 'CNY',
    exchange_rate DECIMAL(10, 4) DEFAULT 7.0,
    exchange_date TIMESTAMPTZ DEFAULT NOW(),
    due_date TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'Draft',
    issued_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 payments 表（付款表）
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    payment_number TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE RESTRICT,
    invoice_id TEXT REFERENCES public.invoices(id) ON DELETE SET NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    base_amount DECIMAL(15, 2) NOT NULL,
    base_currency TEXT DEFAULT 'CNY',
    exchange_rate DECIMAL(10, 4) DEFAULT 7.0,
    exchange_date TIMESTAMPTZ DEFAULT NOW(),
    exchange_difference DECIMAL(15, 2) DEFAULT 0.0,
    method TEXT NOT NULL,
    ref_id TEXT,
    notes TEXT,
    settled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 exchange_rates 表（汇率表）
CREATE TABLE IF NOT EXISTS public.exchange_rates (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    base TEXT NOT NULL,
    quote TEXT NOT NULL,
    rate DECIMAL(10, 4) NOT NULL,
    date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(base, quote, date)
);

-- ==================== 第八部分：物流相关表 ====================

-- 创建 shipping_bookings 表（订舱表）
CREATE TABLE IF NOT EXISTS public.shipping_bookings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    booking_number TEXT NOT NULL UNIQUE,
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE RESTRICT,
    pi_id TEXT REFERENCES public.proforma_invoices(id) ON DELETE SET NULL,
    forwarder_id TEXT,
    forwarder_name TEXT,
    shipping_line_id TEXT,
    shipping_line_name TEXT,
    vessel_name TEXT,
    voyage_number TEXT,
    port_of_loading TEXT NOT NULL,
    port_of_discharge TEXT NOT NULL,
    place_of_receipt TEXT,
    place_of_delivery TEXT,
    etd TIMESTAMPTZ,
    eta TIMESTAMPTZ,
    actual_departure TIMESTAMPTZ,
    actual_arrival TIMESTAMPTZ,
    cargo_description TEXT,
    total_packages INTEGER,
    total_gross_weight DECIMAL(10, 2),
    total_net_weight DECIMAL(10, 2),
    total_volume DECIMAL(10, 3),
    containers JSONB,
    status TEXT DEFAULT 'Draft',
    attachments JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 bills_of_lading 表（提单表）
CREATE TABLE IF NOT EXISTS public.bills_of_lading (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    bl_number TEXT NOT NULL UNIQUE,
    booking_id TEXT NOT NULL REFERENCES public.shipping_bookings(id) ON DELETE RESTRICT,
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE RESTRICT,
    type TEXT NOT NULL,
    shipper JSONB NOT NULL,
    consignee JSONB NOT NULL,
    notify_party JSONB,
    place_of_receipt TEXT,
    port_of_loading TEXT NOT NULL,
    port_of_discharge TEXT NOT NULL,
    place_of_delivery TEXT,
    vessel_name TEXT,
    voyage_number TEXT,
    cargo_description TEXT NOT NULL,
    marks_and_numbers TEXT,
    total_packages INTEGER NOT NULL,
    package_type TEXT,
    total_gross_weight DECIMAL(10, 2) NOT NULL,
    total_volume DECIMAL(10, 3),
    containers JSONB,
    freight_payable TEXT,
    issue_date TIMESTAMPTZ,
    issue_place TEXT,
    issued_by TEXT,
    status TEXT DEFAULT 'Draft',
    attachments JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 commercial_invoices 表（商业发票表）
CREATE TABLE IF NOT EXISTS public.commercial_invoices (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    invoice_number TEXT NOT NULL UNIQUE,
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE RESTRICT,
    pi_id TEXT REFERENCES public.proforma_invoices(id) ON DELETE SET NULL,
    bl_id TEXT REFERENCES public.bills_of_lading(id) ON DELETE SET NULL,
    seller JSONB NOT NULL,
    buyer JSONB NOT NULL,
    items JSONB NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    base_total_amount DECIMAL(15, 2) NOT NULL,
    base_currency TEXT DEFAULT 'CNY',
    exchange_rate DECIMAL(10, 4) DEFAULT 7.0,
    payment_terms TEXT,
    delivery_terms TEXT,
    incoterm TEXT,
    port_of_loading TEXT,
    port_of_discharge TEXT,
    vessel_name TEXT,
    voyage_number TEXT,
    issue_date TIMESTAMPTZ NOT NULL,
    issue_place TEXT,
    issued_by TEXT,
    status TEXT DEFAULT 'Draft',
    attachments JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 packing_lists 表（装箱单表）
CREATE TABLE IF NOT EXISTS public.packing_lists (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    pl_number TEXT NOT NULL UNIQUE,
    invoice_id TEXT NOT NULL REFERENCES public.commercial_invoices(id) ON DELETE RESTRICT,
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE RESTRICT,
    packages JSONB NOT NULL,
    total_packages INTEGER NOT NULL,
    total_gross_weight DECIMAL(10, 2) NOT NULL,
    total_net_weight DECIMAL(10, 2) NOT NULL,
    total_volume DECIMAL(10, 3),
    marks_and_numbers TEXT,
    issue_date TIMESTAMPTZ NOT NULL,
    issue_place TEXT,
    issued_by TEXT,
    status TEXT DEFAULT 'Draft',
    attachments JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 shipping_trackings 表（物流跟踪表）
CREATE TABLE IF NOT EXISTS public.shipping_trackings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    booking_id TEXT REFERENCES public.shipping_bookings(id) ON DELETE SET NULL,
    bl_id TEXT REFERENCES public.bills_of_lading(id) ON DELETE SET NULL,
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE RESTRICT,
    event_type TEXT NOT NULL,
    event_date TIMESTAMPTZ NOT NULL,
    location TEXT,
    description TEXT NOT NULL,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    is_important BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 第九部分：其他业务表 ====================

-- 创建 samples 表（样品表）
CREATE TABLE IF NOT EXISTS public.samples (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    sample_number TEXT NOT NULL UNIQUE,
    project_id TEXT NOT NULL REFERENCES public.projects(id) ON DELETE RESTRICT,
    spec TEXT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    requirement TEXT,
    due_date TIMESTAMPTZ,
    status TEXT DEFAULT 'Applied',
    courier TEXT,
    tracking_no TEXT,
    ship_date TIMESTAMPTZ,
    received_by TEXT,
    received_at TIMESTAMPTZ,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 tags 表（标签表）
CREATE TABLE IF NOT EXISTS public.tags (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL UNIQUE,
    color TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 tasks 表（任务表）
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    description TEXT,
    project_id TEXT REFERENCES public.projects(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_by_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'Pending',
    priority TEXT DEFAULT 'Medium',
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- ==================== 第十部分：创建 updated_at 触发器函数 ====================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为所有表添加 updated_at 触发器
CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_roles BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_customers BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_contacts BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_leads BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_product_categories BEFORE UPDATE ON public.product_categories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_products BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_projects BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_milestones BEFORE UPDATE ON public.milestones FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_project_documents BEFORE UPDATE ON public.project_documents FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_quotations BEFORE UPDATE ON public.quotations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_contracts BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_customer_pos BEFORE UPDATE ON public.customer_pos FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_proforma_invoices BEFORE UPDATE ON public.proforma_invoices FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_sales_orders BEFORE UPDATE ON public.sales_orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_suppliers BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_supplier_contacts BEFORE UPDATE ON public.supplier_contacts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_purchase_requests BEFORE UPDATE ON public.purchase_requests FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_purchase_orders BEFORE UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_product_suppliers BEFORE UPDATE ON public.product_suppliers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_invoices BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_payments BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_shipping_bookings BEFORE UPDATE ON public.shipping_bookings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_bills_of_lading BEFORE UPDATE ON public.bills_of_lading FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_commercial_invoices BEFORE UPDATE ON public.commercial_invoices FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_packing_lists BEFORE UPDATE ON public.packing_lists FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_samples BEFORE UPDATE ON public.samples FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_tasks BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==================== 第十一部分：启用 Row Level Security (RLS) ====================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_pos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proforma_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills_of_lading ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commercial_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packing_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_trackings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- ==================== 第十二部分：创建 RLS 策略 ====================

-- Profiles: 用户可以查看和更新自己的资料
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Customers: 所有认证用户都可以查看和创建客户
CREATE POLICY "Authenticated users can view customers" ON public.customers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create customers" ON public.customers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own customers" ON public.customers FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own customers" ON public.customers FOR DELETE USING (auth.uid() = owner_id);

-- Contacts: 所有认证用户都可以管理联系人
CREATE POLICY "Authenticated users can manage contacts" ON public.contacts FOR ALL USING (auth.role() = 'authenticated');

-- Leads: 用户可以查看和创建线索
CREATE POLICY "Authenticated users can view leads" ON public.leads FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create leads" ON public.leads FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own leads" ON public.leads FOR UPDATE USING (auth.uid() = owner_id);

-- Products: 所有认证用户都可以查看产品
CREATE POLICY "Authenticated users can view products" ON public.products FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage products" ON public.products FOR ALL USING (auth.role() = 'authenticated');

-- Projects: 所有认证用户都可以查看项目
CREATE POLICY "Authenticated users can view projects" ON public.projects FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create projects" ON public.projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = owner_id);

-- Quotations: 所有认证用户都可以管理报价
CREATE POLICY "Authenticated users can manage quotations" ON public.quotations FOR ALL USING (auth.role() = 'authenticated');

-- Contracts: 所有认证用户都可以管理合同
CREATE POLICY "Authenticated users can manage contracts" ON public.contracts FOR ALL USING (auth.role() = 'authenticated');

-- Sales Orders: 所有认证用户都可以管理销售订单
CREATE POLICY "Authenticated users can manage sales_orders" ON public.sales_orders FOR ALL USING (auth.role() = 'authenticated');

-- Suppliers: 所有认证用户都可以管理供应商
CREATE POLICY "Authenticated users can manage suppliers" ON public.suppliers FOR ALL USING (auth.role() = 'authenticated');

-- Purchase Orders: 所有认证用户都可以管理采购订单
CREATE POLICY "Authenticated users can manage purchase_orders" ON public.purchase_orders FOR ALL USING (auth.role() = 'authenticated');

-- Invoices: 所有认证用户都可以管理发票
CREATE POLICY "Authenticated users can manage invoices" ON public.invoices FOR ALL USING (auth.role() = 'authenticated');

-- Payments: 所有认证用户都可以管理付款
CREATE POLICY "Authenticated users can manage payments" ON public.payments FOR ALL USING (auth.role() = 'authenticated');

-- Shipping: 所有认证用户都可以管理物流
CREATE POLICY "Authenticated users can manage shipping" ON public.shipping_bookings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage bills_of_lading" ON public.bills_of_lading FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage commercial_invoices" ON public.commercial_invoices FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage packing_lists" ON public.packing_lists FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage shipping_trackings" ON public.shipping_trackings FOR ALL USING (auth.role() = 'authenticated');

-- Tasks: 用户可以查看和创建任务
CREATE POLICY "Authenticated users can view tasks" ON public.tasks FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create tasks" ON public.tasks FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update assigned tasks" ON public.tasks FOR UPDATE USING (auth.uid() = assigned_to OR auth.uid() = created_by_id);

-- ==================== 第十三部分：创建索引以提高查询性能 ====================

-- Customers 索引
CREATE INDEX IF NOT EXISTS idx_customers_owner_id ON public.customers(owner_id);
CREATE INDEX IF NOT EXISTS idx_customers_status ON public.customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_country ON public.customers(country);
CREATE INDEX IF NOT EXISTS idx_customers_segment ON public.customers(segment);

-- Contacts 索引
CREATE INDEX IF NOT EXISTS idx_contacts_customer_id ON public.contacts(customer_id);
CREATE INDEX IF NOT EXISTS idx_contacts_is_primary ON public.contacts(is_primary);

-- Leads 索引
CREATE INDEX IF NOT EXISTS idx_leads_owner_id ON public.leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);

-- Products 索引
CREATE INDEX IF NOT EXISTS idx_products_part_number ON public.products(part_number);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);

-- Projects 索引
CREATE INDEX IF NOT EXISTS idx_projects_customer_id ON public.projects(customer_id);
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_stage ON public.projects(stage);
CREATE INDEX IF NOT EXISTS idx_projects_project_number ON public.projects(project_number);

-- Quotations 索引
CREATE INDEX IF NOT EXISTS idx_quotations_project_id ON public.quotations(project_id);
CREATE INDEX IF NOT EXISTS idx_quotations_customer_id ON public.quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON public.quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_quotation_number ON public.quotations(quotation_number);

-- Sales Orders 索引
CREATE INDEX IF NOT EXISTS idx_sales_orders_project_id ON public.sales_orders(project_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_contract_id ON public.sales_orders(contract_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON public.sales_orders(status);
CREATE INDEX IF NOT EXISTS idx_sales_orders_order_number ON public.sales_orders(order_number);

-- Purchase Orders 索引
CREATE INDEX IF NOT EXISTS idx_purchase_orders_project_id ON public.purchase_orders(project_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON public.purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON public.purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_po_number ON public.purchase_orders(po_number);

-- Invoices 索引
CREATE INDEX IF NOT EXISTS idx_invoices_project_id ON public.invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_type ON public.invoices(type);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);

-- Payments 索引
CREATE INDEX IF NOT EXISTS idx_payments_project_id ON public.payments(project_id);
CREATE INDEX IF NOT EXISTS idx_payments_type ON public.payments(type);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON public.payments(invoice_id);

-- Shipping 索引
CREATE INDEX IF NOT EXISTS idx_shipping_bookings_project_id ON public.shipping_bookings(project_id);
CREATE INDEX IF NOT EXISTS idx_shipping_bookings_status ON public.shipping_bookings(status);
CREATE INDEX IF NOT EXISTS idx_bills_of_lading_project_id ON public.bills_of_lading(project_id);
CREATE INDEX IF NOT EXISTS idx_shipping_trackings_project_id ON public.shipping_trackings(project_id);

-- Tasks 索引
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);

-- Product Suppliers 索引
CREATE INDEX IF NOT EXISTS idx_product_suppliers_product_id ON public.product_suppliers(product_id);
CREATE INDEX IF NOT EXISTS idx_product_suppliers_supplier_id ON public.product_suppliers(supplier_id);
CREATE INDEX IF NOT EXISTS idx_product_suppliers_is_preferred ON public.product_suppliers(is_preferred);
