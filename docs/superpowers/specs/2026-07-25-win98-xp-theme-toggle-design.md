# Windows XP Theme Toggle + Games Flyout — Design

**Date:** 2026-07-25
**Branch:** `win98-redesign`
**Status:** Design approved, pending spec review

## Goal

Add a full-fidelity **Windows XP (Luna)** theme to the desktop portfolio, switchable live against the existing Windows 98 look from the Settings dialog and remembered across visits. Separately, group **Minesweeper** and **Solitaire** into a **Programs > Games** flyout (both themes) and remove them from the desktop and top-level Programs list.

## Locked Decisions

1. **Toggle, not replace.** Windows 98 stays the default look; XP is a second theme selectable in Settings. The choice persists in `localStorage` and applies on the next visit (including the boot sequence).
2. **Full XP fidelity.** Every surface is themed: window chrome, taskbar, Start menu, desktop background, fonts, boot/shutdown screens, and icons.
3. **Authentic Microsoft XP icons.** Ship the real extracted XP icon set (sourced from an archive such as `bartekl1/windows-ui-assets`) into `public/icons/xp/`. See Assets for the copyright caveat.
4. **Games grouping.** Minesweeper + Solitaire live under a **Games** flyout inside Programs (98) / All Programs (XP). They no longer appear as desktop icons or in the top-level Programs list.

## Architecture

**Approach: theme context + `data-theme` attribute + scoped CSS + per-component branches.**

- New `ThemeProvider` and `useTheme()` hook. State: `theme: "win98" | "winxp"`, default `"win98"`. Persisted to `localStorage` under key `kk-theme`; read synchronously on first render so the boot screen matches the saved theme (avoid a 98→XP flash).
- The root desktop container sets `data-theme={theme}`.
- **98.css stays the base.** A new scoped stylesheet `src/app/xp.css` places *all* XP rules under `[data-theme="winxp"]`, overriding 98.css chrome (`.window`, `.title-bar`, controls, `button`, `input`, `select`, scrollbars) with Luna styling. Imported from `globals.css` after `98.css`.
- Components with hand-written inline styles (Taskbar, StartMenu, Desktop background, DesktopIcon) read `useTheme()` and branch their styles/markup.

**Rejected alternatives:**
- Swapping in the `XP.css` npm library — it reuses 98.css's class names, so the two cannot coexist for a live toggle.
- A separate `<XPDesktop>` component tree — massive duplication of the window-manager wiring and app rendering.

## Component Specifications

### 1. Theme infrastructure
- **Create** `src/hooks/useTheme.tsx`: `ThemeProvider` (reads `localStorage["kk-theme"]`, defaults `"win98"`) and `useTheme()` returning `{ theme, setTheme }`. `setTheme` writes to `localStorage`.
- Wrap `<Desktop>` in `<ThemeProvider>` (in `Desktop.tsx` or the page). `Desktop`'s root `<div>` gets `data-theme={theme}` and the theme-appropriate background.

### 2. Settings dialog (`SettingsApp.tsx`)
- Make the theme radios live. Both **Windows 98** and **Windows XP** enabled (remove the "coming soon"/disabled state). Selecting a radio calls `setTheme` immediately (live switch); OK/Cancel close as today. The selected radio reflects current `theme`.

### 3. Desktop background (`Desktop.tsx`)
- `win98`: existing teal `#008080`.
- `winxp`: **Bliss** wallpaper — `background: url(/wallpapers/bliss.jpg) center/cover`, with a Bliss-style CSS gradient as fallback color.

### 4. Window chrome — `src/app/xp.css` (scoped `[data-theme="winxp"]`)
- `.window`: rounded `8px 8px 0 0` top corners, `1px solid #0831d9` border (no top border), silver body `#ece9d8`, drop shadow.
- `.title-bar`: glossy Luna-blue gradient, white bold text with subtle shadow, ~28px tall. Show the app icon at the left of the title bar (from `app.iconSrc` / XP icon).
- `.title-bar-controls button`: rounded ~21px glass buttons; close = red gradient, min/max = blue gradient, with the `_ □ ×` glyphs.
- `button`, `input`, `select`: Luna-styled (rounded, blue-tinted focus). `::-webkit-scrollbar*`: Luna blue scrollbars.
- Font-family on `[data-theme="winxp"]` root: `Tahoma, "Segoe UI", Verdana, sans-serif`.
- `.window-body` background `#ece9d8`.

### 5. Taskbar (`Taskbar.tsx`)
- Branch on `theme`.
- `winxp`: taskbar blue gradient; **start** button = glossy green rounded button with the XP flag icon + italic "start"; task buttons Luna-styled; system tray = lighter blue notch with clock (+ volume). Social icons kept.
- `win98`: unchanged.

### 6. Start menu (`StartMenu.tsx`)
- Branch on `theme`. Extract the current markup into a `Win98Menu` and add an `XPMenu` (keep both in `StartMenu.tsx` or split into `StartMenu98.tsx` / `StartMenuXP.tsx` if the file grows large).
- **XP layout (desktop):** two columns inside a rounded panel.
  - Header: avatar + "Kavya Kathuria" on a blue bar.
  - Left column: a few pinned apps (About Kavya, Experience, Resume), separator, then **All Programs ▸** which opens a flyout listing all non-hidden, non-game apps **plus** a nested **Games ▸** sub-flyout (Minesweeper, Solitaire).
  - Right column: utility apps — Resume, Contact, Settings, Find, Help.
  - Footer: **Log Off** and **Turn Off** (Turn Off → existing `onShutDown`).
- **XP mobile:** full-screen list styled XP-blue (mirrors the current 98 mobile full-screen behavior), including a Games group.
- **98 menu:** keep current layout, but the **Programs** flyout now lists non-game apps + a **Games ▸** sub-flyout (Minesweeper, Solitaire) instead of listing the games inline.

### 7. Games grouping — data model (`appRegistry.ts`)
- Add `group?: "games"` to `AppDefinition`. Set `group: "games"` on `minesweeper` and `solitaire`.
- `DesktopIcons.tsx`: filter `!app.hidden && app.group !== "games"` (games leave the desktop).
- Both Start menus render the top-level Programs list as `!hidden && group !== "games"`, and a Games flyout as `group === "games"`.

### 8. Boot & shutdown (`BootSequence.tsx`, `ShutdownSequence.tsx`)
- Read the saved theme (via `useTheme`, available because ThemeProvider wraps everything).
- `winxp` boot: black screen, Windows XP logo, animated sliding progress blocks, then a brief "Welcome" splash. `winxp` shutdown: XP "Windows is shutting down…" on the blue background.
- `win98`: keep the current sequences.

### 9. Desktop icons (`DesktopIcon.tsx`)
- Minor theme branch: XP uses white label text with a soft shadow and a blue translucent selection highlight; 98 unchanged. XP swaps to the XP icon asset per app.

## Assets

- **`public/icons/xp/`** — authentic extracted Windows XP icons: one per visible app (about, experience, skills, resume, contact, agents, minesweeper, solitaire) plus system icons used by the XP Start menu/taskbar (start flag, My Documents/folder, Control Panel, Search, Help, Log Off, Turn Off, user avatar).
- **`public/wallpapers/bliss.jpg`** — the XP Bliss wallpaper.
- **Icon mapping:** each `AppDefinition` keeps its existing `iconSrc` (98 icon); add an `xpIconSrc?: string` field for the XP variant, resolved by theme. Components pick `theme === "winxp" ? app.xpIconSrc ?? app.iconSrc : app.iconSrc`.
- **Copyright caveat:** genuine XP icons and the Bliss image are Microsoft-copyrighted. Shipping them on a public site is a copyright gray area, chosen deliberately for fidelity on a hobby tribute. Enforcement risk is negligible in practice but the assets are technically unlicensed.

## Testing (Vitest + RTL)

- `useTheme`: defaults to `win98`; `setTheme("winxp")` updates and writes `localStorage`; reads persisted value on mount.
- `SettingsApp`: both radios enabled; selecting Windows XP calls `setTheme("winxp")`; reflects current theme.
- `StartMenu`: in `winxp` renders two columns + Log Off/Turn Off; in both themes a Games flyout exposes Minesweeper & Solitaire and they are absent from the top-level Programs list.
- `DesktopIcons`: excludes `group: "games"` apps.
- `Taskbar`: renders the green "start" button under `winxp`.
- Existing tests stay green.

## Verification

- `npx vitest run` (existing + new), `npx tsc --noEmit`, `npm run build` all clean.
- Playwright QA in **both** themes: boot matches saved theme; Settings toggles live; XP window chrome, taskbar, and two-column Start menu render; Games flyout opens both games; games absent from desktop; switch back to 98 restores the original look.

## Out of Scope

- No new apps or content; no changes to the agent chat behavior.
- Desktop buddy (Clippy/Rover) is left as-is (character-driven, theme-agnostic).
- No pixel-exact XP animations beyond boot/shutdown (e.g. window open/close easing) unless trivially free.
