-- ==================== 供应商详情扩展 ====================
-- 添加供应商表的缺失字段和银行信息表
-- Migration: 008_add_supplier_details.sql

-- 1. 添加供应商表缺失字段
ALTER TABLE public.suppliers
ADD COLUMN IF NOT EXISTS business_registration_no TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS billing_address JSONB,
ADD COLUMN IF NOT EXISTS shipping_address JSONB;

-- 添加注释
COMMENT ON COLUMN public.suppliers.business_registration_no IS '商业注册号';
COMMENT ON COLUMN public.suppliers.industry IS '行业';
COMMENT ON COLUMN public.suppliers.review_count IS '评论数量';
COMMENT ON COLUMN public.suppliers.billing_address IS '账单地址 (JSON格式: {address_line1, address_line2, city, state, postal_code, country})';
COMMENT ON COLUMN public.suppliers.shipping_address IS '送货地址 (JSON格式: {address_line1, address_line2, city, state, postal_code, country})';

-- 2. 创建供应商银行账户表
CREATE TABLE IF NOT EXISTS public.supplier_bank_accounts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    supplier_id TEXT NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_holder_name TEXT,
    swift_code TEXT,
    iban TEXT,
    currency TEXT DEFAULT 'USD',
    is_primary BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_supplier_bank_accounts_supplier_id 
ON public.supplier_bank_accounts(supplier_id);

CREATE INDEX IF NOT EXISTS idx_supplier_bank_accounts_is_primary 
ON public.supplier_bank_accounts(supplier_id, is_primary) 
WHERE is_primary = true;

-- 添加注释
COMMENT ON TABLE public.supplier_bank_accounts IS '供应商银行账户表';
COMMENT ON COLUMN public.supplier_bank_accounts.bank_name IS '银行名称';
COMMENT ON COLUMN public.supplier_bank_accounts.account_number IS '账户号码';
COMMENT ON COLUMN public.supplier_bank_accounts.account_holder_name IS '账户持有人姓名';
COMMENT ON COLUMN public.supplier_bank_accounts.swift_code IS 'SWIFT代码';
COMMENT ON COLUMN public.supplier_bank_accounts.iban IS 'IBAN号码';
COMMENT ON COLUMN public.supplier_bank_accounts.is_primary IS '是否为主账户';

-- 3. 添加供应商联系人头像字段
ALTER TABLE public.supplier_contacts
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

COMMENT ON COLUMN public.supplier_contacts.avatar_url IS '联系人头像URL';

-- 4. 创建更新时间触发器函数（如果不存在）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为供应商银行账户表添加更新时间触发器
DROP TRIGGER IF EXISTS update_supplier_bank_accounts_updated_at ON public.supplier_bank_accounts;
CREATE TRIGGER update_supplier_bank_accounts_updated_at
    BEFORE UPDATE ON public.supplier_bank_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. 启用 RLS (Row Level Security)
ALTER TABLE public.supplier_bank_accounts ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略：用户只能查看和编辑自己创建的或有权访问的供应商的银行账户
-- 注意：这里使用简单的策略，实际应用中可能需要更复杂的权限控制
CREATE POLICY "Users can view supplier bank accounts"
    ON public.supplier_bank_accounts
    FOR SELECT
    USING (true); -- 暂时允许所有用户查看，后续可根据实际需求调整

CREATE POLICY "Users can insert supplier bank accounts"
    ON public.supplier_bank_accounts
    FOR INSERT
    WITH CHECK (true); -- 暂时允许所有用户插入，后续可根据实际需求调整

CREATE POLICY "Users can update supplier bank accounts"
    ON public.supplier_bank_accounts
    FOR UPDATE
    USING (true); -- 暂时允许所有用户更新，后续可根据实际需求调整

CREATE POLICY "Users can delete supplier bank accounts"
    ON public.supplier_bank_accounts
    FOR DELETE
    USING (true); -- 暂时允许所有用户删除，后续可根据实际需求调整
