# kk-website Project Memory

Project-specific memory for kk_website, moved out of the global `about-me/memory.md` (in `C:\claude`) on 2026-07-23 to keep the global file lean. See the global memory for the cross-project summary and pointer back here.

---

## Current state: Windows 98 desktop portfolio (live on `main`)

The site is a **Windows 98 desktop simulation** — draggable windows, taskbar/Start menu, boot/shutdown sequences, playable games, and a live AI agent chat. It replaced the earlier scroll-snap single-page site. Merged to `main` on 2026-07-26 (merge commit `e969af7`) and deployed to Vercel.

- **Live URLs:** https://kavyakat.de · https://kavyakathuria.vercel.app · https://resume.kavyakat.de (redirects to the PDF via `src/middleware.ts`)
- **Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, [98.css](https://jdan.github.io/98.css/) + scoped XP theme layer (`src/app/xp.css`)
- **tsconfig `@/*` alias** → `./src/*`
- **Deployment:** Vercel, auto-deploy on push to `main`; DNS via Cloudflare (grey cloud / DNS-only for all records pointing to Vercel — orange cloud breaks SSL)
- **Env vars:** `GROQ_API_KEY` (required for agent chat replies), `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (optional rate limiting; no-ops without them)
- **Tests:** Vitest + React Testing Library, 42 test files (150 tests), all green; `npx vitest run`, `npx tsc --noEmit`, `npm run build`

### Key pieces
- **Desktop shell:** `src/components/desktop/` — `useWindowManager` (open/focus/min/max/drag), `BootSequence`, `ShutdownSequence`, `Taskbar`, `StartMenu`, `Window`, `DesktopBuddy`
- **Boot sequence:** phase callbacks (`onComplete`, `onReboot`, `onShutdown`) are `useCallback`-wrapped in `Desktop.tsx` so the `BootSequence` timeout doesn't reset on re-renders
- **App registry:** `src/lib/appRegistry.ts` — the list of windows. `hidden` apps (terminal/find/help) launch from the Start menu but aren't desktop icons; `group: "games"` (minesweeper/solitaire) show both as desktop icons and under Programs > Games.
- **Content windows:** `src/components/desktop/apps/` — About, Experience, Skills (System Properties), Resume, Contact
- **Contact:** buttons use `<button onClick>` (not `<a>`) for 98.css styling; email is `mail@kavyakat.de`
- **Ask Kavya's Agents:** live 2-agent A2A chat — Kavya coordinator (Groq `llama-3.1-8b-instant`) delegates to a Fun Facts agent via `tasks/send` JSON-RPC; real Agent Cards at `/api/agents/*/card`; in-UI payload inspector; character picker (Clippy/Merlin/Rover/Genius). Logic in `src/lib/agents/`, hook `src/hooks/useAgentChat.ts`.
- **Games:** `src/lib/games/` (minesweeper + solitaire logic), rendered by `MinesweeperApp`/`SolitaireApp`
- **Theme toggle:** `src/hooks/useTheme.tsx` + `src/app/xp.css` — live-switchable Windows 98 ↔ XP (Luna), persisted in `localStorage` key `kk-theme` (default `win98`). Switched from the **Appearance tab of System Properties** (`SkillsApp.tsx`).
- **Character system:** `src/hooks/useCharacter.tsx` — `CharacterProvider` context; auto-defaults Rover for XP, Clippy for Win98 on theme change. Set from System Properties > Assistant dropdown.
- **Wallpaper system:** `src/hooks/useWallpaper.tsx` + `src/data/wallpapers.ts` — 5 options per theme, persisted per-theme (`kk-wallpaper-win98` / `kk-wallpaper-winxp`). Set from System Properties > Background swatches.
- **XP title bar buttons:** `.title-bar-controls button` in `xp.css` sets background gradient directly (specificity 0,2,1) with `::after` icon characters (`─`, `□`, `✕`) so they're always visible.
- **Taskbar social icons:** LinkedIn/GitHub/Instagram sit on a white chip in the XP theme (`Taskbar.tsx` `socialStyle`) so they stay visible against the blue Luna taskbar.
- **Desktop buddy z-index:** rests on desktop layer (`z=0`); `z=101` when docked to the open chat (above the focused window's `z=100`); `z=1000` only mid-flight. (`DesktopBuddy.tsx`)
- **Resume subdomain:** `src/middleware.ts` — 302-redirects `resume.kavyakat.de` → `/Kavya_Kathuria_Resume.pdf`. Requires a `CNAME resume → cname.vercel-dns.com` in Cloudflare (grey cloud) and the domain added in Vercel.

### Design docs (`docs/superpowers/`)
- Specs and plans for the redesign live here (committed). The XP theme toggle feature: `specs/2026-07-25-win98-xp-theme-toggle-design.md` + `plans/2026-07-25-win98-xp-theme-toggle.md`.

---

## Durable content facts
- **Resume:** `public/Kavya_Kathuria_Resume.pdf`
- **Contact email:** `mail@kavyakat.de` (defined in `src/data/content.ts`)
- **Hero/About body copy:** "10+ years across software engineering, data engineering, and AI — currently focused on analytical insights at SAP Commerce Cloud. Based in Munich."
- **Table tennis (Beyond Work / About):** TTC 1992 München e.V.; SAP Munich corporate league captain; profile https://www.mytischtennis.de/click-tt/spieler/P1435A5023/spielerportrait — TTR 1266 (peak 1326 on 14.10.2025), League: Bezirksklasse B Gruppe 3 München-West (ByTTV)
- **Analytics:** Vercel Analytics wired into the root layout
