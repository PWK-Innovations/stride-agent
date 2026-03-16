# Phase 5: Stretch Goals (Extra Credit)

## Context

All rubric requirements are met after Phase 4. These are extra credit items that add polish and demonstrate advanced capabilities.

**References:**
- `ai/guides/multi-tool_agent_rubric.md` — stretch goals list
- `ai/guides/unit7-building-agents.md` — streaming pattern
- `ai/guides/unit8-rag-multi-tool.md` — persistent vector store, alternative frameworks
- `aiDocs/prd.md` — P1/P2 features

## Stretch Goal 1: Streaming Responses

### Checklist
- [ ] Modify API route to use `agent.stream()` instead of `agent.invoke()`
- [ ] Return response as Server-Sent Events (`Content-Type: text/event-stream`)
- [ ] Create `ReadableStream` that iterates over agent stream chunks
- [ ] Format each chunk as SSE: `data: ${JSON.stringify(chunk)}\n\n` (extract text content from `chunk.agent?.messages` or `chunk.tools?.messages`)
- [ ] Handle tool call chunks differently from text chunks — only append text content to UI
- [ ] Send `data: [DONE]\n\n` when stream ends
- [ ] Update chat.tsx: read stream with `res.body.getReader()`
- [ ] Append partial content incrementally to current assistant message
- [ ] Parse SSE format in frontend
- [ ] Preserve non-streaming as fallback (query param or header toggle)
- [ ] Test: responses appear token-by-token, not all at once

### Key Files
- `src/app/api/chat/route.ts` (modify)
- `src/app/components/chat.tsx` (modify)

### Commit
```
git commit -m "Add streaming responses to chat UI"
```

---

## Stretch Goal 2: Google Calendar Tool (4th Custom Tool)

### Checklist
- [ ] `npm install googleapis`
- [ ] Set up OAuth 2.0 credentials in Google Cloud Console
- [ ] Add to `.env.local`: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`
- [ ] Add to `.env.example` with placeholder values
- [ ] Create `src/lib/tools/calendar.ts`:
  - Import `google` from `googleapis`
  - Initialize OAuth2 client with credentials
  - Read events: list upcoming events for a time range
  - Write events: create event from natural language (title, date, time)
  - try/catch — never throw
  - Structured logging
- [ ] Tool description: explicit about WHEN to use (schedule, calendar, events, meetings)
- [ ] Zod schema for input (action: "list" | "create", query details)
- [ ] Add calendar tool to agent tools array in `src/lib/agent.ts`
- [ ] Test: "What's on my calendar tomorrow?" → reads events
- [ ] Test: "Add a meeting at 3pm on Monday" → creates event

### Key Files
- `src/lib/tools/calendar.ts` (create)
- `src/lib/agent.ts` (modify — add 4th tool)
- `.env.local`, `.env.example` (modify — add Google creds)

### Commit
```
git commit -m "Add Google Calendar tool via OAuth 2.0"
```

---

## Stretch Goal 3: Persistent Vector Store

### Checklist
- [ ] Create `data/` directory (add to .gitignore if large)
- [ ] After initial embedding in `store.ts`, serialize vector store to `data/vectorstore.json`
- [ ] On startup, check if `data/vectorstore.json` exists
- [ ] Compare file timestamps: if vectorstore is newer than all files in `docs/`, load from file
- [ ] If docs are newer or no cache exists, rebuild from scratch
- [ ] Log whether loading from cache or rebuilding
- [ ] Test: restart server → first RAG query is fast (loaded from cache)
- [ ] Test: modify a doc → restart → rebuilds store

### Key Files
- `src/lib/rag/store.ts` (modify)

### Commit
```
git commit -m "Add persistent vector store with disk caching"
```

---

## Stretch Goal 4: Agent Proposal

### Checklist
- [ ] Create `aiDocs/agent-proposal.md` (~1 page)
- [ ] Identify a feature in the Stride project that benefits from an agent pattern
- [ ] Explain WHY the agent pattern fits:
  - Natural language calendar management (vs clicking UI buttons)
  - Eisenhower prioritization via RAG (agent suggests priority based on docs)
  - Integrated web search for context (lookup info while planning)
  - Multi-tool chaining (e.g., check calendar + calculate available hours + suggest schedule)
- [ ] Be specific about how it integrates into the Stride PWA
- [ ] Mention what WOULDN'T benefit from an agent (simple CRUD operations, static UI rendering)

### Key Files
- `aiDocs/agent-proposal.md` (create)

### Commit
```
git commit -m "Add agent proposal document"
```

---

## Stretch Goal 5: Demo Video

### Checklist
- [ ] Record a 2-minute screencast demonstrating the agent
- [ ] Show calculator tool in action (math question → correct answer with tool badge)
- [ ] Show web search tool (current events question → sourced results)
- [ ] Show RAG tool (productivity question → answer with source attribution)
- [ ] Show conversation memory (follow-up question referencing prior turn)
- [ ] Show structured logging in server console
- [ ] Optional: show any stretch features implemented (streaming, calendar, etc.)
- [ ] Save video and add link/reference to README.md

### Key Files
- `README.md` (modify — add demo video link)
