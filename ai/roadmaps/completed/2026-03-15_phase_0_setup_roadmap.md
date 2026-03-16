# Phase 0: Project Setup

## Context

Initialize the Next.js + TypeScript project from scratch. No code exists yet — only documentation and .gitignore.

**References:**
- `aiDocs/architecture.md` — target project structure
- `aiDocs/coding-style.md` — TypeScript, ES modules, naming conventions
- `ai/guides/unit3-dev-setup.md` — two-folder pattern, .gitignore, scripts
- `ai/guides/unit35-implementation-lab.md` — scripts folder pattern

## Checklist

- [x] Run `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm`
- [x] Verify README.md was not overwritten (restore from git if needed)
- [x] Merge Next.js entries (`.next/`, `out/`) into existing .gitignore
- [x] Install LangChain deps: `npm install langchain @langchain/openai @langchain/langgraph @langchain/core @langchain/tavily @langchain/classic zod mathjs pino`
- [x] Install dev deps: `npm install -D pino-pretty`
- [x] Create directories: `src/lib/tools/`, `src/lib/rag/`, `src/lib/utils/`, `src/app/api/chat/`, `src/app/components/`, `docs/`, `scripts/`
- [x] Create `.env.local` with `OPENAI_API_KEY` and `TAVILY_API_KEY`
- [x] Create `.env.example` with placeholder values (committed to git)
- [x] Create `scripts/dev.sh` — runs `npm run dev`
- [x] Create `scripts/build.sh` — runs `npm run build` with exit codes + JSON output
- [x] Make scripts executable: `chmod +x scripts/dev.sh scripts/build.sh`
- [x] Verify `npm run dev` starts without errors
- [x] Verify `localhost:3000` loads in browser

## Key Files

| Action | File |
|--------|------|
| Created by Next.js | `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs` |
| Created by Next.js | `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css` |
| Create manually | `.env.local`, `.env.example` |
| Create manually | `scripts/dev.sh`, `scripts/build.sh` |
| Modify | `.gitignore` (merge Next.js entries) |

## Verification

```bash
npm run dev          # Starts without errors
npm run build        # Builds successfully
./scripts/dev.sh     # Starts dev server
./scripts/build.sh   # Outputs JSON status
ls src/lib/tools src/lib/rag src/lib/utils src/app/api/chat src/app/components docs scripts
```

## Commit

```
git add -A && git commit -m "Initial project setup with Next.js, TypeScript, and dependencies"
```
