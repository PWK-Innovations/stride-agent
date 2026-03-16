# Phase 2: Web UI

## Context

Build a Tailwind CSS chat interface connected to the `/api/chat` endpoint from Phase 1. Single-page chat with message bubbles, tool badges, and auto-scroll. Uses olive color palette from `ai/guides/reference/oatmeal-olive-instrument/`.

**References:**
- `aiDocs/mvp.md` — chat UI requirements: message bubbles, tool badges, input field
- `aiDocs/architecture.md` — component list: chat.tsx, message.tsx, input.tsx
- `aiDocs/coding-style.md` — React/Next.js patterns: `"use client"`, server components by default, typed props
- `ai/guides/reference/oatmeal-olive-instrument/` — Design system: olive colors, clsx, rounded-full buttons, Instrument Serif + Inter fonts

## Checklist

### Message Component (`src/app/components/message.tsx`)
- [x] `"use client"` directive
- [x] Props interface: `{ role: "user" | "assistant", content: string, toolUsed?: string | null }`
- [x] User messages: right-aligned, olive-950 background, white text
- [x] Agent messages: left-aligned, olive-100 background with dark mode support
- [x] Tool badge: small pill below agent text (`rounded-full bg-olive-200`) showing "Used: {toolName}"
- [x] `whitespace-pre-wrap` on content for multiline responses
- [x] Max width constraint (`max-w-[70%]`) so bubbles don't span full width

### Input Component (`src/app/components/input.tsx`)
- [x] `"use client"` directive
- [x] Props interface: `{ onSend: (message: string) => void, disabled: boolean }`
- [x] Text input with placeholder "Ask me anything..."
- [x] Send button (olive-950, rounded-full, disabled when empty or loading)
- [x] Enter key submits (prevent default)
- [x] Clear input after send
- [x] Disabled state while agent is processing

### Chat Container (`src/app/components/chat.tsx`)
- [x] `"use client"` directive
- [x] State: `messages` array, `loading` boolean
- [x] `sessionId` created once on mount via `crypto.randomUUID()` (resets on page refresh — new session, clean history)
- [x] `handleSend(message)`:
  - Append user message to state immediately
  - Set loading true
  - POST to `/api/chat` with `{ message, sessionId }`
  - Append agent response with toolUsed on success
  - Append error message on failure
  - Set loading false
- [x] Auto-scroll to bottom on new messages (useRef + useEffect)
- [x] "Thinking..." indicator while loading
- [x] Empty state: centered text "Send a message to get started"
- [x] Header: "Stride Agent" title + subtitle

### Page (`src/app/page.tsx`)
- [x] Replace default Next.js content
- [x] Render `<Chat />` component full-screen
- [x] No `"use client"` needed — Chat handles it

### Layout (`src/app/layout.tsx`)
- [x] Strip Next.js boilerplate font imports and default styles
- [x] globals.css has Tailwind import + olive theme colors
- [x] Google Fonts loaded: Instrument Serif (display) + Inter (sans)
- [x] Clean body/html styling — no conflicting classes

### Additional
- [x] Installed `clsx` for className merging (matching reference design system)
- [x] Updated `aiDocs/coding-style.md` with olive design system patterns
- [x] Excluded `ai/` from `tsconfig.json` to avoid type-checking reference files
- [x] Strip LaTeX formatting from agent responses (`\(`, `\)`, `\times`, etc.)
- [x] User bubbles: match Send button color (`bg-olive-950 text-white` / `dark:bg-olive-300 dark:text-olive-950`)

## Key Files

| Action | File |
|--------|------|
| Create | `src/app/components/message.tsx` |
| Create | `src/app/components/input.tsx` |
| Create | `src/app/components/chat.tsx` |
| Modify | `src/app/page.tsx` |
| Modify | `src/app/layout.tsx` |
| Modify | `src/app/globals.css` |
| Modify | `aiDocs/coding-style.md` |
| Modify | `tsconfig.json` |

## Verification

- [x] `npm run dev` → `localhost:3000` shows chat interface with header, empty message area, input
- [x] Type "What is 15 * 23?" → user bubble right (olive-950), agent bubble left (olive-100), "Used: calculator" badge
- [x] Type "Search for latest AI news" → response with "Used: web_search" badge
- [x] Send many messages → auto-scrolls to latest
- [x] Follow-up "multiply that by 2" → memory works, references prior answer
- [x] Loading state: input disabled, "Thinking..." shown while waiting

## Commit

```
git add -A && git commit -m "Add Tailwind CSS chat UI connected to agent"
```
