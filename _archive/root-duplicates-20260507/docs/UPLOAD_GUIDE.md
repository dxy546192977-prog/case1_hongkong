# Upload Guide

这份说明对应 Code 页面里“当前代码库为空”的场景。你现在本地已经有 JourneyKit 文件，所以使用页面下方的“对于已存在的文件夹或仓库”这一组命令。

## 基础概念

- 本地仓库：你电脑里的 `/Users/yunzhi/Workspace/03_Sandbox/JourneyKit`。
- 远程仓库：网页上的 `journeykit / case1_hongkong`。
- commit：把本地改动保存成一个版本点。
- push：把本地 commit 上传到远程仓库，协作者才能看到。
- pull：把别人上传的新改动同步到你本地。

## 第一次上传

在终端执行：

```bash
cd /Users/yunzhi/Workspace/03_Sandbox/JourneyKit
git status
git remote add origin git@gitlab.alibaba-inc.com:journeykit/case1_hongkong.git
git add .env.example .gitignore README.md docs data prototypes public/assets
git commit -m "Initial JourneyKit legacy demo handoff"
git push -u origin main
```

如果最后一步提示当前分支不是 `main`，先执行：

```bash
git branch --show-current
```

然后把 push 命令里的 `main` 换成显示出来的分支名。

## 如果 remote 已经存在

如果执行 `git remote add origin ...` 时提示 `remote origin already exists`，不要重复添加，改用：

```bash
git remote -v
git remote set-url origin git@gitlab.alibaba-inc.com:journeykit/case1_hongkong.git
```

然后继续：

```bash
git add .env.example .gitignore README.md docs data prototypes public/assets
git commit -m "Initial JourneyKit legacy demo handoff"
git push -u origin main
```

## 如果 SSH 推不上去

页面默认选中的是 SSH 地址：

```text
git@gitlab.alibaba-inc.com:journeykit/case1_hongkong.git
```

如果你电脑没有配置过 SSH key，`git push` 可能会失败。此时可以在网页上切到 `HTTPS`，复制 HTTPS 地址，然后执行：

```bash
git remote set-url origin <把网页上的 HTTPS 地址粘贴到这里>
git push -u origin main
```

HTTPS 通常会弹出登录或 token 验证。不要把密码、token 或任何密钥写进仓库文件。

## 后续日常协作

每次开始改之前，先同步远程：

```bash
git pull
```

改完后查看变更：

```bash
git status
git diff
```

提交并上传：

```bash
git add <改过的文件>
git commit -m "Describe the change"
git push
```

## 当前 demo 的打开方式

协作者下载仓库后，在仓库根目录执行：

```bash
python3 -m http.server 8899
```

打开：

```text
http://127.0.0.1:8899/prototypes/chat-demo2-legacy/index.html
```

## 不建议上传的内容

不要上传：

- `.env.local`
- 真实 API key 或 token
- `资料备份/`
- 大型本地原始视频，例如 `public/assets/reference/flipbook/*.mov`

如果后续必须共享大型素材，先确认团队是否使用 Git LFS 或内部资产库。
