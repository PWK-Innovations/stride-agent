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
- [ ] `docs/pomodoro-technique.md` — 500-1000 words: 25-min intervals, 5-min breaks, 4-cycle pattern, history, benefits, variations
- [ ] `docs/time-blocking.md` — 500-1000 words: Cal Newport's approach, scheduling blocks, planning a day, handling interruptions
- [ ] `docs/eisenhower-matrix.md` — 500-1000 words: urgent vs important quadrants, categorization examples, delegate/delete guidance
- [ ] `docs/daily-planning.md` — 500-1000 words: morning review, top 3 priorities, end-of-day review, weekly connection
- [ ] `docs/deep-work.md` — 500-1000 words: Cal Newport's rules, shallow vs deep work, environment design, digital minimalism
- [ ] Each document has real, substantive content (not placeholder text)

### Document Loader (`src/lib/rag/loader.ts`)
- [ ] Import `DirectoryLoader` from `langchain/document_loaders/fs/directory`
- [ ] Import `TextLoader` from `langchain/document_loaders/fs/text`
- [ ] Import `RecursiveCharacterTextSplitter` from `langchain/text_splitter`
- [ ] Load `.md` and `.txt` files from `docs/` directory
- [ ] Split with `chunkSize: 1000`, `chunkOverlap: 200`
- [ ] Return split documents with metadata (source file path auto-populated by DirectoryLoader)
- [ ] Export `loadAndSplitDocuments()`

### Vector Store (`src/lib/rag/store.ts`)
- [ ] Import `MemoryVectorStore` from `@langchain/classic/vectorstores/memory`
- [ ] Import `OpenAIEmbeddings` from `@langchain/openai`
- [ ] Embeddings model: `text-embedding-3-small`
- [ ] Singleton pattern: lazy init on first call, cached in module-level variable
- [ ] `MemoryVectorStore.fromDocuments(docs, embeddings)`
- [ ] Log document count on initialization via logger
- [ ] Export `getVectorStore()`

### RAG Tool (`src/lib/tools/rag.ts`)
- [ ] Import `tool` from `@langchain/core/tools`, `z` from `zod`
- [ ] Import `getVectorStore` from `../rag/store`
- [ ] Import `logToolCall`, `logToolError` from `../utils/logger`
- [ ] `similaritySearch(query, 3)` — return top 3 chunks
- [ ] **Source attribution on every result:** `[{i}] (Source: ${doc.metadata.source})\n${doc.pageContent}`
- [ ] Handle empty results: return "No relevant documents found."
- [ ] Description: explicit about productivity/time-management scope
- [ ] try/catch — never throw
- [ ] Log tool calls
- [ ] Export as `knowledgeBase`

### Wire into Agent (`src/lib/agent.ts`)
- [ ] Import `knowledgeBase` from `./tools/rag`
- [ ] Add to tools array: `[calculator, webSearch, knowledgeBase]`

### Update README (`README.md`)
- [ ] Project description: what Stride Agent is
- [ ] Features: calculator, web search, RAG with source attribution, conversation memory
- [ ] Prerequisites: Node.js, npm, OpenAI API key, Tavily API key
- [ ] Installation: `git clone`, `npm install`, copy `.env.example` to `.env.local`, add keys
- [ ] How to run: `npm run dev`, open `localhost:3000`
- [ ] Project structure overview
- [ ] RAG documents listed
- [ ] Tech stack

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

- [ ] "How does the Pomodoro technique work?" → uses `knowledge_base`, response includes `(Source: docs/pomodoro-technique.md)`
- [ ] "What is the Eisenhower Matrix?" → source-attributed answer from eisenhower doc
- [ ] Follow-up "How is it different from time-blocking?" → multi-turn memory works, retrieves from multiple docs
- [ ] "What is 5 + 5?" → routes to calculator, NOT RAG
- [ ] "Latest news today" → routes to web search, NOT RAG
- [ ] Server logs show `[RAG]` entries with query and result count
- [ ] First RAG query may be slow (lazy vector store init) — subsequent queries are fast

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
