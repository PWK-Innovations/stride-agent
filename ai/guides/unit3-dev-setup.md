# Unit 3: Development Setup & Tools

## Two-Folder Pattern

| Folder | Tracked? | Purpose | Contents |
|--------|----------|---------|----------|
| `aiDocs/` | Yes | Permanent project knowledge | context.md, PRD, MVP, architecture, coding style, changelog |
| `ai/` | No | Temporary working space | Roadmaps, plans, research, brainstorming |

### Project Structure

```
project-root/
├── aiDocs/                # ← TRACKED in git
│   ├── context.md         # Most important file
│   ├── prd.md
│   ├── mvp.md
│   ├── architecture.md
│   ├── coding-style.md
│   └── changelog.md
├── ai/                    # ← GITIGNORED
│   ├── guides/
│   ├── roadmaps/
│   └── notes/
├── CLAUDE.md              # ← GITIGNORED
├── .cursorrules           # ← GITIGNORED
└── scripts/
```

## Claude Code Config (CLAUDE.md)

```
Read aiDocs/context.md for project context.
Follow coding style in aiDocs/coding-style.md
Ask for opinion before complex work.
```

## context.md Template

```markdown
# Project Context

## Critical Files to Review
- PRD: aiDocs/prd.md
- Architecture: aiDocs/architecture.md
- Style Guide: aiDocs/coding-style.md

## Tech Stack
- Frontend: React, TypeScript
- Backend: Node.js, Express

## Important Notes
- All scripts return JSON to stdout
- Use structured logging to files
- Never commit .testEnvVars

## Current Focus
Building caption generation CLI script
```

## Changelog Format

```markdown
# Changelog

## 2026-02-01
- Added caption generation CLI (JPG/PNG input, JSON output)
- Switched from OpenAI to Anthropic Vision API for cost

## 2026-01-28
- Initial project setup: React frontend, Express backend
```

Document what changed and why (not how). 1-2 lines per entry.

## Essential .gitignore

```
ai/
CLAUDE.md
.cursorrules
.testEnvVars
node_modules/
.env
.env.local
```

## MCP Configuration (Claude Code)

File: `~/.config/claude/mcp.json`

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@context7/mcp"]
    }
  }
}
```

### MCP Usage

```
Use Context7 to research the best React state management libraries.
Pull the documentation and store in ai/guides/ with suffix _context7.md
```

## Prompting Patterns

### Tentative Approach (better results)

```
"We need to add authentication.
I'm thinking JWT tokens but I'm not sure
if that's the best approach here.
What do you think?"
```

### Context-First Pattern

```
Review the context file.
Then review how [feature] currently works.
Now here's what we need to change: [requirements]
What's your opinion on the best approach?
Don't make any code changes yet.
```

### Bias Toward Truth

| Strategy | How |
|----------|-----|
| Chain-of-Thought | "Show your reasoning step by step" |
| Structured Output | Request JSON — reduces creative drift |
| Explicit Uncertainty | "Say 'I don't know' rather than guessing" |
| Multi-Step Verification | Generate → Verify → Refine → Present |

## Setup Checklist

1. Create GitHub repository
2. Add .gitignore with ai/, CLAUDE.md, .cursorrules, .testEnvVars
3. Create aiDocs/ with context.md
4. Create ai/ folder structure (guides/, roadmaps/, notes/)
5. Create CLAUDE.md pointing to aiDocs/context.md
6. Verify AI can describe your project from aiDocs/context.md
