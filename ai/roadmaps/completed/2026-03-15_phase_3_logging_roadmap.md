# Phase 3: Structured Logging

## Context

Add Pino-based structured logging so every tool call is recorded with tool name, input arguments, and result summary. This satisfies the rubric requirement: "logging that shows tool calls, arguments, and results."

**References:**
- `ai/guides/unit4-logging-testing-cli.md` — structured logging patterns, Pino, log levels, what to log
- `aiDocs/coding-style.md` — logging section: tag prefixes, console.log for info, console.error for errors
- `ai/guides/multi-tool_agent_rubric.md` — "Structured logging - logging that shows tool calls, arguments, and results"

## Checklist

### Logger Utility (`src/lib/utils/logger.ts`)
- [x] Import `pino`
- [x] Create logger instance with `level: process.env.LOG_LEVEL || "info"`
- [x] Raw JSON output (no pino-pretty transport — better for machine parsing, avoids Next.js issues)
- [x] `logToolCall(toolName, args, result)`:
  - INFO level
  - Truncate result to 200 chars if longer
  - Log: `{ tool, input, result }` with message `[{toolName}] Tool called`
- [x] `logToolError(toolName, args, error)`:
  - ERROR level
  - Log: `{ tool, input, error }` with message `[{toolName}] Tool error`
- [x] Export `logger`, `logToolCall`, `logToolError`

### Integrate into Calculator (`src/lib/tools/calculator.ts`)
- [x] Import `logToolCall`, `logToolError` from `../utils/logger`
- [x] On success: `logToolCall("Calculator", { expression }, resultString)`
- [x] On catch: `logToolError("Calculator", { expression }, errorMessage)`

### Integrate into Web Search (`src/lib/tools/web-search.ts`)
- [x] Import `logToolCall`, `logToolError` from `../utils/logger`
- [x] On success: `logToolCall("WebSearch", { query }, formattedResult)`
- [x] On catch: `logToolError("WebSearch", { query }, errorMessage)`
- [x] On no results: `logToolError("WebSearch", { query }, "No results found")`
- [x] On search API error: `logToolError("WebSearch", { query }, errMsg)`

### Integrate into API Route (`src/app/api/chat/route.ts`)
- [x] Import `logger` from `@/lib/utils/logger`
- [x] Log request received: `logger.info({ sessionId, message }, "[Chat API] Request received")`
- [x] Log response sent: `logger.info({ sessionId, toolUsed, responseLength }, "[Chat API] Response sent")`
- [x] Log errors: `logger.error({ error }, "[Chat API] Error")`

### CLI Test Script (`scripts/test.sh`)
- [x] Create `scripts/test.sh` with JSON output and exit codes
- [x] Tests: calculator, web search, memory, validation
- [x] Make executable

## Key Files

| Action | File |
|--------|------|
| Create | `src/lib/utils/logger.ts` |
| Create | `scripts/test.sh` |
| Modify | `src/lib/tools/calculator.ts` |
| Modify | `src/lib/tools/web-search.ts` |
| Modify | `src/app/api/chat/route.ts` |

## Verification

- [x] Send calculator query → server console shows structured JSON log with `[Calculator] Tool invoked` + `Tool completed`
- [x] Send web search query → server console shows `[WebSearch] Tool invoked` + `Tool completed` structured log
- [x] Send invalid math → server console shows ERROR level log with stack trace
- [x] API route logs show `[Chat API] Request received` and `[Chat API] Response sent`
- [x] All logs are valid JSON (parseable) — 20/20 validated
- [x] `./scripts/test.sh` runs and outputs JSON results — 4/4 pass

## Commit

```
git add -A && git commit -m "Add structured Pino logging for tool calls"
```
