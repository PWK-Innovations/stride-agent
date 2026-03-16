# Claude Code Guidelines — Stride Agent

## Project Context

- Read `aiDocs/context.md` for project overview, tech stack, and current focus
- Read `aiDocs/prd.md` and `aiDocs/mvp.md` for requirements and scope

## Behavioral Guidelines

### Ask Before Acting
- Ask my opinion before starting complex or multi-file work
- Propose an approach and wait for approval on architectural decisions
- If a task has multiple valid paths, list the options — don't pick one silently

### Keep It Simple
- Do not over-engineer — build the simplest thing that works
- No premature abstractions, no "just in case" code
- If three lines of code solve it, don't create a utility function
- Match the complexity to the task — MVP first, polish later

### Flag Uncertainty
- If you're unsure about something, say so — don't guess
- If you're making an assumption, call it out explicitly
- If a library or API behaves unexpectedly, flag it rather than working around it silently

### Frontend
- Use Tailwind CSS for all styling
- Reference `notes/` folder for component patterns and UI style before building UI
- Match the component styles in `notes/` — don't invent new patterns

### Code Quality
- No raw `eval()` — use safe expression evaluation for the calculator tool
- Structured logging for all tool calls (tool name, args, result)
- Keep secrets out of code — use environment variables, never commit `.env`
- Follow existing patterns in the codebase rather than introducing new ones

### Git Practices
- Don't commit unless I ask
- Don't push unless I ask
- Commit messages should be clear and describe what changed

### Scope Discipline
- Stick to what's asked — don't add features, refactors, or "improvements" beyond the request
- Core MVP tools (calculator, web search, RAG) before any stretch goals (calendar, streaming)
- If something is marked "out of scope" in the MVP doc, don't build it
