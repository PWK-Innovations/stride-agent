# Stride Agent — High-Level Implementation Plan

## Overview

Build a multi-tool AI chatbot with Next.js, TypeScript, and LangChain.js/TypeScript (ReAct pattern). Six phases from setup through stretch goals.

## Phase Summary

| Phase | What | Deliverables | Commit |
|-------|------|-------------|--------|
| **0 — Setup** | Init Next.js + TS, install deps, folder structure, env vars | Working dev server, project skeleton | `"Initial project setup"` |
| **1 — Tools + Agent** | Calculator, web search, ReAct agent, memory, API route | 2 tools working via curl, multi-turn memory (logging added retroactively in Phase 3) | `"Add tools and ReAct agent"` |
| **2 — Web UI** | Tailwind chat page, components, connected to agent | Chat UI in browser with tool badges | `"Add Tailwind chat UI"` |
| **3 — Logging** | Pino structured logging for all tool calls | JSON logs in server console | `"Add structured logging"` |
| **4 — RAG** | 5+ docs, vector store, RAG tool, source attribution, README | 3 tools + memory + UI = rubric complete | `"Add RAG tool"` |
| **5 — Stretch** | Streaming, calendar tool, persistent store, agent proposal | Extra credit items | One commit each |

## Phase Dependencies

```
Phase 0 (Setup)
    ↓
Phase 1 (Tools + Agent) ← depends on project structure + deps
    ↓
Phase 2 (UI) ← depends on working /api/chat
    ↓
Phase 3 (Logging) ← depends on tool files to instrument
    ↓
Phase 4 (RAG) ← depends on agent + logger
    ↓
Phase 5 (Stretch) ← depends on all above
```

Phase 2 and Phase 3 are independent of each other and can be swapped.

## Rubric Requirements → Phase Mapping

| Requirement | Phase | Status |
|-------------|-------|--------|
| Calculator tool | 1 | ◻ |
| Web search tool (Tavily) | 1 | ◻ |
| RAG tool (5+ docs, source attribution) | 4 | ◻ |
| Conversation memory (multi-turn) | 1 | ◻ |
| Web UI (chat page) | 2 | ◻ |
| Structured logging | 3 | ◻ |
| context.md | Done | ✅ |
| PRD | Done | ✅ |
| Roadmap | Done | ✅ |
| .gitignore | Done | ✅ |
| 5+ meaningful commits | All | ◻ |
| README.md | 4 | ◻ |
| 2-minute demo video | 5 | ◻ |

## Stretch Goals → Phase 5

| Goal | Status |
|------|--------|
| Streaming in web UI | ◻ |
| 4th custom tool (Google Calendar) | ◻ |
| Persistent vector store | ◻ |
| Agent proposal (~1 page) | ◻ |
| 2-minute demo video | ◻ |

## Reference Docs

- `aiDocs/prd.md` — requirements, features, risks, timeline
- `aiDocs/mvp.md` — scope, tech stack, user flows
- `aiDocs/architecture.md` — project structure, request flow, agent design
- `aiDocs/coding-style.md` — TypeScript patterns, naming, error handling
- `ai/guides/unit7-building-agents.md` — ReAct pattern, tool definitions, LangChain setup
- `ai/guides/unit8-rag-multi-tool.md` — RAG pipeline, embeddings, vector store, memory
- `ai/guides/unit4-logging-testing-cli.md` — structured logging, Pino, scripts
- `ai/guides/multi-tool_agent_rubric.md` — grading criteria
