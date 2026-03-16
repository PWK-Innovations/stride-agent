# Phase 1: Tools + Agent

## Context

Implement the calculator tool, web search tool, ReAct agent with conversation memory, and the API route. No UI yet — verify via curl.

**Note:** The agent starts with **2 tools** (calculator + web search). The 3rd tool (RAG) is added in Phase 4. Structured logging is added retroactively to these tools in Phase 3 — no logging in this phase.

**References:**
- `ai/guides/unit7-building-agents.md` — tool definitions, ReAct pattern, agent creation, error handling
- `ai/guides/unit8-rag-multi-tool.md` — conversation memory pattern
- `aiDocs/architecture.md` — request flow, tool design, agent architecture
- `aiDocs/coding-style.md` — TypeScript, async/await, error handling

## Checklist

### Calculator Tool (`src/lib/tools/calculator.ts`)
- [x] Import `tool` from `@langchain/core/tools`, `z` from `zod`, `evaluate` from `mathjs`
- [x] Use `evaluate()` from mathjs — NOT `eval()` or `Function()`
- [x] Zod schema: `z.object({ expression: z.string() })`
- [x] Description explains WHEN to use: arithmetic, percentages, calculations where precision matters
- [x] try/catch — never throw, return error strings on failure
- [x] Export the tool

### Web Search Tool (`src/lib/tools/web-search.ts`)
- [x] Import `TavilySearch` from `@langchain/tavily` (verify export — may be `TavilySearchResults`)
- [x] `maxResults: 3`
- [x] Format results: title, content, URL for each result
- [x] Async function
- [x] try/catch — never throw, return error strings
- [x] Description explains WHEN: current events, news, prices, real-time data not in training
- [x] Export the tool

### Conversation Memory (`src/lib/memory.ts`)
- [x] In-memory session store: `Record<string, BaseMessage[]>`
- [x] Import `HumanMessage`, `AIMessage` from `@langchain/core/messages`
- [x] `getMessageHistory(sessionId)` — returns or creates message array
- [x] `addUserMessage(sessionId, content)` — pushes HumanMessage
- [x] `addAssistantMessage(sessionId, content)` — pushes AIMessage
- [x] `clearSession(sessionId)` — deletes session
- [x] Export all functions

### Agent (`src/lib/agent.ts`)
- [x] Import `ChatOpenAI` from `@langchain/openai`
- [x] Import `createReactAgent` from `@langchain/langgraph/prebuilt` (verify — slides show `createAgent` from `langchain`)
- [x] Model: `gpt-4o`, `temperature: 0`
- [x] Tools array: `[calculator, webSearch]`
- [x] Export the agent

### API Route (`src/app/api/chat/route.ts`)
- [x] POST handler accepts `{ message, sessionId }`
- [x] Validate: return 400 if message or sessionId missing
- [x] Add user message to session history via `addUserMessage()`
- [x] Get full message history via `getMessageHistory()`
- [x] Invoke agent: `agent.invoke({ messages }, { recursionLimit: 10 })`
- [x] Extract final response from `result.messages[result.messages.length - 1].content`
- [x] Extract `toolUsed` by inspecting intermediate ToolMessages
- [x] Save assistant response via `addAssistantMessage()`
- [x] Return `{ response, toolUsed }`
- [x] try/catch — return 500 with error message on failure

## Key Files

| Action | File |
|--------|------|
| Create | `src/lib/tools/calculator.ts` |
| Create | `src/lib/tools/web-search.ts` |
| Create | `src/lib/memory.ts` |
| Create | `src/lib/agent.ts` |
| Create | `src/app/api/chat/route.ts` |

## Verification

```bash
# Start dev server
npm run dev

# Test calculator
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is 247 * 18?","sessionId":"test-1"}'
# Expected: { "response": "...", "toolUsed": "calculator" }

# Test web search
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What happened in the NBA last night?","sessionId":"test-2"}'
# Expected: { "response": "...", "toolUsed": "web_search" }

# Test memory (follow-up)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Now multiply that result by 3","sessionId":"test-1"}'
# Expected: references 4446 from prior turn
```

## Commit

```
git add -A && git commit -m "Add calculator, web search tools, and ReAct agent with memory"
```

## Known Risks

- `createAgent` import path may differ in newer LangChain — try `createReactAgent` from `@langchain/langgraph/prebuilt`
- `TavilySearch` export may be named differently — check `@langchain/tavily` package exports
- Tool detection (`toolUsed`) depends on LangChain message types — inspect `result.messages` for ToolMessage objects
