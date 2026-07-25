# kk-website Project Memory

Project-specific memory for kk_website, moved out of the global `about-me/memory.md` (in `C:\claude`) on 2026-07-23 to keep the global file lean. See the global memory for the cross-project summary and pointer back here.

---

## Active redesign in progress: Windows 98 desktop portfolio

The whole site is being rebuilt as a Windows 98 desktop simulation (draggable windows, taskbar/Start menu, boot sequence) replacing the current scroll-snap page described further down in this file. That "Current state" section below describes what's live on `main` — it does not describe this redesign.

- **Branch:** `win98-redesign` (pushed to origin, tracking set up)
- **Design spec:** `docs/superpowers/specs/2026-07-24-win98-portfolio-redesign-design.md` — full design: desktop shell, content-to-window mapping, the live 2-agent A2A chat showcase ("Ask Kavya's Agents" — Kavya Agent + Fun Facts Agent, real Agent Cards + task-based JSON-RPC delegation, Groq + Upstash), Minesweeper/Solitaire, mobile fallback, what gets removed from the current site
- **Implementation plans** (`docs/superpowers/plans/`), written via the superpowers writing-plans skill:
  - `2026-07-24-win98-desktop-shell.md` — **executed and committed.** Phase 1 of 3: window manager, boot sequence, taskbar/Start menu, and the 5 content windows (About/Experience/Skills/Resume/Contact) with mobile fallback.
  - `2026-07-24-agent-showcase.md` — **executed and committed** (commits `9bdad20..c87224c`). The live "Ask Kavya's Agents" chat: Kavya Agent coordinator (Groq `llama-3.1-8b-instant`) + Fun Facts Agent, real Agent Cards at `/api/agents/*/card`, A2A `tasks/send` JSON-RPC delegation with an in-UI payload inspector, character picker (Clippy/Merlin/Rover/Genius), quick actions, Upstash rate limiting (dev-safe no-op without env). Requires `GROQ_API_KEY` (and optional `UPSTASH_REDIS_REST_URL`/`_TOKEN`) at runtime. All 71 tests pass, tsc clean, build succeeds; final code review clean.
  - **Games plan — not written yet.** Minesweeper + Solitaire.
- To continue on a new machine: check out `win98-redesign`, then either write the remaining two plans, or execute the Desktop Shell plan via `superpowers:subagent-driven-development` / `superpowers:executing-plans`.

---

## kk_website — Personal Website
- **Location:** `C:\Projects\kk-website`
- **Live URL:** https://kavyakathuria.vercel.app
- **Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Structure:** `src/app/` for routing, `src/components/`, `src/hooks/`
- **tsconfig `@/*` alias** points to `./src/*`
- **Status:** Feature-complete and deployed to Vercel. 6 sections: Hero, About, Experience, Skills, Beyond Work, Contact.
- **Features:** scroll-snap container, `useInView` fade-in animations, `useActiveSection` scroll-spy, mobile responsive layout with hamburger nav, horizontal experience card carousel, faded photo background on Hero (desktop only)
- **Current state (committed + pushed, live on Vercel):**
  - Hero photo: desktop — right-anchored faded bg; mobile — circle to the right of the name
  - Hero: subtitle on one line (mobile), content at pt-[20vh] on mobile, animated scroll hint at bottom (`ScrollHint` component — Hero only, removed from other sections)
  - Hero body copy: "10+ years across software engineering, data engineering, and AI — currently focused on analytical insights at SAP Commerce Cloud. Based in Munich."
  - Navbar: KK logo removed, all links centered (Home · About · Experience · Skills · Beyond Work · Contact)
  - Navbar active-section indicator (`src/hooks/useActiveSection.ts`, IntersectionObserver-based, threshold 0.5): desktop shows underline on the active link; mobile shows a thin progress bar under the navbar (width scales with active section index) plus an underline on the active link in the dropdown; mobile section-name label was tried and removed (too easily truncated)
  - Section number indicators removed from all sections
  - Beyond Work section (`src/components/BeyondWork.tsx`): table tennis — TTC 1992 München (Bavarian district league) + SAP Munich corporate league captain; links to https://www.mytischtennis.de/click-tt/spieler/P1435A5023/spielerportrait
  - Vercel Analytics installed and wired into root layout
  - Resume: `public/Kavya_Kathuria_Resume.pdf`, download attribute set to "Kavya Kathuria Resume"
  - `useInView` uses `#scroll-container` as IntersectionObserver root (fixes fade-in inside scroll-snap)
  - Sections use `min-height` not `height` so tall sections (About on mobile) don't clip content
- **Table tennis data (scraped):** Club: TTC 1992 München e.V., TTR: 1266 (peak 1326 on 14.10.2025), League: Bezirksklasse B Gruppe 3 München-West (ByTTV)
