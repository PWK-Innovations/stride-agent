# Phase 3: Structured Logging

## Context

Add Pino-based structured logging so every tool call is recorded with tool name, input arguments, and result summary. This satisfies the rubric requirement: "logging that shows tool calls, arguments, and results."

**References:**
- `ai/guides/unit4-logging-testing-cli.md` — structured logging patterns, Pino, log levels, what to log
- `aiDocs/coding-style.md` — logging section: tag prefixes, console.log for info, console.error for errors
- `ai/guides/multi-tool_agent_rubric.md` — "Structured logging - logging that shows tool calls, arguments, and results"

## Checklist

### Logger Utility (`src/lib/utils/logger.ts`)
- [ ] Import `pino`
- [ ] Create logger instance with `level: process.env.LOG_LEVEL || "info"`
- [ ] Try `pino-pretty` transport for dev readability — if it fails in Next.js, fall back to raw JSON
- [ ] `logToolCall(toolName, args, result)`:
  - INFO level
  - Truncate result to 200 chars if longer
  - Log: `{ tool, input, result }` with message `[{toolName}] Tool called`
- [ ] `logToolError(toolName, args, error)`:
  - ERROR level
  - Log: `{ tool, input, error }` with message `[{toolName}] Tool error`
- [ ] Export `logger`, `logToolCall`, `logToolError`

### Integrate into Calculator (`src/lib/tools/calculator.ts`)
- [ ] Import `logToolCall`, `logToolError` from `../utils/logger`
- [ ] On success: `logToolCall("Calculator", { expression }, resultString)`
- [ ] On catch: `logToolError("Calculator", { expression }, errorMessage)`

### Integrate into Web Search (`src/lib/tools/web-search.ts`)
- [ ] Import `logToolCall`, `logToolError` from `../utils/logger`
- [ ] On success: `logToolCall("WebSearch", { query }, truncatedResult)`
- [ ] On catch: `logToolError("WebSearch", { query }, errorMessage)`

### Integrate into API Route (`src/app/api/chat/route.ts`)
- [ ] Import `logger` from `@/lib/utils/logger`
- [ ] Log request received: `logger.info({ sessionId, message }, "[Chat API] Request received")`
- [ ] Log response sent: `logger.info({ sessionId, toolUsed }, "[Chat API] Response sent")`
- [ ] Log errors: `logger.error({ sessionId, error }, "[Chat API] Error")`

## Key Files

| Action | File |
|--------|------|
| Create | `src/lib/utils/logger.ts` |
| Modify | `src/lib/tools/calculator.ts` |
| Modify | `src/lib/tools/web-search.ts` |
| Modify | `src/app/api/chat/route.ts` |

## Verification

- [ ] Send calculator query → server console shows:
  ```json
  {"level":"info","tool":"Calculator","input":{"expression":"247 * 18"},"result":"4446","msg":"[Calculator] Tool called"}
  ```
- [ ] Send web search query → server console shows `[WebSearch]` structured log
- [ ] Send invalid math (e.g., "abc/def") → server console shows ERROR level log
- [ ] API route logs show `[Chat API] Request received` and `[Chat API] Response sent`
- [ ] All logs are valid JSON (parseable)

## Commit

```
git add -A && git commit -m "Add structured Pino logging for tool calls"
```

## Notes

- If `pino-pretty` causes issues with Next.js server-side rendering (worker thread limitations), remove the `transport` config and use raw JSON output. Raw JSON is actually better for machine parsing.
- Log levels: ERROR (failures), WARN (recoverable issues), INFO (normal operations), DEBUG (detailed troubleshooting)
- Set `LOG_LEVEL=debug` in `.env.local` for verbose output during development
