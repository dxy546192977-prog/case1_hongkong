# JourneyKit Plan

## 项目定位

JourneyKit 是完整的点对点综合交通方案项目，不是单一机场地图，也不是旧 FlyAI Flipbook Lab 的改名版。

当前 case 是 `case1_hongkong`。主目标是把一次复杂跨城/跨境行程组织成可读、可操作、可交互的移动端 chat 方案：

- 大交通：火车、飞机等长距离主干段，强调时刻、航班/车次、风险和换乘余量。
- 小交通：打车、地铁等城市内衔接，强调路线、出入口、耗时、费用和缓冲。
- 自由交通：机场、枢纽、园区等空间内自主移动，强调可探索的空间画布、点击展开、路线聚焦和行李/安检/登机等任务节点。

## 范围关系

香港机场自由交通无限流画布是 JourneyKit 的一个模块，只负责机场空间内的交互节点和视觉探索。

网页端 ChatGPT Project / image2 负责机场模块的人工高质量视觉资产探索。本地 JourneyKit 负责资产归档、节点数据、点击交互、运行时图像生成、视频转场和主行程 UI 整合。

## 近期目标

1. 建立独立项目结构，所有命名统一为 JourneyKit。
2. 迁移旧 `chat-demo2` 作为 legacy prototype，确保不依赖旧服务即可打开。
3. 整理 `资料备份` 中的香港机场资料、风格参考和 flipbook 参考。
4. 建立 `case1_hongkong` 数据入口。
5. 预留真实图像 API 接入方式，为后续无限画布生成服务做准备。

## 不做的事

- 不把 `flyai-flipbook-lab/server` 作为 JourneyKit 正式后端。
- 不把旧多哈/樟宜素材当成香港机场最终验收内容。
- 不把任何 API key 写入代码或文档。
- 不以旧 `chat-demo2` 的视觉风格作为最终方向。

## 后续实现建议

- 新建 `apps/web` 承载最终移动端 chat demo。
- 新建 `apps/api` 或 `server` 承载 JourneyKit generation service。
- 将 airport canvas 的节点模型抽象为 `CanvasNode`, `CanvasEdge`, `GenerationJob`。
- 图像生成服务输入必须包含当前节点、点击坐标、路径历史和 `hkg_airport_facts.json` 中已审核事实。
- 生成结果落地到 `data/case1_hongkong/generated_nodes/`，并生成可复看的 fixture。
