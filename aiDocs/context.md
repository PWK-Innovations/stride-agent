# Stride Agent — Project Context

## What This Is

- Multi-tool AI chatbot agent built with LangChain.js (ReAct pattern)
- Individual project for Dev Units 7-8
- Will eventually integrate into the parent Stride project (AI-Powered Daily Planner)

## Key Docs

- **PRD:** `aiDocs/prd.md` — problem statement, features, user stories, risks, timeline
- **MVP:** `aiDocs/mvp.md` — what's in scope, tech stack, user flows, validation checklist
- **Rubric:** `ai/guides/multi-tool_agent_rubric.md` — assignment requirements and grading criteria
- **Architecture:** `aiDocs/architecture.md` — project structure, request flow, agent design, RAG pipeline
- **Coding Style:** `aiDocs/coding-style.md` — naming conventions, TypeScript patterns, error handling, logging format
- **Component Styles:** `notes/` — reference folder for Tailwind component patterns and UI style

## Tech Stack

- **Framework:** Next.js (App Router) with TypeScript
- **Agent Framework:** LangChain.js/TypeScript (ReAct agent pattern)
- **LLM:** OpenAI GPT-4o
- **Web Search:** Tavily API
- **RAG:** LangChain document loaders, text splitters, OpenAI embeddings, MemoryVectorStore
- **Calendar (stretch):** Google Calendar API via `googleapis` npm package, OAuth 2.0
- **Frontend:** Next.js React components + Tailwind CSS — reference `notes/` folder for component styles
- **Backend:** Next.js API routes (`app/api/`)
- **Logging:** Structured console logging (tool name, args, result)

## Tools (4 total)

- **Calculator** — evaluates math expressions safely (no raw `eval()`)
- **Web Search** — Tavily API, returns summarized web results
- **RAG** — vector search over 5+ productivity/scheduling docs, source attribution required
- **Calendar (stretch)** — Google Calendar read/write via OAuth 2.0

## RAG Documents (productivity/scheduling domain)

- Pomodoro Technique
- Time-blocking methodology
- Eisenhower Matrix (urgency/importance prioritization)
- Daily planning best practices
- Focus and deep work strategies

## Current Focus

- Phase 1: Project setup, documentation, and repo infrastructure
- Next up: Phase 2 — implement calculator and web search tools
- Core MVP must work before any stretch goals (calendar, streaming, persistent vector store)

## Repo Requirements (from rubric)

- 5+ meaningful commits showing incremental progression
- Structured logging for tool calls
- .gitignore — no secrets, no node_modules
- README.md — what it does, how to run it
- 2-minute demo video at the end
