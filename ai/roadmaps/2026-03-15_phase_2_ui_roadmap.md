# Phase 2: Web UI

## Context

Build a Tailwind CSS chat interface connected to the `/api/chat` endpoint from Phase 1. Single-page chat with message bubbles, tool badges, and auto-scroll.

**References:**
- `aiDocs/mvp.md` — chat UI requirements: message bubbles, tool badges, input field
- `aiDocs/architecture.md` — component list: chat.tsx, message.tsx, input.tsx
- `aiDocs/coding-style.md` — React/Next.js patterns: `"use client"`, server components by default, typed props
- `notes/` — Tailwind component references (check for files; use standard patterns if empty)

## Checklist

### Message Component (`src/app/components/message.tsx`)
- [ ] `"use client"` directive
- [ ] Props interface: `{ role: "user" | "assistant", content: string, toolUsed?: string | null }`
- [ ] User messages: right-aligned, blue background (`bg-blue-600 text-white`)
- [ ] Agent messages: left-aligned, gray background (`bg-gray-100 text-gray-900`)
- [ ] Tool badge: small pill below agent text (`bg-gray-200 text-xs`) showing "Used: {toolName}"
- [ ] `whitespace-pre-wrap` on content for multiline responses
- [ ] Max width constraint (`max-w-[70%]`) so bubbles don't span full width

### Input Component (`src/app/components/input.tsx`)
- [ ] `"use client"` directive
- [ ] Props interface: `{ onSend: (message: string) => void, disabled: boolean }`
- [ ] Text input with placeholder "Ask me anything..."
- [ ] Send button (blue, disabled when empty or loading)
- [ ] Enter key submits (prevent default), Shift+Enter does not
- [ ] Clear input after send
- [ ] Disabled state while agent is processing

### Chat Container (`src/app/components/chat.tsx`)
- [ ] `"use client"` directive
- [ ] State: `messages` array, `loading` boolean
- [ ] `sessionId` created once on mount via `crypto.randomUUID()` (resets on page refresh — new session, clean history)
- [ ] `handleSend(message)`:
  - Append user message to state immediately
  - Set loading true
  - POST to `/api/chat` with `{ message, sessionId }`
  - Append agent response with toolUsed on success
  - Append error message on failure
  - Set loading false
- [ ] Auto-scroll to bottom on new messages (useRef + useEffect)
- [ ] "Thinking..." indicator while loading
- [ ] Empty state: centered text "Send a message to get started"
- [ ] Header: "Stride Agent" title + subtitle

### Page (`src/app/page.tsx`)
- [ ] Replace default Next.js content
- [ ] Render `<Chat />` component full-screen
- [ ] No `"use client"` needed — Chat handles it

### Layout (`src/app/layout.tsx`)
- [ ] Strip Next.js boilerplate font imports and default styles
- [ ] Ensure `globals.css` has `@tailwind base; @tailwind components; @tailwind utilities;`
- [ ] Clean body/html styling — no conflicting classes

## Key Files

| Action | File |
|--------|------|
| Create | `src/app/components/message.tsx` |
| Create | `src/app/components/input.tsx` |
| Create | `src/app/components/chat.tsx` |
| Modify | `src/app/page.tsx` |
| Modify | `src/app/layout.tsx` |
| Modify | `src/app/globals.css` (if needed) |

## Verification

- [ ] `npm run dev` → `localhost:3000` shows chat interface with header, empty message area, input
- [ ] Type "What is 15 * 23?" → user bubble right (blue), agent bubble left (gray), "Used: calculator" badge
- [ ] Type "Search for latest AI news" → response with "Used: web_search" badge
- [ ] Send many messages → auto-scrolls to latest
- [ ] Follow-up "multiply that by 2" → memory works, references prior answer
- [ ] Loading state: input disabled, "Thinking..." shown while waiting

## Commit

```
git add -A && git commit -m "Add Tailwind CSS chat UI connected to agent"
```
