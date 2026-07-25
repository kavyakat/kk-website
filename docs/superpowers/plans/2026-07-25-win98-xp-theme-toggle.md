# Windows XP Theme Toggle + Games Flyout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full-fidelity Windows XP (Luna) theme that toggles live against the existing Windows 98 look from the Settings dialog and persists across visits, and group Minesweeper + Solitaire into a Programs > Games flyout.

**Architecture:** A `ThemeProvider`/`useTheme` context (persisted to `localStorage`, default `win98`) sets `data-theme` on the desktop root. 98.css stays the base; a scoped `xp.css` (`[data-theme="winxp"]`) repaints window chrome, buttons, inputs, scrollbars. Inline-styled components (Taskbar, StartMenu, Desktop background, DesktopIcon, boot/shutdown) branch on `useTheme()`. Authentic extracted XP icons + the Bliss wallpaper ship in `public/`.

**Tech Stack:** Next.js 14 App Router, React 18 client components, TypeScript, 98.css, Vitest 4 + React Testing Library + jsdom.

**Spec:** `docs/superpowers/specs/2026-07-25-win98-xp-theme-toggle-design.md`

**Copyright note:** Genuine XP icons and the Bliss image are Microsoft-copyrighted; shipping them is a deliberate gray-area choice for fidelity on a hobby tribute (see spec).

---

## File Structure

- `src/hooks/useTheme.tsx` (create) — `ThemeProvider` + `useTheme()`; localStorage persistence. Sole owner of theme state.
- `src/hooks/useTheme.test.tsx` (create) — theme default, set, persist, rehydrate.
- `src/app/page.tsx` (modify) — wrap `<Desktop/>` in `<ThemeProvider>`.
- `src/app/globals.css` (modify) — `@import "xp.css"` after 98.css.
- `src/app/xp.css` (create) — all XP chrome, scoped under `[data-theme="winxp"]`.
- `src/lib/appRegistry.ts` (modify) — add `group?: "games"` and `xpIconSrc?: string`; set games group + XP icon paths.
- `src/lib/appRegistry.test.ts` (modify) — assert games grouping + xp icon presence.
- `src/components/desktop/Desktop.tsx` (modify) — `data-theme` + themed background; pass nothing extra (children read context).
- `src/components/desktop/DesktopIcons.tsx` (modify) — exclude `group: "games"`.
- `src/components/desktop/DesktopIcon.tsx` (modify) — resolve XP icon + XP label style via `useTheme()`.
- `src/components/desktop/DesktopIcon.test.tsx` (modify) — icon resolution by theme.
- `src/components/desktop/apps/SettingsApp.tsx` (modify) — live theme toggle via `useTheme()`.
- `src/components/desktop/apps/SettingsApp.test.tsx` (modify) — both radios enabled; selecting XP calls setTheme.
- `src/components/desktop/Taskbar.tsx` (modify) — XP taskbar + green start button.
- `src/components/desktop/Taskbar.test.tsx` (modify) — green "start" button in XP.
- `src/components/desktop/StartMenu.tsx` (modify) — XP two-column layout + Games flyout; 98 Games flyout.
- `src/components/desktop/StartMenu.test.tsx` (create) — XP columns, Games flyout in both themes.
- `src/components/desktop/BootSequence.tsx` (modify) — XP boot variant.
- `src/components/desktop/ShutdownSequence.tsx` (modify) — XP shutdown variant.
- `public/icons/xp/*.png` (create) — authentic per-app + system icons.
- `public/wallpapers/bliss.jpg` (create) — XP wallpaper.

---

## Task 1: Theme infrastructure

**Files:**
- Create: `src/hooks/useTheme.tsx`
- Create: `src/hooks/useTheme.test.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/desktop/Desktop.tsx:72-74` (root div)

- [ ] **Step 1: Write the failing test** — `src/hooks/useTheme.test.tsx`

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, useTheme } from "./useTheme";

function Probe() {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={() => setTheme("winxp")}>xp</button>
    </div>
  );
}

describe("useTheme", () => {
  beforeEach(() => localStorage.clear());

  it("defaults to win98", () => {
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByTestId("theme").textContent).toBe("win98");
  });

  it("setTheme updates value and persists to localStorage", () => {
    render(<ThemeProvider><Probe /></ThemeProvider>);
    fireEvent.click(screen.getByText("xp"));
    expect(screen.getByTestId("theme").textContent).toBe("winxp");
    expect(localStorage.getItem("kk-theme")).toBe("winxp");
  });

  it("rehydrates the saved theme on mount", () => {
    localStorage.setItem("kk-theme", "winxp");
    render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByTestId("theme").textContent).toBe("winxp");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/useTheme.test.tsx`
Expected: FAIL — cannot resolve `./useTheme`.

- [ ] **Step 3: Implement `src/hooks/useTheme.tsx`**

```tsx
"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "win98" | "winxp";

const STORAGE_KEY = "kk-theme";

const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({
  theme: "win98",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("win98");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "win98" || saved === "winxp") setThemeState(saved);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEY, t);
  };

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/hooks/useTheme.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Wrap the app** — `src/app/page.tsx`

```tsx
import Desktop from "@/components/desktop/Desktop";
import { ThemeProvider } from "@/hooks/useTheme";

export default function Home() {
  return (
    <ThemeProvider>
      <Desktop />
    </ThemeProvider>
  );
}
```

- [ ] **Step 6: Apply `data-theme` + themed background** — `src/components/desktop/Desktop.tsx`

At the top of `Desktop`, after `const chat = useAgentChat();` add:

```tsx
  const { theme } = useTheme();
```

Add the import near the other hooks:

```tsx
import { useTheme } from "@/hooks/useTheme";
```

Replace the root `<div>` opening tag (currently line 73) with:

```tsx
    <div
      data-theme={theme}
      style={{
        position: "relative",
        width: "100%",
        height: "100dvh",
        background:
          theme === "winxp"
            ? "#5a8bd6 url(/wallpapers/bliss.jpg) center/cover no-repeat"
            : "#008080",
        overflow: "hidden",
      }}
    >
```

- [ ] **Step 7: Verify build + tests**

Run: `npx tsc --noEmit && npx vitest run src/hooks/useTheme.test.tsx`
Expected: tsc clean; tests PASS.

- [ ] **Step 8: Commit**

```bash
git add src/hooks/useTheme.tsx src/hooks/useTheme.test.tsx src/app/page.tsx src/components/desktop/Desktop.tsx
git commit -m "feat: add theme context with win98/winxp toggle and persistence"
```

---

## Task 2: Fetch authentic XP icons + Bliss wallpaper

**Files:**
- Create: `public/icons/xp/` (PNG files)
- Create: `public/wallpapers/bliss.jpg`

Source: `bartekl1/windows-ui-assets` (raw GitHub). If a specific path 404s, list the repo tree first with the GitHub API and adjust the filename — do not invent URLs.

- [ ] **Step 1: Create directories**

```bash
mkdir -p "public/icons/xp" "public/wallpapers"
```

- [ ] **Step 2: Discover available XP icon filenames**

```bash
curl -s "https://api.github.com/repos/bartekl1/windows-ui-assets/git/trees/main?recursive=1" \
  | grep -iE '"path":.*[Xx][Pp].*\.(png|ico)"' | head -60
```

Expected: a list of XP icon paths. Note the exact paths for My Computer, Recycle Bin, folder, generic document, generic application, Minesweeper, Solitaire, Control Panel, Search/Find, Help, Log Off, Turn Off, and the Start flag.

- [ ] **Step 3: Download the needed icons** (adjust the source paths to the real ones found in Step 2)

```bash
BASE="https://raw.githubusercontent.com/bartekl1/windows-ui-assets/main"
# Example pattern — replace <path> with verified paths from Step 2:
curl -fsSL "$BASE/<path-to>/My Computer.png"    -o "public/icons/xp/my-computer.png"
curl -fsSL "$BASE/<path-to>/Recycle Bin.png"     -o "public/icons/xp/recycle-bin.png"
curl -fsSL "$BASE/<path-to>/Folder.png"          -o "public/icons/xp/folder.png"
curl -fsSL "$BASE/<path-to>/Document.png"        -o "public/icons/xp/document.png"
curl -fsSL "$BASE/<path-to>/Application.png"      -o "public/icons/xp/application.png"
curl -fsSL "$BASE/<path-to>/Minesweeper.png"      -o "public/icons/xp/minesweeper.png"
curl -fsSL "$BASE/<path-to>/Solitaire.png"        -o "public/icons/xp/solitaire.png"
curl -fsSL "$BASE/<path-to>/Control Panel.png"    -o "public/icons/xp/control-panel.png"
curl -fsSL "$BASE/<path-to>/Search.png"           -o "public/icons/xp/search.png"
curl -fsSL "$BASE/<path-to>/Help.png"             -o "public/icons/xp/help.png"
curl -fsSL "$BASE/<path-to>/Log Off.png"          -o "public/icons/xp/log-off.png"
curl -fsSL "$BASE/<path-to>/Shut Down.png"        -o "public/icons/xp/turn-off.png"
curl -fsSL "$BASE/<path-to>/Start.png"            -o "public/icons/xp/start-flag.png"
curl -fsSL "$BASE/<path-to>/User.png"             -o "public/icons/xp/user.png"
```

For per-app icons that have no direct XP equivalent (about, experience, skills, resume, contact, agents), map to the closest system icon:
- about → `document.png`, experience → `application.png`, skills → `my-computer.png`,
- resume → `document.png`, contact → `application.png`, agents → `user.png`.
Copy them to app-named files so the registry can reference stable names:

```bash
cd public/icons/xp
cp document.png about.png; cp application.png experience.png; cp my-computer.png skills.png
cp document.png resume.png; cp application.png contact.png; cp user.png agents.png
cd -
```

- [ ] **Step 4: Download the Bliss wallpaper**

```bash
curl -fsSL "$BASE/<path-to>/Bliss.jpg" -o "public/wallpapers/bliss.jpg" \
  || curl -fsSL "https://raw.githubusercontent.com/bartekl1/windows-ui-assets/main/<verified-bliss-path>" -o "public/wallpapers/bliss.jpg"
```

- [ ] **Step 5: Verify assets are real images (non-empty, correct type)**

```bash
file public/icons/xp/*.png public/wallpapers/bliss.jpg
ls -l public/icons/xp public/wallpapers
```

Expected: each PNG reports "PNG image data", bliss reports "JPEG image data", all non-zero size. If any is HTML/empty, the URL was wrong — re-check Step 2.

- [ ] **Step 6: Commit**

```bash
git add public/icons/xp public/wallpapers
git commit -m "chore: add authentic Windows XP icons and Bliss wallpaper"
```

---

## Task 3: Games grouping + XP icon field in the registry

**Files:**
- Modify: `src/lib/appRegistry.ts`
- Modify: `src/lib/appRegistry.test.ts`
- Modify: `src/components/desktop/DesktopIcons.tsx:20`
- Modify: `src/components/desktop/DesktopIcon.tsx`
- Modify: `src/components/desktop/DesktopIcon.test.tsx`

- [ ] **Step 1: Write the failing registry test** — append to `src/lib/appRegistry.test.ts`

```ts
  it("marks Minesweeper and Solitaire as games", () => {
    const games = appRegistry.filter((a) => a.group === "games").map((a) => a.id);
    expect(games).toEqual(expect.arrayContaining(["minesweeper", "solitaire"]));
  });

  it("gives every visible app an XP icon", () => {
    for (const app of appRegistry.filter((a) => !a.hidden)) {
      expect(app.xpIconSrc && app.xpIconSrc.length).toBeGreaterThan(0);
    }
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/appRegistry.test.ts`
Expected: FAIL — `group`/`xpIconSrc` undefined.

- [ ] **Step 3: Update `AppDefinition` + entries** — `src/lib/appRegistry.ts`

Add two optional fields to the interface:

```ts
export interface AppDefinition {
  id: AppId;
  label: string;
  iconSrc: string;
  xpIconSrc?: string;
  group?: "games";
  defaultPosition: { x: number; y: number };
  defaultSize: { width: number; height: number };
  hidden?: boolean;
}
```

Add `xpIconSrc` to every entry and `group: "games"` to the two games. Full replacement array:

```ts
export const appRegistry: AppDefinition[] = [
  { id: "about", label: "About.txt", iconSrc: "/icons/about.png", xpIconSrc: "/icons/xp/about.png", defaultPosition: { x: 140, y: 90 }, defaultSize: { width: 360, height: 260 } },
  { id: "experience", label: "Experience", iconSrc: "/icons/experience.png", xpIconSrc: "/icons/xp/experience.png", defaultPosition: { x: 200, y: 120 }, defaultSize: { width: 480, height: 360 } },
  { id: "skills", label: "System Properties", iconSrc: "/icons/skills.png", xpIconSrc: "/icons/xp/skills.png", defaultPosition: { x: 260, y: 150 }, defaultSize: { width: 440, height: 380 } },
  { id: "resume", label: "Resume.pdf", iconSrc: "/icons/resume.png", xpIconSrc: "/icons/xp/resume.png", defaultPosition: { x: 320, y: 80 }, defaultSize: { width: 500, height: 620 } },
  { id: "contact", label: "Contact.exe", iconSrc: "/icons/contact.png", xpIconSrc: "/icons/xp/contact.png", defaultPosition: { x: 180, y: 200 }, defaultSize: { width: 420, height: 320 } },
  { id: "agents", label: "About Kavya", iconSrc: "/icons/agents.png", xpIconSrc: "/icons/xp/agents.png", defaultPosition: { x: 240, y: 60 }, defaultSize: { width: 400, height: 480 } },
  { id: "minesweeper", label: "Minesweeper", iconSrc: "/icons/minesweeper.svg", xpIconSrc: "/icons/xp/minesweeper.png", group: "games", defaultPosition: { x: 300, y: 100 }, defaultSize: { width: 250, height: 322 } },
  { id: "solitaire", label: "Solitaire", iconSrc: "/icons/solitaire.svg", xpIconSrc: "/icons/xp/solitaire.png", group: "games", defaultPosition: { x: 120, y: 60 }, defaultSize: { width: 480, height: 440 } },
  { id: "terminal", label: "MS-DOS Prompt", iconSrc: "/icons/terminal.svg", xpIconSrc: "/icons/terminal.svg", defaultPosition: { x: 160, y: 70 }, defaultSize: { width: 540, height: 380 }, hidden: true },
  { id: "settings", label: "Display Properties", iconSrc: "/icons/settings.svg", xpIconSrc: "/icons/xp/control-panel.png", defaultPosition: { x: 220, y: 90 }, defaultSize: { width: 400, height: 380 }, hidden: true },
  { id: "find", label: "Find: All Files", iconSrc: "/icons/find.svg", xpIconSrc: "/icons/xp/search.png", defaultPosition: { x: 260, y: 110 }, defaultSize: { width: 440, height: 320 }, hidden: true },
  { id: "help", label: "Help", iconSrc: "/icons/help.svg", xpIconSrc: "/icons/xp/help.png", defaultPosition: { x: 300, y: 130 }, defaultSize: { width: 420, height: 340 }, hidden: true },
];
```

- [ ] **Step 4: Run registry test**

Run: `npx vitest run src/lib/appRegistry.test.ts`
Expected: PASS.

- [ ] **Step 5: Write the failing DesktopIcon test** — replace body of `src/components/desktop/DesktopIcon.test.tsx` render helper to wrap in ThemeProvider, and add:

```tsx
import { ThemeProvider } from "@/hooks/useTheme";
// ...
  it("uses the XP icon when the theme is winxp", () => {
    localStorage.setItem("kk-theme", "winxp");
    render(
      <ThemeProvider>
        <DesktopIcon label="About" iconSrc="/icons/about.png" xpIconSrc="/icons/xp/about.png" isMobile={false} onOpen={() => {}} />
      </ThemeProvider>
    );
    const img = document.querySelector("img")!;
    expect(img.getAttribute("src")).toBe("/icons/xp/about.png");
    localStorage.clear();
  });
```

(Keep existing DesktopIcon tests; wrap their renders in `<ThemeProvider>` too.)

- [ ] **Step 6: Run to verify it fails**

Run: `npx vitest run src/components/desktop/DesktopIcon.test.tsx`
Expected: FAIL — `xpIconSrc` prop not accepted / src still `/icons/about.png`.

- [ ] **Step 7: Update `DesktopIcon.tsx`**

```tsx
"use client";

import { useTheme } from "@/hooks/useTheme";

interface DesktopIconProps {
  label: string;
  iconSrc: string;
  xpIconSrc?: string;
  isMobile: boolean;
  onOpen: () => void;
}

export default function DesktopIcon({ label, iconSrc, xpIconSrc, isMobile, onOpen }: DesktopIconProps) {
  const { theme } = useTheme();
  const size = isMobile ? 40 : 32;
  const src = theme === "winxp" ? xpIconSrc ?? iconSrc : iconSrc;
  return (
    <button
      className="desktop-icon"
      onDoubleClick={!isMobile ? onOpen : undefined}
      onClick={isMobile ? onOpen : undefined}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: isMobile ? 80 : 74, background: "transparent", border: "none", cursor: "pointer" }}
    >
      <img src={src} alt="" width={size} height={size} style={{ imageRendering: theme === "winxp" ? "auto" : "pixelated" }} />
      <span style={{ color: "#fff", fontSize: 11, textShadow: "1px 1px 2px #000", textAlign: "center", lineHeight: 1.3 }}>{label}</span>
    </button>
  );
}
```

- [ ] **Step 8: Pass `xpIconSrc` + exclude games** — `src/components/desktop/DesktopIcons.tsx`

Replace the map (line 20-22):

```tsx
      {appRegistry.filter((app) => !app.hidden && app.group !== "games").map((app) => (
        <DesktopIcon key={app.id} label={app.label} iconSrc={app.iconSrc} xpIconSrc={app.xpIconSrc} isMobile={isMobile} onOpen={() => onOpen(app.id)} />
      ))}
```

- [ ] **Step 9: Run tests**

Run: `npx vitest run src/components/desktop/DesktopIcon.test.tsx src/lib/appRegistry.test.ts`
Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add src/lib/appRegistry.ts src/lib/appRegistry.test.ts src/components/desktop/DesktopIcons.tsx src/components/desktop/DesktopIcon.tsx src/components/desktop/DesktopIcon.test.tsx
git commit -m "feat: add games group + XP icon field, keep games off the desktop"
```

---

## Task 4: Settings dialog live theme toggle

**Files:**
- Modify: `src/components/desktop/apps/SettingsApp.tsx`
- Modify: `src/components/desktop/apps/SettingsApp.test.tsx`

- [ ] **Step 1: Write the failing test** — replace `SettingsApp.test.tsx`

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, useTheme } from "@/hooks/useTheme";
import SettingsApp from "./SettingsApp";

function ThemeReadout() {
  const { theme } = useTheme();
  return <span data-testid="active-theme">{theme}</span>;
}

describe("SettingsApp", () => {
  beforeEach(() => localStorage.clear());

  it("enables both theme radios (no coming soon)", () => {
    render(<ThemeProvider><SettingsApp /></ThemeProvider>);
    const xp = screen.getByLabelText(/Windows XP/i) as HTMLInputElement;
    expect(xp.disabled).toBe(false);
    expect(screen.queryByText(/coming soon/i)).toBeNull();
  });

  it("switches the theme live when XP is chosen", () => {
    render(<ThemeProvider><SettingsApp /><ThemeReadout /></ThemeProvider>);
    fireEvent.click(screen.getByLabelText(/Windows XP/i));
    expect(screen.getByTestId("active-theme").textContent).toBe("winxp");
    expect(localStorage.getItem("kk-theme")).toBe("winxp");
  });

  it("calls onClose from OK", () => {
    const onClose = vi.fn();
    render(<ThemeProvider><SettingsApp onClose={onClose} /></ThemeProvider>);
    fireEvent.click(screen.getByText("OK"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/components/desktop/apps/SettingsApp.test.tsx`
Expected: FAIL — XP radio is disabled / no live switch.

- [ ] **Step 3: Rewrite `SettingsApp.tsx`**

```tsx
"use client";

import { useTheme } from "@/hooks/useTheme";

export default function SettingsApp({ onClose }: { onClose?: () => void }) {
  const { theme, setTheme } = useTheme();

  return (
    <div style={{ padding: 12, fontSize: 12, color: "#000", display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box" }}>
      <fieldset style={{ padding: 10 }}>
        <legend>Appearance</legend>

        <div style={{ background: theme === "winxp" ? "#5a8bd6" : "#008080", border: "2px solid", borderColor: "#808080 #fff #fff #808080", height: 90, marginBottom: 10, display: "flex", alignItems: "flex-end" }}>
          <div style={{ background: "#c0c0c0", border: "2px solid", borderColor: "#fff #000 #000 #fff", margin: 8, padding: "3px 10px", fontSize: 11 }}>
            Inactive Window
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <span style={{ width: 60 }}>Scheme:</span>
          <span>{theme === "winxp" ? "Windows XP (Luna)" : "Windows Standard"}</span>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <input type="radio" name="theme" checked={theme === "win98"} onChange={() => setTheme("win98")} />
          Windows 98
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input type="radio" name="theme" checked={theme === "winxp"} onChange={() => setTheme("winxp")} />
          Windows XP
        </label>
      </fieldset>

      <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end", gap: 6, paddingTop: 10 }}>
        <button type="button" onClick={onClose} style={{ minWidth: 75 }}>OK</button>
        <button type="button" onClick={onClose} style={{ minWidth: 75 }}>Cancel</button>
      </div>
    </div>
  );
}
```

Note: the `<label>` wraps the text so `getByLabelText(/Windows XP/i)` resolves the radio.

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/components/desktop/apps/SettingsApp.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/desktop/apps/SettingsApp.tsx src/components/desktop/apps/SettingsApp.test.tsx
git commit -m "feat: make Settings switch between Windows 98 and XP live"
```

---

## Task 5: XP window chrome (xp.css)

**Files:**
- Create: `src/app/xp.css`
- Modify: `src/app/globals.css:4`

This task is visual; it is verified by browser QA in Task 9, not a unit test. Use the values below as the starting point.

- [ ] **Step 1: Create `src/app/xp.css`**

```css
[data-theme="winxp"] {
  font-family: Tahoma, "Segoe UI", Verdana, sans-serif;
}

[data-theme="winxp"] .window {
  border: 1px solid #0831d9;
  border-top: none;
  border-radius: 8px 8px 0 0;
  background: #ece9d8;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.45);
  box-sizing: border-box;
}

[data-theme="winxp"] .title-bar {
  height: 28px;
  padding: 0 5px 0 6px;
  border-radius: 7px 7px 0 0;
  color: #fff;
  font-weight: bold;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.4);
  background: linear-gradient(180deg, #0997ff 0%, #0053ee 8%, #0050ee 40%, #0060ff 45%, #0050ee 52%, #003bd4 88%, #0836c4 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

[data-theme="winxp"] .title-bar.inactive,
[data-theme="winxp"] .window:not(:focus-within) .title-bar {
  background: linear-gradient(180deg, #7ba2e7 0%, #6d8fd8 50%, #5f83d4 100%);
}

[data-theme="winxp"] .title-bar-controls {
  display: flex;
  gap: 2px;
}

[data-theme="winxp"] .title-bar-controls button {
  width: 21px;
  height: 21px;
  min-width: 21px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 3px;
  box-shadow: none;
  background-image: none;
  position: relative;
}

[data-theme="winxp"] .title-bar-controls button[aria-label="Minimize"],
[data-theme="winxp"] .title-bar-controls button[aria-label="Maximize"],
[data-theme="winxp"] .title-bar-controls button[aria-label="Restore"] {
  background: radial-gradient(circle at 40% 30%, #7db2ff, #245edb);
}

[data-theme="winxp"] .title-bar-controls button[aria-label="Close"] {
  background: radial-gradient(circle at 40% 30%, #ff8a7a, #d13020);
}

[data-theme="winxp"] .window-body {
  background: #ece9d8;
}

[data-theme="winxp"] button {
  border-radius: 3px;
  border: 1px solid #003c74;
  box-shadow: none;
  background: linear-gradient(180deg, #fdfdfd, #d6e5f5 90%, #c3d8ef);
  padding: 3px 10px;
}

[data-theme="winxp"] button:active {
  background: linear-gradient(180deg, #c3d8ef, #d6e5f5);
}

[data-theme="winxp"] input,
[data-theme="winxp"] select,
[data-theme="winxp"] textarea {
  border: 1px solid #7f9db9;
  box-shadow: none;
  border-radius: 0;
}

[data-theme="winxp"] ::-webkit-scrollbar {
  width: 16px;
  height: 16px;
}
[data-theme="winxp"] ::-webkit-scrollbar-track {
  background: #d4e0f0;
}
[data-theme="winxp"] ::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, #4b8ff0, #2f6fd6);
  border: 1px solid #2158c8;
  border-radius: 2px;
}
```

- [ ] **Step 2: Import it** — `src/app/globals.css`, after line 4 (`@import "98.css";`)

```css
@import "98.css";
@import "./xp.css";
```

- [ ] **Step 3: Verify build compiles**

Run: `npm run build`
Expected: build succeeds (CSS parsed, no errors).

- [ ] **Step 4: Commit**

```bash
git add src/app/xp.css src/app/globals.css
git commit -m "feat: add scoped Windows XP Luna window chrome"
```

---

## Task 6: XP taskbar + green start button

**Files:**
- Modify: `src/components/desktop/Taskbar.tsx`
- Modify: `src/components/desktop/Taskbar.test.tsx`

- [ ] **Step 1: Write the failing test** — add to `Taskbar.test.tsx` (wrap existing renders in `<ThemeProvider>` and import it)

```tsx
import { ThemeProvider } from "@/hooks/useTheme";
// ...
  it("shows the green italic 'start' button in XP theme", () => {
    localStorage.setItem("kk-theme", "winxp");
    render(
      <ThemeProvider>
        <Taskbar isMobile={false} windows={{}} onSelectApp={() => {}} onShutDown={() => {}} />
      </ThemeProvider>
    );
    expect(screen.getByRole("button", { name: /start/i }).textContent?.toLowerCase()).toContain("start");
    localStorage.clear();
  });
```

- [ ] **Step 2: Run to verify it fails / regressions**

Run: `npx vitest run src/components/desktop/Taskbar.test.tsx`
Expected: existing tests may need the ThemeProvider wrapper; the new test should pass once the branch exists. First confirm the current state fails or errors on the new assertion.

- [ ] **Step 3: Implement the theme branch** — `src/components/desktop/Taskbar.tsx`

Add imports + hook:

```tsx
import { useTheme } from "@/hooks/useTheme";
```

Inside the component, after `const [time, setTime] = useState("");`:

```tsx
  const { theme } = useTheme();
  const xp = theme === "winxp";
```

Replace the outer taskbar `<div>` style `background`, `borderTop`, and `height` with theme-aware values:

```tsx
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: xp ? 34 : 30,
        background: xp
          ? "linear-gradient(180deg,#3f8cf3 0%,#2265e0 8%,#245edb 42%,#2158d4 90%,#1c50c8 100%)"
          : "#c0c0c0",
        borderTop: xp ? "1px solid #1042c4" : "2px solid #fff",
        display: "flex",
        alignItems: "center",
        padding: "0 4px",
        gap: 4,
        zIndex: 300,
      }}
```

Replace the Start `<button>` with a theme branch:

```tsx
      <button
        onClick={() => setStartOpen((v) => !v)}
        style={
          xp
            ? { display: "flex", alignItems: "center", gap: 6, height: 34, padding: "0 22px 3px 12px", marginRight: 8, fontStyle: "italic", fontWeight: "bold", fontSize: 15, color: "#fff", textShadow: "1px 1px 2px rgba(0,0,0,.5)", border: "none", borderRadius: "0 12px 12px 0", boxShadow: "inset 0 1px 0 rgba(255,255,255,.4)", background: "linear-gradient(180deg,#59b158 0%,#39923a 46%,#2e8b2e 52%,#0f6d0f 100%)" }
            : { display: "flex", alignItems: "center", gap: 4, fontWeight: "bold", fontSize: 11, color: "#000", height: 22, padding: "0 8px" }
        }
      >
        <img src={xp ? "/icons/xp/start-flag.png" : "/icons/start.png"} alt="" width={xp ? 18 : 16} height={xp ? 18 : 16} style={{ imageRendering: xp ? "auto" : "pixelated" }} /> {xp ? "start" : "Start"}
      </button>
```

For the open-app task buttons, add an XP style branch (blue Luna buttons). Replace the task button `style` with:

```tsx
          style={
            xp
              ? { fontSize: 11, color: "#fff", height: 24, padding: "0 10px", minWidth: 100, textAlign: "left", display: "flex", alignItems: "center", gap: 6, border: "1px solid #1b52c8", borderRadius: 3, background: "linear-gradient(180deg,#4993f0,#2360d8)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.3)" }
              : { fontSize: 11, color: "#000", height: 22, padding: "0 10px", minWidth: 100, textAlign: "left", display: "flex", alignItems: "center", gap: 6 }
          }
```

And make each open-app icon use the XP variant: `src={xp ? app.xpIconSrc ?? app.iconSrc : app.iconSrc}`.

The clock container: add `color: xp ? "#fff" : "#000"` and drop the raised border when `xp` (`border: xp ? "none" : "1px solid"`).

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/components/desktop/Taskbar.test.tsx`
Expected: PASS (existing wrapped tests + new XP test).

- [ ] **Step 5: Commit**

```bash
git add src/components/desktop/Taskbar.tsx src/components/desktop/Taskbar.test.tsx
git commit -m "feat: XP taskbar with glossy green start button"
```

---

## Task 7: XP two-column Start menu + Games flyout

**Files:**
- Modify: `src/components/desktop/StartMenu.tsx`
- Create: `src/components/desktop/StartMenu.test.tsx`

Design: keep the existing `MenuItem`, `Separator`, `Panel` helpers. Compute the app groups once. The 98 menu gains a **Games ▸** sub-flyout; the XP menu is a distinct two-column layout that reuses `MenuItem`.

- [ ] **Step 1: Write the failing test** — `src/components/desktop/StartMenu.test.tsx`

```tsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "@/hooks/useTheme";
import StartMenu from "./StartMenu";

function renderMenu() {
  return render(
    <ThemeProvider>
      <StartMenu isMobile={false} onSelect={vi.fn()} onShutDown={vi.fn()} onClose={vi.fn()} />
    </ThemeProvider>
  );
}

describe("StartMenu", () => {
  beforeEach(() => localStorage.clear());

  it("keeps Minesweeper out of the top-level Programs list (98)", () => {
    renderMenu();
    fireEvent.mouseEnter(screen.getByText("Programs"));
    // top-level Programs flyout shows a Games entry, not the games directly
    expect(screen.getByText("Games")).toBeTruthy();
    expect(screen.queryByText("Minesweeper")).toBeNull();
  });

  it("reveals the games under the Games flyout (98)", () => {
    renderMenu();
    fireEvent.mouseEnter(screen.getByText("Programs"));
    fireEvent.mouseEnter(screen.getByText("Games"));
    expect(screen.getByText("Minesweeper")).toBeTruthy();
    expect(screen.getByText("Solitaire")).toBeTruthy();
  });

  it("renders the XP two-column layout with Log Off / Turn Off", () => {
    localStorage.setItem("kk-theme", "winxp");
    renderMenu();
    expect(screen.getByText(/Kavya Kathuria/i)).toBeTruthy();
    expect(screen.getByText(/Log Off/i)).toBeTruthy();
    expect(screen.getByText(/Turn Off/i)).toBeTruthy();
    expect(screen.getByText(/All Programs/i)).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/components/desktop/StartMenu.test.tsx`
Expected: FAIL — no Games flyout / no XP layout.

- [ ] **Step 3: Add shared group helpers + theme branch** — near the top of `StartMenu`'s body (after `const pick = ...`)

```tsx
  const { theme } = useTheme();
  const [gamesOpen, setGamesOpen] = useState(false);
  const [allProgramsOpen, setAllProgramsOpen] = useState(false);

  const programApps = appRegistry.filter((a) => !a.hidden && a.group !== "games");
  const gameApps = appRegistry.filter((a) => a.group === "games");
```

Add the import:

```tsx
import { useTheme } from "@/hooks/useTheme";
```

- [ ] **Step 4: 98 Programs flyout — nest Games** — replace the desktop Programs `Panel` block (currently lines 144-150) with:

```tsx
          {programsOpen && (
            <Panel style={{ position: "absolute", left: "100%", top: 2, minWidth: 180, padding: "2px 0" }}>
              {programApps.map((app) => (
                <MenuItem key={app.id} iconSrc={app.iconSrc} label={app.label} onClick={() => pick(app.id)} onMouseEnter={() => setGamesOpen(false)} />
              ))}
              <div style={{ position: "relative" }}>
                <MenuItem icon="🎮" label="Games" arrow onClick={() => setGamesOpen((v) => !v)} onMouseEnter={() => setGamesOpen(true)} />
                {gamesOpen && (
                  <Panel style={{ position: "absolute", left: "100%", top: 0, minWidth: 150, padding: "2px 0" }}>
                    {gameApps.map((g) => (
                      <MenuItem key={g.id} iconSrc={g.iconSrc} label={g.label} onClick={() => pick(g.id)} />
                    ))}
                  </Panel>
                )}
              </div>
            </Panel>
          )}
```

Do the same nesting in the **mobile** branch (lines 98-100): render `programApps` then a "Games" header followed by `gameApps`.

- [ ] **Step 5: Add the XP menu** — at the start of the desktop `return` (before the existing 98 markup), branch:

```tsx
  if (!isMobile && theme === "winxp") {
    const XpItem = ({ app }: { app: (typeof appRegistry)[number] }) => (
      <button
        role="menuitem"
        onClick={() => pick(app.id)}
        style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", border: "none", background: "transparent", padding: "5px 10px", fontSize: 12, color: "#00157f", cursor: "pointer" }}
      >
        <img src={app.xpIconSrc ?? app.iconSrc} alt="" width={22} height={22} />
        {app.label}
      </button>
    );
    const rightIds: AppId[] = ["resume", "contact", "settings", "find", "help"];
    const rightApps = rightIds.map((id) => appRegistry.find((a) => a.id === id)!).filter(Boolean);
    const pinned = programApps.filter((a) => ["agents", "experience", "about"].includes(a.id));

    return (
      <div role="menu" style={{ position: "absolute", bottom: 34, left: 0, width: 300, zIndex: 200, borderRadius: "8px 8px 0 0", overflow: "hidden", boxShadow: "3px -3px 14px rgba(0,0,0,.5)", fontFamily: "Tahoma, sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", color: "#fff", fontWeight: "bold", fontSize: 14, background: "linear-gradient(180deg,#1b52c8,#2f6fd6)", borderBottom: "2px solid #eec14a" }}>
          <img src="/icons/xp/user.png" alt="" width={30} height={30} style={{ borderRadius: 4, border: "1px solid #fff" }} />
          Kavya Kathuria
        </div>
        <div style={{ display: "flex", background: "#fff" }}>
          <div style={{ width: 178, padding: "6px 0", background: "#fff" }}>
            {pinned.map((a) => <XpItem key={a.id} app={a} />)}
            <Separator />
            <div style={{ position: "relative" }}>
              <button role="menuitem" onClick={() => setAllProgramsOpen((v) => !v)} onMouseEnter={() => setAllProgramsOpen(true)} style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", border: "none", background: "transparent", padding: "5px 10px", fontSize: 12, fontWeight: "bold", color: "#00157f", cursor: "pointer" }}>
                All Programs <span style={{ marginLeft: "auto" }}>▸</span>
              </button>
              {allProgramsOpen && (
                <Panel style={{ position: "absolute", left: "100%", bottom: 0, minWidth: 170, padding: "2px 0" }}>
                  {programApps.map((app) => (
                    <MenuItem key={app.id} iconSrc={app.xpIconSrc ?? app.iconSrc} label={app.label} onClick={() => pick(app.id)} onMouseEnter={() => setGamesOpen(false)} />
                  ))}
                  <div style={{ position: "relative" }}>
                    <MenuItem icon="🎮" label="Games" arrow onClick={() => setGamesOpen((v) => !v)} onMouseEnter={() => setGamesOpen(true)} />
                    {gamesOpen && (
                      <Panel style={{ position: "absolute", left: "100%", top: 0, minWidth: 150, padding: "2px 0" }}>
                        {gameApps.map((g) => <MenuItem key={g.id} iconSrc={g.xpIconSrc ?? g.iconSrc} label={g.label} onClick={() => pick(g.id)} />)}
                      </Panel>
                    )}
                  </div>
                </Panel>
              )}
            </div>
          </div>
          <div style={{ width: 122, padding: "6px 0", background: "linear-gradient(180deg,#d3e5fa,#b6d5f5)" }}>
            {rightApps.map((a) => <XpItem key={a.id} app={a} />)}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 14, padding: "6px 12px", color: "#fff", fontSize: 12, background: "linear-gradient(180deg,#2f6fd6,#1b52c8)" }}>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer" }}>⏻ Log Off</button>
          <button onClick={() => { onClose(); onShutDown(); }} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer" }}>⭘ Turn Off</button>
        </div>
      </div>
    );
  }
```

(The XP mobile menu reuses the existing mobile branch — acceptable for v1; a full XP mobile skin is out of scope per the spec.)

- [ ] **Step 6: Run tests**

Run: `npx vitest run src/components/desktop/StartMenu.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 7: Run the full suite to catch regressions**

Run: `npx vitest run`
Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add src/components/desktop/StartMenu.tsx src/components/desktop/StartMenu.test.tsx
git commit -m "feat: XP two-column Start menu and Games flyout in both themes"
```

---

## Task 8: Themed boot + shutdown

**Files:**
- Modify: `src/components/desktop/BootSequence.tsx`
- Modify: `src/components/desktop/ShutdownSequence.tsx`

- [ ] **Step 1: XP boot branch** — `src/components/desktop/BootSequence.tsx`

Add `import { useTheme } from "@/hooks/useTheme";` and read `const { theme } = useTheme();`. When `theme === "winxp"`, render the XP boot instead of the 98 markup:

```tsx
  if (theme === "winxp") {
    return (
      <div role="button" aria-label="Skip boot sequence" onClick={onComplete} style={{ position: "fixed", inset: 0, background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 1000, fontFamily: "Tahoma, sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
          <img src="/icons/xp/start-flag.png" alt="" width={44} height={44} />
          <div style={{ color: "#fff" }}>
            <div style={{ fontSize: 14 }}>Microsoft<sup>®</sup></div>
            <div style={{ fontSize: 40, fontWeight: 700 }}>Windows<span style={{ color: "#ff7a00" }}>xp</span></div>
          </div>
        </div>
        <div style={{ width: 180, height: 14, border: "1px solid #444", borderRadius: 4, overflow: "hidden", position: "relative", background: "#111" }}>
          <div style={{ position: "absolute", top: 0, bottom: 0, width: 60, display: "flex", gap: 4, animation: "boot-bar 1.6s linear infinite" }}>
            <div style={{ flex: 1, background: "#3b7dff", borderRadius: 2 }} />
            <div style={{ flex: 1, background: "#3b7dff", borderRadius: 2 }} />
            <div style={{ flex: 1, background: "#3b7dff", borderRadius: 2 }} />
          </div>
        </div>
        <div style={{ marginTop: 40, color: "#8a8a8a", fontSize: 12 }}>click anywhere to skip</div>
      </div>
    );
  }
```

Keep the existing 98 markup below as the default return.

- [ ] **Step 2: XP shutdown branch** — `src/components/desktop/ShutdownSequence.tsx`

Add the theme hook. When `theme === "winxp"` and not yet `safeToTurnOff`, render a centered blue "Windows is shutting down…" screen:

```tsx
  if (theme === "winxp" && !safeToTurnOff) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "linear-gradient(180deg,#5a7edc,#2b4a9b)", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 1000, fontFamily: "Tahoma, sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 22 }}>
          <img src="/icons/xp/start-flag.png" alt="" width={32} height={32} /> Windows<span style={{ color: "#ff7a00" }}>xp</span>
        </div>
        <div style={{ marginTop: 20, fontSize: 15 }}>Windows is shutting down…</div>
      </div>
    );
  }
```

Keep the existing "safe to turn off" and 98 line-by-line screens.

- [ ] **Step 3: Verify build + full suite**

Run: `npx tsc --noEmit && npx vitest run && npm run build`
Expected: tsc clean, all tests pass, build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/desktop/BootSequence.tsx src/components/desktop/ShutdownSequence.tsx
git commit -m "feat: themed XP boot and shutdown screens"
```

---

## Task 9: Full QA in both themes

**Files:** none (verification only).

- [ ] **Step 1: Start the dev server**

Run: `npm run dev` (already may be running on :3000/:3002).

- [ ] **Step 2: Browser QA — Windows 98 (default)**

Boot → 98 look intact. Desktop shows no Minesweeper/Solitaire icons. Start → Programs → Games ▸ reveals both games; opening one works. Everything else unchanged.

- [ ] **Step 3: Switch to XP**

Start → Settings (Display Properties) → select **Windows XP** → desktop repaints live: Bliss wallpaper, blue taskbar + green start button, Luna window chrome (rounded blue title bars, glass buttons). Open a window — chrome is XP. Start menu is the two-column XP layout with the user header, All Programs ▸ (with Games ▸), right utility column, and Log Off / Turn Off. XP desktop icons use the authentic XP art.

- [ ] **Step 4: Persistence + boot/shutdown**

Reload the page → still XP → boot screen shows the XP boot. Start → Turn Off → XP shutdown screen. Power back on → XP. Switch back to 98 in Settings → reload → 98 boot returns.

- [ ] **Step 5: Report** any visual issues; tune the `xp.css` / inline gradients from Tasks 5–7 as needed, re-running `npm run build` after CSS edits.

- [ ] **Step 6: Final commit (if QA tuning changed files)**

```bash
git add -A -- src/ public/
git commit -m "fix: XP theme visual polish from QA"
```

---

## Self-Review Notes

- **Spec coverage:** theme infra (T1), assets (T2), games grouping + xp icons (T3), Settings toggle (T4), window chrome (T5), taskbar (T6), Start menu + games flyout (T7), boot/shutdown (T8), QA both themes (T9). All spec sections mapped.
- **Type consistency:** `Theme = "win98" | "winxp"`, `useTheme() → { theme, setTheme }`, registry fields `group?: "games"` and `xpIconSrc?: string`, `localStorage` key `kk-theme` — used identically across all tasks.
- **Known judgment calls:** XP mobile Start menu reuses the 98-style full-screen list (full XP mobile skin is out of scope); per-app XP icons map to nearest system icons where XP has no direct equivalent; CSS gradient values are starting points to be tuned during T9 QA.
