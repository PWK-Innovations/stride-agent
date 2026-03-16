# Changelog

## 2026-03-15 — Project Documentation & Planning

- Created PRD (`aiDocs/prd.md`) — problem statement, features (P0/P1/P2), user stories, risks
- Created MVP doc (`aiDocs/mvp.md`) — scope, tech stack, user flows, validation criteria
- Created context.md (`aiDocs/context.md`) — project overview, tech stack, current focus
- Created CLAUDE.md — behavioral guidelines, code quality rules, scope constraints
- Created architecture doc (`aiDocs/architecture.md`) — Next.js App Router structure, request flow, agent design
- Created coding style guide (`aiDocs/coding-style.md`) — TypeScript patterns, React/Next.js conventions, error handling
- Pivoted tech stack from JavaScript/Express to TypeScript/Next.js
- Scraped professor's lecture slides and created 5 reference guides in `ai/guides/`
- Created high-level implementation plan with 6 phases (0-5) in `ai/roadmaps/`
- Created individual plan files (detailed "how") and roadmap files (checklists) for each phase
- Completed alignment review of all plans against rubric, professor's guides, MVP, and PRD
- Applied 6 fixes: demo video, logging retrofit timing, tool count clarity, streaming format, error recovery, session reset

## 2026-03-15 — Phase 0: Project Setup

- Initialized Next.js 16 with TypeScript, Tailwind CSS, ESLint, App Router
- Installed all LangChain dependencies, mathjs, pino, zod
- Created project directory structure (src/lib/tools, src/lib/rag, src/lib/utils, docs, scripts)
- Added .env.example with placeholder API keys
- Created dev.sh and build.sh scripts with exit codes + JSON output
- Merged .gitignore with Next.js entries

## 2026-03-15 — Phase 1: Tools + Agent

- Created calculator tool (`src/lib/tools/calculator.ts`) — mathjs evaluate, Zod schema, error handling
- Created web search tool (`src/lib/tools/web-search.ts`) — TavilySearch, maxResults: 3, formatted output
- Created conversation memory (`src/lib/memory.ts`) — in-memory session store with BaseMessage types
- Created ReAct agent (`src/lib/agent.ts`) — GPT-4o, temperature 0, createReactAgent from @langchain/langgraph
- Created API route (`src/app/api/chat/route.ts`) — POST handler with validation, tool detection, memory integration
- Verified: calculator returns correct results, web search returns formatted results, memory persists across turns, validation returns 400

## 2026-03-15 — Phase 2: Web UI

- Created Message component (`src/app/components/message.tsx`) — olive bubbles, tool badges, LaTeX cleanup
- Created Input component (`src/app/components/input.tsx`) — rounded-full input + send button, enter to submit
- Created Chat container (`src/app/components/chat.tsx`) — session state, auto-scroll, thinking indicator, empty state
- Updated page.tsx, layout.tsx, globals.css — olive theme, Instrument Serif + Inter fonts, Tailwind @theme
- Updated coding-style.md with olive design system patterns
- Installed clsx for className merging
- Excluded ai/ from tsconfig.json to avoid type-checking reference files
- User bubbles match Send button color (olive-950), agent bubbles in olive-100

## 2026-03-15 — Phase 3: Structured Logging

- Created logger utility (`src/lib/utils/logger.ts`) — Pino with raw JSON output, configurable LOG_LEVEL
- Added three-point logging per professor's slides: entry (`logToolEntry`), exit (`logToolCall`), error (`logToolError`)
- `logToolEntry` — INFO level, logs action name + input arguments on function entry
- `logToolCall` — INFO level, logs action + input + truncated result + success status on function exit
- `logToolError` — ERROR level, logs action + input + error message + stack trace
- Integrated logging into calculator tool — success and error paths
- Integrated logging into web search tool — success, no results, API error, and catch paths
- Integrated logging into API route — request received, response sent, error logging
- Created CLI test script (`scripts/test.sh`) — JSON output, exit codes, tests calculator/web search/memory/validation

## 2026-03-15 — Phase 4: RAG (Retrieval-Augmented Generation)

- Created 5 productivity documents in `docs/` (500-1000 words each): pomodoro-technique, time-blocking, eisenhower-matrix, daily-planning, deep-work
- Created document loader (`src/lib/rag/loader.ts`) — reads markdown files, creates Documents with source metadata, splits with RecursiveCharacterTextSplitter (1000/200)
- Created vector store (`src/lib/rag/store.ts`) — MemoryVectorStore singleton with text-embedding-3-small, lazy init, logs document count
- Created RAG tool (`src/lib/tools/rag.ts`) — knowledge_base tool with similaritySearch top-3, source attribution on every result, three-point logging
- Wired knowledgeBase into agent (`src/lib/agent.ts`) — now 3 tools: calculator, webSearch, knowledgeBase
- Updated README.md — full project documentation with features, setup, structure, tech stack
- Installed `@langchain/community` for additional LangChain integrations
- Fixed loader imports: used fs + `@langchain/core/documents` + `@langchain/textsplitters` instead of deprecated `langchain/document_loaders`

## 2026-03-16 — Phase 5: Stretch Goals

### Streaming Responses
- Modified API route to use `agent.streamEvents()` with SSE format (`text/event-stream`)
- Frontend reads stream with `res.body.getReader()`, appends tokens incrementally
- SSE events: `text` (LLM tokens), `tool` (tool name), `done` (final status with toolUsed)
- Token-by-token streaming — words appear one at a time like ChatGPT
- Filters `on_chat_model_stream` to only emit text tokens (skips tool_call_chunks from tool-selection LLM calls)
- Tracks tool usage from `on_tool_end` events
- Error handling for stream failures with `type: "error"` SSE event
- Fixed React StrictMode duplication bug (immutable state updates via `prev.map()`)

### Google Calendar Tool (4th Custom Tool)
- Created `src/lib/tools/calendar.ts` — list and create events via OAuth 2.0
- Zod schema for input (action: "list" | "create", query details)
- Created `scripts/get-google-token.js` — OAuth helper that reads .env.local, opens browser for authorization
- Added GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN to .env.example
- Wired calendar tool into agent (now 4 tools)

### Persistent Vector Store
- Modified `src/lib/rag/store.ts` to cache embeddings to `data/vectorstore.json`
- Compares cache mtime vs docs mtime — loads from cache if newer, rebuilds if docs changed
- Logs `[RAG] Loading vector store from cache` or `[RAG] Building vector store from documents`

### Agent Proposal
- Created `aiDocs/agent-proposal.md` (~650 words) — identifies natural-language planning assistant as the Stride feature that benefits from an agent pattern
- Covers why agent fits (NL calendar, RAG coaching, multi-tool chaining, web search, memory) and what doesn't need an agent (CRUD, static UI, timers)
