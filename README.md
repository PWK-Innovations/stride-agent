# Stride Agent

A multi-tool AI chatbot built with Next.js, TypeScript, and LangChain.js. Stride Agent uses a ReAct (Reasoning + Acting) agent pattern to route queries to the right tool — a calculator, web search, or a RAG-powered productivity knowledge base — with conversation memory and structured logging.

## Features

- **Calculator** — Evaluate math expressions with precision (powered by mathjs)
- **Web Search** — Search the web for current information (powered by Tavily)
- **Knowledge Base (RAG)** — Search 5+ productivity documents with source attribution
- **Conversation Memory** — Multi-turn context within sessions
- **Structured Logging** — Pino-based JSON logs for every tool call (entry, exit, error with stack traces)
- **Chat UI** — Olive-themed interface with tool usage badges

## Prerequisites

- Node.js 18+
- npm
- [OpenAI API key](https://platform.openai.com/api-keys)
- [Tavily API key](https://tavily.com/)

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

## Project Structure

```
src/
  app/
    api/chat/route.ts     # POST endpoint — agent invocation
    components/           # Chat UI (message, input, chat container)
    page.tsx              # Main page
  lib/
    agent.ts              # ReAct agent (GPT-4o + 3 tools)
    memory.ts             # In-memory session store
    tools/
      calculator.ts       # Math evaluation tool
      web-search.ts       # Tavily web search tool
      rag.ts              # RAG knowledge base tool
    rag/
      loader.ts           # Document loader + text splitter
      store.ts            # MemoryVectorStore singleton
    utils/
      logger.ts           # Pino structured logging
docs/                     # RAG source documents
  pomodoro-technique.md
  time-blocking.md
  eisenhower-matrix.md
  daily-planning.md
  deep-work.md
scripts/
  test.sh                # CLI test script
  dev.sh                 # Dev server launcher
  build.sh               # Build with JSON output
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
| Vector Store | MemoryVectorStore |
| Web Search | Tavily |
| Calculator | mathjs |
| Logging | Pino |
| Styling | Tailwind CSS v4 |
