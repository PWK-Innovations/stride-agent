# Unit 4: CLI Tools, Structured Logging & Testing

## Scripts Folder Pattern

```
scripts/
├── build.sh      # Compile/build
├── run.sh        # Run the app
├── test.sh       # Run test suite
├── lint.sh       # Run linting
└── dev.sh        # Start dev server
```

## Exit Codes

| Code | Meaning | Use Case |
|------|---------|----------|
| 0 | Success | Everything worked |
| 1 | General failure | Default error condition |
| 2 | Misuse | Invalid arguments |
| 126 | Cannot execute | Permission problems |
| 127 | Command not found | Missing dependency |

## stdout vs stderr

```bash
# Data goes to stdout (AI parses this)
echo '{"result": "success", "count": 42}'

# Errors go to stderr
echo "Warning: Deprecated function" >&2
```

## JSON Output (machine-readable)

**Good:**
```bash
$ ./scripts/create-user.sh test@example.com
{"id": 123, "email": "test@example.com", "created": true}
```

**Bad:**
```bash
$ ./scripts/create-user.sh test@example.com
User created successfully! Welcome aboard!
```

---

## Structured Logging

### Why

AI cannot use debuggers but can read structured logs. Handles 95% of debugging.

### Unstructured (bad) vs Structured (good)

```
// Bad
Error occurred in user service

// Good
{"level":"error","service":"user","action":"create",
 "error":"duplicate_email","email":"test@example.com",
 "timestamp":"2024-01-28T10:30:00Z"}
```

### What to Log

```javascript
// Function entry
logger.info({ action: 'createUser', input: { email, name } });

// Function exit
logger.info({ action: 'createUser', result: { userId, success: true } });

// Errors with full context
logger.error({
  action: 'createUser',
  error: err.message,
  stack: err.stack,
  input: { email, name }
});
```

### Log Levels

| Level | When | Example |
|-------|------|---------|
| ERROR | Something failed | Database connection failed |
| WARN | Concerning but recoverable | Retry attempt 3 of 5 |
| INFO | Normal operations | User logged in |
| DEBUG | Detailed troubleshooting | Query details |

### Recommended: Pino (Node.js)

Fast, structured JSON output.

---

## Testing Strategies

### Two Levels

| Mode | What | Discovers |
|------|------|-----------|
| **TDD (unit-level)** | AI writes tests, then implements | Anticipated edge cases |
| **Explore → Codify (system-level)** | AI exercises running system, then formalizes | Unexpected behaviors |

### TDD: Red → Green → Refactor

1. **RED:** Write tests that fail (no implementation yet)
2. **GREEN:** Write minimal code to pass
3. **REFACTOR:** Improve code quality (tests ensure correctness)
4. **REPEAT**

### TDD with AI — Step by Step

1. Define the contract — prompt AI to write comprehensive tests
2. Review generated tests — ask AI to identify gaps
3. Add missing tests
4. Verify tests fail (validates test quality)
5. Implement to pass — "Use minimal code necessary"
6. Verify tests pass
7. Refactor

### Explore → Codify (for APIs/integrations)

**Phase 1: Explore**
```
The API server is running on localhost:3000.
Explore it:
- Hit each endpoint with valid and invalid inputs
- Try edge cases
- Check what happens with missing auth tokens
- Look at the logs after each request
- Report anything surprising
```

**Phase 2: Codify** — transform discoveries into repeatable tests

---

## Security

### Never Commit

- API keys, database passwords, auth tokens, private keys

### .gitignore

```
.env
.env.local
.testEnvVars
*.key
*.pem
secrets/
ai/
credentials.json
```

### Three Common AI-Generated Vulnerabilities

1. **SQL Injection** — fix with parameterized queries
2. **Hardcoded Secrets** — fix with environment variables
3. **Prompt Injection** — fix by separating data from instructions

### Safe Calculator (no eval)

```typescript
// ❌ Dangerous
const result = eval(userExpression);

// ✅ Safe
import { evaluate } from "mathjs";
const result = evaluate(expression);
```

---

## The Test-Log-Fix Loop

```
Test → Read Logs → Analyze → Fix → Repeat
```

### Initiating

```
Implement [feature] according to the plan.
After implementation, run tests with ./scripts/test.sh
Review the logs and fix any issues.
Continue until all tests pass.
```

### Effective Error Sharing

```
I ran ./scripts/test.sh and got this error:
[Full error with stack trace]

What I was trying to do: [action]
Expected: [what should happen]
Actual: [what happened]

Logs from ./logs/app.log:
[paste structured logs]

What I've tried:
1. [attempt 1]
2. [attempt 2]
```
