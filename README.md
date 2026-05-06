# 行程规划 · 工作区总览

本目录是一个**多 case 工作区容器**，本身不存放业务代码，只承担两件事：

1. 收纳一组并行推进的子项目（每个 case 都是独立的 Git 仓库，自带远端）。
2. 在根目录暂存几个跨 case 的临时演示页与归档。

## 当前包含的 case

| 目录 | 定位 | 维护方式 | 入口 |
|---|---|---|---|
| `hongkong_journey/` | JourneyKit 香港行程原型主线（main-demo-v5、机场无限画布、HKIA 中转引导等），远端仓库名 `journeykit/case1_hongkong` | **独立 Git 仓库**，进入后单独提交 | `hongkong_journey/README.md` |

> 后续新增的 case 请同级摆放，并在上表登记。每个 case 都应是自治的独立仓库，外层 `.gitignore` 已逐项忽略对应目录名（当前为 `hongkong_journey/`、`case2_hongkong/`），新增 case 时记得同步追加到 `.gitignore`，避免子仓库被错误纳入外层 Git。

## 根目录游离文件（有意保留在外）

| 文件 | 用途 |
|---|---|
| `正向支付链路.html` | 跨 case 的正向支付链路演示页 |
| `订详FLipbook效果.html` | 订单详情 Flipbook 翻页效果演示页 |

这两个文件**故意放在根目录**，不属于任何单一 case，作为独立演示入口存在。

打开方式（在本目录启动静态服务）：

```bash
python3 -m http.server 8899
```

然后访问 `http://127.0.0.1:8899/正向支付链路.html` 或 `http://127.0.0.1:8899/订详FLipbook效果.html`。

> 不要用 `file://` 双击打开，页面依赖 `<script type="module">`，浏览器在 `file://` 协议下会拒绝加载 ES Module。

## 目录速览

```text
行程规划/
├── README.md                     本文件，工作区总览
├── .env.example                  环境变量样例
├── .gitignore                    已忽略 hongkong_journey/、case2_hongkong/、.env.local、.aone_copilot/、资料备份/ 等
├── .gitlab-ci.yml                外层 CI 配置
├── 正向支付链路.html              跨 case 演示页
├── 订详FLipbook效果.html          跨 case 演示页
├── hongkong_journey/             JourneyKit 香港主线（独立 Git 仓库，外层不追踪）
├── _archive/                     历史归档目录
│   └── root-duplicates-20260507/ 早期根目录 data/docs/prototypes 三件套的备份快照
└── .aone_copilot/                IDE 工具本地缓存，已被 .gitignore 忽略，无需关注
```

## 进入 case 工作

```bash
cd hongkong_journey
# 之后所有 git/构建/启动命令都在这一层执行，与外层工作区互不干扰
```
case 内部的目录约定、启动方式、API Key 配置等，请看各 case 自己的 `README.md`。

## 工作区维护守则
- **不要在外层根目录新增业务目录**（`docs/`、`data/`、`prototypes/`、`public/` 等）。所有业务内容都应落在某个 case 子目录内部。
- **不要再用软链接把 case 内部目录"提"到根目录**。早期曾在根目录建过 `data`、`docs`、`prototypes` 三个软链指向 `hongkong_journey/`（旧名 `case1_hongkong/`）内部，会让人误以为根目录有内容、并模糊"外层工作区/内层 case"的边界，已于 2026-05-07 全部清除（备份在 `_archive/root-duplicates-20260507/`）。
- 跨 case 的临时演示页可以暂放根目录，但需要在本 README 的「根目录游离文件」小节登记，避免下次清理时被误删。
- 已废弃但暂时不舍得删的内容统一进 `_archive/`，目录名建议带日期后缀（如 `root-duplicates-20260507/`）。
