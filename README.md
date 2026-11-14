# RE:STACK

**A local-first HyperCard revival for connected thinking.**

**English** · [简体中文](#中文版)

<a id="english"></a>

## English

RE:STACK turns notes into a small, navigable network of ideas. Inspired by HyperCard's personal, linkable stacks, it combines a tactile card deck with full-text search, bidirectional navigation, and an interactive constellation view—without an account or an application backend.

> **Project status:** Working source project with automated tests, a live public demo, and a narrated 57.1-second demo video published on YouTube: **[https://youtu.be/-nrugPKofmU](https://youtu.be/-nrugPKofmU)**. See [SUBMISSION.md](SUBMISSION.md) for the honest submission checklist.

## Highlights

- **Card CRUD:** Create, edit, color-code, and delete plain-text cards. Changes are saved automatically when browser storage is available.
- **Tags and collections:** Add comma-separated tags, filter the deck, and sort by recent edit, creation date, or title.
- **Connections and backlinks:** Add directed links between cards and navigate automatically derived backlinks from the destination card.
- **Local full-text search:** Search titles, bodies, tags, and linked-card titles. Use the inline deck filter or the keyboard-friendly search dialog.
- **Constellation view:** Explore an SVG relationship graph, hover to trace neighbors, click to focus, double-click to open, and zoom the map. For readability, the graph shows up to the 25 most recently edited cards.
- **Portable JSON v1:** Export a readable workspace snapshot or import one after validation and confirmation.
- **Example workspace:** Start with five connected cards that explain the project and its interaction model. Restore this demo from the sidebar when needed.
- **Responsive and keyboard support:** Use the deck on narrow screens and navigate core workflows without a mouse.

## Quick start

### Prerequisites

- A current Node.js release supported by Vite 7 (Node.js 22.12+ is recommended)
- npm

### Install and run

```bash
npm ci
npm run dev
```

Vite uses **http://localhost:5173** and requires that port to be available.

### Verify and build

```bash
npm test           # 23 unit/property tests
npm run test:watch
npm run build      # Strict TypeScript + production bundle
npm run preview    # Serve that bundle at http://localhost:4173
npm run test:ui    # 3 Playwright workflows in installed Chrome
npm run check:all  # Unit/property tests, build, and browser tests
```

The browser tests start Vite automatically. They use the installed Chrome channel; set `CHROME_PATH` if Chrome is in a nonstandard location. On 2026-11-13, the complete `npm run check:all` sequence passed: **23/23 tests and 3/3 browser workflows**, including a 390 × 844 mobile viewport.

### Demo video source

The `video/` directory contains a 57.1-second HyperFrames composition built from a real Chrome recording, plus its rendered MP4: **[video/renders/restack-demo.mp4](video/renders/restack-demo.mp4)** (1920 × 1080, 30 fps, H.264, 7.9 MB, English narration over real product footage). A public mirror is available at **[https://restack-demo.nyc.boxd.sh/restack-demo.mp4](https://restack-demo.nyc.boxd.sh/restack-demo.mp4)**. See [DEMO_SCRIPT.md](DEMO_SCRIPT.md) for the timeline and reproduction steps.

```bash
cd video
npm run check
npx hyperframes preview --background
```

The final MP4 has been rendered and visually checked from representative frames against the full Studio preview. It is published publicly on YouTube at **[https://youtu.be/-nrugPKofmU](https://youtu.be/-nrugPKofmU)**.

## A two-minute tour

1. Open the example deck and select **New card** (or press `N`).
2. Add a title and plain-text body. Enter comma-separated tags and press `Enter` to file them.
3. In **Connections**, find another card and connect it. Open the destination card to see the new entry under **Referenced by**.
4. Press `Ctrl+K` (Windows/Linux) or `Cmd+K` (macOS), type a query, use the arrow keys, and press `Enter` to open a result.
5. Switch to **Constellation** to inspect the network. Click a node to focus it; double-click a node (or focus it and press `Enter`) to edit it.
6. Select **Export stack** to download `restack-YYYY-MM-DD.json`. Keep this file as your portable backup.

## Keyboard controls

| Key | Action |
| --- | --- |
| `N` | Create a card when not typing in a form field |
| `Ctrl+K` / `Cmd+K` | Open or close global search |
| `↑` / `↓` | Move through global-search results |
| `Enter` | Open the active search result or focused graph node |
| `Escape` | Close the editor, search, or mobile navigation |
| `Tab` / `Shift+Tab` | Move through native interactive controls |

## Data, privacy, and backup

RE:STACK has **no application backend, account system, cloud sync, or tracking service**. Workspace state is held in React and persisted to browser `localStorage` under the key `restack.workspace.v1`.

Important consequences:

- Data is local to the current browser profile and origin. It does not automatically follow you to another browser, device, port, or hostname.
- Clearing site data can delete the stack. **Export JSON regularly; local storage is not a backup service.**
- If storage is blocked or full, the interface reports that storage is unavailable. In-memory editing can continue, but those changes may not survive a reload.
- Card operations do not need an API. This is not currently documented as an installable PWA, and no guarantee is made that application assets will be available after every network-independent cold start.
- Import replaces the current workspace only after confirmation. Export first if you need to preserve the current stack.

### JSON v1 shape

```json
{
  "version": 1,
  "cards": [
    {
      "id": "welcome",
      "title": "A small studio for big ideas.",
      "body": "Every thought gets a card.",
      "tags": ["start here"],
      "links": ["hypercard"],
      "accent": "lime",
      "createdAt": "2026-01-01T12:00:00.000Z",
      "updatedAt": "2026-01-06T12:00:00.000Z"
    }
  ]
}
```

The importer validates JSON structure, version, IDs, card fields, and links. Current limits include 1,000 cards per imported workspace, an import file no larger than 2,000,000 bytes, 180 characters per title, 30,000 characters per body, and eight normalized tags per card. Invalid or self-referential links are removed during parsing. See [src/lib/model.ts](src/lib/model.ts) for the authoritative rules.

## Technology and structure

- React 19 + React DOM
- TypeScript in strict mode
- Vite 7
- Vitest + fast-check for tests
- Browser `localStorage`, Blob downloads, and SVG; no server runtime

```text
src/
├── App.tsx                    Application state and workspace views
├── components/
│   ├── CardEditor.tsx        Editing, tags, links, and backlinks
│   ├── Graph.tsx             Interactive SVG constellation
│   ├── Icon.tsx              Inline interface icons
│   └── SearchDialog.tsx      Keyboard-friendly global search
├── lib/
│   ├── model.ts              Card operations, search, JSON, and seed data
│   └── storage.ts            Defensive local persistence
├── main.tsx                   React entry point
└── styles.css                 Responsive visual system
```

## Project links and placeholders

| Resource | Current status |
| --- | --- |
| Canonical repository | **[https://github.com/ggyyuig/restack](https://github.com/ggyyuig/restack)** — public, MIT licensed |
| Public demo | **[https://restack-demo.nyc.boxd.sh/](https://restack-demo.nyc.boxd.sh/)** — deployed static build, verified in Chrome on 2026-11-13 |
| Demo video | **Rendered, verified, and public:** [YouTube — RE:STACK demo](https://youtu.be/-nrugPKofmU) (57.1 s, 1920 × 1080, 30 fps, 7.9 MB, English narration). Public mirror: [restack-demo.mp4](https://restack-demo.nyc.boxd.sh/restack-demo.mp4). |
| Competition entry | **Draft; submission has not been confirmed.** |

The intended primary competition category is **Resurrection**. The visual direction may also fit **Costume Contest**, but no finalist status, category placement, or award is claimed.

### Mandatory Kiro requirement

**RE:STACK has not used Kiro and therefore does not currently satisfy the competition's mandatory Kiro-usage requirement.** No Kiro-assisted development, `.kiro` evidence, or Kiro write-up is claimed. Only the project owner may add such evidence and narrative after genuine Kiro use; those materials must describe what actually happened.

## Contributing and license

Read [CONTRIBUTING.md](CONTRIBUTING.md) for development and data-compatibility guidelines. The video run-through is in [DEMO_SCRIPT.md](DEMO_SCRIPT.md).

RE:STACK is available under the [MIT License](LICENSE).

---

<a id="中文版"></a>

## 中文版

**RE:STACK 是一个面向“关联思考”的本地优先 HyperCard 复兴项目。**

RE:STACK 把笔记变成一个小巧、可浏览的想法网络。它从 HyperCard 那种个人化、可互相链接的“卡片栈”汲取灵感，把有触感的卡片桌面、全文搜索、双向导航和可交互的星座视图结合在一起——不需要账号，也没有应用后端。

> **项目状态：** 可运行的源码项目，包含自动化测试、在线公开演示，以及已发布到 YouTube 的 57.1 秒英文旁白演示视频：**[https://youtu.be/-nrugPKofmU](https://youtu.be/-nrugPKofmU)**。完整且诚实的提交清单见 [SUBMISSION.md](SUBMISSION.md)。

## 功能亮点

- **卡片增删改查：** 创建、编辑、设置颜色和删除纯文本卡片。浏览器存储可用时，修改会自动保存。
- **标签与集合：** 用逗号分隔标签，按标签筛选卡片，并按最近编辑、创建时间或标题排序。
- **连接与反向链接：** 在卡片之间建立有向连接；打开目标卡片即可看到自动生成的“被引用”列表。
- **本地全文搜索：** 搜索标题、正文、标签和被链接卡片的标题。可以使用卡片列表内的筛选框，也可以使用键盘友好的搜索对话框。
- **星座视图：** 浏览 SVG 关系图，悬停查看相邻节点，单击聚焦，双击打开，并支持缩放。为保证可读性，图中最多显示最近编辑的 25 张卡片。
- **可移植的 JSON v1：** 导出可读的工作区快照；导入时会先校验结构并请求确认。
- **示例工作区：** 内置五张互相连接的卡片，用来说明项目本身和交互方式；需要时可从侧边栏恢复。
- **响应式与键盘支持：** 在窄屏上同样可用，核心流程可以不用鼠标完成。

## 快速开始

### 环境要求

- 当前受 Vite 7 支持的 Node.js 版本（建议 Node.js 22.12+）
- npm

### 安装与运行

```bash
npm ci
npm run dev
```

Vite 默认使用 **http://localhost:5173**，请确保该端口可用。

### 验证与构建

```bash
npm test           # 23 个单元/属性测试
npm run test:watch
npm run build      # 严格 TypeScript 检查 + 生产构建
npm run preview    # 在 http://localhost:4173 预览生产包
npm run test:ui    # 在已安装的 Chrome 中运行 3 个 Playwright 流程
npm run check:all  # 单元/属性测试、构建和浏览器测试
```

浏览器测试会自动启动 Vite，并使用本机安装的 Chrome；如果 Chrome 不在默认位置，可设置 `CHROME_PATH`。2026-11-13 完整执行 `npm run check:all` 的结果为：**单元/属性测试 23/23 通过，浏览器流程 3/3 通过**，其中包含 390 × 844 移动端视口。

### 演示视频源码

`video/` 目录包含一段 57.1 秒的 HyperFrames 合成，素材来自真实 Chrome 录屏，并附有渲染后的 MP4：**[video/renders/restack-demo.mp4](video/renders/restack-demo.mp4)**（1920 × 1080，30 fps，H.264，7.9 MB，真实产品画面配英文旁白）。公开镜像地址为 **[https://restack-demo.nyc.boxd.sh/restack-demo.mp4](https://restack-demo.nyc.boxd.sh/restack-demo.mp4)**。时间线与复现步骤见 [DEMO_SCRIPT.md](DEMO_SCRIPT.md)。

```bash
cd video
npm run check
npx hyperframes preview --background
```

最终 MP4 已渲染，并用代表性画面与完整 Studio 预览做过核对。公开视频已发布到 YouTube：**[https://youtu.be/-nrugPKofmU](https://youtu.be/-nrugPKofmU)**。

## 两分钟上手

1. 打开示例卡片桌面，点击 **New card**（或按 `N`）新建卡片。
2. 填写标题和纯文本正文。输入逗号分隔的标签后按 `Enter` 归档。
3. 在 **Connections** 中找到另一张卡片并建立连接。打开目标卡片，即可在 **Referenced by** 下看到新的反向链接。
4. 按 `Ctrl+K`（Windows/Linux）或 `Cmd+K`（macOS），输入关键词，用方向键选择结果，按 `Enter` 打开。
5. 切换到 **Constellation** 查看关系网络。单击节点聚焦；双击节点（或聚焦后按 `Enter`）进入编辑。
6. 点击 **Export stack** 下载 `restack-YYYY-MM-DD.json`，把它作为可移植备份保存。

## 键盘操作

| 按键 | 操作 |
| --- | --- |
| `N` | 不在表单输入时新建卡片 |
| `Ctrl+K` / `Cmd+K` | 打开或关闭全局搜索 |
| `↑` / `↓` | 在全局搜索结果中移动 |
| `Enter` | 打开当前搜索结果或聚焦的图节点 |
| `Escape` | 关闭编辑器、搜索或移动端导航 |
| `Tab` / `Shift+Tab` | 在原生交互控件之间移动 |

## 数据、隐私与备份

RE:STACK **没有应用后端、账号系统、云同步或跟踪服务**。工作区状态由 React 管理，并持久化到浏览器的 `localStorage`，键名为 `restack.workspace.v1`。

重要说明：

- 数据只属于当前浏览器配置和当前来源（origin）。它不会自动跟随你切换到其他浏览器、设备、端口或域名。
- 清除站点数据可能删除整个卡片栈。**请定期导出 JSON；localStorage 不是备份服务。**
- 如果浏览器存储被禁用或空间已满，界面会提示存储不可用。此时仍可在内存中编辑，但刷新后修改可能丢失。
- 卡片操作不需要 API。本项目目前没有作为可安装 PWA 提供，也不保证在完全离线冷启动时所有应用资源始终可用。
- 导入只有在确认后才会替换当前工作区。如需保留现有卡片栈，请先导出。

### JSON v1 结构

```json
{
  "version": 1,
  "cards": [
    {
      "id": "welcome",
      "title": "A small studio for big ideas.",
      "body": "Every thought gets a card.",
      "tags": ["start here"],
      "links": ["hypercard"],
      "accent": "lime",
      "createdAt": "2026-01-01T12:00:00.000Z",
      "updatedAt": "2026-01-06T12:00:00.000Z"
    }
  ]
}
```

导入器会校验 JSON 结构、版本、ID、卡片字段和链接。当前限制包括：单个导入工作区最多 1,000 张卡片，导入文件不超过 2,000,000 字节，标题最长 180 字符，正文最长 30,000 字符，每张卡片最多 8 个归一化标签。解析时会移除无效链接和自引用链接。权威规则见 [src/lib/model.ts](src/lib/model.ts)。

## 技术与目录结构

- React 19 + React DOM
- 严格模式 TypeScript
- Vite 7
- Vitest + fast-check
- 浏览器 `localStorage`、Blob 下载和 SVG；无服务端运行时

```text
src/
├── App.tsx                    Application state and workspace views
├── components/
│   ├── CardEditor.tsx        Editing, tags, links, and backlinks
│   ├── Graph.tsx             Interactive SVG constellation
│   ├── Icon.tsx              Inline interface icons
│   └── SearchDialog.tsx      Keyboard-friendly global search
├── lib/
│   ├── model.ts              Card operations, search, JSON, and seed data
│   └── storage.ts            Defensive local persistence
├── main.tsx                   React entry point
└── styles.css                 Responsive visual system
```

## 项目链接与占位信息

| 资源 | 当前状态 |
| --- | --- |
| 代码仓库 | **[https://github.com/ggyyuig/restack](https://github.com/ggyyuig/restack)** — 公开，MIT 许可 |
| 在线演示 | **[https://restack-demo.nyc.boxd.sh/](https://restack-demo.nyc.boxd.sh/)** — 已部署静态构建，2026-11-13 在 Chrome 中验证通过 |
| 演示视频 | **已渲染、已验证并公开：** [YouTube — RE:STACK demo](https://youtu.be/-nrugPKofmU)（57.1 秒，1920 × 1080，30 fps，7.9 MB，英文旁白）。公开镜像：[restack-demo.mp4](https://restack-demo.nyc.boxd.sh/restack-demo.mp4)。 |
| 竞赛提交 | **草稿；尚未确认正式提交。** |

项目计划参加的主赛道是 **Resurrection（复活）**。视觉方向也可能适合 **Costume Contest（服装大赛）**，但不宣称任何入围、赛道名次或奖项。

### Kiro 使用要求（重要）

**RE:STACK 目前没有使用 Kiro，因此尚不满足本次竞赛对 Kiro 使用的强制要求。** 项目不宣称任何 Kiro 辅助开发、`.kiro` 证据或 Kiro 写作内容。只有在真正使用 Kiro 之后，项目所有者才能补充相应材料；这些材料必须如实描述实际发生的过程。

## 贡献与许可

开发约定和数据兼容性说明见 [CONTRIBUTING.md](CONTRIBUTING.md)。视频流程说明见 [DEMO_SCRIPT.md](DEMO_SCRIPT.md)。

RE:STACK 采用 [MIT License](LICENSE) 开源。
