# Asset Pipeline

## 资产来源

JourneyKit 当前有三类资产来源：

1. `资料备份` 中的用户资料：机场地图、白皮书、风格参考、交互示意和视频参考。
2. 网页端 ChatGPT Project / image2：用于香港机场自由交通模块的人工视觉探索。
3. 本地 JourneyKit generation service：后续根据节点、点击坐标和 HKIA facts 运行时生成下一张图或转场视频。

## 目录规则

- 机场事实参考：`public/assets/reference/hkg-airport/`
- 风格参考：`public/assets/reference/style/`
- 交互参考：`public/assets/reference/interaction/`
- flipbook 参考：`public/assets/reference/flipbook/`
- image2 香港机场生成图：`public/assets/generated/image2-hkg/`
- 旧 playback2 原型资产：`public/assets/prototype-legacy/`
- 本地 API 生成节点：`data/case1_hongkong/generated_nodes/`

## 命名建议

image2 或人工导出的机场资产建议使用：

```text
hkg_<node>_<view>_<purpose>_vNN.<ext>
```

示例：

```text
hkg_root_isometric_overview_v01.png
hkg_baggage_focus_wayfinding_v02.png
hkg_transfer_security_node_v01.png
hkg_gate_route_transition_keyframe_v01.png
```

## 资产回填

每个可进入产品的图像资产都应回填到节点数据：

- `data/case1_hongkong/airport_canvas_nodes.json`
- 或后续生成服务输出的 `data/case1_hongkong/generated_nodes/<node_id>.json`

必须记录：

- 资产路径
- 生成方式：image2 / fal / Google / OpenAI / manual
- 使用事实
- prompt 摘要
- 是否经过人工审核

## API Key 规则

真实密钥只写入 `.env.local`。不要提交 `.env.local`，不要把 key 粘贴到 README、JSON、截图或日志里。

`.env.example` 只保留变量名。

## 无 key 模式

没有 API key 时，JourneyKit 只能使用静态 fixture 或人工导入资产进行 playback，不得伪装成真实生成。

## 有 key 模式

有 key 时，本地 generation service 可以：

1. 读取当前节点和点击坐标。
2. 根据 HKIA facts 生成 tap understanding。
3. 生成下一节点 prompt。
4. 调用图像/视频 provider。
5. 保存图片、metadata、prompt 和节点 JSON。
6. 前端 preload 后再切换，失败则保留当前节点。
