# Stride Agent

A multi-tool AI chatbot built with Next.js, TypeScript, and LangChain.js. Stride Agent uses a ReAct (Reasoning + Acting) agent pattern to route queries to the right tool — a calculator, web search, RAG-powered productivity knowledge base, and Google Calendar — with conversation memory and structured logging.

## Checklist

### Core Requirements
- [x] Calculator tool — evaluates math expressions
- [x] Web search tool — searches the web using Tavily
- [x] RAG tool — vector search over 5+ real documents, with source attribution
- [x] Google Calendar tool — list and create events via OAuth 2.0 (4th custom tool)
- [x] Conversation memory — multi-turn context (follow-up questions work)
- [x] Web UI — olive-themed chat page with tool usage badges
- [x] Structured logging — Pino JSON logs showing tool calls, arguments, and results
- [x] Streaming — SSE-based response pipeline (text/event-stream)
- [x] Persistent vector store — embeddings cached to disk, survive restarts
- [x] Agent proposal — ~1 page identifying how Stride benefits from an agent pattern

### Repo Requirements
- [x] context.md — orients AI tools to the project
- [x] PRD — what the agent does, its tools, the problem it solves
- [x] Roadmap — phased plan with progress tracked
- [x] .gitignore — no secrets, no node_modules
- [x] Incremental git history — 5+ meaningful commits showing progression
- [x] README.md — what it does, how to run it

## Features

- **Calculator** — Evaluate math expressions with precision (powered by mathjs)
- **Web Search** — Search the web for current information (powered by Tavily)
- **Knowledge Base (RAG)** — Search 5+ productivity documents with source attribution
- **Google Calendar** — List upcoming events and create new ones via natural language
- **Conversation Memory** — Multi-turn context within sessions
- **Structured Logging** — Pino-based JSON logs for every tool call (entry, exit, error with stack traces)
- **Streaming** — Server-Sent Events pipeline between backend and frontend
- **Persistent Vector Store** — Embeddings cached to `data/vectorstore.json`, auto-invalidated when docs change
- **Agent Proposal** — ~1 page document identifying how Stride benefits from an agent pattern (`aiDocs/agent-proposal.md`)

## Prerequisites

- Node.js 18+
- npm
- [OpenAI API key](https://platform.openai.com/api-keys)
- [Tavily API key](https://tavily.com/)
- Google Calendar API credentials (optional, for calendar tool)

## Getting Started

```bash
git clone https://github.com/PWK-Innovations/stride-agent.git
cd stride-agent
npm install
cp .env.example .env.local
# Add your API keys to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start chatting.

### Google Calendar Setup (Optional)

1. Create a project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable the Google Calendar API
3. Create OAuth 2.0 credentials (Desktop app)
4. Add `http://localhost:3333/oauth2callback` as an authorized redirect URI
5. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env.local`
6. Run `node scripts/get-google-token.js` to get your refresh token
7. Add `GOOGLE_REFRESH_TOKEN` to `.env.local`

## Project Structure

```
src/
  app/
    api/chat/route.ts     # POST endpoint — SSE streaming response
    components/           # Chat UI (message, input, chat container)
    page.tsx              # Main page
  lib/
    agent.ts              # ReAct agent (GPT-4o + 4 tools)
    memory.ts             # In-memory session store
    tools/
      calculator.ts       # Math evaluation tool
      web-search.ts       # Tavily web search tool
      rag.ts              # RAG knowledge base tool
      calendar.ts         # Google Calendar tool (OAuth 2.0)
    rag/
      loader.ts           # Document loader + text splitter
      store.ts            # MemoryVectorStore with disk caching
    utils/
      logger.ts           # Pino structured logging
docs/                     # RAG source documents
  pomodoro-technique.md
  time-blocking.md
  eisenhower-matrix.md
  daily-planning.md
  deep-work.md
scripts/
  get-google-token.js    # OAuth token helper
  test.sh                # CLI test script
  dev.sh                 # Dev server launcher
  build.sh               # Build with JSON output
aiDocs/
  agent-proposal.md      # Agent proposal document
```

## RAG Documents

| Document | Topic |
|----------|-------|
| `pomodoro-technique.md` | 25-min focus intervals, breaks, history, variations |
| `time-blocking.md` | Cal Newport's approach, scheduling blocks, handling interruptions |
| `eisenhower-matrix.md` | Urgent vs important quadrants, categorization, delegation |
| `daily-planning.md` | Morning review, top 3 priorities, end-of-day review |
| `deep-work.md` | Deep vs shallow work, environment design, digital minimalism |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| AI Agent | LangChain.js + LangGraph (ReAct pattern) |
| LLM | GPT-4o |
| Embeddings | text-embedding-3-small |
| Vector Store | MemoryVectorStore (persistent cache) |
| Web Search | Tavily |
| Calendar | Google Calendar API (OAuth 2.0) |
| Calculator | mathjs |
| Logging | Pino |
| Styling | Tailwind CSS v4 |
