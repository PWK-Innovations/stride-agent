# MVP Definition: Stride Agent

## Context

- **PRD Reference:** `prd.md` (same folder)
- **Rubric Reference:** `ai/guides/multi-tool_agent_rubric.md`
- **Core idea:** A chat-based AI agent built with Next.js, TypeScript, and LangChain.js/TypeScript (ReAct pattern) that can do math, search the web, answer questions from documents, and interact with Google Calendar — all from one conversation.

---

## MVP Goal

Build a working web chat UI where a user can talk to an AI agent that picks the right tool for the job: **ask a question → agent reasons about which tool to use → executes it → returns a synthesized answer.**

This is NOT a production service. This is a demo to validate:

1. The ReAct agent loop correctly selects and chains tools based on user input
2. Conversation memory maintains context across multiple turns
3. RAG retrieval returns relevant, source-attributed answers from real documents
4. The chat UI provides a usable interface for interacting with all four tools

---

## MVP Scope: What's In

- LangChain.js/TypeScript ReAct agent with four tools
- Tailwind CSS chat UI in the browser
- Conversation memory (in-memory, per session)
- Structured logging of tool calls
- 5+ productivity/scheduling documents for RAG

### Must-Have (MVP Core)

**Chat UI (Tailwind CSS)**

- A single-page chat interface styled with Tailwind CSS.
- Message input field at the bottom, scrollable message history above.
- User messages and agent responses visually distinct (left/right or color-coded bubbles).
- Shows which tool the agent used for each response (e.g., a small label or badge like "Used: Calculator").
- Responsive enough to work in a desktop browser — mobile optimization is not required.

**Calculator Tool**

- Evaluates math expressions from natural language (e.g., "What's 15% of 230?" or "Convert 5 miles to kilometers").
- Uses a safe expression evaluator — no raw `eval()`.
- Agent selects this tool when the user asks a math or arithmetic question.

**Web Search Tool (Tavily)**

- Searches the web via the Tavily API and returns summarized results.
- Agent selects this tool when the user asks about current events, facts, or anything not in the local documents.
- Results include enough context for the agent to formulate a useful answer.

**RAG Tool (Vector Search)**

- Searches over 5+ real documents in the productivity/scheduling domain:
  - Pomodoro Technique
  - Time-blocking methodology
  - Eisenhower Matrix (urgency/importance prioritization)
  - Daily planning best practices
  - Focus and deep work strategies
- Documents are chunked, embedded, and stored in a vector store at build time.
- Every RAG response includes **source attribution** — the document name or section the information came from.
- Agent selects this tool when the user asks about productivity techniques, scheduling strategies, or time management.

**Conversation Memory**

- Multi-turn context maintained in-memory for the session.
- Follow-up questions work without restating context (e.g., "Tell me more about that" after a RAG answer).
- Memory clears on page refresh — no persistence required for MVP.

**Structured Logging**

- Every tool call logs: tool name, input arguments, and result summary.
- Logs are visible in the server console (not necessarily in the UI).
- Useful for debugging and demonstrating agent behavior in the demo video.

### Stretch Goals (After Core Works)

**Calendar Tool (Google Calendar)**

- Reads upcoming events from Google Calendar via OAuth 2.0 and the `googleapis` npm package.
- Adds new calendar events from natural language (e.g., "Add a meeting with Jake tomorrow at 3pm").
- Agent selects this tool when the user asks about their schedule or wants to create an event.
- OAuth flow: user authorizes once, token is stored locally for the session.

**Streaming**

- Agent responses stream token-by-token into the chat UI instead of appearing all at once.
- Provides better UX for longer responses — user sees output immediately.

**Persistent Vector Store**

- Document embeddings survive server restarts (written to disk or a lightweight DB).
- Eliminates re-embedding on every startup.

---

## MVP Scope: What's Out

- User authentication or accounts — agent runs locally, no login.
- Persistent chat history — memory is session-only, lost on refresh.
- Production deployment or hosting — runs on `localhost`.
- Mobile-optimized UI — works in desktop browsers only.
- Document upload — RAG documents are pre-loaded, users can't add their own.
- Multi-agent orchestration — single agent, multiple tools.
- Calendar write operations beyond stretch — read-only is sufficient for core MVP; write is stretch.
- Multiple calendar providers — Google Calendar only.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Agent Framework** | LangChain.js/TypeScript (ReAct agent pattern) |
| **LLM** | OpenAI GPT-4o (or equivalent via LangChain) |
| **Web Search** | Tavily API |
| **RAG / Embeddings** | LangChain document loaders, text splitters, OpenAI embeddings |
| **Vector Store** | In-memory (MemoryVectorStore) — persistent store is stretch |
| **Calendar** | Google Calendar API via `googleapis` npm package (stretch) |
| **Frontend** | Next.js React components + Tailwind CSS |
| **Backend** | Next.js API routes (App Router, `app/api/`) |
| **Language** | TypeScript (strict mode) |
| **Logging** | Structured console logging (tool name, args, result) |

---

## User Flow

### Flow 1: Math Question

1. User types: **"What's 247 * 18?"**
2. Agent reasons → selects **Calculator** tool
3. Calculator evaluates → returns `4446`
4. Agent responds: "247 * 18 = 4,446"
5. UI shows tool badge: `Calculator`

### Flow 2: Web Search

1. User types: **"What happened in the NBA last night?"**
2. Agent reasons → selects **Web Search** tool
3. Tavily searches → returns top results
4. Agent synthesizes a summary from the search results
5. UI shows tool badge: `Web Search`

### Flow 3: RAG (Document Retrieval)

1. User types: **"How does the Pomodoro technique work?"**
2. Agent reasons → selects **RAG** tool
3. RAG retrieves relevant chunks from the Pomodoro document
4. Agent responds with an explanation + **source attribution** (e.g., "Source: Pomodoro Technique Guide")
5. User follows up: **"How long are the breaks?"** → memory maintains context, agent retrieves more from the same doc

### Flow 4: Calendar (Stretch)

1. User types: **"What's on my calendar tomorrow?"**
2. Agent reasons → selects **Calendar** tool
3. Calendar tool reads Google Calendar events for tomorrow
4. Agent responds with a formatted list of events
5. User types: **"Add a team standup at 9am on Monday"**
6. Agent creates the event → confirms with details

### Flow 5: Multi-Turn Memory

1. User types: **"Search for the best productivity apps in 2026"**
2. Agent uses Web Search → returns results
3. User types: **"Which of those are free?"**
4. Agent uses memory to understand "those" refers to the previous search → refines the answer or searches again with context

---

## Validation

### Success = the agent picks the right tool and answers correctly

- **Working UI:** Chat page loads in a browser, messages send and display correctly.
- **Tool selection:** Agent consistently picks the correct tool for each type of question.
- **Calculator:** Returns accurate math results.
- **Web search:** Returns relevant, current information.
- **RAG:** Returns answers grounded in the loaded documents with source attribution visible.
- **Memory:** Follow-up questions work — agent references prior context.
- **Logging:** Tool calls are visible in server logs with tool name, arguments, and results.

---

## Summary

| Layer | MVP Core | Stretch |
|-------|----------|---------|
| **UI** | Tailwind CSS chat page — send messages, see responses, tool badges | Streaming responses |
| **Tools** | Calculator, Web Search (Tavily), RAG (5+ docs, source attribution) | Google Calendar (read + write) |
| **Memory** | In-memory conversation context (session-only) | Persistent vector store |
| **Logging** | Structured console logs (tool name, args, result) | — |
| **Infra** | Next.js app, localhost only | — |

**In one line:** A Next.js + TypeScript chat UI where you talk to a LangChain.js/TypeScript ReAct agent that can do math, search the web, answer from documents with sources, and (stretch) manage your Google Calendar — all in one conversation thread with memory.
