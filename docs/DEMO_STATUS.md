# Demo Status

## 当前定位

这个仓库当前是 JourneyKit `case1_hongkong` 的初版协作包，用来把已有 demo、资料结构和后续方向先同步给协作者。

当前可运行的页面是：

```text
prototypes/chat-demo2-legacy/index.html
```

它是旧 `chat-demo2` 的静态迁移版，只用于说明：

- 综合交通行程如何承载一个自由交通卡片。
- 自由交通卡片如何展开成聚焦浮层。
- 点击机场空间节点后如何进入下一层内容。
- playback2 图片与转场视频的基本交互骨架。

## 不是最终稿

请不要把当前 demo 当成 JourneyKit 的最终视觉、最终信息架构或最终香港机场内容。

当前限制：

- 页面里仍然有 legacy 文案和旧机场示意内容。
- `prototypes/chat-demo2-legacy/` 只保留交互机制参考。
- `data/case1_hongkong/` 还处于草稿阶段。
- 香港机场事实仍需从 `public/assets/reference/hkg-airport/` 中抽取并人工确认。
- 图像生成服务、正式移动端应用和最终主流程还没有实现。

## 当前可以协作的内容

协作者可以优先看这些文件：

- `README.md`：项目入口和本地预览方式。
- `docs/JOURNEYKIT_PLAN.md`：产品范围和后续方向。
- `docs/AIRPORT_CANVAS_MODULE.md`：机场自由交通画布模块说明。
- `docs/ASSET_PIPELINE.md`：资产归档和后续生成服务规则。
- `data/case1_hongkong/`：case 数据草稿。
- `prototypes/chat-demo2-legacy/`：当前可运行的 legacy demo。

## 本地预览

在仓库根目录执行：

```bash
python3 -m http.server 8899
```

然后打开：

```text
http://127.0.0.1:8899/prototypes/chat-demo2-legacy/index.html
```

## 资产说明

当前 demo 必需资产位于：

```text
public/assets/prototype-legacy/
```

大型原始参考视频 `public/assets/reference/flipbook/*.mov` 默认不上传到 Git。后续如果需要共享大型素材，建议使用 Git LFS、网盘或内部资产库，而不是直接放普通 Git 仓库。
