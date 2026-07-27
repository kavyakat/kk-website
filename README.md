# Kavya Kathuria — Personal Website

Personal portfolio built as a **Windows 98 desktop simulation**. Live at **[kavyakat.de](https://kavyakat.de)** · **[kavyakathuria.vercel.app](https://kavyakathuria.vercel.app)**.

Boot into a retro desktop with draggable windows, a taskbar and Start menu, a boot/shutdown sequence, playable games, and a live AI agent chat. Switch the whole thing to a Windows XP (Luna) look from the **Appearance** tab of System Properties.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + [98.css](https://jdan.github.io/98.css/), with a scoped Windows XP theme layer (`src/app/xp.css`)
- **AI:** Groq (`llama-3.1-8b-instant`) for the agent chat
- **Rate limiting:** Upstash Redis (optional — no-ops without env)
- **Testing:** Vitest + React Testing Library (42 test files, 150 tests)
- **Deployment:** Vercel (auto-deploy on push to `main`)
- **Analytics:** Vercel Analytics

## Features

- **Desktop shell** — window manager (open/focus/minimize/maximize/drag), taskbar, Start menu, boot and shutdown sequences
- **Content windows** — About, Experience, Skills (System Properties), Resume, Contact
- **Ask Kavya's Agents** — a live 2-agent A2A chat: a Kavya coordinator agent delegates to a Fun Facts agent via task-based JSON-RPC, with real Agent Cards served at `/api/agents/*/card` and an in-UI payload inspector. Pick a classic Office-style character (Clippy/Merlin/Rover/Genius).
- **Desktop buddy** — a floating Clippy-style assistant that syncs with the chat character and docks into the open chat window
- **Games** — Minesweeper and Solitaire, shown as desktop icons and under Programs > Games
- **Theme toggle** — live-switchable Windows 98 ↔ Windows XP look from System Properties > Appearance, persisted in `localStorage`; character auto-defaults to Rover on XP, Clippy on 98
- **Wallpaper picker** — 5 desktop wallpapers per theme, persisted per-theme in `localStorage`
- **Mobile layout** — simplified icon grid on small screens

## Structure

```
src/
  app/                    # Next.js App Router (layout, page, API routes, xp.css)
    api/agents/           # Agent Cards + A2A JSON-RPC endpoints
  components/desktop/     # Desktop shell + window chrome
    apps/                 # Individual window contents (About, Games, Chat, etc.)
  data/                   # Static content (experience, skills, fun facts, wallpapers)
  hooks/                  # useWindowManager, useTheme, useCharacter, useWallpaper, useAgentChat
  lib/
    agents/               # Coordinator, Fun Facts agent, cards, prompts, rate limit
    games/                # Minesweeper + Solitaire game logic
    appRegistry.ts        # The list of desktop apps/windows
  middleware.ts           # Redirects resume.kavyakat.de → the resume PDF
```

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

The agent chat needs a Groq API key at runtime. Rate limiting is optional.

```bash
GROQ_API_KEY=...              # required for the agent chat to return replies
UPSTASH_REDIS_REST_URL=...    # optional — enables rate limiting
UPSTASH_REDIS_REST_TOKEN=...  # optional
```

Without `GROQ_API_KEY` the desktop still boots and every window works; only the live agent replies are unavailable.

## Testing

```bash
npx vitest run      # run the full suite once
npx vitest          # watch mode
npx tsc --noEmit    # type check
npm run build       # production build
```
