# 行程规划项目文件索引

这个仓库当前由两条主线并行组成：

- `case1_hongkong`：JourneyKit 香港行程原型线（`main-demo-v5`、历史迁移、资产沉淀）。
- `case2_hongkong`：Qwen 高舱推荐 / 对话流 H5 线（含航司数据库、PPT、发布配置）。

同时，根目录还保留了一套与 `case1_hongkong` 高度相似的 `prototypes/`、`public/`、`docs/` 目录，主要用于演示与过渡。

## 建议你优先使用的入口

- 维护 `case1_hongkong` 相关内容时：优先在 `case1_hongkong/` 下改动。
- 维护 Qwen 高舱项目时：优先在 `case2_hongkong/` 下改动。
- 根目录 `prototypes/` 与 `public/`：视为“工作台/兼容层”，新改动建议同步判断是否应沉淀到子 case。

## 目录总览（按职责）

```text
case1_hongkong/                    香港行程规划主线（JourneyKit）
  ├─ prototypes/main-demo-v5/      串联版主原型（首页到机场详情）
  ├─ prototypes/chat-demo2-legacy/ 历史原型（参考用）
  ├─ docs/                         case1 文档
  └─ public/assets/                case1 静态资源

case2_hongkong/                    Qwen 高舱推荐/对话流主线
  ├─ 2 H5效果/                     主 H5 与子效果
  ├─ 5 项目PPT/                    项目讲解页面与素材
  ├─ 6 航司数据库/                 航司结构化数据
  ├─ 7 上传Github/                 发布与对外说明
  └─ 10 切图素材/                  共用切图资产

prototypes/                        根目录原型（与 case1 存在重叠）
public/assets/                     根目录资产（与 case1 存在重叠）
docs/                              根目录项目文档（与 case1 存在重叠）
```

## 快速预览

在仓库根目录启动静态服务：

```bash
python3 -m http.server 8899
```

常用页面：

- `http://127.0.0.1:8899/prototypes/main-demo-v5/index.html`
- `http://127.0.0.1:8899/case1_hongkong/prototypes/main-demo-v5/index.html`
- `http://127.0.0.1:8899/case2_hongkong/2%20H5效果/国泰Qwen-对话流.html`

## 文件整理规则（建议执行）

- 单一事实源：同一功能只保留一个“主维护目录”，其他目录只做镜像或归档。
- 先标注再迁移：对重复目录先在 README 标注“主/备”，确认稳定后再清理。
- 素材分类：`reference`（外部参考）、`generated`（AI 生成）、`runtime`（运行必需）分开存放。
- 文档收口：同类文档尽量收敛到各自 case 的 `docs/`，根目录只留总索引与跨 case 约定。
- 禁止提交敏感信息：`.env.local`、真实 API Key、超大原始媒体文件不入库。

## 关联文档

- `case1_hongkong/README.md`
- `case2_hongkong/README.md`
- `docs/DEMO_STATUS.md`
- `docs/UPLOAD_GUIDE.md`
