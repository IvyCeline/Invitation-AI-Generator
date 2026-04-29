# 汇金国际 - 公司邀请函

汇金国际 (Huijin International) 活动邀请函网页，参考 [Greenvelope](https://www.greenvelope.com) 风格设计。

**公司官网**: [www.huijin.com.au](https://www.huijin.com.au/)

## 功能特点

- 🎴 **翻转卡片效果** - 优雅的 3D 翻转动画展示邀请信息
- ✨ **精美动效** - 使用 Framer Motion 实现流畅的页面动画
- 📝 **RSVP 表单** - 完整的出席确认功能
- 📅 **日历集成** - 支持添加到 Google 日历、Outlook、Apple 日历
- 📱 **响应式设计** - 完美适配各种设备
- 🎨 **高级视觉效果** - 金色主题、玻璃态效果、动态背景

## 快速开始

### 安装依赖

```bash
cd company-invitation
pnpm install
# 或
npm install
```

### 启动开发服务器

```bash
pnpm dev
# 或
npm run dev
```

访问 http://localhost:3001 查看邀请函

### 构建生产版本

```bash
pnpm build
# 或
npm run build
```

## 自定义配置

打开 `src/App.tsx` 文件，修改 `invitationConfig` 对象来自定义您的邀请函：

```typescript
export const invitationConfig = {
  company: {
    name: "汇金国际",
    nameEn: "HUIJIN INTERNATIONAL",
    logo: "logo图片URL",
    tagline: "专注您的财富，让您专注更重要的事",
    website: "https://www.huijin.com.au/",
  },
  event: {
    title: "2025年度客户答谢晚宴",
    subtitle: "携手共赢 · 财富未来",
    date: "2025年12月20日",
    time: "18:00 - 22:00",
    weekday: "星期六",
    location: "悉尼四季酒店",
    address: "199 George St, Sydney NSW 2000",
    description: "汇金国际诚挚邀请您出席...",
    highlights: ["年度市场回顾", "2026投资展望", "客户答谢颁奖", "精致晚宴美食"],
    dressCode: "商务正装 Business Attire",
    contact: {
      name: "汇金国际活动组",
      email: "info@huijin.com.au",
      phone: "1800 006 668",
    },
    startDateTime: "2025-12-20T18:00:00",
    endDateTime: "2025-12-20T22:00:00",
  },
};
```

## 技术栈

- **React 18** - 用户界面库
- **TypeScript** - 类型安全
- **Vite** - 快速构建工具
- **Tailwind CSS** - 原子化 CSS 框架
- **Framer Motion** - 动画库

## 文件结构

```
company-invitation/
├── src/
│   ├── components/
│   │   ├── BackgroundEffects.tsx  # 动态背景效果
│   │   ├── CalendarButtons.tsx    # 日历集成按钮
│   │   ├── FlipCard.tsx           # 翻转卡片组件
│   │   └── RSVPModal.tsx          # RSVP 表单模态框
│   ├── App.tsx                    # 主应用组件
│   ├── index.css                  # 全局样式
│   └── main.tsx                   # 入口文件
├── index.html                     # HTML 模板
├── package.json                   # 项目配置
├── tailwind.config.js            # Tailwind 配置
└── vite.config.ts                # Vite 配置
```

## 部署

构建后的文件位于 `dist` 目录，可以部署到任何静态托管服务：

- Vercel
- Netlify
- GitHub Pages
- 阿里云 OSS
- 腾讯云 COS

## 许可证

MIT License

