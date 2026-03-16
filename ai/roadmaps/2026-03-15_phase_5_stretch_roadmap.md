# Phase 5: Stretch Goals (Extra Credit)

## Context

All rubric requirements are met after Phase 4. These are extra credit items that add polish and demonstrate advanced capabilities.

**References:**
- `ai/guides/multi-tool_agent_rubric.md` — stretch goals list
- `ai/guides/unit7-building-agents.md` — streaming pattern
- `ai/guides/unit8-rag-multi-tool.md` — persistent vector store, alternative frameworks
- `aiDocs/prd.md` — P1/P2 features

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

### Deliverables
- [x] GitHub repo with proper infrastructure and incremental history
- [x] Working agent — four tools + memory + web UI
- [x] README.md
- [ ] 2-minute demo video — unedited screen capture showing agent in action

---

## Implementation Details

### Streaming Responses
- [x] API route sends responses as Server-Sent Events (`Content-Type: text/event-stream`)
- [x] SSE events: `type: "tool"` (tool name), `type: "text"` (response content), `type: "done"` (final status)
- [x] Frontend reads SSE stream with `res.body.getReader()` + `TextDecoder`
- [x] Frontend parses SSE format and updates assistant message incrementally
- [x] Fixed React StrictMode duplication bug (immutable state updates via `prev.map()`)
- [x] Tool badge rendered from `type: "done"` event
- [x] Verified: responses display without duplication
- [x] Token-by-token streaming via `agent.streamEvents()` — words appear one at a time like ChatGPT
- [x] Filters `on_chat_model_stream` to only emit text tokens (skips tool_call_chunks)
- [x] Tracks tool usage from `on_tool_end` events
- [x] Error handling for stream failures with `type: "error"` SSE event

### Google Calendar Tool (4th Custom Tool)
- [x] `npm install googleapis`
- [x] Set up OAuth 2.0 credentials in Google Cloud Console
- [x] Add to `.env.local`: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`
- [x] Add to `.env.example` with placeholder values
- [x] Create `src/lib/tools/calendar.ts` with list/create actions, structured logging
- [x] Zod schema for input (action: "list" | "create", query details)
- [x] Add calendar tool to agent tools array in `src/lib/agent.ts` (now 4 tools)
- [x] Created `scripts/get-google-token.js` helper for OAuth token generation
- [x] Test: "What's on my calendar tomorrow?" → reads events
- [x] Test: "Add a meeting at 3pm on Monday" → creates event

### Persistent Vector Store
- [x] Cache embeddings to `data/vectorstore.json` after initial build
- [x] Compare cache mtime vs docs mtime — load from cache if newer
- [x] If docs are newer or no cache exists, rebuild from scratch
- [x] Log whether loading from cache or rebuilding
- [x] Test: restart server → logs show "[RAG] Loading vector store from cache"
- [x] Test: modify a doc → restart → logs show "[RAG] Building vector store from documents"

### Agent Proposal
- [x] Create `aiDocs/agent-proposal.md` (~1 page, ~650 words)
- [x] Identify a feature in the Stride project that benefits from an agent pattern
- [x] Explain WHY the agent pattern fits (NL calendar, RAG coaching, multi-tool chaining, web search, memory)
- [x] Mention what WOULDN'T benefit from an agent (simple CRUD, static UI, timers, data viz)

### Demo Video
- [ ] Record a 2-minute screencast demonstrating the agent
- [ ] Show calculator, web search, RAG, and calendar tools
- [ ] Show conversation memory (follow-up questions)
- [ ] Show structured logging in server console
- [ ] Save video and add link to README.md

## Key Files

| Action | File |
|--------|------|
| Modify | `src/app/api/chat/route.ts` — SSE streaming |
| Modify | `src/app/components/chat.tsx` — SSE reader |
| Create | `src/lib/tools/calendar.ts` — Google Calendar tool |
| Modify | `src/lib/agent.ts` — add 4th tool |
| Modify | `src/lib/rag/store.ts` — persistent cache |
| Create | `aiDocs/agent-proposal.md` — agent proposal |
| Create | `scripts/get-google-token.js` — OAuth helper |
| Modify | `.env.example` — Google creds |
| Modify | `README.md` — updated docs |
