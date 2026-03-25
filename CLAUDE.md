# Stride Agent

Multi-tool AI chatbot (LangChain.js ReAct pattern) for productivity and scheduling. Next.js + TypeScript + Tailwind CSS with an olive design system.

## Project Context

Read @aiDocs/context.md first — it orients you on the project and links to the PRD, MVP, architecture, coding style, and all other key docs.

All planning and documentation files live in `aiDocs/` and must stay there.

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — ESLint check

## Behavioral Guidelines

IMPORTANT — follow these in every interaction:

1. **Ask before complex work.** If a task touches 3+ files or involves architectural decisions, present your approach and ask for my opinion before writing code.
2. **Do not over-engineer.** Solve what's asked — no extra abstractions, feature flags, or "just in case" code. Three similar lines are better than a premature helper.
3. **Flag uncertainty.** If you're unsure about a requirement, implementation detail, or whether something will break — say so. Never guess silently.
4. **Read before editing.** Always read a file before modifying it. Understand the existing patterns first.
5. **Preserve project structure.** PRD, MVP, and all planning docs stay in `aiDocs/`. RAG source docs stay in `docs/`. Do not reorganize without asking.
6. **No unnecessary dependencies.** Don't add npm packages without explicit approval. If it can be done in a few lines, do it inline.
7. **Verify your work.** Run `npm run build` or `npm run lint` after changes to catch issues early.

## Environment Variables

Defined in `.env.local` (see `.env.example` for required keys):
- `OPENAI_API_KEY` — GPT-4o and embeddings
- `TAVILY_API_KEY` — web search
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` — Calendar OAuth
