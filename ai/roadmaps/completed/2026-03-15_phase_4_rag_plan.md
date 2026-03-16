# Phase 4 Plan: RAG (Retrieval-Augmented Generation)

## Goal

Create 5+ real productivity documents, build the full RAG pipeline, create the knowledge_base tool with source attribution, wire it into the agent, and finalize the README. This completes all rubric requirements.

## Approach

### 1. Curate Documents — `docs/`

Five markdown files in the productivity/scheduling domain (matching PRD and MVP docs):

| File | Topic | Key Content |
|------|-------|-------------|
| `pomodoro-technique.md` | Pomodoro Technique | 25-min intervals, 5-min breaks, 4-cycle pattern, history (Cirillo), benefits, common variations |
| `time-blocking.md` | Time-Blocking | Cal Newport's approach, scheduling specific blocks, planning a time-blocked day, handling interruptions, defense against shallow work |
| `eisenhower-matrix.md` | Eisenhower Matrix | Urgent vs important quadrants (Do/Schedule/Delegate/Delete), categorization examples, decision framework |
| `daily-planning.md` | Daily Planning | Morning review routine, identify top 3 priorities, time estimation, end-of-day review, connection to weekly planning |
| `deep-work.md` | Deep Work & Focus | Cal Newport's 4 rules, shallow vs deep work definitions, environment design, digital minimalism, ritual building |

**Content quality matters** — these documents are what the agent searches over during demos. Each should be 500-1000 words of substantive, real content. Not placeholder text.

**Why this domain:** Aligns with the parent Stride project (AI-Powered Daily Planner). When the agent integrates into Stride, these documents become the built-in knowledge base for productivity coaching.

### 2. Document Loader — `src/lib/rag/loader.ts`

Load and chunk documents using LangChain's built-in loaders.

**Pipeline:**
1. `DirectoryLoader` reads all `.md` and `.txt` files from `docs/`
2. Each file becomes a `Document` with `pageContent` and `metadata.source` (file path auto-populated)
3. `RecursiveCharacterTextSplitter` chunks each document

**Chunk configuration:**
- `chunkSize: 1000` — characters per chunk
- `chunkOverlap: 200` — overlap between chunks for context continuity

**Why these values:** With 5 documents of ~500-1000 words each (~3000-6000 characters), this produces roughly 15-30 chunks. Small enough for MemoryVectorStore, large enough for meaningful retrieval.

**Code pattern:**
```typescript
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const DOCS_DIR = path.join(process.cwd(), "docs");

export async function loadAndSplitDocuments() {
  const loader = new DirectoryLoader(DOCS_DIR, {
    ".md": (filePath) => new TextLoader(filePath),
    ".txt": (filePath) => new TextLoader(filePath),
  });
  const docs = await loader.load();
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
  return splitter.splitDocuments(docs);
}
```

### 3. Vector Store — `src/lib/rag/store.ts`

In-memory vector store with lazy initialization.

**Pattern:** Singleton — built once on first request, cached in a module-level variable. Subsequent requests reuse the same store without re-embedding.

```typescript
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";

let vectorStore: MemoryVectorStore | null = null;

export async function getVectorStore() {
  if (vectorStore) return vectorStore;
  const embeddings = new OpenAIEmbeddings({ model: "text-embedding-3-small" });
  const docs = await loadAndSplitDocuments();
  vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
  return vectorStore;
}
```

**`text-embedding-3-small`** — cheap ($0.02/1M tokens), fast, 1536 dimensions. More than sufficient for 5 documents.

**First-request latency:** The first RAG query after server start triggers loading + splitting + embedding all documents. This takes a few seconds. The "Thinking..." UI indicator from Phase 2 covers this. Subsequent queries are instant.

### 4. RAG Tool — `src/lib/tools/rag.ts`

**Source attribution is the critical requirement.** Every RAG response must include where the information came from.

**Pattern:**
```typescript
const results = await store.similaritySearch(query, 3);
return results
  .map((doc, i) => `[${i + 1}] (Source: ${doc.metadata.source})\n${doc.pageContent}`)
  .join("\n\n");
```

`doc.metadata.source` is automatically populated by `DirectoryLoader` with the file path (e.g., `docs/pomodoro-technique.md`).

**Tool description is critical for routing.** The description must be explicit about the scope so the agent doesn't route general questions to RAG:

> "Search the productivity and time management knowledge base. Use for questions about the Pomodoro Technique, time-blocking, the Eisenhower Matrix, daily planning, and deep work. Do NOT use for general web questions or math."

The "Do NOT use for..." part prevents misrouting. Without it, the agent may try RAG for questions like "What's the weather?" because the description is too generic.

### 5. Wire into Agent — `src/lib/agent.ts`

Add the RAG tool to the tools array:

```typescript
import { knowledgeBase } from "./tools/rag";

const tools = [calculator, webSearch, knowledgeBase]; // Now 3 tools
```

The agent now has all 3 required tools. The LLM uses tool descriptions to decide which to call.

### 6. Update README — `README.md`

Replace the skeleton with a complete project README:
- What Stride Agent is (1-2 sentences)
- Features list (calculator, web search, RAG with source attribution, conversation memory)
- Prerequisites (Node.js 18+, npm, OpenAI API key, Tavily API key)
- Quick start: clone, `npm install`, copy `.env.example` to `.env.local`, add keys, `npm run dev`
- Project structure (abbreviated tree)
- RAG documents listed
- Tech stack table

## Technical Decisions

- **MemoryVectorStore over Chroma/Pinecone** — zero infrastructure, sufficient for 5 documents, persistent store is stretch
- **top-k = 3** — returns 3 most relevant chunks per query; balances relevance with context window usage
- **Singleton vector store** — avoids re-embedding on every API call; rebuilt only on server restart
- **DirectoryLoader over static array** — scales to more documents, auto-populates source metadata

## Rubric Completion Check

After this phase, ALL required deliverables are met:
- ✅ Calculator tool (Phase 1)
- ✅ Web search tool (Phase 1)
- ✅ RAG tool with 5+ docs and source attribution (Phase 4)
- ✅ Conversation memory (Phase 1)
- ✅ Web UI (Phase 2)
- ✅ Structured logging (Phase 3)
- ✅ context.md, PRD, roadmap, .gitignore (Pre-existing)
- ✅ 5+ meaningful commits (Phases 0-4 = 5 commits)
- ✅ README.md (Phase 4)

## What NOT to Do

- Don't add persistent vector store — that's Phase 5 stretch
- Don't add document upload UI — documents are pre-loaded
- Don't over-engineer the loader — DirectoryLoader + TextLoader is sufficient
- Don't use a paid vector database — MemoryVectorStore is free and meets requirements
