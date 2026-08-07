# Qt Mode Human Takeover — Design Spec

**Date:** 2026-08-07  
**Status:** Approved

## Overview

When a visitor sends a message in qt/flirty mode, the server notifies Kavya via Telegram. If he replies within 30 seconds, his reply is delivered to the visitor. If not, the AI takes over seamlessly. Once Kavya replies, he stays "live" — every subsequent message notifies him — until he sends `/done` or `/afk` to the bot.

Only one qt conversation can be active at a time.

---

## Architecture

```
Visitor sends qt message
        ↓
POST /api/agents/kavya
  - checks qt:human_live in Redis
  - sends Telegram notification
  - sets qt:pending:{sessionId} (TTL 30s)
  - sets qt:active_session
  - returns {status: "pending", sessionId} immediately

Frontend polls GET /api/agents/kavya/poll?sessionId=xxx every 2s
  ├── qt:human_reply:{sessionId} found → consume, return reply (sets qt:human_live)
  ├── qt:pending:{sessionId} missing (TTL expired) → run AI, return reply
  └── still pending → return {status: "pending"}

POST /api/agents/telegram/webhook (receives Telegram updates)
  ├── /done or /afk → delete qt:human_live, confirm to Kavya
  └── any other text → store as qt:human_reply:{activeSession}, set qt:human_live
```

---

## Redis State

| Key | Value | TTL | Purpose |
|-----|-------|-----|---------|
| `qt:active_session` | session token (UUID) | 1 hour | links Telegram replies to the active browser session |
| `qt:pending:{sessionId}` | `"1"` | 30s | window during which Kavya can intercept |
| `qt:human_live` | session token | none | set while Kavya is actively chatting; cleared by `/done` |
| `qt:human_reply:{sessionId}` | reply text | 60s | Kavya's reply waiting to be consumed by the poll endpoint |

---

## API Contract

### `POST /api/agents/kavya` (modified)

Existing behaviour is unchanged for non-flirty messages and the `qt` greeting / `bye` shortcuts.

For flirty messages that reach the AI path:
- Generate a `sessionId` (UUID)
- Write `qt:active_session = sessionId` (TTL 1hr)
- Write `qt:pending:{sessionId} = "1"` (TTL 30s)
- Send Telegram notification (fire-and-forget, errors silently swallowed)
- Return `{ status: "pending", sessionId }` — no AI call yet

### `GET /api/agents/kavya/poll?sessionId=xxx` (new)

Called by the frontend every 2s while a message is pending.

1. `qt:human_reply:{sessionId}` exists → delete it, set `qt:human_live = sessionId` (no TTL), return `{ reply, agent: "kavya" }`
2. `qt:pending:{sessionId}` missing → run AI coordinator, return normal `ChatResponse`
3. Both present (still waiting) → return `{ status: "pending" }`

### `POST /api/agents/telegram/webhook` (new)

Accepts Telegram Bot API updates. Rejects any message not from `TELEGRAM_CHAT_ID`.

- `/done` or `/afk` → `DEL qt:human_live`, reply "ok, AI is back 🤖"
- Any other text → `SET qt:human_reply:{activeSession} <text>` (TTL 60s), `SET qt:human_live {activeSession}` (no TTL)
- If no active session exists → reply "no active qt session" (no-op)

Security: webhook URL includes the bot token as a path segment so Telegram requests are implicitly authenticated. Only messages from `TELEGRAM_CHAT_ID` are acted on; all others are silently ignored.

---

## Telegram Notification Format

```
💬 qt is messaging you

"[message text]"

Reply here within 30s. Send /done when you're done.
```

---

## Frontend Changes

### `useAgentChat.ts`

- When `POST /api/agents/kavya` returns `{status: "pending", sessionId}`: store `sessionId` in state, set `waiting: true`, push a waiting bubble into the message list
- Start polling `/api/agents/kavya/poll?sessionId=xxx` every 2s (`setInterval`)
- On poll reply: clear the waiting bubble, append the real reply, clear `waiting` and `sessionId`, stop polling
- On poll returning `{status: "pending"}`: continue polling
- Cleanup: stop the interval on unmount or when the window closes

### `AgentChatApp.tsx`

Render the waiting bubble as a dimmed, italic agent message: `"checking if Kavya's around... ✨"`

### `types.ts`

```ts
interface ChatResponse {
  // existing fields unchanged
  status?: "pending";
  sessionId?: string;
}
```

---

## New Files

| File | Purpose |
|------|---------|
| `src/lib/agents/qtState.ts` | Redis helpers: get/set/delete for all `qt:*` keys |
| `src/lib/agents/telegram.ts` | `sendTelegramMessage(text)` — thin wrapper around Bot API |
| `src/app/api/agents/kavya/poll/route.ts` | Poll endpoint |
| `src/app/api/agents/telegram/webhook/route.ts` | Telegram webhook handler |

## Modified Files

| File | Change |
|------|--------|
| `src/lib/agents/types.ts` | Add `status`, `sessionId` to `ChatResponse` |
| `src/app/api/agents/kavya/route.ts` | Human-handoff logic before AI call |
| `src/hooks/useAgentChat.ts` | Pending state + poll loop |
| `src/components/desktop/apps/AgentChatApp.tsx` | Waiting bubble |

---

## Environment Variables

| Variable | Where |
|----------|-------|
| `TELEGRAM_BOT_TOKEN` | `.env.local` + Vercel dashboard |
| `TELEGRAM_CHAT_ID` | `.env.local` + Vercel dashboard |
| `UPSTASH_REDIS_REST_URL` | `.env.local` + Vercel dashboard |
| `UPSTASH_REDIS_REST_TOKEN` | `.env.local` + Vercel dashboard |

---

## Post-Deploy Step

Register the Telegram webhook once after deploying to production:

```
https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://kavyakat.de/api/agents/telegram/webhook
```

---

## Out of Scope

- Multiple simultaneous qt conversations
- Any UI indication to the visitor that a human (vs AI) replied
- Kavya seeing conversation history in Telegram (she only sees each message as it arrives)
- Delivery receipts or read indicators
