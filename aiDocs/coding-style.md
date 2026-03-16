# Coding Style — Stride Agent

## Language & Runtime

- TypeScript — strict mode enabled
- Next.js (App Router) with React for frontend components
- Node.js runtime for API routes and agent logic

## File & Folder Naming

- **Files:** kebab-case (`calculator.ts`, `web-search.ts`)
- **Folders:** kebab-case (`src/lib/tools/`, `src/app/api/`)
- **React components:** kebab-case files, PascalCase exports (`chat.tsx` exports `Chat`)
- **Types/interfaces:** PascalCase (`ChatMessage`, `ToolResult`)
- **Variables/functions:** camelCase (`getSearchResults`, `chatHistory`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_TOKENS`, `TAVILY_API_KEY`)
- **Environment variables:** UPPER_SNAKE_CASE in `.env.local`

## TypeScript

- Use explicit types for function parameters and return values
- Use `interface` for object shapes, `type` for unions and intersections
- Avoid `any` — use `unknown` and narrow with type guards when the type is genuinely uncertain
- Export types/interfaces that are shared across files
- Don't over-type — let TypeScript infer where it's obvious (e.g., `const x = 5`)

## Code Style

- Use `const` by default, `let` when reassignment is needed, never `var`
- Use arrow functions for callbacks and inline functions
- Use `async`/`await` over raw promises — no `.then()` chains
- Destructure objects and arrays where it improves readability
- Early returns over nested `if`/`else` blocks
- No unused variables or imports — TypeScript strict mode catches these

## React / Next.js

- Use `'use client'` directive only on components that need client-side interactivity
- Server components by default — only opt into client where needed (event handlers, state, effects)
- Keep components small and focused — one job per component
- Props typed with interfaces, not inline types
- No `useEffect` for data fetching — use server components or API routes

## Error Handling

- `try`/`catch` around external calls (API requests, file I/O)
- Log errors with context (what was attempted, what failed)
- Return user-friendly messages from API routes — don't expose stack traces
- Let internal errors bubble up — don't swallow them silently
- Use Next.js `NextResponse` for consistent API error responses

## Logging

- Structured console logging for every tool call:
  - Tool name
  - Input arguments
  - Result summary (truncated if large)
- Use `console.log` for info, `console.error` for errors
- Prefix logs with a tag for easy filtering (e.g., `[Calculator]`, `[WebSearch]`, `[RAG]`)

## Frontend (Tailwind CSS)

- Reference `notes/` folder for component patterns before building UI
- Utility-first — compose Tailwind classes directly, avoid custom CSS unless necessary
- Keep JSX structure flat — avoid deep nesting
- Group related Tailwind classes logically (layout → spacing → typography → color)

## Dependencies

- Minimize dependencies — don't add a package for something achievable in a few lines
- All secrets via environment variables in `.env.local` — never hardcoded, never committed

## Comments

- Only where the "why" isn't obvious from the code
- No commented-out code — delete it, git has history
- No JSDoc unless the function signature is genuinely unclear — TypeScript types serve as documentation
