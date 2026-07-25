# kk-website: Windows 98 Desktop Portfolio Redesign

## Summary

Replace the current scroll-snap, colored-section single page with a full Windows 98 desktop OS simulation. The entire site becomes a desktop: icons open draggable windows containing the existing content (About, Experience, Skills, Beyond Work, Contact, Resume), plus two new features — a live two-agent AI chat ("Ask Kavya's Agents") demonstrating real A2A (agent-to-agent) protocol delegation, and two playable classic Windows 98 games (Minesweeper, Solitaire).

Inspiration: [fran-ai.dev](https://fran-ai.dev/) — a Windows 3.1 desktop simulation with an embedded AI chat persona. This design uses the same "desktop as portfolio" metaphor at Windows 98 fidelity, with a genuine multi-agent showcase instead of a single chat persona.

This is a full replacement of the current design (scroll-snap sections, per-section background colors, serif italic headers, `useInView`/`useActiveSection` hooks, `Navbar`/`ScrollHint` components) — not an incremental change.

## Goals

- Feel completely distinctive, not templated — memorable enough that a recruiter or engineer remembers the site specifically
- Demonstrate real technical range: not just frontend polish, but a working multi-agent AI feature using real A2A protocol shapes
- Keep all existing bio/experience/skills/contact content intact — this is a presentation change, not a content rewrite
- Stay usable on mobile despite the desktop-window metaphor

## Non-goals

- Pixel-perfect Windows 98 recreation of every OS feature (no file properties dialogs, no actual file system, no Registry Editor easter eggs beyond what's listed here)
- Full A2A spec compliance (formal conformance testing, agent discovery beyond this site, multi-tenant agent hosting) — we implement the meaningful, demonstrable parts: Agent Cards and task-based JSON-RPC delegation between two agents
- Window resizing (v1 ships with fixed/preset window sizes)
- Persisting window state across page reloads (a refresh resets the desktop)

## Desktop Shell

**Wallpaper:** classic Windows 98 teal (`#008080`).

**Desktop icons** (double-click to open, left edge, top-to-bottom):
1. `About.txt` — Notepad window, bio text
2. `Experience` — File Explorer-style window, one folder icon per role
3. `System Properties` — Skills, styled as a Windows System Properties / Device Manager dialog, tabbed by category
4. `Resume.pdf` — embedded PDF viewer window
5. `Ask Kavya's Agents` — MSN Messenger-style chat window (see Agent Showcase below)
6. `Contact.exe` — Outlook Express "New Message"-style window
7. `Minesweeper.exe` — playable classic Minesweeper
8. `Solitaire.exe` — playable classic Klondike Solitaire
9. `Recycle Bin` — decorative; no functional requirement in v1

**Window manager:**
- Draggable by title bar (mouse/touch drag on desktop; auto-maximized on mobile, see Mobile section)
- Click anywhere on a window raises it to the top (focus/z-index)
- Minimize sends the window to the taskbar (button remains, window hides)
- Close removes the window and its taskbar button
- Fixed/preset size per window type — no resize handles in v1
- Multiple windows of the same app are not supported in v1 (opening an already-open app focuses the existing window instead of creating a second instance)

**Taskbar:**
- Fixed to the bottom of the viewport
- Start button (bottom-left) with the classic 4-color flag glyph, opens a cascading Start Menu listing the same 9 items as a Programs list
- One button per open window, clicking focuses/restores it
- Live clock, right-aligned

**Boot sequence:** a brief BIOS/loading-style screen plays once per session load before the desktop appears (a few seconds, skippable by click/tap to avoid frustrating repeat visitors).

**Visual chrome:** implemented via the `98.css` toolkit (installed as an npm dependency and self-hosted — not loaded from a CDN in production, to avoid an external runtime dependency and CSP/offline issues). This provides the beveled 3D borders, blue-gradient active title bar, `#C0C0C0` panel gray, and the "Pixelated MS Sans Serif" bitmap-style font. All window/taskbar text is explicitly set to black — the mockup process surfaced a real bug where UI text inherited a light color from the surrounding page theme and became unreadable against the light gray Win98 chrome; the production implementation must not repeat this (never rely on inherited/ambient text color inside `98.css`-styled chrome).

## Content-to-Window Mapping

Existing component data is reused as-is; only the presentation container changes.

| Window | Source content | Notes |
|---|---|---|
| `About.txt` | `About.tsx` bio copy | Rendered in a Notepad-style window (monospace, scrollable body, fake File/Edit/Search/Help menu bar — non-functional, decorative) |
| `Experience` | `Experience.tsx` role data | File Explorer-style window; each of the 5 roles is a folder icon; double-click opens a details pane with the existing title/company/period/bullets |
| `System Properties` | `Skills.tsx` skill groups | Tabbed dialog (Languages, SAP & Cloud, Data & AI, DevOps), styled like Windows' System Properties/Device Manager — skills presented as "installed components" |
| `Resume.pdf` | `public/Kavya_Kathuria_Resume.pdf` | Embedded PDF viewer window; also reachable via the chat's `Open Resume` quick-action button |
| `Contact.exe` | `Contact.tsx` links | Outlook-Express-style "New Message" compose window, pre-filled `To:` field, GitHub/LinkedIn as a signature block |
| `Ask Kavya's Agents` | `BeyondWork.tsx` (table tennis) + all of the above | See Agent Showcase section |

## Agent Showcase ("Ask Kavya's Agents")

**Roster (2 agents — simplified from an earlier 4-agent draft for reliability and lower maintenance surface):**
- **Kavya Agent** (Coordinator) — answers questions about background, experience, skills, and contact info directly
- **Fun Facts Agent** (specialist) — table tennis / Beyond Work content; the Coordinator delegates to it when a question falls in this domain

**Protocol approach:** implements the meaningful, demonstrable parts of the A2A protocol rather than full spec conformance:
- Each agent exposes an **Agent Card** (a capability descriptor: name, description, skills) at a discoverable JSON endpoint
- Coordinator → specialist delegation uses **task-based JSON-RPC**, matching A2A's message/task lifecycle shape
- The chat UI exposes the raw request/response JSON for a delegation on demand (a "view payload" toggle on the delegation message) — this is what makes the demo read as "real implementation" to a technically literate visitor, not just a themed chatbot

**Interaction model:**
- Primary interaction is quick-action buttons: `About Me` · `My Experience` · `My Skills` · `Fun Facts 🏓` · `Open Resume`
- Free text is also available, length-capped
- `Open Resume` is a real desktop action (opens the `Resume.pdf` window) triggered from inside the chat, not a Q&A response

**Backend:**
- **Groq** as the LLM provider (fast enough for a live multi-hop exchange, generous free tier, same choice as the fran-ai.dev reference)
- Next.js API routes (Vercel serverless functions) — one route per agent, plus its Agent Card endpoint
- System prompts scoped tightly to each agent's content domain, with explicit instructions to resist attempts to redirect behavior (prompt injection resistance)

**Safety & cost controls (required, not optional, since this is a public endpoint tied to Kavya's name):**
- **Upstash Redis** (free tier, pairs natively with Vercel) for per-IP rate limiting and a global daily request cap
- Once the daily cap is hit, the chat shows a friendly "agents are resting, back tomorrow" state rather than erroring
- Response length capped server-side regardless of what the model returns

**Setup dependency:** requires a Groq account and API key, plus an Upstash Redis instance — Kavya needs to create these accounts herself (account creation isn't something Claude can do on her behalf) and provide the resulting credentials as environment variables (`GROQ_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`).

## Games

Two classic, actually-bundled-with-Windows-98 games (not Snake, which wasn't native to Win98):

- **Minesweeper** — classic beginner 9×9 grid, flood-fill reveal, flagging, win/loss detection. Full working implementation, not a screenshot/decoration.
- **Solitaire (Klondike)** — 7 tableau columns, 4 foundations, stock/waste pile, drag-and-drop card movement, win detection.

Both are real scope items on top of the desktop shell and agent feature — flagged explicitly so implementation planning accounts for them as their own build effort, not incidental polish.

## Mobile / Touch Fallback

Draggable overlapping windows don't translate to a phone. Mobile gets its own faithful mode rather than a shrunk desktop:
- Desktop icons render as a full-screen grid (phone home-screen style) instead of a left-edge column
- Tapping an icon opens its window full-screen/auto-maximized — no dragging required
- The taskbar becomes a bottom bar; Start opens a full-screen app list instead of a cascading menu
- The boot sequence plays identically (it's just a loading screen)

This keeps the Windows 98 identity consistent on mobile instead of degrading to a generic responsive layout.

## What Gets Removed

The following current implementation is fully replaced, not extended:
- `src/components/Navbar.tsx`, `ScrollHint.tsx`, and the scroll-snap CSS in `globals.css`
- `src/hooks/useInView.ts`, `useActiveSection.ts`
- The current `Hero.tsx` treatment (photo-based hero) — superseded by the boot sequence + desktop
- Per-section background colors (indigo/orange/slate/emerald/violet) and serif italic headers

`About.tsx`, `Experience.tsx`, `Skills.tsx`, `BeyondWork.tsx`, `Contact.tsx` are not deleted — their data/copy is reused inside the new window components; their current presentation (as standalone scroll sections) is replaced.

## Suggested Implementation Phasing

For the planning step — not a commitment made here, just a sequencing suggestion given the size of this project:
1. Desktop shell: boot sequence, wallpaper, icons, window manager, taskbar/Start menu, static windows (About, Experience, System Properties, Resume, Contact)
2. Mobile fallback for the above
3. Agent Showcase: backend routes, Agent Cards, rate limiting, chat UI
4. Games: Minesweeper, then Solitaire

## Open Risks

- `98.css` (or an equivalent) needs to be vetted for React/Next.js compatibility and bundle size before implementation starts
- Groq/Upstash account creation and key provisioning is a blocking dependency on Kavya before the Agent Showcase can be built or tested
- Two real mini-games are a meaningful time investment; if timeline is tight, Solitaire is the better candidate to cut or defer, since Minesweeper alone still delivers the "Windows 98 nostalgia" beat
