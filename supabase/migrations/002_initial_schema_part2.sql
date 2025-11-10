-- ==================== ExportCRM 完整数据库初始化脚本 Part 2 ====================
-- 这是 000_initial_schema_complete.sql 的续集
-- 包含：用户设置、系统设置、外贸基础配置、存储桶、触发器和RLS策略

-- ==================== 第十九部分：用户和系统设置 ====================

-- 创建 user_settings 表（用户设置表）
CREATE TABLE IF NOT EXISTS public.user_settings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    smtp_host TEXT,
    smtp_port INTEGER,
    smtp_user TEXT,
    smtp_pass TEXT,
    smtp_from TEXT,
    smtp_secure BOOLEAN DEFAULT false,
    rfq_email_company_name TEXT,
    rfq_email_subject TEXT,
    rfq_email_greeting TEXT,
    rfq_email_intro TEXT,
    rfq_email_closing TEXT,
    rfq_email_signature TEXT,
    rfq_email_footer TEXT,
    language TEXT DEFAULT 'zh',
    timezone TEXT DEFAULT 'Asia/Shanghai',
    currency TEXT DEFAULT 'CNY',
    theme TEXT DEFAULT 'light',
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 system_settings 表（系统设置表）
CREATE TABLE IF NOT EXISTS public.system_settings (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 第二十部分：外贸基础数据配置表 ====================

-- 创建 ports 表（港口信息表）
CREATE TABLE IF NOT EXISTS public.ports (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    name_cn TEXT NOT NULL,
    country TEXT NOT NULL,
    country_cn TEXT NOT NULL,
    city TEXT,
    type TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 incoterms 表（贸易术语表）
CREATE TABLE IF NOT EXISTS public.incoterms (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    name_cn TEXT NOT NULL,
    description TEXT,
    version TEXT DEFAULT '2020',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 shipping_methods 表（运输方式表）
CREATE TABLE IF NOT EXISTS public.shipping_methods (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    name_cn TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 payment_terms 表（付款方式表）
CREATE TABLE IF NOT EXISTS public.payment_terms (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    name_cn TEXT NOT NULL,
    type TEXT NOT NULL,
    days INTEGER,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 packing_types 表（包装类型表）
CREATE TABLE IF NOT EXISTS public.packing_types (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    name_cn TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 container_types 表（集装箱类型表）
CREATE TABLE IF NOT EXISTS public.container_types (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    name_cn TEXT NOT NULL,
    size TEXT,
    capacity TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 certifications 表（证书/认证类型表）
CREATE TABLE IF NOT EXISTS public.certifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    name_cn TEXT NOT NULL,
    issuer TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 trade_types 表（贸易类型表）
CREATE TABLE IF NOT EXISTS public.trade_types (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    name_cn TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 units_of_measurement 表（计量单位表）
CREATE TABLE IF NOT EXISTS public.units_of_measurement (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    name_cn TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 insurance_types 表（保险类型表）
CREATE TABLE IF NOT EXISTS public.insurance_types (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    name_cn TEXT NOT NULL,
    coverage TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 shipping_lines 表（船公司/承运人表）
CREATE TABLE IF NOT EXISTS public.shipping_lines (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    name_cn TEXT NOT NULL,
    type TEXT NOT NULL,
    website TEXT,
    contact TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建 customs_documents 表（报关文件类型表）
CREATE TABLE IF NOT EXISTS public.customs_documents (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    name_cn TEXT NOT NULL,
    required BOOLEAN DEFAULT false,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== 第二十一部分：创建存储桶 ====================

-- 创建 avatars 存储桶（用于用户头像）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,
  ARRAY['image/jpeg','image/jpg','image/png','image/gif','image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 创建 documents 存储桶（用于文档存储）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  52428800,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'text/plain',
    'text/csv'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- 创建 products 存储桶（用于产品图片和附件）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  true,
  52428800,
  ARRAY[
    'image/jpeg','image/jpg','image/png','image/gif','image/webp',
    'application/pdf','application/zip','text/plain'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ==================== 第二十二部分：创建 updated_at 触发器 ====================

CREATE TRIGGER set_updated_at_customers BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_customer_contacts BEFORE UPDATE ON public.customer_contacts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_leads BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_product_categories BEFORE UPDATE ON public.product_categories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_products BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_suppliers BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_supplier_contacts BEFORE UPDATE ON public.supplier_contacts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_projects BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_quotations BEFORE UPDATE ON public.quotations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_orders BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_samples BEFORE UPDATE ON public.samples FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_invoices BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_payments BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_purchase_orders BEFORE UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_approval_flows BEFORE UPDATE ON public.approval_flows FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_approvals BEFORE UPDATE ON public.approvals FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_workflow_definitions BEFORE UPDATE ON public.workflow_definitions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_workflow_instances BEFORE UPDATE ON public.workflow_instances FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_workflow_node_instances BEFORE UPDATE ON public.workflow_node_instances FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_logistics_inquiries BEFORE UPDATE ON public.logistics_inquiries FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_quotation_costs BEFORE UPDATE ON public.quotation_costs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_logistics_suppliers BEFORE UPDATE ON public.logistics_suppliers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_rfq_records BEFORE UPDATE ON public.rfq_records FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_rfq_supplier_records BEFORE UPDATE ON public.rfq_supplier_records FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_project_profit_details BEFORE UPDATE ON public.project_profit_details FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_payment_reconciliations BEFORE UPDATE ON public.payment_reconciliations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_exceptions BEFORE UPDATE ON public.exceptions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_inspections BEFORE UPDATE ON public.inspections FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_templates BEFORE UPDATE ON public.templates FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_user_settings BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_system_settings BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_ports BEFORE UPDATE ON public.ports FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_incoterms BEFORE UPDATE ON public.incoterms FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_shipping_methods BEFORE UPDATE ON public.shipping_methods FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_payment_terms BEFORE UPDATE ON public.payment_terms FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_packing_types BEFORE UPDATE ON public.packing_types FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_container_types BEFORE UPDATE ON public.container_types FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_certifications BEFORE UPDATE ON public.certifications FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_trade_types BEFORE UPDATE ON public.trade_types FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_units_of_measurement BEFORE UPDATE ON public.units_of_measurement FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_insurance_types BEFORE UPDATE ON public.insurance_types FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_shipping_lines BEFORE UPDATE ON public.shipping_lines FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_customs_documents BEFORE UPDATE ON public.customs_documents FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==================== 第二十三部分：启用 RLS ====================

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_node_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfq_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfq_supplier_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_profit_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_profit_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exception_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exception_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sample_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incoterms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packing_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.container_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units_of_measurement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customs_documents ENABLE ROW LEVEL SECURITY;

-- ==================== 第二十四部分：创建 RLS 策略 ====================

-- 所有认证用户可以访问业务数据（简化策略，适合小型团队）
CREATE POLICY "Authenticated users can manage customers" ON public.customers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage customer_contacts" ON public.customer_contacts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage leads" ON public.leads FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage product_categories" ON public.product_categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage products" ON public.products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage suppliers" ON public.suppliers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage supplier_contacts" ON public.supplier_contacts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage projects" ON public.projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage quotations" ON public.quotations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage quotation_items" ON public.quotation_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage orders" ON public.orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage order_items" ON public.order_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage samples" ON public.samples FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage invoices" ON public.invoices FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage payments" ON public.payments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage purchase_orders" ON public.purchase_orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage purchase_order_items" ON public.purchase_order_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage approval_flows" ON public.approval_flows FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage approvals" ON public.approvals FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view approval_history" ON public.approval_history FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can manage workflow_definitions" ON public.workflow_definitions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage workflow_instances" ON public.workflow_instances FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage workflow_node_instances" ON public.workflow_node_instances FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage workflow_actions" ON public.workflow_actions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage logistics_inquiries" ON public.logistics_inquiries FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage logistics_quotes" ON public.logistics_quotes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage quotation_costs" ON public.quotation_costs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage logistics_suppliers" ON public.logistics_suppliers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage rfq_records" ON public.rfq_records FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage rfq_supplier_records" ON public.rfq_supplier_records FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage project_costs" ON public.project_costs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage project_profit_reports" ON public.project_profit_reports FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage project_profit_details" ON public.project_profit_details FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage payment_reconciliations" ON public.payment_reconciliations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage exceptions" ON public.exceptions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view exception_history" ON public.exception_history FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage exception_reminders" ON public.exception_reminders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage inspections" ON public.inspections FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage sample_costs" ON public.sample_costs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage files" ON public.files FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage templates" ON public.templates FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Users can manage own settings" ON public.user_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can view system_settings" ON public.system_settings FOR SELECT USING (auth.role() = 'authenticated');

-- 外贸基础数据配置表策略（所有认证用户可读）
CREATE POLICY "Authenticated users can view ports" ON public.ports FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view incoterms" ON public.incoterms FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view shipping_methods" ON public.shipping_methods FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view payment_terms" ON public.payment_terms FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view packing_types" ON public.packing_types FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view container_types" ON public.container_types FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view certifications" ON public.certifications FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view trade_types" ON public.trade_types FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view units_of_measurement" ON public.units_of_measurement FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view insurance_types" ON public.insurance_types FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view shipping_lines" ON public.shipping_lines FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view customs_documents" ON public.customs_documents FOR SELECT USING (auth.role() = 'authenticated');

-- ==================== 第二十五部分：存储桶 RLS 策略 ====================

-- Avatars 存储桶策略
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Documents 存储桶策略
DROP POLICY IF EXISTS "Authenticated users can view documents" ON storage.objects;
CREATE POLICY "Authenticated users can view documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update documents" ON storage.objects;
CREATE POLICY "Authenticated users can update documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete documents" ON storage.objects;
CREATE POLICY "Authenticated users can delete documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- Products 存储桶策略
DROP POLICY IF EXISTS "Products bucket is publicly readable" ON storage.objects;
CREATE POLICY "Products bucket is publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Authenticated users can upload to products bucket" ON storage.objects;
CREATE POLICY "Authenticated users can upload to products bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update product files" ON storage.objects;
CREATE POLICY "Authenticated users can update product files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'products' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete from products bucket" ON storage.objects;
CREATE POLICY "Authenticated users can delete from products bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'products' AND auth.role() = 'authenticated');

-- ==================== 完成 ====================
SELECT '✅ ExportCRM 数据库初始化完成！' AS status;
