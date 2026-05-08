# JourneyKit 行程规划 H5 - Next.js 版本

当前目录是从原静态 H5 Demo 整理出的 Next.js App Router 版本。原型交互逻辑保留在 `src/legacy/main-demo-v5`，Next 页面通过一个客户端外壳组件统一承载，后续可以逐步把 legacy 视图拆成 React 组件。

## 启动

```bash
cd nextjs-app
npm install
npm run dev
```

默认访问 `http://127.0.0.1:3000`。

## 页面路由

| 路由 | 对应原页面 | 说明 |
| --- | --- | --- |
| `/` | `正向支付链路.html` | 咨询、方案、行程、下单、支付、行前页主链路 |
| `/payment` | `正向支付链路.html` | 同主链路，便于明确访问 |
| `/refund` | `退改链路.html` | 航变退改保障主链路 |
| `/flipbook` | `订详FLipbook效果.html` | 香港机场中转订详 Flipbook |

## `public/*.html` 与 `src/app/*` 的关系

这三组页面（`flipbook` / `payment` / `refund`）目前是“壳路由 + 真实静态页”的双层结构：

- `src/app/flipbook/page.tsx`、`src/app/payment/page.tsx`、`src/app/refund/page.tsx`
  - 作用：Next.js 路由入口（访问 `/flipbook`、`/payment`、`/refund` 时先命中这里）
  - 行为：页面加载后立即 `window.location.replace("/xxx.html")`
- `public/flipbook.html`、`public/payment.html`、`public/refund.html`
  - 作用：真实业务演示内容（包含 legacy 的 HTML/CSS/JS）
  - 访问方式：可直接访问 `/flipbook.html`、`/payment.html`、`/refund.html`

可按下面理解：

- 访问 `/payment` -> 命中 `src/app/payment/page.tsx` -> 跳转到 `/payment.html` -> 显示 `public/payment.html`
- 访问 `/refund`、`/flipbook` 同理

### 为什么 `out/flipbook.html` 看起来只有一行

项目启用了 `next.config.ts` 的 `output: "export"`，构建后 `out/` 中会生成静态导出结果。  
因此你在 `out/flipbook.html`、`out/payment.html`、`out/refund.html` 看到的是 Next 导出的路由页（壳页），不是 `public/*.html` 的原始源码文件。

这就是“开发时看起来是跳到静态页、导出后 `out/*.html` 又像壳页”的根本原因。

## 目录结构

```text
nextjs-app/
├── src/
│   ├── app/                    # Next.js App Router 页面
│   ├── components/DeviceShell.tsx
│   │                           # 统一挂载旧 H5 渲染与 action 分发
│   ├── legacy/                 # 从原 H5 迁移来的 JS 数据、视图和状态逻辑
│   └── styles/                 # 原设计系统 CSS
└── public/assets/              # 图片、视频等静态资源
```

## 构建

```bash
npm run build
```

项目路径包含中文目录，Next 16 的 Turbopack 在该路径下会触发内部路径编码问题，所以当前 `dev` 和 `build` 脚本显式使用 webpack。
