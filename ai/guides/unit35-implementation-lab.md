# Unit 3.5: Implementation Lab

## Core Pattern

PRD (what) → Plans (how) → Roadmaps (checklist) → Code

## Implementation with AI

### The Prompt

```
Review @context.md. Implement the roadmap at ai/roadmaps/[your-roadmap].md.
```

### AI Workflow

- Reads roadmap scope
- Consults architecture.md for system design
- References coding-style.md for conventions
- Implements code
- Requests clarification when needed

Your role: monitor progress, answer AI questions, avoid micromanagement.

## Verification (Law of Witnesses)

### Verification Prompt

```
Review the roadmap at ai/roadmaps/[your-roadmap].md.
Check off completed items from phase 1.
Flag anything missed or implemented differently than planned.
Don't make code changes — just report.
```

### What AI Reports

- Completed roadmap tasks
- Missing items
- Deviations from original plan

## Four-Step Recipe

1. **Review Context** — examine context.md and roadmap
2. **Implement** — execute phase following architecture.md and coding-style.md
3. **Verify with Sub-Agent** — check built features against roadmap
4. **Archive When Complete** — move to ai/roadmaps/completed/

## CLI Testing Scripts

### Folder Structure

```
scripts/
├── build.sh      # Compile/build
├── test.sh       # Run all tests
├── run.sh        # Run the application
└── dev.sh        # Start dev server
```

Minimum: build.sh and test.sh.

### Example test.sh

```bash
#!/bin/bash
echo "Building project..."
./scripts/build.sh || { echo '{"status":"fail","step":"build"}' >&2; exit 1; }
echo "Running tests..."
if npm test 2>&1; then
    echo '{"status": "pass", "message": "All tests passed"}'
    exit 0
else
    echo '{"status": "fail", "message": "Tests failed"}' >&2
    exit 1
fi
```

### Node.js Alternative (cross-platform)

```javascript
const { execSync } = require('child_process');
try {
  execSync('npm test', { stdio: 'inherit' });
  console.log(JSON.stringify({ status: 'pass' }));
  process.exit(0);
} catch (err) {
  console.error(JSON.stringify({ status: 'fail', error: err.message }));
  process.exit(1);
}
```

## The Fix Loop

### Autonomous Cycle

```
Test → Read Logs → Analyze → Fix → Repeat
```

### When AI Gets Stuck (intervene after 3+ same errors)

```
Stop. Let's step back.
1. What are we actually trying to accomplish?
2. What have we tried so far?
3. What's the actual root cause?
4. Is there a completely different approach?
```

## Complete Development Cycle

PLAN (roadmap) → IMPLEMENT (AI codes) → TEST (CLI) → FIX (autonomous loop) → VERIFY (check roadmap)
