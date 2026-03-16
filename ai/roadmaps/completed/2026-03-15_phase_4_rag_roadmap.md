# Phase 4: RAG (Retrieval-Augmented Generation)

## Context

Create 5+ real productivity documents, build the RAG pipeline (load → split → embed → store → retrieve), create the knowledge_base tool with source attribution, and wire it into the agent. This is the final rubric requirement before stretch goals.

**References:**
- `ai/guides/unit8-rag-multi-tool.md` — embeddings, MemoryVectorStore, DirectoryLoader, RAG tool pattern, source attribution
- `aiDocs/mvp.md` — RAG documents: Pomodoro, time-blocking, Eisenhower Matrix, daily planning, deep work
- `aiDocs/architecture.md` — RAG pipeline: load → split → embed → store → retrieve → attribute
- `aiDocs/prd.md` — RAG documents in the productivity/scheduling domain

## Checklist

### Curate Documents (`docs/`)
- [x] `docs/pomodoro-technique.md` — 500-1000 words: 25-min intervals, 5-min breaks, 4-cycle pattern, history, benefits, variations
- [x] `docs/time-blocking.md` — 500-1000 words: Cal Newport's approach, scheduling blocks, planning a day, handling interruptions
- [x] `docs/eisenhower-matrix.md` — 500-1000 words: urgent vs important quadrants, categorization examples, delegate/delete guidance
- [x] `docs/daily-planning.md` — 500-1000 words: morning review, top 3 priorities, end-of-day review, weekly connection
- [x] `docs/deep-work.md` — 500-1000 words: Cal Newport's rules, shallow vs deep work, environment design, digital minimalism
- [x] Each document has real, substantive content (not placeholder text)

### Document Loader (`src/lib/rag/loader.ts`)
- [x] Read `.md` and `.txt` files from `docs/` directory (fs-based, no DirectoryLoader needed)
- [x] Create Documents with `@langchain/core/documents` and source metadata
- [x] Import `RecursiveCharacterTextSplitter` from `@langchain/textsplitters`
- [x] Load `.md` and `.txt` files from `docs/` directory
- [x] Split with `chunkSize: 1000`, `chunkOverlap: 200`
- [x] Return split documents with metadata (source file path set manually)
- [x] Export `loadAndSplitDocuments()`

### Vector Store (`src/lib/rag/store.ts`)
- [x] Import `MemoryVectorStore` from `@langchain/classic/vectorstores/memory`
- [x] Import `OpenAIEmbeddings` from `@langchain/openai`
- [x] Embeddings model: `text-embedding-3-small`
- [x] Singleton pattern: lazy init on first call, cached in module-level variable
- [x] `MemoryVectorStore.fromDocuments(docs, embeddings)`
- [x] Log document count on initialization via logger
- [x] Export `getVectorStore()`

### RAG Tool (`src/lib/tools/rag.ts`)
- [x] Import `tool` from `@langchain/core/tools`, `z` from `zod`
- [x] Import `getVectorStore` from `../rag/store`
- [x] Import `logToolEntry`, `logToolCall`, `logToolError` from `../utils/logger`
- [x] `similaritySearch(query, 3)` — return top 3 chunks
- [x] **Source attribution on every result:** `[{i}] (Source: ${doc.metadata.source})\n${doc.pageContent}`
- [x] Handle empty results: return "No relevant documents found."
- [x] Description: explicit about productivity/time-management scope
- [x] try/catch — never throw
- [x] Log tool calls (entry, exit, error)
- [x] Export as `knowledgeBase`

### Wire into Agent (`src/lib/agent.ts`)
- [x] Import `knowledgeBase` from `./tools/rag`
- [x] Add to tools array: `[calculator, webSearch, knowledgeBase]`

### Update README (`README.md`)
- [x] Project description: what Stride Agent is
- [x] Features: calculator, web search, RAG with source attribution, conversation memory
- [x] Prerequisites: Node.js, npm, OpenAI API key, Tavily API key
- [x] Installation: `git clone`, `npm install`, copy `.env.example` to `.env.local`, add keys
- [x] How to run: `npm run dev`, open `localhost:3000`
- [x] Project structure overview
- [x] RAG documents listed
- [x] Tech stack

## Key Files

| Action | File |
|--------|------|
| Create | `docs/pomodoro-technique.md` |
| Create | `docs/time-blocking.md` |
| Create | `docs/eisenhower-matrix.md` |
| Create | `docs/daily-planning.md` |
| Create | `docs/deep-work.md` |
| Create | `src/lib/rag/loader.ts` |
| Create | `src/lib/rag/store.ts` |
| Create | `src/lib/tools/rag.ts` |
| Modify | `src/lib/agent.ts` — add RAG tool |
| Modify | `README.md` — full project documentation |

## Verification

- [x] "How does the Pomodoro technique work?" → uses `knowledge_base`, response includes `(Source: docs/pomodoro-technique.md)`
- [x] "What is the Eisenhower Matrix?" → source-attributed answer from eisenhower doc
- [x] Follow-up "How is it different from time-blocking?" → multi-turn memory works, retrieves from multiple docs
- [x] "What is 5 + 5?" → routes to calculator, NOT RAG
- [x] "Latest news today" → routes to web search, NOT RAG
- [x] Server logs show `[KnowledgeBase]` and `[RAG]` entries with query and result count (44 documents indexed)
- [x] First RAG query triggers lazy vector store init (~1.2s), subsequent queries reuse cache and are faster

## Commit

```
git add -A && git commit -m "Add RAG tool with 5+ productivity documents and source attribution"
```

## After This Phase

All rubric requirements are met:
- ✅ Calculator tool
- ✅ Web search tool
- ✅ RAG tool (5+ docs, source attribution)
- ✅ Conversation memory
- ✅ Web UI
- ✅ Structured logging
- ✅ 5+ commits (phases 0-4 = 5 commits minimum)
- ✅ README.md
- ✅ context.md, PRD, roadmap, .gitignore

Phase 5 is stretch/extra credit only.
