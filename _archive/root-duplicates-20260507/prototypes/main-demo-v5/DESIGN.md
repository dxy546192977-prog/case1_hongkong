# Main Demo · 视觉规则压缩版

不是长篇规范，只是落码前的最小约束。机器形态见 `styles/tokens.css`。

## 气质

亮色 editorial 移动 OS。干净、轻、智能、有触感。Gleb Kuznetsov / Milkinside 的浅底变体——不是 OTA、不是 cyber、不是 shadcn 灰。

## 调色

- 页面底：`#F7F7F8`（off-white），surface 用纯白拉对比
- 字色：`#111318` 主，`#6E737C` 次，`#A6A9B0` 弱
- hairline 用 ink 8% alpha，**不用纯灰** —— 灰色是 AI slop 信号
- 主 CTA 蓝：`#174DFF`（Figma 串联里的蓝按钮原色）
- 暖色 accent：`#E9C7AB`（自由交通段、酒店、行李等）
- 不要面状渐变背景

## 组件硬规则

- 卡片：纯白 surface + 大圆角（16–22px）+ elev-1 阴影。**不堆叠多重边框**
- 按钮主：bg `#174DFF`、白字、22px 圆角、46–52px 高度、轻按下凹感
- 按钮次：transparent + ink 字 + hairline 边
- 气泡：用户右侧（accent-warm 浅底）、agent 左侧裸文（不带气泡框）
- 浮层（订单/机场占位）：从底部上推，圆角 28px 顶部，背后 dim 50% ink
- 列表项分隔用 hairline，**不用浅灰背景条**

## 字体

`-apple-system, "SF Pro Text", "PingFang SC", system-ui`。中英混排时英文字号上调 1px 视觉对齐。
标题用 SemiBold（600），正文 Regular（400），强调走色不走粗。

## 动效

- 缓动 `cubic-bezier(0.2, 0.8, 0.2, 1)`（OS 风），不要 `ease-in-out`
- 时长：fast 180ms，base 280ms，emph 420ms，sheet 520ms
- 卡片 tap 给 scale 0.97 反馈（80ms in / 200ms out）
- 浮层进入 translateY(100%) → 0，配 dim 渐入

## 不做清单

- 不做暗色
- 不做全屏渐变背景
- 不做 hover 花活（移动 demo 没有 hover）
- 不做 shadcn 默认灰卡片
- 不让机场风格盖过主 demo 的 OS 调性
