# JourneyKit

JourneyKit 是一个点对点综合交通方案项目。当前本地项目用于 `case1_hongkong` 的初始化、原型迁移、资产沉淀和后续真实图像 API 接入实验。

## 当前状态

- 已迁移旧 `chat-demo2` 为独立静态原型：`prototypes/chat-demo2-legacy/index.html`。
- 已整理香港机场、风格参考、交互示意、flipbook 参考视频和 image2 生成资产。
- 已建立 `data/case1_hongkong/` 数据入口，后续用于主行程 UI、机场无限画布节点和图像生成服务。
- 旧 FlyAI Flipbook Lab 仅作为素材来源，不是 JourneyKit 运行依赖。
- 当前仓库是初版协作 demo，不是最终稿。详细状态见 `docs/DEMO_STATUS.md`。

## 本地预览

```bash
cd /Users/yunzhi/Workspace/03_Sandbox/JourneyKit
python3 -m http.server 8899
```

打开：

- `http://127.0.0.1:8899/prototypes/chat-demo2-legacy/index.html`

这个页面是旧原型迁移版，只用于参考“自由交通卡片展开 + playback2 转场”的交互骨架，不代表 JourneyKit 最终视觉风格。

## 协作与上传

第一次把本地项目上传到空仓库时，按 `docs/UPLOAD_GUIDE.md` 操作。

当前建议上传仓库结构、文档、数据、legacy demo 和必要 demo 资产；不要上传 `.env.local`、真实 API key、`资料备份/` 或大型本地原始视频。

## 目录

```text
docs/                              项目计划、协作上下文、机场模块和资产流程
prototypes/chat-demo2-legacy/       旧 chat-demo2 静态迁移原型
public/assets/reference/            机场、风格、交互、flipbook 参考资料
public/assets/generated/image2-hkg/  网页端 ChatGPT Project / image2 生成资产
public/assets/prototype-legacy/      旧 playback2 图片和视频
data/case1_hongkong/                香港 case 的结构化数据和生成落地目录
```

## API Key

真实 key 只放 `.env.local`，不要提交。参考 `.env.example`。

首版可支持 fal / Google / OpenAI image2 中的一个或多个 provider。无 key 时只能使用静态 fixture playback；有 key 后再启用本地 generation service 生成机场无限画布节点。
