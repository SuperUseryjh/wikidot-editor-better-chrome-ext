<p align="center">
  <img src="./assets/logo.svg" width="160" alt="Wikidot Editor Better logo">
</p>

<h1 align="center">Wikidot Editor Better</h1>

<p align="center">为 Wikidot 编辑页带来 Monaco Editor 体验的 Chrome 扩展。</p>

<p align="center">
  <a href="https://github.com/SuperUseryjh/wikidot-editor-better-chrome-ext/releases"><img src="https://img.shields.io/github/v/release/SuperUseryjh/wikidot-editor-better-chrome-ext?display_name=tag&sort=semver&label=%E5%8F%91%E5%B8%83" alt="发布版本"></a>
  <a href="https://github.com/SuperUseryjh/wikidot-editor-better-chrome-ext/stargazers"><img src="https://img.shields.io/github/stars/SuperUseryjh/wikidot-editor-better-chrome-ext?style=flat&label=Stars" alt="GitHub Stars"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-GPL%20v3.0-2dc8d8" alt="GPL v3.0"></a>
  <a href="https://github.com/SuperUseryjh/wikidot-editor-better-chrome-ext/actions"><img src="https://img.shields.io/github/actions/workflow/status/SuperUseryjh/wikidot-editor-better-chrome-ext/release.yml?label=%E6%9E%84%E5%BB%BA" alt="构建状态"></a>
</p>

将 [Wikidot](https://www.wikidot.com/) 页面源代码编辑区域的 `textarea` 替换为 [Monaco Editor](https://microsoft.github.io/monaco-editor/)（VS Code 同款编辑器）的独立 Chrome Manifest V3 扩展。原工具栏按钮、快捷键、表单提交全部保持可用。

此项目又名 FuckiDot Editor。

## 安装入口

- [查看 GitHub Releases](https://github.com/SuperUseryjh/wikidot-editor-better-chrome-ext/releases)
- [查看项目源码](https://github.com/SuperUseryjh/wikidot-editor-better-chrome-ext)
- [报告问题或提出建议](https://github.com/SuperUseryjh/wikidot-editor-better-chrome-ext/issues)

## 功能特性

- 用 Monaco Editor 替换 Wikidot 源码编辑框，保留原有保存、预览、草稿、工具栏和快捷键行为。
- 提供 Wikidot 语法高亮，支持模块、标题、列表、表格、代码块及 CSS/HTML/JavaScript 嵌入语言。
- 自动发现 AJAX 动态插入的编辑区域；初始化失败时保留原生 textarea 可继续使用。
- 使用 Manifest V3 主世界 content script，兼容 Monaco 的 AMD 模块与动态加载机制。
- 使用 `chrome.storage` 保存扩展配置，使用受限消息协议、Wikidot host permission 与 `chrome.cookies` 支持跨站 include 源码校验。
- 不依赖 Tampermonkey、GM API、油猴更新端点或油猴脚本产物。

## 运行方式

扩展由三个运行环境协作完成：主世界 content script 启动 Monaco 并接管编辑器；隔离世界 bridge 负责与扩展 API 通信；Manifest V3 Service Worker 在严格校验请求后处理跨站 include 和 Cookie 读取。三者均包含在扩展 ZIP 中，不依赖油猴脚本或外部服务。

## 安装

当前提供 GitHub Release ZIP 与开发者模式安装方式：

1. 从本仓库 Release 下载 `wikidot-editor-better-chrome.zip`。
2. 解压 ZIP。
3. 打开 `chrome://extensions`。
4. 开启右上角“开发者模式”。
5. 选择“加载已解压的扩展程序”，并选中解压后的目录。
6. 打开任意 Wikidot 页面，点击“编辑”即可使用。

Chrome 会在扩展版本变更后显示重新加载按钮；本地开发时重新构建后点击该按钮，再刷新 Wikidot 页面即可加载新代码。首次打开编辑页时，Monaco 需要下载编辑器资源，加载失败时会自动保留原生 textarea 并提供重试。

## 权限说明

扩展只请求以下权限：

| 权限 | 用途 |
| --- | --- |
| `storage` | 保存编辑器配置。 |
| `cookies` | 读取 Wikidot 的 `wikidot_token7`，用于已校验的跨站 include 源码请求。 |
| `https://*.wikidot.com/*` | 在 Wikidot 页面运行编辑器，并访问被严格白名单限制的跨站 include 页面。 |

Service Worker 只接受格式受校验的 include 请求：目标必须是 HTTPS Wikidot 子域名，路径仅允许单层页面、首页或 AMC 端点；POST 请求体也限定为 ViewSourceModule 的固定格式。

## 开发

```bash
bun install
bun run test
bun run build
```

| 命令 | 说明 |
| --- | --- |
| `bun run test` | 执行语法、include 解析、版本比较与 Monaco 加载测试。 |
| `bun run typecheck` | 执行 TypeScript 类型检查。 |
| `bun run build` | 生成可直接由 Chrome 加载的 `dist/` 目录。 |
| `bun run dev` | 以 watch 模式编译 TypeScript。 |

构建完成后，直接在 `chrome://extensions` 选择 `dist/` 目录加载扩展。

## 项目结构

```text
src/
├── bootstrapMain.ts       主世界编辑器启动逻辑
├── editor.ts              Monaco 与 Wikidot textarea 的双向代理
├── includeValidator.ts    include 参数及源码校验
├── extension/
│   ├── contentBridge.ts   隔离世界与主世界的事件桥接
│   └── background.ts      MV3 Service Worker、跨站请求和 Cookie 读取
└── monacoLoader.ts        Monaco CDN 加载与回退策略
scripts/bundle.ts          构建 content script、Service Worker 与 manifest
landing/                   可独立部署的扩展安装落地页
```

## 发布

- 版本号由 `package.json` 的 `version` 单独管理，必须是 Chrome Manifest 支持的数字版本。
- 本项目作为独立 Git 仓库发布时，`.github/workflows/release.yml` 会运行测试、构建 `dist/`、打包 ZIP、上传 Artifact，并在 `main` 分支创建 GitHub Release。
- `landing/` 不依赖油猴项目，可部署至任意静态托管服务。

### 发布产物

| 文件 | 用途 |
| --- | --- |
| `dist/` | 可由 Chrome“加载已解压的扩展程序”直接加载的目录。 |
| `wikidot-editor-better-chrome.zip` | GitHub Release 上传的可分发扩展包。 |

独立发布前请同步更新 `package.json` 的版本号和 `RELEASE_NOTES.md`。Chrome Manifest 版本必须由 1 到 4 段数字组成，每段范围为 `0` 至 `65535`。

## Tampermonkey 脚本

Tampermonkey 版本是独立项目，拥有自己的版本、自动更新、构建、Release 和落地页；本扩展不依赖其源码或产物。

本扩展由 Tampermonkey 脚本 v1.0.2 分叉而来。

Tampermonkey 版本号继续保持 1.x.x 格式。

### 友情链接

- [Tampermonkey 版本落地页](https://fuckidot-editor.yaoonion.fun)
- [Tampermonkey 版本仓库](https://github.com/SuperUseryjh/wikidot-editor-better)

## 许可证

本项目使用 [GNU GPL v3.0](LICENSE) 许可证。

## Star History

<a href="https://www.star-history.com/?repos=SuperUseryjh%2Fwikidot-editor-better-chrome-ext&type=date&legend=top-left">
  <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=SuperUseryjh/wikidot-editor-better-chrome-ext&type=Date">
</a>
