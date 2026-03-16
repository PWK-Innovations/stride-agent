# Phase 1 Plan: Tools + Agent

## Goal

Implement calculator tool, web search tool, ReAct agent with conversation memory, and an API route. No UI — verify everything via curl.

## Approach

### 1. Calculator Tool — `src/lib/tools/calculator.ts`

Use the LangChain `tool()` pattern from Unit 7 slides with `mathjs` for safe evaluation.

**Implementation pattern:**
```typescript
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { evaluate } from "mathjs";

export const calculator = tool(
  ({ expression }) => {
    try {
      const result = evaluate(expression);
      return String(result);
    } catch (error) {
      return `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  },
  {
    name: "calculator",
    description: "Evaluate mathematical expressions. Use for arithmetic, percentages, or calculations where precision matters. Input should be a valid math expression like '2 + 2', 'sqrt(16)', or '0.15 * 230'.",
    schema: z.object({
      expression: z.string().describe("A mathematical expression to evaluate (mathjs syntax)"),
    }),
  }
);
```

**Why mathjs over Function():** The professor's slides show `Function('"use strict"; return (' + expression + ')')()` but our `CLAUDE.md` and `coding-style.md` mandate no raw eval. `mathjs.evaluate()` is math-only — it can't execute arbitrary JS. Unit 8 slides also explicitly recommend it.

**Key rules:**
- Never throw from inside the tool — always try/catch and return error strings
- The agent receives the error string as tool output and gracefully tells the user (e.g., "I couldn't evaluate that expression because...")
- Description must say WHEN to use it, not just what it does
- Zod schema validates input shape

### 2. Web Search Tool — `src/lib/tools/web-search.ts`

**Implementation pattern:**
```typescript
import { TavilySearch } from "@langchain/tavily";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const webSearch = tool(
  async ({ query }) => {
    try {
      const tavily = new TavilySearch({ maxResults: 3 });
      const results = await tavily.invoke({ query });
      if (Array.isArray(results)) {
        return results
          .map((r) => `**${r.title}**\n${r.content}\nURL: ${r.url}`)
          .join("\n\n---\n\n");
      }
      return String(results);
    } catch (error) {
      return `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  },
  {
    name: "web_search",
    description: "Search the web for current information. Use for up-to-date data not in training: news, events, prices, recent releases.",
    schema: z.object({
      query: z.string().describe("The search query"),
    }),
  }
);
```

**Import risk:** `TavilySearch` may not be the exact export name from `@langchain/tavily`. Check the package's actual exports at implementation time. Alternatives: `TavilySearchResults` from `@langchain/community/tools/tavily_search`.

**Key rules:**
- Must be `async` — web calls are asynchronous
- Format results so the LLM can synthesize them (title + content + URL)
- `maxResults: 3` keeps response size manageable

### 3. Conversation Memory — `src/lib/memory.ts`

Simple in-memory session store using LangChain message types so they pass directly to the agent.

**Implementation pattern:**
```typescript
import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";

const sessions: Record<string, BaseMessage[]> = {};

export function getMessageHistory(sessionId: string): BaseMessage[] {
  if (!sessions[sessionId]) sessions[sessionId] = [];
  return sessions[sessionId];
}

export function addUserMessage(sessionId: string, content: string): void {
  getMessageHistory(sessionId).push(new HumanMessage(content));
}

export function addAssistantMessage(sessionId: string, content: string): void {
  getMessageHistory(sessionId).push(new AIMessage(content));
}
```

**Why this over LangChain BufferMemory:** Simpler, more transparent, and the message array passes directly to `agent.invoke({ messages })`. No extra abstraction needed for MVP.

**Limitation:** Memory grows unbounded per session. Acceptable for MVP — sessions reset on server restart. Production would need truncation.

### 4. Agent — `src/lib/agent.ts`

**Implementation pattern:**
```typescript
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { calculator } from "./tools/calculator";
import { webSearch } from "./tools/web-search";

const model = new ChatOpenAI({ model: "gpt-4o", temperature: 0 });

export const agent = createReactAgent({ llm: model, tools: [calculator, webSearch] });
```

**Import risk:** The slides show `import { createAgent } from "langchain"` but current LangChain.js versions use `createReactAgent` from `@langchain/langgraph/prebuilt`. The API is similar but parameter names may differ (`model` vs `llm`). Verify at implementation time by checking the installed package.

**`temperature: 0`** — deterministic tool selection for consistent behavior.

### 5. API Route — `src/app/api/chat/route.ts`

Next.js App Router API route pattern: export a `POST` function that receives `NextRequest`.

**Request/response contract:**
```
POST /api/chat
Body: { message: string, sessionId: string }
Response: { response: string, toolUsed: string | null }
Error: { error: string } with 400 or 500 status
```

**Flow:**
1. Parse request body, validate message + sessionId
2. `addUserMessage(sessionId, message)` — append to session history
3. `getMessageHistory(sessionId)` — get full conversation
4. `agent.invoke({ messages: history }, { recursionLimit: 10 })` — run agent
5. Extract final response from `result.messages[result.messages.length - 1].content`
6. Extract `toolUsed` — inspect intermediate messages for ToolMessage objects with a `name` property
7. `addAssistantMessage(sessionId, response)` — save to memory
8. Return JSON response

**`recursionLimit: 10`** — prevents infinite tool-calling loops (Unit 7 recommendation).

**Extracting toolUsed:** The agent result contains all intermediate messages including ToolMessages. Loop through `result.messages` looking for messages with a `name` property or `_getType() === "tool"`. The last tool message's name is the tool that was used. If no tool was used, `toolUsed` is `null`.

## Technical Decisions

- **gpt-4o over gpt-4o-mini** — better tool selection accuracy; switch to mini if cost is a concern
- **recursionLimit: 10** — enough for multi-step reasoning, prevents runaway costs
- **Session-based memory** — no auth, each sessionId gets its own history, resets on restart
- **POST over GET** — message bodies can be large, GET has URL length limits

## What NOT to Do

- Don't add logging yet — that's Phase 3
- Don't build UI — that's Phase 2
- Don't add the RAG tool — that's Phase 4
- Don't wrap Tavily in a custom class — use the LangChain tool pattern directly
