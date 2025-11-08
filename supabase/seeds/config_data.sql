-- ExportCRM 配置基础数据种子脚本
-- 为配置页面添加初始数据

-- ==================== 港口信息 ====================
INSERT INTO public.ports (code, name, name_cn, country, country_cn, city, type, is_active, sort_order) VALUES
('CNNBO', 'Ningbo', '宁波', 'China', '中国', 'Ningbo', 'Seaport', true, 1),
('CNSHA', 'Shanghai', '上海', 'China', '中国', 'Shanghai', 'Seaport', true, 2),
('CNSZX', 'Shenzhen', '深圳', 'China', '中国', 'Shenzhen', 'Seaport', true, 3),
('CNGZH', 'Guangzhou', '广州', 'China', '中国', 'Guangzhou', 'Seaport', true, 4),
('CNQIN', 'Qingdao', '青岛', 'China', '中国', 'Qingdao', 'Seaport', true, 5),
('CNTXG', 'Tianjin', '天津', 'China', '中国', 'Tianjin', 'Seaport', true, 6),
('CNXMN', 'Xiamen', '厦门', 'China', '中国', 'Xiamen', 'Seaport', true, 7),
('USLAX', 'Los Angeles', '洛杉矶', 'United States', '美国', 'Los Angeles', 'Seaport', true, 10),
('USNYC', 'New York', '纽约', 'United States', '美国', 'New York', 'Seaport', true, 11),
('DEHAM', 'Hamburg', '汉堡', 'Germany', '德国', 'Hamburg', 'Seaport', true, 20),
('NLRTM', 'Rotterdam', '鹿特丹', 'Netherlands', '荷兰', 'Rotterdam', 'Seaport', true, 21),
('SGSIN', 'Singapore', '新加坡', 'Singapore', '新加坡', 'Singapore', 'Seaport', true, 30)
ON CONFLICT (code) DO NOTHING;

-- ==================== 贸易术语 Incoterms ====================
INSERT INTO public.incoterms (code, name, name_cn, version, is_active, sort_order) VALUES
('EXW', 'Ex Works', '工厂交货', '2020', true, 1),
('FCA', 'Free Carrier', '货交承运人', '2020', true, 2),
('CPT', 'Carriage Paid To', '运费付至', '2020', true, 3),
('CIP', 'Carriage and Insurance Paid To', '运费、保险费付至', '2020', true, 4),
('DAP', 'Delivered at Place', '目的地交货', '2020', true, 5),
('DPU', 'Delivered at Place Unloaded', '卸货地交货', '2020', true, 6),
('DDP', 'Delivered Duty Paid', '完税后交货', '2020', true, 7),
('FAS', 'Free Alongside Ship', '船边交货', '2020', true, 8),
('FOB', 'Free On Board', '装运港船上交货', '2020', true, 9),
('CFR', 'Cost and Freight', '成本加运费', '2020', true, 10),
('CIF', 'Cost, Insurance and Freight', '成本、保险费加运费', '2020', true, 11)
ON CONFLICT (code) DO NOTHING;

-- ==================== 运输方式 ====================
INSERT INTO public.shipping_methods (code, name, name_cn, type, is_active, sort_order) VALUES
('SEA_FCL', 'Sea Freight FCL', '海运整柜', 'Sea', true, 1),
('SEA_LCL', 'Sea Freight LCL', '海运拼柜', 'Sea', true, 2),
('AIR', 'Air Freight', '空运', 'Air', true, 10),
('EXPRESS_DHL', 'DHL Express', 'DHL快递', 'Courier', true, 20),
('EXPRESS_FEDEX', 'FedEx Express', 'FedEx快递', 'Courier', true, 21),
('EXPRESS_UPS', 'UPS Express', 'UPS快递', 'Courier', true, 22),
('RAIL', 'Rail Transport', '铁路运输', 'Rail', true, 30),
('TRUCK', 'Road Transport', '公路运输', 'Land', true, 40),
('MULTIMODAL', 'Multimodal Transport', '多式联运', 'Multimodal', true, 50)
ON CONFLICT (code) DO NOTHING;

-- ==================== 付款方式 ====================
INSERT INTO public.payment_terms (code, name, name_cn, type, days, is_active, sort_order) VALUES
('TT_ADVANCE', '100% T/T in Advance', '100%预付', 'Advance', 0, true, 1),
('TT_30', '30% Deposit + 70% Before Shipment', '30%定金+70%发货前', 'TT', 0, true, 2),
('TT30', 'T/T 30 Days', '电汇30天', 'TT', 30, true, 10),
('TT60', 'T/T 60 Days', '电汇60天', 'TT', 60, true, 11),
('TT90', 'T/T 90 Days', '电汇90天', 'TT', 90, true, 12),
('LC_SIGHT', 'L/C at Sight', '即期信用证', 'LC', 0, true, 20),
('LC30', 'L/C 30 Days', '远期信用证30天', 'LC', 30, true, 21),
('LC60', 'L/C 60 Days', '远期信用证60天', 'LC', 60, true, 22),
('DP', 'D/P (Documents against Payment)', '付款交单', 'DP', 0, true, 30),
('DA30', 'D/A 30 Days', '承兑交单30天', 'DA', 30, true, 40),
('OA30', 'O/A 30 Days', '记账30天', 'OA', 30, true, 50)
ON CONFLICT (code) DO NOTHING;

-- ==================== 计量单位 ====================
INSERT INTO public.units_of_measurement (code, name, name_cn, type, is_active, sort_order) VALUES
-- 数量单位
('PCS', 'Piece', '个', 'Quantity', true, 1),
('SET', 'Set', '套', 'Quantity', true, 2),
('PAIR', 'Pair', '对', 'Quantity', true, 3),
('DOZ', 'Dozen', '打', 'Quantity', true, 4),
-- 重量单位
('KG', 'Kilogram', '公斤', 'Weight', true, 10),
('G', 'Gram', '克', 'Weight', true, 11),
('MT', 'Metric Ton', '公吨', 'Weight', true, 12),
('LB', 'Pound', '磅', 'Weight', true, 13),
-- 体积单位
('CBM', 'Cubic Meter', '立方米', 'Volume', true, 20),
('M3', 'Cubic Meter', '立方米', 'Volume', true, 21),
('L', 'Liter', '升', 'Volume', true, 22),
-- 长度单位
('M', 'Meter', '米', 'Length', true, 30),
('CM', 'Centimeter', '厘米', 'Length', true, 31),
('MM', 'Millimeter', '毫米', 'Length', true, 32),
('FT', 'Foot', '英尺', 'Length', true, 33),
('IN', 'Inch', '英寸', 'Length', true, 34),
-- 包装单位
('CTN', 'Carton', '箱', 'Package', true, 40),
('BOX', 'Box', '盒', 'Package', true, 41),
('PLT', 'Pallet', '托盘', 'Package', true, 42),
('BAG', 'Bag', '袋', 'Package', true, 43)
ON CONFLICT (code) DO NOTHING;

