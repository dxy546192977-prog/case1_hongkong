# JourneyKit Collaboration Context

## 一句话背景

JourneyKit 是一个点对点综合交通方案项目。当前 case 是 `case1_hongkong`，重点模块是香港机场自由交通的无限流画布交互系统。

## 当前仓库状态

本地根目录：`/Users/yunzhi/Workspace/03_Sandbox/JourneyKit`

旧 `flyai-flipbook-lab` 只作为历史原型和素材来源。JourneyKit 必须独立运行、独立协作、后续同步到 `https://code.alibaba-inc.com/journeykit/case1_hongkong/`。

## 关键文件

- `README.md`：项目入口和启动方式。
- `docs/JOURNEYKIT_PLAN.md`：主产品计划。
- `docs/AIRPORT_CANVAS_MODULE.md`：机场无限画布模块说明。
- `docs/ASSET_PIPELINE.md`：image2 / Project / 本地图像 API 的资产流转规则。
- `data/case1_hongkong/journey.json`：综合交通行程草稿。
- `data/case1_hongkong/hkg_airport_facts.json`：机场图像和交互可使用的事实来源。
- `data/case1_hongkong/airport_canvas_nodes.json`：机场画布节点草稿。
- `prototypes/chat-demo2-legacy/index.html`：旧交互原型迁移版，不代表最终风格。

## 产品原则

1. 用户看到的是完整交通方案，不是三块模块堆叠。
2. 大交通、小交通、自由交通使用不同信息形态，但要被一条真实行程逻辑串起来。
3. 自由交通需要有空间感、可点击、可聚焦、可回退、可复看。
4. 机场图像中的事实不能编造；只允许来自已审核资料和用户确认。
5. 旧多哈/樟宜 playback2 只保留交互机制参考，香港机场是后续正式 case。

## 给 image2 / 网页端 Project 的说明

你只负责生成香港机场自由交通模块的高质量视觉资产。请输出可归档的单张图、分层探索图、局部节点图或转场关键帧，并在文件名和说明中标清：节点、视角、用途、事实来源、是否可直接进入产品。

不要生成完整 JourneyKit 主应用，也不要替代本地节点数据和交互编排。

## 给本地 Codex / Claude Code 的说明

优先维护 JourneyKit 的项目结构、数据、交互、生成服务和文档。所有真实 API key 只走 `.env.local`。修改时保持小步、可回滚、可协作。
