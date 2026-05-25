# Atoms Demo — AI-Powered App Builder / AI 驱动的应用构建器

> [English](#english) | [中文](#中文)

---

## English

A simplified clone of [Atoms.dev](https://atoms.dev/) built for the ROOT full-stack engineer interview challenge. Describe your app idea in natural language and watch an AI agent generate a complete, runnable web application in real-time.

### Features

- **AI-Powered Code Generation** — Describe any web app idea and get a complete, runnable HTML application with inline CSS & JS
- **Real-Time Preview** — Stream-generated code renders instantly in a sandboxed iframe
- **Multi-Turn Iteration** — Continue the conversation to refine and modify your app (ex: "change the background to blue")
- **Data Persistence** — All projects and conversations saved to SQLite via Drizzle ORM
- **Project Dashboard** — View, reopen, and delete previous projects
- **Code Viewer** — Switch between preview and source code tabs

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| AI | DeepSeek via Vercel AI SDK |
| Database | SQLite (better-sqlite3) + Drizzle ORM |
| Auth | localStorage-based identity |
| Deployment | Vercel |

### Getting Started

#### Prerequisites

- Node.js 18+
- A DeepSeek API key ([get one here](https://platform.deepseek.com/))

#### Setup

```bash
cd atoms-demo
npm install
cp .env.local.example .env.local   # then set DEEPSEEK_API_KEY=sk-...
npx drizzle-kit push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

#### Environment Variables

| Variable | Description |
|----------|-------------|
| `DEEPSEEK_API_KEY` | Your DeepSeek API key (starts with `sk-`) |

### Architecture

```
src/
  app/
    api/
      chat/route.ts          # AI chat endpoint (streaming)
      conversations/route.ts  # Conversation persistence
    project/[id]/page.tsx     # Editor page (chat + preview)
    layout.tsx                # Root layout
    page.tsx                  # Landing / dashboard
    globals.css               # Global styles
  components/
    ChatPanel.tsx             # Chat interface component
    PreviewPanel.tsx          # iframe preview + code viewer
  lib/
    ai/prompt.ts              # System prompt for AI agent
    actions/
      projects.ts             # Server actions for project CRUD
      conversations.ts        # Server actions for conversation CRUD
    db/
      schema.ts               # Drizzle ORM schema
      index.ts                # DB connection
    crypto.ts                 # UUID generation
```

### How It Works

1. **User describes an app idea** in the chat panel
2. **System Prompt** instructs the AI (as "Alex, Engineer at Atoms") to generate a complete, self-contained HTML file wrapped in a code fence
3. **Streaming response** is parsed in real-time — code blocks are extracted and injected into the sandboxed iframe
4. **Multi-turn iteration**: subsequent messages include the full conversation history, allowing the AI to refine the previously generated app
5. **Persistence**: every message and generated code block is saved to SQLite

### Key Design Decisions

- **Single-file HTML generation** instead of React components — maximizes compatibility, avoids complex build tooling in the preview, and keeps generated apps fully self-contained
- **iframe sandbox** for safe code execution — prevents generated code from affecting the host application
- **localStorage identity** instead of full OAuth — prioritizes speed of implementation while satisfying the auth requirement
- **Manual streaming fetch** instead of `useChat` hook — AI SDK v6 introduced breaking API changes; custom implementation gives more control over code extraction

### License

MIT

---

## 中文

为 ROOT 全栈工程师面试挑战构建的 [Atoms.dev](https://atoms.dev/) 简化版 Demo。用自然语言描述你的想法，AI Agent 即可实时生成完整可运行的 Web 应用。

### 功能特性

- **AI 对话式代码生成** — 描述任何 Web 应用想法，获得包含内联 CSS 和 JS 的完整可运行 HTML 应用
- **实时预览** — 流式生成的代码即时渲染在沙盒化的 iframe 中
- **多轮迭代** — 继续对话即可优化修改应用（例如"把背景改成蓝色"）
- **数据持久化** — 所有项目和对话通过 Drizzle ORM 保存到 SQLite
- **项目仪表盘** — 查看、重新打开和删除历史项目
- **代码查看器** — 在预览和源码视图之间切换

### 技术栈

| 层 | 技术 |
|---|------|
| 框架 | Next.js 16 (App Router) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS v4 |
| AI | DeepSeek + Vercel AI SDK |
| 数据库 | SQLite (better-sqlite3) + Drizzle ORM |
| 认证 | localStorage 身份标识 |
| 部署 | Vercel |

### 快速开始

#### 前置条件

- Node.js 18+
- DeepSeek API Key（[在此获取](https://platform.deepseek.com/)）

#### 安装运行

```bash
cd atoms-demo
npm install
cp .env.local.example .env.local   # 编辑并设置 DEEPSEEK_API_KEY=sk-...
npx drizzle-kit push
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

### 工作原理

1. **用户在聊天面板中描述应用想法**
2. **System Prompt** 指示 AI（扮演"Atoms 工程师 Alex"）生成完整自包含的 HTML 文件，包裹在代码围栏中
3. **流式响应**实时解析 — 提取代码块并注入沙盒 iframe
4. **多轮迭代**：后续消息包含完整对话历史，AI 可基于上下文优化已生成的应用
5. **持久化**：每条消息和生成的代码块保存到 SQLite

### 关键设计决策

- **单文件 HTML 生成**而非 React 组件 — 最大化兼容性，避免预览中的复杂构建工具链，保持生成应用完全自包含
- **iframe 沙盒**确保代码安全执行 — 防止生成代码影响宿主应用
- **localStorage 身份标识**替代完整 OAuth — 优先实现速度同时满足认证需求
- **手动流式 fetch**替代 useChat hook — AI SDK v6 引入了破坏性 API 变更，自定义实现提供更多代码提取控制权

### License

MIT
