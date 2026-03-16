# Architecture — Stride Agent

## Overview

- Next.js app (App Router) with TypeScript — serves both the chat UI and API routes
- LangChain.js/TypeScript ReAct agent handles all reasoning and tool selection
- Tools are modular — each tool is a self-contained file the agent can call
- No database for MVP — memory and vector store are in-memory

## Project Structure

```
stride-agent/
├── src/
│   └── app/
│       ├── layout.tsx          # Root layout
│       ├── page.tsx            # Chat UI page
│       ├── api/
│       │   └── chat/
│       │       └── route.ts    # POST /api/chat — agent endpoint
│       └── components/
│           ├── chat.tsx         # Chat container component
│           ├── message.tsx      # Single message bubble
│           └── input.tsx        # Message input field
├── src/lib/
│   ├── agent.ts                # ReAct agent setup (LangChain AgentExecutor)
│   ├── memory.ts               # Conversation memory configuration
│   ├── tools/
│   │   ├── calculator.ts       # Math expression evaluator
│   │   ├── web-search.ts       # Tavily API search
│   │   ├── rag.ts              # Vector search over documents
│   │   └── calendar.ts         # Google Calendar integration (stretch)
│   ├── rag/
│   │   ├── loader.ts           # Document loading and chunking
│   │   └── store.ts            # Vector store setup and retrieval
│   └── utils/
│       └── logger.ts           # Structured logging helper
├── docs/                       # RAG source documents (5+ markdown/text files)
├── notes/                      # Tailwind component style references
├── aiDocs/                     # Project documentation (PRD, MVP, context, etc.)
├── ai/guides/                  # Assignment rubric
├── .env.local                  # API keys (not committed)
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## Request Flow

1. **User sends message** → React component POSTs to `/api/chat` with `{ message, sessionId }`
2. **Next.js API route** (`app/api/chat/route.ts`) receives the request, passes it to the agent
3. **ReAct agent** (LangChain AgentExecutor):
   - Reads the message + conversation history from memory
   - Reasons about which tool to use (or responds directly)
   - Calls the selected tool with arguments
   - Observes the tool result
   - Repeats if needed (multi-step reasoning)
   - Returns final answer
4. **Structured logger** records each tool call (tool name, args, result)
5. **API route** returns `{ response, toolUsed }` as JSON
6. **React component** renders the response in the chat UI with a tool badge

## Agent Architecture

- **Pattern:** ReAct (Reasoning + Acting) via LangChain.js/TypeScript `AgentExecutor`
- **LLM:** OpenAI GPT-4o — handles reasoning, tool selection, and response generation
- **Tools:** Array of LangChain `Tool` objects passed to the agent at initialization
- **Memory:** LangChain `BufferMemory` — stores conversation history in-memory per session
- **Tool selection:** The LLM decides which tool to call based on the user's message and conversation context — no hardcoded routing

## Tool Design

- Each tool is a standalone module exporting a LangChain `Tool` (or `DynamicTool`)
- Tools have:
  - `name` — identifier the agent uses to select it
  - `description` — tells the LLM when to use this tool
  - `func` — the async function that runs when called
- Tools do one thing — no side effects, no cross-tool dependencies
- Tools return strings — the agent handles synthesis and formatting
- Each tool file exports a typed interface for its inputs/outputs

## RAG Pipeline

1. **Load:** Read markdown/text files from `docs/` directory
2. **Split:** Chunk documents using LangChain `RecursiveCharacterTextSplitter`
3. **Embed:** Generate embeddings via OpenAI embeddings API
4. **Store:** Save to `MemoryVectorStore` (in-memory for MVP)
5. **Retrieve:** On tool call, similarity search returns top-k chunks
6. **Attribute:** Each chunk carries source metadata — included in the agent's response

## Data Flow

- **Conversation memory:** In-memory per session, cleared on server restart
- **Vector store:** In-memory, rebuilt from `docs/` on server startup
- **API keys:** Loaded from `.env.local` via Next.js built-in env handling — OpenAI, Tavily, Google (stretch)
- **No database** — no persistence layer for MVP

## Key Decisions

- **Next.js over Express** — matches parent Stride project, API routes + React UI in one framework, TypeScript out of the box
- **App Router** — modern Next.js convention, server components by default, API routes via `route.ts`
- **TypeScript** — type safety for tool interfaces, agent config, and API contracts
- **MemoryVectorStore over Chroma/Pinecone** — zero infrastructure, sufficient for 5 docs
- **Single app** — frontend and API in the same Next.js instance, no CORS issues
- **Tailwind CSS** — reference `notes/` for component patterns
- **Session-based memory** — no auth needed, each browser session gets its own history
