# Configuration Management / 配置管理

## Overview / 概述

The Configuration Management feature provides a centralized interface to manage all basic data configurations for the export management system.

配置管理功能提供了一个集中的界面来管理外贸管理系统的所有基础数据配置。

## Features / 功能

### 1. Ports Management / 港口管理
- Add, edit, and delete port information
- Support for seaports, airports, inland ports, and rail terminals
- Bilingual support (English/Chinese)
- Active/Inactive status management

### 2. Incoterms Management / 贸易术语管理
- Manage international commercial terms
- Support for Incoterms 2020, 2010, and 2000
- Complete list of 11 standard terms (EXW, FCA, CPT, CIP, DAP, DPU, DDP, FAS, FOB, CFR, CIF)

### 3. Shipping Methods Management / 运输方式管理
- Configure various shipping methods
- Categories: Sea Freight, Air Freight, Express Courier, Rail, Land Transport, Multimodal
- Customize shipping method names and descriptions

### 4. Payment Terms Management / 付款方式管理
- Configure payment terms and conditions
- Support for T/T, L/C, D/P, D/A, O/A, and other payment types
- Set payment days for credit terms

### 5. Units of Measurement Management / 计量单位管理
- Manage units for products and shipping
- Categories: Quantity, Weight, Volume, Length, Area, Time, Package
- Support for metric and imperial units

## Access / 访问方式

Navigate to **Configuration** in the sidebar menu to access the configuration management page.

在侧边栏菜单中点击 **Configuration** 访问配置管理页面。

## Initial Data Setup / 初始数据设置

The system comes with pre-configured basic data. To load the initial configuration data:

系统自带预配置的基础数据。要加载初始配置数据：

### Method 1: Database Reset (Recommended for Development)
### 方法 1: 数据库重置（开发环境推荐）

```powershell
# Reset database and load all seed data / 重置数据库并加载所有种子数据
supabase db reset
```

This will:
- Reset the database to initial state
- Run all migrations
- Load all seed data including configuration data

这将：
- 将数据库重置到初始状态
- 运行所有迁移
- 加载所有种子数据，包括配置数据

### Method 2: Manual SQL Import
### 方法 2: 手动 SQL 导入

If you only want to load configuration data without resetting the database:

如果只想加载配置数据而不重置数据库：

1. Open Supabase Studio: `http://localhost:54323`
2. Go to **SQL Editor**
3. Open and run `supabase/seeds/config_data.sql`

## Configuration Data Included / 包含的配置数据

### Ports / 港口 (12 entries)
- Chinese ports: Ningbo, Shanghai, Shenzhen, Guangzhou, Qingdao, Tianjin, Xiamen
- International ports: Los Angeles, New York, Hamburg, Rotterdam, Singapore

### Incoterms / 贸易术语 (11 entries)
- EXW, FCA, CPT, CIP, DAP, DPU, DDP, FAS, FOB, CFR, CIF (Incoterms 2020)

### Shipping Methods / 运输方式 (9 entries)
- Sea: FCL, LCL
- Air: Air Freight
- Express: DHL, FedEx, UPS
- Rail, Road Transport, Multimodal

### Payment Terms / 付款方式 (11 entries)
- T/T variations (Advance, 30/60/90 days)
- L/C (Sight, 30/60 days)
- D/P, D/A, O/A

### Units of Measurement / 计量单位 (23 entries)
- Quantity: PCS, SET, PAIR, DOZ
- Weight: KG, G, MT, LB
- Volume: CBM, M3, L
- Length: M, CM, MM, FT, IN
- Package: CTN, BOX, PLT, BAG

## Usage / 使用方法

### Adding New Configuration / 添加新配置

1. Navigate to the desired configuration tab
2. Click **Add [Item]** button
3. Fill in the required fields:
   - **Code**: Unique identifier (e.g., "CNSHA" for Shanghai port)
   - **Name (EN)**: English name
   - **Name (CN)**: Chinese name
   - **Type/Category**: Select appropriate type
   - **Description**: Optional additional information
   - **Active**: Toggle to enable/disable
4. Click **Create** to save

### Editing Configuration / 编辑配置

1. Find the item you want to edit in the table
2. Click the **Edit** button (pencil icon)
3. Modify the fields as needed
4. Click **Update** to save changes

### Deleting Configuration / 删除配置

1. Find the item you want to delete
2. Click the **Delete** button (trash icon)
3. Confirm the deletion in the popup dialog

**Note**: Deleting configuration items that are referenced by other data (e.g., products, orders) may cause errors. Consider marking items as "Inactive" instead of deleting them.

**注意**: 删除被其他数据引用的配置项（如产品、订单）可能导致错误。建议将项目标记为"未激活"而不是删除。

## Best Practices / 最佳实践

1. **Use Standard Codes** / **使用标准代码**
   - For ports: Use UN/LOCODE (e.g., CNSHA for Shanghai)
   - For incoterms: Use official ICC codes (e.g., FOB, CIF)
   - For units: Use standard abbreviations (e.g., KG, M, PCS)

2. **Maintain Bilingual Names** / **维护双语名称**
   - Always provide both English and Chinese names
   - Use official translations when available

3. **Set Appropriate Sort Orders** / **设置合适的排序**
   - Use sort_order to control display sequence
   - Group related items together (e.g., all sea freight methods)

4. **Use Active/Inactive Status** / **使用激活/未激活状态**
   - Instead of deleting, mark items as inactive when no longer used
   - This preserves historical data integrity

5. **Keep Descriptions Updated** / **保持描述更新**
   - Add relevant notes in the description field
   - Include version information for standards (e.g., Incoterms 2020)

## Database Schema / 数据库架构

All configuration tables follow a consistent schema:

所有配置表都遵循一致的架构：

```sql
CREATE TABLE public.{table_name} (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    code TEXT NOT NULL UNIQUE,           -- 唯一代码
    name TEXT NOT NULL,                   -- 英文名称
    name_cn TEXT NOT NULL,                -- 中文名称
    type TEXT NOT NULL,                   -- 类型/分类
    description TEXT,                     -- 描述
    is_active BOOLEAN DEFAULT true,       -- 是否激活
    sort_order INTEGER DEFAULT 0,         -- 排序顺序
    created_at TIMESTAMPTZ DEFAULT NOW(), -- 创建时间
    updated_at TIMESTAMPTZ DEFAULT NOW()  -- 更新时间
);
```

## Troubleshooting / 故障排除

### Issue: Configuration page shows "No data found"
### 问题: 配置页面显示"无数据"

**Solution / 解决方案:**
1. Run database reset: `supabase db reset`
2. Or manually import seed data from `supabase/seeds/config_data.sql`

### Issue: Cannot add new configuration item
### 问题: 无法添加新配置项

**Solution / 解决方案:**
1. Check if the code is unique (no duplicates)
2. Ensure all required fields are filled
3. Verify user has proper permissions

### Issue: Changes not saving
### 问题: 更改未保存

**Solution / 解决方案:**
1. Check browser console for errors
2. Verify database connection
3. Check RLS policies for the table

## Related Files / 相关文件

- Page: `app/config/page.tsx`
- Components: `components/config/*.tsx`
- Database Migration: `supabase/migrations/002_supplementary_tables.sql` (lines 469-642)
- Seed Data: `supabase/seed.sql` (lines 483-572)
- Additional Seed: `supabase/seeds/config_data.sql`

## Future Enhancements / 未来增强

Planned features for future releases:

计划在未来版本中添加的功能：

- [ ] Import/Export configuration data (Excel, CSV)
- [ ] Bulk edit operations
- [ ] Configuration templates
- [ ] Version history and audit log
- [ ] Custom field support
- [ ] Configuration validation rules
- [ ] Integration with external APIs (port codes, exchange rates, etc.)

