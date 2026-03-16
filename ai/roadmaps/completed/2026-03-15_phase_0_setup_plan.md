# Phase 0 Plan: Project Setup

## Goal

Go from an empty repo (docs only) to a working Next.js + TypeScript project with all dependencies installed, folder structure matching architecture.md, and environment variables configured.

## Approach

### 1. Initialize Next.js in Existing Directory

Run `create-next-app` directly in the project root (`.`), not a subdirectory. The directory already has files (.gitignore, README.md, aiDocs/, ai/) so we need to be careful.

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

**Why these flags:**
- `--app` — App Router (modern Next.js convention, matches architecture.md)
- `--src-dir` — puts code under `src/` to separate from config files
- `--tailwind` — Tailwind CSS pre-configured with `tailwind.config.ts` and `postcss.config.mjs`
- `--typescript` — strict TypeScript out of the box
- `--use-npm` — npm over yarn/pnpm for consistency

**Post-init cleanup:**
- `create-next-app` may overwrite `README.md` and `.gitignore` — check git diff and restore if needed
- Merge Next.js entries (`.next/`, `out/`) into the existing `.gitignore`
- The default `page.tsx` will have boilerplate — leave it for now, Phase 2 replaces it

### 2. Install Dependencies

Two install commands — production and dev:

```bash
# Production dependencies
npm install langchain @langchain/openai @langchain/langgraph @langchain/core @langchain/tavily @langchain/classic zod mathjs pino

# Dev dependencies
npm install -D pino-pretty
```

**Package purposes:**
| Package | Used In | Purpose |
|---------|---------|---------|
| `langchain` | Phase 1 | Core framework, `createAgent` |
| `@langchain/openai` | Phase 1, 4 | `ChatOpenAI`, `OpenAIEmbeddings` |
| `@langchain/langgraph` | Phase 1 | Agent graph execution, `createReactAgent` |
| `@langchain/core` | Phase 1 | `tool()` function, message types |
| `@langchain/tavily` | Phase 1 | `TavilySearch` for web search |
| `@langchain/classic` | Phase 4 | `MemoryVectorStore` for RAG |
| `zod` | Phase 1 | Tool input schema validation |
| `mathjs` | Phase 1 | Safe math expression evaluation |
| `pino` | Phase 3 | Structured JSON logging |
| `pino-pretty` (dev) | Phase 3 | Human-readable log formatting |

### 3. Create Folder Structure

Match the architecture.md project structure. These directories are empty for now — files get created in later phases.

```bash
mkdir -p src/lib/tools      # calculator.ts, web-search.ts, rag.ts, calendar.ts
mkdir -p src/lib/rag         # loader.ts, store.ts
mkdir -p src/lib/utils       # logger.ts
mkdir -p src/app/api/chat    # route.ts
mkdir -p src/app/components  # chat.tsx, message.tsx, input.tsx
mkdir -p docs                # RAG source documents (Phase 4)
mkdir -p scripts             # Shell scripts
```

Note: `src/app/` already exists from `create-next-app`. We're adding subdirectories to it.

### 4. Environment Variables

**`.env.local`** (gitignored — real keys):
```
OPENAI_API_KEY=sk-...
TAVILY_API_KEY=tvly-...
```

**`.env.example`** (committed — placeholder):
```
OPENAI_API_KEY=your-openai-api-key-here
TAVILY_API_KEY=your-tavily-api-key-here
```

Next.js automatically loads `.env.local` — no `dotenv` package needed. Server-side code (API routes, lib/) can access `process.env.OPENAI_API_KEY` directly.

### 5. Shell Scripts

**`scripts/dev.sh`:**
```bash
#!/bin/bash
echo "Starting Stride Agent dev server..."
npm run dev
```

**`scripts/build.sh`:**
```bash
#!/bin/bash
echo "Building Stride Agent..."
npm run build
if [ $? -eq 0 ]; then
  echo '{"status": "pass", "message": "Build successful"}'
  exit 0
else
  echo '{"status": "fail", "message": "Build failed"}' >&2
  exit 1
fi
```

Make executable: `chmod +x scripts/dev.sh scripts/build.sh`

These follow the Unit 4 pattern: exit codes + JSON output for AI-parseable results.

## Technical Decisions

- **npm over yarn/pnpm** — simpler, no extra tooling
- **App Router over Pages Router** — modern Next.js, server components by default, `route.ts` API routes
- **All LangChain packages installed upfront** — avoids repeated installs across phases; unused packages don't affect bundle
- **No database** — MemoryVectorStore is in-memory, conversation memory is in-memory; persistence is stretch

## What NOT to Do

- Don't modify the default `page.tsx` or `layout.tsx` yet — that's Phase 2
- Don't create any TypeScript source files yet — that's Phase 1+
- Don't add API keys to `.env.example` — only placeholders
