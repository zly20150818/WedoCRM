-- ExportCRM Supabase 数据库迁移脚本 - 补充表
-- 基于 Prisma Schema 的补充表（审批、通知、RFQ、工作流等）
-- 在运行 001_initial_schema.sql 之后运行此脚本

-- ==================== 补充第一部分：审批系统 ====================

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

-- ==================== 补充第二部分：通知系统 ====================

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

-- ==================== 补充第三部分：工作流系统 ====================

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

-- ==================== 补充第四部分：物流询价和费用 ====================

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

-- ==================== 补充第五部分：RFQ 管理 ====================

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

-- ==================== 补充第六部分：项目成本和利润 ====================

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

-- ==================== 补充第七部分：异常处理 ====================

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

-- ==================== 补充第八部分：其他业务表 ====================

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

-- ==================== 补充第九部分：用户和系统设置 ====================

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

-- ==================== 补充第十部分：外贸基础数据配置表 ====================

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

-- ==================== 补充第十一部分：创建 updated_at 触发器 ====================

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

-- ==================== 补充第十二部分：启用 RLS ====================

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

-- ==================== 补充第十三部分：创建 RLS 策略 ====================

-- 审批系统策略
CREATE POLICY "Authenticated users can manage approval_flows" ON public.approval_flows FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage approvals" ON public.approvals FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view approval_history" ON public.approval_history FOR SELECT USING (auth.role() = 'authenticated');

-- 通知系统策略
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- 工作流系统策略
CREATE POLICY "Authenticated users can manage workflow_definitions" ON public.workflow_definitions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage workflow_instances" ON public.workflow_instances FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage workflow_node_instances" ON public.workflow_node_instances FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage workflow_actions" ON public.workflow_actions FOR ALL USING (auth.role() = 'authenticated');

-- 物流询价策略
CREATE POLICY "Authenticated users can manage logistics_inquiries" ON public.logistics_inquiries FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage logistics_quotes" ON public.logistics_quotes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage quotation_costs" ON public.quotation_costs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage logistics_suppliers" ON public.logistics_suppliers FOR ALL USING (auth.role() = 'authenticated');

-- RFQ 策略
CREATE POLICY "Authenticated users can manage rfq_records" ON public.rfq_records FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage rfq_supplier_records" ON public.rfq_supplier_records FOR ALL USING (auth.role() = 'authenticated');

-- 项目成本和利润策略
CREATE POLICY "Authenticated users can manage project_costs" ON public.project_costs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage project_profit_reports" ON public.project_profit_reports FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage project_profit_details" ON public.project_profit_details FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage payment_reconciliations" ON public.payment_reconciliations FOR ALL USING (auth.role() = 'authenticated');

-- 异常处理策略
CREATE POLICY "Authenticated users can manage exceptions" ON public.exceptions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view exception_history" ON public.exception_history FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage exception_reminders" ON public.exception_reminders FOR ALL USING (auth.role() = 'authenticated');

-- 其他业务表策略
CREATE POLICY "Authenticated users can manage inspections" ON public.inspections FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage sample_costs" ON public.sample_costs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage files" ON public.files FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage templates" ON public.templates FOR ALL USING (auth.role() = 'authenticated');

-- 用户和系统设置策略
CREATE POLICY "Users can manage own settings" ON public.user_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can view system_settings" ON public.system_settings FOR SELECT USING (auth.role() = 'authenticated');

-- 外贸基础数据配置表策略（所有认证用户可读，管理员可写）
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

-- ==================== 补充第十四部分：创建补充索引 ====================

-- 审批系统索引
CREATE INDEX IF NOT EXISTS idx_approvals_flow_id ON public.approvals(flow_id);
CREATE INDEX IF NOT EXISTS idx_approvals_requester_id ON public.approvals(requester_id);
CREATE INDEX IF NOT EXISTS idx_approvals_current_approver_id ON public.approvals(current_approver_id);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON public.approvals(status);
CREATE INDEX IF NOT EXISTS idx_approval_history_approval_id ON public.approval_history(approval_id);

-- 通知系统索引
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- 工作流系统索引
CREATE INDEX IF NOT EXISTS idx_workflow_instances_definition_id ON public.workflow_instances(definition_id);
CREATE INDEX IF NOT EXISTS idx_workflow_instances_project_id ON public.workflow_instances(project_id);
CREATE INDEX IF NOT EXISTS idx_workflow_node_instances_instance_id ON public.workflow_node_instances(instance_id);
CREATE INDEX IF NOT EXISTS idx_workflow_node_instances_assigned_to ON public.workflow_node_instances(assigned_to);

-- RFQ 索引
CREATE INDEX IF NOT EXISTS idx_rfq_records_project_id ON public.rfq_records(project_id);
CREATE INDEX IF NOT EXISTS idx_rfq_records_sent_by ON public.rfq_records(sent_by);
CREATE INDEX IF NOT EXISTS idx_rfq_supplier_records_rfq_id ON public.rfq_supplier_records(rfq_id);
CREATE INDEX IF NOT EXISTS idx_rfq_supplier_records_supplier_id ON public.rfq_supplier_records(supplier_id);

-- 异常处理索引
CREATE INDEX IF NOT EXISTS idx_exceptions_project_id ON public.exceptions(project_id);
CREATE INDEX IF NOT EXISTS idx_exceptions_assigned_to ON public.exceptions(assigned_to);
CREATE INDEX IF NOT EXISTS idx_exceptions_status ON public.exceptions(status);
CREATE INDEX IF NOT EXISTS idx_exceptions_type ON public.exceptions(type);

-- 项目成本和利润索引
CREATE INDEX IF NOT EXISTS idx_project_costs_project_id ON public.project_costs(project_id);
CREATE INDEX IF NOT EXISTS idx_project_profit_details_project_id ON public.project_profit_details(project_id);
CREATE INDEX IF NOT EXISTS idx_project_profit_details_calculated_by ON public.project_profit_details(calculated_by);

-- 用户设置索引
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- 外贸基础数据配置表索引
CREATE INDEX IF NOT EXISTS idx_ports_code ON public.ports(code);
CREATE INDEX IF NOT EXISTS idx_ports_country ON public.ports(country);
CREATE INDEX IF NOT EXISTS idx_incoterms_code ON public.incoterms(code);
CREATE INDEX IF NOT EXISTS idx_shipping_methods_code ON public.shipping_methods(code);

