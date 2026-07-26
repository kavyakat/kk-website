# kk-website Project Memory

Project-specific memory for kk_website, moved out of the global `about-me/memory.md` (in `C:\claude`) on 2026-07-23 to keep the global file lean. See the global memory for the cross-project summary and pointer back here.

---

## Current state: Windows 98 desktop portfolio (live on `main`)

The site is a **Windows 98 desktop simulation** — draggable windows, taskbar/Start menu, boot/shutdown sequences, playable games, and a live AI agent chat. It replaced the earlier scroll-snap single-page site. Merged to `main` on 2026-07-26 (merge commit `e969af7`) and deployed to Vercel.

- **Live URL:** https://kavyakathuria.vercel.app
- **Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, [98.css](https://jdan.github.io/98.css/) + scoped XP theme layer (`src/app/xp.css`)
- **tsconfig `@/*` alias** → `./src/*`
- **Deployment:** Vercel, auto-deploy on push to `main`
- **Env vars:** `GROQ_API_KEY` (required for agent chat replies), `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (optional rate limiting; no-ops without them)
- **Tests:** Vitest + React Testing Library, 42 test files (148 tests), all green; `npx vitest run`, `npx tsc --noEmit`, `npm run build`

### Key pieces
- **Desktop shell:** `src/components/desktop/` — `useWindowManager` (open/focus/min/max/drag), `BootSequence`, `ShutdownSequence`, `Taskbar`, `StartMenu`, `Window`, `DesktopBuddy`
- **App registry:** `src/lib/appRegistry.ts` — the list of windows. `hidden` apps (terminal/settings/find/help) launch from the Start menu but aren't desktop icons; `group: "games"` (minesweeper/solitaire) live under Programs > Games.
- **Content windows:** `src/components/desktop/apps/` — About, Experience, Skills (System Properties), Resume, Contact
- **Ask Kavya's Agents:** live 2-agent A2A chat — Kavya coordinator (Groq `llama-3.1-8b-instant`) delegates to a Fun Facts agent via `tasks/send` JSON-RPC; real Agent Cards at `/api/agents/*/card`; in-UI payload inspector; character picker (Clippy/Merlin/Rover/Genius). Logic in `src/lib/agents/`, hook `src/hooks/useAgentChat.ts`.
- **Games:** `src/lib/games/` (minesweeper + solitaire logic), rendered by `MinesweeperApp`/`SolitaireApp`
- **Theme toggle:** `src/hooks/useTheme.tsx` + `src/app/xp.css` — live-switchable Windows 98 ↔ XP (Luna), persisted in `localStorage` key `kk-theme` (default `win98`), read synchronously on first render so the boot screen matches. Switched from the Settings ("Display Properties") dialog.

### Design docs (`docs/superpowers/`)
- Specs and plans for the redesign live here (committed). The XP theme toggle feature: `specs/2026-07-25-win98-xp-theme-toggle-design.md` + `plans/2026-07-25-win98-xp-theme-toggle.md`.

---

## Durable content facts
- **Resume:** `public/Kavya_Kathuria_Resume.pdf`
- **Hero/About body copy:** "10+ years across software engineering, data engineering, and AI — currently focused on analytical insights at SAP Commerce Cloud. Based in Munich."
- **Table tennis (Beyond Work / About):** TTC 1992 München e.V.; SAP Munich corporate league captain; profile https://www.mytischtennis.de/click-tt/spieler/P1435A5023/spielerportrait — TTR 1266 (peak 1326 on 14.10.2025), League: Bezirksklasse B Gruppe 3 München-West (ByTTV)
- **Analytics:** Vercel Analytics wired into the root layout
