# UI 全局配色与视觉分层规范 | Global UI Color & Layering Guide

- **UI组件**: shadcn/ui + Radix UI
- **样式框架**: Tailwind CSS

---

## 1. 背景与分层（Background & Layering）

- **主体背景**（body/root）：极浅灰 `#f8fafc`（`hsl(210 40% 98%)`），各个 Card/内容区之间有自然留白，不全白糊在一起。
- **卡片区域（Card）**：纯白 `#fff`（`hsl(0 0% 100%)`），带有柔和边框 `#e2e8f0`，推荐加微阴影提升层次，四周有统一圆角。
- **分割/装饰线条 muted**：可用 `#f1f5f9` (`hsl(210 40% 96%)`) 提供更多中间灰度缓冲。



---

## 2. 卡片和输入控件（Card & Inputs）

- **Card 标准样式**：
  - 背景：白色 `bg-white`（暗色模式下为深灰）
  - 边框：`border-[#e2e8f0]` `border border-solid`
  - 阴影（可选）：`shadow-sm`/`shadow-md`
  - 圆角：`rounded-xl`
- **Input/Button/Select**：
  - 背景：`#f1f5f9`（浅灰），获得焦点显示主色描边
  - 边框：`#e2e8f0` 或 `#d1d5db`
  - 圆角：`rounded-lg` 或与卡片一致
  - focus/active 用主色高光（如 `ring-primary`）

---

## 3. 暗色模式（Dark Mode）
- **主背景**：`#181a20`（较深不刺眼）
- **Card 背景**：`#22242a` 分离明显
- **边框色**：`#313340`
 
---

## 4. 全局 CSS 变量实现示例（globals.css）
```css
:root {
  --background: 210 40% 98%;       /* body 背景 #f8fafc */
  --card: 0 0% 100%;               /* 卡片专属 #fff */
  --border: 214.3 31.8% 91.4%;     /* 卡片/输入边界 #e2e8f0 */
  --input: 214.3 31.8% 91.4%;      /* 输入组件 #e2e8f0 */
  --radius: 0.75rem;               /* 通用圆角 */
  /* ...其它同主工程实现... */
}
.dark {
  --background: 222.2 40% 10%;     /* #181a20 */
  --card: 222.2 25% 16%;           /* #22242a */
  --border: 220 13% 27%;           /* #313340 */
  /* ...其它... */
}
```

---

## 5. 推荐开发流程（How to Reuse）
- 新页面、组件开发前，直接查阅本文档获取配色和分层标准
- 保证页面主背景灰/卡片白/空间分离/输入组件聚焦主色描边，保持一致感
- 如需调整可与 UI 负责人沟通后再次修订本文件

---

 

本文件为团队长期标准，每次全局/局部风格调整需同步更新。
