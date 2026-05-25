# 笔试结果回收 — Atoms Demo

## 基本信息

- **职位**: AI Native 全栈工程师
- **项目名**: Atoms Demo — AI-Powered App Builder
- **代码链接**: https://github.com/Cyan95/atoms-demo
- **已部署链接**: https://atoms-demo-psi.vercel.app

## 项目简介

做了 Atoms.dev 的简化版 Demo — 用户用自然语言描述想构建的应用，AI Agent（DeepSeek-V3）流式生成完整可运行的 HTML/CSS/JS 代码，右侧 iframe 实时预览。

## 技术栈

| 层 | 技术 |
|---|------|
| 框架 | Next.js 16 (App Router) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS v4 |
| AI | DeepSeek-V3 + Vercel AI SDK |
| 存储 | 内存存储（生产）+ SQLite/Drizzle（本地开发） |
| 部署 | Vercel (production) |

## 已实现功能

- AI 对话式代码生成（流式输出）
- iframe sandbox 实时预览
- 多轮迭代修改（对话历史上下文中持续改进）
- 项目 Dashboard + 快速模板
- 对话历史持久化
- 代码/预览 双 Tab 切换

## 核心架构

- 左栏：ChatPanel 对话组件（手动流式 fetch，提取 HTML 代码块）
- 右栏：PreviewPanel（iframe sandbox + srcdoc 注入 + 代码查看器）
- API：DeepSeek API（streamText）+ System Prompt 模拟 Alex Engineer 角色
- 数据：Server Actions + 内存存储（本地开发用 SQLite + Drizzle）
- 认证：localStorage 身份标识

## 使用说明

1. 打开 https://atoms-demo-psi.vercel.app
2. 输入姓名 → 进入 Dashboard
3. 选择模板或新建项目
4. 在聊天框描述需求，AI 流式生成代码，右侧实时预览
5. 继续对话迭代修改（如"把背景改成蓝色"）

## AI Coding 工具使用

- Claude Code 用于架构设计、代码生成、代码审查
- 充值账单：Claude Pro $20/mo + API 按量
