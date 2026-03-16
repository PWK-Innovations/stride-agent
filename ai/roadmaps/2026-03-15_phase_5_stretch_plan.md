# Phase 5 Plan: Stretch Goals (Extra Credit)

## Goal

Implement optional extra-credit features: streaming responses, 4th custom tool (Google Calendar), persistent vector store, and agent proposal document.

## Approach

### Stretch 1: Streaming Responses

**What changes:**
- API route switches from `agent.invoke()` (returns full response) to `agent.stream()` (yields chunks)
- Response format changes from JSON to Server-Sent Events (SSE)
- Frontend switches from `fetch → json()` to `fetch → body.getReader()` for incremental reading

**Backend — `src/app/api/chat/route.ts`:**

```typescript
const stream = agent.stream({ messages }, { recursionLimit: 10 });
const encoder = new TextEncoder();

const readable = new ReadableStream({
  async start(controller) {
    for await (const chunk of stream) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
    }
    controller.enqueue(encoder.encode("data: [DONE]\n\n"));
    controller.close();
  },
});

return new Response(readable, {
  headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
});
```

**Frontend — `src/app/components/chat.tsx`:**
- After `fetch()`, check for streaming response via Content-Type header
- Use `response.body.getReader()` + `TextDecoder` to read chunks
- Parse SSE format: split on `\n\n`, extract `data:` prefix
- Append partial content to current assistant message as it arrives
- Detect `[DONE]` to finalize message

**Preserve fallback:** Add a query param or header to toggle streaming on/off so the non-streaming path still works. This prevents regressions.

**Stream chunk format:** The `agent.stream()` yields chunks with different shapes depending on whether the agent is thinking (text) or calling tools. Inspect the chunk structure at implementation time — typically `chunk.agent?.messages` contains AIMessage chunks and `chunk.tools?.messages` contains ToolMessage results. Only append text content from AIMessage chunks to the UI; tool call chunks should be handled separately or skipped.

**Complexity:** This is the most substantial stretch goal — it modifies both backend and frontend, requires understanding SSE format, and the agent's stream output format needs inspection to extract text content vs tool calls.

---

### Stretch 2: Google Calendar Tool (4th Custom Tool)

**Setup required:**
1. Google Cloud Console: create project, enable Calendar API, create OAuth 2.0 credentials
2. Authorize once manually to get a refresh token
3. Store in `.env.local`: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`

**Implementation — `src/lib/tools/calendar.ts`:**

The tool needs two capabilities:
- **Read events:** List upcoming events for a time range (today, tomorrow, this week)
- **Create events:** Add a new event with title, date, time, optional description

**Zod schema approach:**
```typescript
schema: z.object({
  action: z.enum(["list", "create"]).describe("Whether to list upcoming events or create a new one"),
  query: z.string().optional().describe("For list: time range like 'today' or 'this week'. For create: event details like 'Team standup at 9am Monday'"),
})
```

**OAuth flow:**
```typescript
import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
);
oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

const calendar = google.calendar({ version: "v3", auth: oauth2Client });
```

**Why pre-authorized refresh token:** Full OAuth flow in the browser requires redirect handling, consent screens, and token storage — too complex for a stretch goal. Pre-authorizing via a script and storing the refresh token in `.env.local` is simpler and sufficient for demos.

**Wire in:** Add to agent tools array in `src/lib/agent.ts` (now 4 tools total).

---

### Stretch 3: Persistent Vector Store

**Goal:** Document embeddings survive server restarts so the first RAG query is fast.

**Approach — modify `src/lib/rag/store.ts`:**

1. Define a cache path: `data/vectorstore.json`
2. On `getVectorStore()`:
   - Check if cache file exists
   - Compare cache timestamp vs latest file in `docs/`
   - If cache is newer → load from file (fast, no embedding API call)
   - If docs are newer or no cache → rebuild from scratch, then write to cache
3. Use `MemoryVectorStore` serialization methods or write a custom serialize/deserialize

**File format:** JSON containing the embedded vectors + metadata. MemoryVectorStore may have built-in serialization — check docs at implementation time. If not, manually extract the internal data structure.

**Add `data/` to .gitignore** if the cache files are large.

---

### Stretch 4: Agent Proposal

**File:** `aiDocs/agent-proposal.md`

~1 page document answering: "Identify a feature in one of your projects that would benefit from an agent pattern."

**Content outline for Stride:**
1. **The feature:** Natural-language daily planning assistant embedded in the Stride PWA
2. **Why agent pattern fits:**
   - Calendar management via conversation (vs clicking through UI)
   - RAG-powered productivity coaching (Eisenhower prioritization, Pomodoro guidance)
   - Multi-tool chaining: check calendar → calculate free time → suggest task schedule
   - Web search for context (lookup meeting topics, deadlines)
3. **How it integrates:** The Stride Agent becomes the chat panel in the PWA sidebar, connected to the same Google Calendar integration and task database
4. **What DOESN'T need an agent:** Simple CRUD (add/delete tasks), static UI rendering, timer functionality — these are better as direct UI interactions

## Priority Order

If time is limited, implement in this order:
1. **Agent proposal** — lowest effort, guaranteed completion
2. **Streaming** — highest impact on demo quality
3. **Persistent vector store** — moderate effort, nice improvement
4. **Calendar tool** — highest effort (OAuth setup), most impressive

## What NOT to Do

- Don't start stretch goals until Phase 4 is complete and all rubric requirements pass
- Don't spend more than a few hours on OAuth setup — if Google Calendar is too complex, skip it
- Don't break the non-streaming path when adding streaming
