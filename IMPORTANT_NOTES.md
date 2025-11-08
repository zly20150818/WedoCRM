# Important Notes / 重要说明

## English Version

### 🌐 No Internationalization

**This template does NOT include internationalization (i18n) functionality.**

- All UI text is in English
- No translation files or language switching
- Simpler codebase and easier to maintain

### Why No i18n?

1. **Simplicity** - Reduces complexity for developers who only need English
2. **Performance** - No overhead from translation libraries
3. **Easier to Start** - Focus on building features, not managing translations
4. **Flexible** - Easy to add i18n later if needed

### If You Need Multi-Language Support

You can add it yourself using:

1. **next-intl** (Recommended for Next.js App Router)
```bash
npm install next-intl
```

2. **react-i18next**
```bash
npm install react-i18next i18next
```

3. **Create your own Context** (Simple approach)
- Create a `language-provider.tsx` file
- Define translation dictionaries
- Use React Context to manage language state

### Template Features

✅ **What's Included:**
- Supabase Authentication
- Protected Routes
- Responsive Layout (Sidebar + Header)
- Theme Support (Light/Dark)
- User Profile Management
- Settings Page
- Modern UI Components (shadcn/ui)

❌ **What's NOT Included:**
- Internationalization (i18n)
- Multi-language support
- Translation files
- Business logic
- Business-specific pages

---

## 中文版本

### 🌐 无国际化功能

**此模板不包含国际化（i18n）功能。**

- 所有UI文本使用英文
- 没有翻译文件或语言切换
- 代码结构更简单，更易维护

### 为什么不包含国际化？

1. **简洁性** - 为只需要英文的开发者减少复杂度
2. **性能** - 没有翻译库的开销
3. **快速开始** - 专注于构建功能，而非管理翻译
4. **灵活性** - 如有需要，可以后续轻松添加

### 如果需要多语言支持

你可以自行添加，使用以下方案：

1. **next-intl** （推荐用于 Next.js App Router）
```bash
npm install next-intl
```

2. **react-i18next**
```bash
npm install react-i18next i18next
```

3. **创建自己的 Context**（简单方法）
- 创建 `language-provider.tsx` 文件
- 定义翻译字典
- 使用 React Context 管理语言状态

### 模板功能

✅ **包含的功能：**
- Supabase 认证
- 受保护的路由
- 响应式布局（侧边栏 + 标题栏）
- 主题支持（明暗模式）
- 用户资料管理
- 设置页面
- 现代 UI 组件（shadcn/ui）

❌ **不包含的功能：**
- 国际化（i18n）
- 多语言支持
- 翻译文件
- 业务逻辑
- 业务相关页面

---

## Quick Start / 快速开始

### English
See `QUICK_START.md` for setup instructions.

### 中文
查看 `QUICK_START.md` 了解安装步骤。

---

## Documentation / 文档

### English Documentation
- `TEMPLATE_README.md` - Full documentation in English
- `HOW_TO_USE.md` - Usage examples and scenarios
- `PROJECT_OVERVIEW.md` - Project structure and overview

### 中文文档
- `TEMPLATE_README_CN.md` - 完整的中文文档
- `HOW_TO_USE.md` - 使用示例和场景（中英文）
- `PROJECT_OVERVIEW.md` - 项目结构和概览（中英文）

---

## Support / 支持

If you have questions / 如有问题：

1. Check the documentation / 查看文档
2. Review code comments / 查看代码注释
3. Search online / 在线搜索

**Remember / 记住：** This is a base template. You need to add your own business logic and features.

**这是一个基础模板，你需要添加自己的业务逻辑和功能。**

