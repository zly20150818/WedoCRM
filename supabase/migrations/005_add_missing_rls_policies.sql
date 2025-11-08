-- 添加缺失的 RLS 策略
-- 为供应商联系人和采购请求表添加策略

-- supplier_contacts 策略
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'supplier_contacts' 
        AND policyname = 'Authenticated users can manage supplier_contacts'
    ) THEN
        CREATE POLICY "Authenticated users can manage supplier_contacts" 
        ON public.supplier_contacts FOR ALL 
        USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- purchase_requests 策略
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'purchase_requests' 
        AND policyname = 'Authenticated users can manage purchase_requests'
    ) THEN
        CREATE POLICY "Authenticated users can manage purchase_requests" 
        ON public.purchase_requests FOR ALL 
        USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- product_categories 策略
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'product_categories' 
        AND policyname = 'Authenticated users can view product_categories'
    ) THEN
        CREATE POLICY "Authenticated users can view product_categories" 
        ON public.product_categories FOR SELECT 
        USING (auth.role() = 'authenticated');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'product_categories' 
        AND policyname = 'Authenticated users can manage product_categories'
    ) THEN
        CREATE POLICY "Authenticated users can manage product_categories" 
        ON public.product_categories FOR ALL 
        USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- quotation_items 策略
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'quotation_items' 
        AND policyname = 'Authenticated users can manage quotation_items'
    ) THEN
        CREATE POLICY "Authenticated users can manage quotation_items" 
        ON public.quotation_items FOR ALL 
        USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- product_suppliers 策略（补充）
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'product_suppliers' 
        AND policyname = 'Authenticated users can manage product_suppliers'
    ) THEN
        CREATE POLICY "Authenticated users can manage product_suppliers" 
        ON public.product_suppliers FOR ALL 
        USING (auth.role() = 'authenticated');
    END IF;
END $$;

