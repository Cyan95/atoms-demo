# Atoms Demo — AI-Powered App Builder

A simplified clone of [Atoms.dev](https://atoms.dev/) built for the ROOT full-stack engineer interview challenge. Describe your app idea in natural language and watch an AI agent generate a complete, runnable web application in real-time.

![Preview](public/preview.png)

## Features

- **AI-Powered Code Generation** — Describe any web app idea and get a complete, runnable HTML application with inline CSS & JS
- **Real-Time Preview** — Stream-generated code renders instantly in a sandboxed iframe
- **Multi-Turn Iteration** — Continue the conversation to refine and modify your app (ex: "change the background to blue")
- **Data Persistence** — All projects and conversations saved to SQLite via Drizzle ORM
- **Project Dashboard** — View, reopen, and delete previous projects
- **Code Viewer** — Switch between preview and source code tabs

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| AI | DeepSeek via Vercel AI SDK |
| Database | SQLite (better-sqlite3) + Drizzle ORM |
| Auth | localStorage-based identity |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- A DeepSeek API key ([get one here](https://platform.deepseek.com/))

### Setup

```bash
# 1. Clone and enter the project
cd atoms-demo

# 2. Install dependencies
npm install

# 3. Set your API key
cp .env.local.example .env.local
# Edit .env.local and set DEEPSEEK_API_KEY=sk-...

# 4. Initialize the database
npx drizzle-kit push

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DEEPSEEK_API_KEY` | Your DeepSeek API key (starts with `sk-`) |

## Architecture

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

## How It Works

1. **User describes an app idea** in the chat panel
2. **System Prompt** instructs Claude (as "Alex, Engineer at Atoms") to generate a complete, self-contained HTML file wrapped in a code fence
3. **Streaming response** is parsed in real-time — code blocks are extracted and injected into the sandboxed iframe
4. **Multi-turn iteration**: subsequent messages include the full conversation history, allowing the AI to refine the previously generated app
5. **Persistence**: every message and generated code block is saved to SQLite

## Key Design Decisions

- **Single-file HTML generation** instead of React components — maximizes compatibility, avoids complex build tooling in the preview, and keeps generated apps fully self-contained
- **iframe sandbox** for safe code execution — prevents generated code from affecting the host application
- **localStorage identity** instead of full OAuth — prioritizes speed of implementation while satisfying the auth requirement
- **Manual streaming fetch** instead of `useChat` hook — AI SDK v6 introduced breaking API changes; custom implementation gives more control over code extraction

## Known Limitations & Next Steps

- [ ] Replace localStorage auth with Clerk/OAuth for proper user management
- [ ] Add multi-file project support (HTML + CSS + JS)
- [ ] Add one-click deploy to Vercel/Netlify
- [ ] Add visual editor (drag-and-drop component builder)
- [ ] Add template marketplace
- [ ] Add code export to GitHub

## License

MIT
