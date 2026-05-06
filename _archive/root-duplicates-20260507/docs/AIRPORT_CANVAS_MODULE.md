# Airport Canvas Module

## 模块定位

机场自由交通无限流画布是 JourneyKit 的子模块，用于表达旅客在香港机场内的自主移动、任务选择和空间探索。

它不是独立产品首页，也不是普通静态地图。它应嵌入主 chat 方案中：用户滚动到机场自由交通段时，卡片可丝滑展开为上方聚焦浮层，用户可以点击行李、转机、登机、设施等区域进入下一层视觉节点。

## 目标体验

- 从主行程卡片进入机场画布时，保持上下文，不把用户丢到孤立页面。
- 点击区域产生局部圆形水波/形变，而不是整图突兀缩放。
- 新节点进入前保留当前图，避免黑屏。
- 支持返回上层、回到总览、继续探索。
- 支持静态图转场，后续支持 3-5 秒视频 loop 或前后节点 transition video。

## 节点模型

参考 `data/case1_hongkong/airport_canvas_nodes.json`。核心字段包括：

- `node_id`
- `parent_id`
- `title`
- `query`
- `tap_point`
- `tap_subject`
- `facts_used`
- `image_urls`
- `provider`
- `image_model`
- `prompt_model`
- `authored_prompt`
- `final_prompt`
- `video_url`

## 生成规则

每次点击生成下一节点时，输入至少包含：

- 当前节点
- 点击坐标
- 当前图片或图片引用
- 路径历史
- `hkg_airport_facts.json` 中允许使用的事实
- 用户当前任务，例如行李、转机、登机口路线

模型可以决定构图、镜头和视觉层次，但不能改写机场事实。

## 香港机场事实边界

正式进入产品前，必须从 `public/assets/reference/hkg-airport/` 中抽取并人工确认 HKIA facts。未确认前，节点状态保持 `needs_fact_extraction` 或 `pending`。

## 与 legacy playback2 的关系

`prototypes/chat-demo2-legacy/` 中的旧 playback2 只用于参考交互机制：展开、点击、转场、回退。它不是香港机场最终内容，也不是最终视觉方向。
