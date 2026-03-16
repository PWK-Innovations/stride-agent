# Phase 2 Plan: Web UI

## Goal

Build a Tailwind CSS chat interface as a single Next.js page. Three React components (message, input, chat container) connected to the `/api/chat` endpoint from Phase 1.

## Approach

### Architecture

```
page.tsx (server component)
  └── Chat (client component — manages state + API calls)
        ├── Message[] (display component — bubbles + tool badges)
        ├── "Thinking..." indicator (conditional)
        └── Input (client component — text field + send button)
```

Only the chat-related components need `"use client"` — the page itself is a server component that renders the Chat container.

### 1. Message Component — `src/app/components/message.tsx`

Displays a single message bubble. User messages right-aligned in blue, agent messages left-aligned in gray.

**Design decisions:**
- `max-w-[70%]` — prevents bubbles from spanning full width
- `rounded-2xl` — modern chat bubble look
- `whitespace-pre-wrap` — preserves line breaks in agent responses (important for formatted tool output)
- Tool badge: small pill (`text-xs`, `bg-gray-200`) below agent text, only shows when `toolUsed` is set

**Props interface:**
```typescript
interface MessageProps {
  role: "user" | "assistant";
  content: string;
  toolUsed?: string | null;
}
```

### 2. Input Component — `src/app/components/input.tsx`

Text input + send button at the bottom of the chat.

**Design decisions:**
- Enter key submits (prevent default so it doesn't add a newline)
- Input clears after send
- Both input and button disabled while `loading` is true
- Button disabled when input is empty
- Flex layout: input grows (`flex-1`), button fixed width

**Props interface:**
```typescript
interface InputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}
```

### 3. Chat Container — `src/app/components/chat.tsx`

Main component that manages all state and API communication.

**State:**
- `messages: ChatMessage[]` — all messages in the conversation
- `loading: boolean` — true while waiting for agent response
- `sessionId: string` — generated once via `crypto.randomUUID()` on mount, persists until page refresh

**`handleSend(message)` flow:**
1. Append `{ role: "user", content: message }` to messages immediately (optimistic UI)
2. Set `loading = true`
3. `fetch("/api/chat", { method: "POST", body: { message, sessionId } })`
4. On success: append `{ role: "assistant", content: data.response, toolUsed: data.toolUsed }`
5. On error: append `{ role: "assistant", content: "Error: ..." }`
6. Set `loading = false`

**Auto-scroll:** `useRef` on a div at the bottom of the messages container + `useEffect` that scrolls into view whenever `messages` changes.

**Empty state:** When `messages.length === 0`, show centered text "Send a message to get started" instead of blank space.

**Loading state:** Show a gray "Thinking..." bubble below the last message while waiting.

**Layout:**
```
┌─────────────────────────────┐
│  Header: "Stride Agent"     │  ← border-b, fixed
├─────────────────────────────┤
│                             │
│  [Message bubbles]          │  ← flex-1, overflow-y-auto
│  [Thinking...]              │
│                             │
├─────────────────────────────┤
│  [Input field] [Send]       │  ← border-t, fixed
└─────────────────────────────┘
```

Full viewport height: `h-screen` with `flex flex-col`.

### 4. Page — `src/app/page.tsx`

Replace the default Next.js boilerplate with a single `<Chat />` render. No `"use client"` needed on the page itself.

### 5. Layout + Globals Cleanup — `src/app/layout.tsx`, `src/app/globals.css`

- Remove default Next.js font imports (Geist, Inter, etc.) if they add unwanted styling
- Ensure `globals.css` has the Tailwind directives: `@tailwind base; @tailwind components; @tailwind utilities;`
- Remove any default body padding/margin that conflicts with full-screen chat

## Tailwind Patterns

Reference `notes/` folder first — if empty, use these standard patterns:

**Bubbles:** `rounded-2xl px-4 py-3`
**User:** `bg-blue-600 text-white`
**Agent:** `bg-gray-100 text-gray-900`
**Badge:** `rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600`
**Input:** `rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none`
**Button:** `rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50`

## Technical Decisions

- **`crypto.randomUUID()` for sessionId** — built-in, no deps, unique per tab
- **Optimistic user message** — appears instantly before API call returns
- **No SSR for chat** — entire Chat component is `"use client"`, messages are client state only
- **No markdown rendering** — plain `whitespace-pre-wrap` for MVP; add markdown later if needed

## What NOT to Do

- Don't add streaming — that's Phase 5 stretch
- Don't persist messages to localStorage — session-only per MVP
- Don't add markdown rendering library — keep it simple
- Don't over-style — functional Tailwind, not pixel-perfect design
