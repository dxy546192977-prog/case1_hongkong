# JourneyKit 香港行程规划 - Next.js 版本

基于原 vanilla JS 原型重构的 Next.js (App Router) 项目。

## 启动

```bash
cd nextjs-app
npm install
npm run dev
# 访问 http://localhost:3000
```

## 页面路由

| 路由 | 对应原页面 | 说明 |
|------|-----------|------|
| `/` | `正向支付链路.html` | 主 demo：咨询 → 方案 → 行程 → 下单 → 支付 → 行前 |
| `/refund` | `退改链路.html` | 航变退改：影响识别 → 替代方案 → 全额退款 |
| `/flipbook` | `订详FLipbook效果.html` | 机场平面图点击式导航 |

## 项目结构

```
nextjs-app/
├── src/
│   ├── app/                    # Next.js App Router 页面
│   │   ├── layout.tsx          # 根布局（引入全局样式）
│   │   ├── page.tsx            # 首页（正向支付链路）
│   │   ├── refund/page.tsx     # 退改链路
│   │   └── flipbook/page.tsx   # Flipbook 效果
│   ├── lib/
│   │   ├── data.ts             # 数据层（方案/行程/乘客/权益等）
│   │   ├── store.ts            # Zustand 状态管理（替代原 state+actions）
│   │   └── motion.ts           # 动效工具
│   ├── components/
│   │   ├── Icons.tsx           # Lucide 图标 React 组件
│   │   ├── ScreenRouter.tsx    # 屏幕路由调度
│   │   ├── ui/                 # 通用 UI 组件
│   │   │   ├── DeviceShell.tsx # 手机设备外壳
│   │   │   ├── DemoStageDock.tsx # 右下角快捷导航
│   │   │   └── Composer.tsx    # 输入框组件
│   │   └── views/              # 业务视图组件
│   │       ├── ChatView.tsx    # 咨询对话
│   │       ├── PlanCarousel.tsx # 方案卡片轮播
│   │       ├── ItineraryView.tsx # 行程详情
│   │       ├── PrepView.tsx    # 行前准备
│   │       ├── RefundView.tsx  # 退改链路
│   │       ├── TripView.tsx    # 行程卡片
│   │       ├── TripExpandedView.tsx # 中转管家全屏
│   │       ├── FlipbookView.tsx # 机场 Flipbook
│   │       └── MyTripsControl.tsx # 我的行程控制
│   └── styles/                 # 原生 CSS 设计系统
│       ├── tokens.css          # 设计 token
│       ├── base.css            # 基础样式
│       ├── components.css      # 组件样式
│       ├── personas.css        # 人设样式
│       ├── transit-card.css    # 中转卡片
│       ├── transit-assistant.css # 中转管家
│       ├── hkg-push-demo.css   # 推送 demo
│       └── globals.css         # 全局样式
└── public/assets/              # 静态资源（图片/视频）
```

## 技术栈

- **Next.js 15** (App Router, Static Export)
- **React 19**
- **TypeScript**
- **Zustand 5** (状态管理)
- **原生 CSS** (复用已有设计系统)
