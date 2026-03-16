# Phase 3 Plan: Structured Logging

## Goal

Add Pino-based structured logging so every tool call is recorded with tool name, input arguments, and result summary. Satisfies the rubric: "logging that shows tool calls, arguments, and results."

## Approach

### 1. Logger Utility — `src/lib/utils/logger.ts`

Create a centralized logger with helper functions for tool-specific logging.

**Pino setup:**
```typescript
import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
});
```

**Helper functions:**
- `logToolCall(toolName, args, result)` — INFO level, structured JSON with tool/input/result fields, truncates result to 200 chars
- `logToolError(toolName, args, error)` — ERROR level, structured JSON with tool/input/error fields

**Tag format:** Messages prefixed with `[ToolName]` for easy grep/filtering — e.g., `[Calculator] Tool called`, `[WebSearch] Tool error`.

**pino-pretty consideration:** The `transport` option for pino-pretty spawns a worker thread. This can fail in Next.js server-side context. Two paths:
1. Try with transport — if it works, great for dev readability
2. If it fails, remove transport and use raw JSON — still structured, still meets rubric

Raw JSON is actually better for the rubric since it demonstrates machine-parseable structured logging.

### 2. Integrate into Calculator — `src/lib/tools/calculator.ts`

Modify the existing tool function (don't rewrite it):
- On successful evaluation: `logToolCall("Calculator", { expression }, resultString)`
- On catch block: `logToolError("Calculator", { expression }, errorMessage)`

The logging calls go inside the tool's function body, after the result is computed and before the return.

### 3. Integrate into Web Search — `src/lib/tools/web-search.ts`

Same pattern:
- On successful search: `logToolCall("WebSearch", { query }, truncatedResult)`
- On catch block: `logToolError("WebSearch", { query }, errorMessage)`

Truncation matters here — web search results can be long. The `logToolCall` helper handles this (200 char limit).

### 4. Integrate into API Route — `src/app/api/chat/route.ts`

Add request/response-level logging:
- Request received: `logger.info({ sessionId, message }, "[Chat API] Request received")`
- Response sent: `logger.info({ sessionId, toolUsed, responseLength }, "[Chat API] Response sent")`
- Error: `logger.error({ sessionId, error }, "[Chat API] Error")`

This gives end-to-end visibility: request → tool call → response.

## Log Output Examples

**Calculator call:**
```json
{"level":30,"time":1710500000000,"tool":"Calculator","input":{"expression":"247 * 18"},"result":"4446","msg":"[Calculator] Tool called"}
```

**Web search call:**
```json
{"level":30,"time":1710500000000,"tool":"WebSearch","input":{"query":"NBA scores"},"result":"**Lakers vs Celtics**\nThe Lakers won 112-108...","msg":"[WebSearch] Tool called"}
```

**Tool error:**
```json
{"level":50,"time":1710500000000,"tool":"Calculator","input":{"expression":"abc/def"},"error":"Undefined symbol abc","msg":"[Calculator] Tool error"}
```

## Log Levels

| Level | Pino Value | When |
|-------|-----------|------|
| ERROR | 50 | Tool failures, API errors |
| WARN | 40 | Recoverable issues (rate limits, retries) |
| INFO | 30 | Normal tool calls, request/response lifecycle |
| DEBUG | 20 | Detailed internals (message history contents, full results) |

Default is INFO. Set `LOG_LEVEL=debug` in `.env.local` for verbose output during development.

## Technical Decisions

- **Pino over console.log** — structured JSON output, log levels, machine-parseable; recommended in Unit 4 slides
- **Result truncation at 200 chars** — web search results can be 1000+ chars; truncation keeps logs readable
- **Logging inside tool functions** — not in a wrapper; keeps it explicit and visible in each tool file
- **No file logging for MVP** — console only; file logging adds complexity with no rubric benefit

## What NOT to Do

- Don't add logging to the UI components — server-side only
- Don't log full conversation history on every request — too verbose, use DEBUG level if needed
- Don't log API keys or sensitive data
- Don't over-log — one INFO entry per tool call is sufficient
