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
