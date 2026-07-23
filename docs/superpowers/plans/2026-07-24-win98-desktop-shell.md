# Windows 98 Desktop Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current scroll-snap portfolio page with a Windows 98 desktop simulation — boot sequence, draggable windows, taskbar/Start menu, and five working content windows (About, Experience, Skills, Resume, Contact) — that stands on its own as a complete, deployable portfolio site.

**Architecture:** A single `Desktop` component owns all window state via a `useWindowManager` hook (open/closed/minimized/position/z-index per app, keyed by a shared `AppId` registry). Generic `Window` chrome renders whatever app content is passed as children. A `useIsMobile` hook switches icons/windows/taskbar/Start-menu between desktop (draggable, cascading) and mobile (full-screen, no drag) presentation. This plan does **not** include the Agent Showcase or the games — those are separate plans that extend the same `appRegistry`.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS (existing), `98.css` (new, self-hosted npm dependency for Win98 chrome), Vitest + React Testing Library (new, for logic/interaction tests).

## Global Constraints

- No window resizing in this plan — every window uses a fixed size from `appRegistry`.
- Single instance per app — opening an already-open app focuses it rather than creating a duplicate window.
- No state persistence across page reloads — a refresh always restarts at the boot sequence.
- `98.css` must be installed as an npm dependency and imported locally — never loaded from a CDN `<link>` in production (avoids an external runtime dependency).
- All window/taskbar/desktop text must have an explicitly set color (never rely on inherited/ambient text color) — a real readability bug surfaced during design mockups when Win98 chrome inherited a dark-theme text color.
- Boot sequence must be skippable by a single click/tap anywhere on it.
- Testing approach is pragmatic, not strict TDD-everywhere: real unit/interaction tests for state logic and anything with a right/wrong answer (window manager, mobile detection, tab/folder-selection interactions, data integrity, link correctness); a single holistic manual QA pass (desktop + mobile viewport) covers pure visual/aesthetic judgment instead of forced component snapshot tests.
- This plan produces a complete, deployable replacement for the current site on its own — it does not depend on the Agent Showcase or Games plans.

---

### Task 1: Set up Vitest testing infrastructure

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `npm test` runs Vitest once (CI-style); test files use `.test.ts`/`.test.tsx` suffix and the `@/*` import alias.

- [ ] **Step 1: Install test dependencies**

Run: `npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event`

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 3: Create `vitest.setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4: Add a `test` script to `package.json`**

In the `"scripts"` block of `package.json`, add:

```json
"test": "vitest run"
```

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts vitest.setup.ts package.json package-lock.json
git commit -m "chore: set up Vitest testing infrastructure"
```

---

### Task 2: App registry

**Files:**
- Create: `src/lib/appRegistry.ts`
- Test: `src/lib/appRegistry.test.ts`

**Interfaces:**
- Produces: `AppId` type (`"about" | "experience" | "skills" | "resume" | "contact"`), `AppDefinition` interface (`id: AppId; label: string; icon: string; defaultPosition: {x:number;y:number}; defaultSize: {width:number;height:number}`), `appRegistry: AppDefinition[]`. Later plans (Agent Showcase, Games) extend `AppId` and append to `appRegistry` — every other task in this plan imports from here.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/appRegistry.test.ts
import { describe, it, expect } from "vitest";
import { appRegistry } from "./appRegistry";

describe("appRegistry", () => {
  it("has a unique id for every app", () => {
    const ids = appRegistry.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every app a non-empty label and icon", () => {
    for (const app of appRegistry) {
      expect(app.label.length).toBeGreaterThan(0);
      expect(app.icon.length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- appRegistry`
Expected: FAIL — `Cannot find module './appRegistry'`

- [ ] **Step 3: Create `src/lib/appRegistry.ts`**

```ts
export type AppId = "about" | "experience" | "skills" | "resume" | "contact";

export interface AppDefinition {
  id: AppId;
  label: string;
  icon: string;
  defaultPosition: { x: number; y: number };
  defaultSize: { width: number; height: number };
}

export const appRegistry: AppDefinition[] = [
  { id: "about", label: "About.txt", icon: "📄", defaultPosition: { x: 140, y: 90 }, defaultSize: { width: 360, height: 260 } },
  { id: "experience", label: "Experience", icon: "📁", defaultPosition: { x: 200, y: 120 }, defaultSize: { width: 480, height: 360 } },
  { id: "skills", label: "System Properties", icon: "🖥️", defaultPosition: { x: 260, y: 150 }, defaultSize: { width: 440, height: 380 } },
  { id: "resume", label: "Resume.pdf", icon: "📕", defaultPosition: { x: 320, y: 80 }, defaultSize: { width: 500, height: 620 } },
  { id: "contact", label: "Contact.exe", icon: "✉️", defaultPosition: { x: 180, y: 200 }, defaultSize: { width: 420, height: 320 } },
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- appRegistry`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/appRegistry.ts src/lib/appRegistry.test.ts
git commit -m "feat: add desktop app registry"
```

---

### Task 3: `useWindowManager` hook

**Files:**
- Create: `src/hooks/useWindowManager.ts`
- Test: `src/hooks/useWindowManager.test.ts`

**Interfaces:**
- Consumes: `AppId` from `@/lib/appRegistry` (Task 2)
- Produces: `WindowState` interface (`open: boolean; minimized: boolean; zIndex: number; position: {x:number;y:number}`), `useWindowManager()` hook returning `{ windows: Record<string, WindowState>; openWindow(id: AppId, defaults: {x:number;y:number}): void; closeWindow(id: AppId): void; minimizeWindow(id: AppId): void; focusWindow(id: AppId): void; moveWindow(id: AppId, position: {x:number;y:number}): void }`. `Desktop.tsx` (Task 15), `Window.tsx` (Task 5), and `Taskbar.tsx` (Task 7) all consume this.

- [ ] **Step 1: Write the failing tests**

```ts
// src/hooks/useWindowManager.test.ts
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWindowManager } from "./useWindowManager";

describe("useWindowManager", () => {
  it("opens a window with the given default position", () => {
    const { result } = renderHook(() => useWindowManager());
    act(() => result.current.openWindow("about", { x: 10, y: 20 }));
    expect(result.current.windows.about.open).toBe(true);
    expect(result.current.windows.about.position).toEqual({ x: 10, y: 20 });
  });

  it("raises z-index above all other open windows when focused", () => {
    const { result } = renderHook(() => useWindowManager());
    act(() => result.current.openWindow("about", { x: 0, y: 0 }));
    act(() => result.current.openWindow("skills", { x: 0, y: 0 }));
    const skillsZ = result.current.windows.skills.zIndex;
    act(() => result.current.focusWindow("about"));
    expect(result.current.windows.about.zIndex).toBeGreaterThan(skillsZ);
  });

  it("re-opening an already-open window focuses it instead of resetting its position", () => {
    const { result } = renderHook(() => useWindowManager());
    act(() => result.current.openWindow("about", { x: 10, y: 20 }));
    act(() => result.current.moveWindow("about", { x: 99, y: 99 }));
    act(() => result.current.openWindow("about", { x: 10, y: 20 }));
    expect(result.current.windows.about.position).toEqual({ x: 99, y: 99 });
  });

  it("minimizing hides the window without closing it", () => {
    const { result } = renderHook(() => useWindowManager());
    act(() => result.current.openWindow("about", { x: 0, y: 0 }));
    act(() => result.current.minimizeWindow("about"));
    expect(result.current.windows.about.open).toBe(true);
    expect(result.current.windows.about.minimized).toBe(true);
  });

  it("closing sets open to false", () => {
    const { result } = renderHook(() => useWindowManager());
    act(() => result.current.openWindow("about", { x: 0, y: 0 }));
    act(() => result.current.closeWindow("about"));
    expect(result.current.windows.about.open).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- useWindowManager`
Expected: FAIL — `Cannot find module './useWindowManager'`

- [ ] **Step 3: Create `src/hooks/useWindowManager.ts`**

```ts
import { useCallback, useState } from "react";
import type { AppId } from "@/lib/appRegistry";

export interface WindowState {
  open: boolean;
  minimized: boolean;
  zIndex: number;
  position: { x: number; y: number };
}

export interface WindowManager {
  windows: Record<string, WindowState>;
  openWindow: (id: AppId, defaults: { x: number; y: number }) => void;
  closeWindow: (id: AppId) => void;
  minimizeWindow: (id: AppId) => void;
  focusWindow: (id: AppId) => void;
  moveWindow: (id: AppId, position: { x: number; y: number }) => void;
}

const EMPTY_STATE: WindowState = { open: false, minimized: false, zIndex: 0, position: { x: 0, y: 0 } };

export function useWindowManager(): WindowManager {
  const [windows, setWindows] = useState<Record<string, WindowState>>({});
  const [topZ, setTopZ] = useState(1);

  const openWindow = useCallback(
    (id: AppId, defaults: { x: number; y: number }) => {
      const nextZ = topZ + 1;
      setWindows((prev) => {
        const existing = prev[id];
        if (existing && existing.open) {
          return { ...prev, [id]: { ...existing, minimized: false, zIndex: nextZ } };
        }
        return { ...prev, [id]: { open: true, minimized: false, zIndex: nextZ, position: existing?.position ?? defaults } };
      });
      setTopZ(nextZ);
    },
    [topZ]
  );

  const closeWindow = useCallback((id: AppId) => {
    setWindows((prev) => ({ ...prev, [id]: { ...(prev[id] ?? EMPTY_STATE), open: false } }));
  }, []);

  const minimizeWindow = useCallback((id: AppId) => {
    setWindows((prev) => ({ ...prev, [id]: { ...(prev[id] ?? EMPTY_STATE), minimized: true } }));
  }, []);

  const focusWindow = useCallback(
    (id: AppId) => {
      const nextZ = topZ + 1;
      setWindows((prev) => ({ ...prev, [id]: { ...(prev[id] ?? EMPTY_STATE), minimized: false, zIndex: nextZ } }));
      setTopZ(nextZ);
    },
    [topZ]
  );

  const moveWindow = useCallback((id: AppId, position: { x: number; y: number }) => {
    setWindows((prev) => ({ ...prev, [id]: { ...(prev[id] ?? EMPTY_STATE), position } }));
  }, []);

  return { windows, openWindow, closeWindow, minimizeWindow, focusWindow, moveWindow };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- useWindowManager`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useWindowManager.ts src/hooks/useWindowManager.test.ts
git commit -m "feat: add useWindowManager hook"
```

---

### Task 4: `useIsMobile` hook

**Files:**
- Create: `src/hooks/useIsMobile.ts`
- Test: `src/hooks/useIsMobile.test.ts`

**Interfaces:**
- Produces: `useIsMobile(): boolean` — `true` when viewport matches `(max-width: 767px)`. Consumed by `Window.tsx` (Task 5), `DesktopIcons.tsx` (Task 6), `Taskbar.tsx`/`StartMenu.tsx` (Task 7), and `Desktop.tsx` (Task 15).

- [ ] **Step 1: Write the failing tests**

```ts
// src/hooks/useIsMobile.test.ts
import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useIsMobile } from "./useIsMobile";

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

describe("useIsMobile", () => {
  it("returns true when the viewport matches the mobile query", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("returns false when the viewport does not match the mobile query", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- useIsMobile`
Expected: FAIL — `Cannot find module './useIsMobile'`

- [ ] **Step 3: Create `src/hooks/useIsMobile.ts`**

```ts
import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT_QUERY = "(max-width: 767px)";

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_BREAKPOINT_QUERY);
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return isMobile;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- useIsMobile`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useIsMobile.ts src/hooks/useIsMobile.test.ts
git commit -m "feat: add useIsMobile hook"
```

---

### Task 5: `Window` component (chrome, drag, 98.css wiring)

**Files:**
- Create: `src/components/desktop/Window.tsx`
- Test: `src/components/desktop/Window.test.tsx`
- Modify: `package.json` (add `98.css` dependency)
- Modify: `src/app/globals.css` (import `98.css`)

**Interfaces:**
- Consumes: nothing from earlier tasks (props-only component)
- Produces: `<Window title isFocused isMobile position size onFocus onClose onMinimize onMove children>` — used by `Desktop.tsx` (Task 15) to wrap every app's content.

- [ ] **Step 1: Install `98.css` and wire it in**

Run: `npm install 98.css`

In `src/app/globals.css`, add the import alongside the existing Tailwind directives:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
@import "98.css";
```

- [ ] **Step 2: Write the failing tests**

```tsx
// src/components/desktop/Window.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Window from "./Window";

const baseProps = {
  title: "About.txt",
  isFocused: true,
  isMobile: false,
  position: { x: 10, y: 20 },
  size: { width: 300, height: 200 },
  onMove: vi.fn(),
};

describe("Window", () => {
  it("renders the title and calls onClose when the close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <Window {...baseProps} onFocus={vi.fn()} onClose={onClose} onMinimize={vi.fn()}>
        <p>content</p>
      </Window>
    );
    expect(screen.getByText("About.txt")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onMinimize when the minimize button is clicked", () => {
    const onMinimize = vi.fn();
    render(
      <Window {...baseProps} onFocus={vi.fn()} onClose={vi.fn()} onMinimize={onMinimize}>
        <p>content</p>
      </Window>
    );
    fireEvent.click(screen.getByRole("button", { name: /minimize/i }));
    expect(onMinimize).toHaveBeenCalled();
  });

  it("calls onFocus when the window body is clicked", () => {
    const onFocus = vi.fn();
    render(
      <Window {...baseProps} onFocus={onFocus} onClose={vi.fn()} onMinimize={vi.fn()}>
        <p>content</p>
      </Window>
    );
    fireEvent.mouseDown(screen.getByText("content"));
    expect(onFocus).toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test -- Window.test`
Expected: FAIL — `Cannot find module './Window'`

- [ ] **Step 4: Create `src/components/desktop/Window.tsx`**

```tsx
"use client";

import { useRef, type ReactNode, type PointerEvent as ReactPointerEvent } from "react";

interface WindowProps {
  title: string;
  isFocused: boolean;
  isMobile: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMove: (position: { x: number; y: number }) => void;
  children: ReactNode;
}

export default function Window({
  title,
  isFocused,
  isMobile,
  position,
  size,
  onFocus,
  onClose,
  onMinimize,
  onMove,
  children,
}: WindowProps) {
  const dragState = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);

  const handleTitlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (isMobile) return;
    onFocus();
    dragState.current = { startX: e.clientX, startY: e.clientY, originX: position.x, originY: position.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleTitlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    onMove({ x: dragState.current.originX + dx, y: dragState.current.originY + dy });
  };

  const handleTitlePointerUp = () => {
    dragState.current = null;
  };

  const style = isMobile
    ? { position: "fixed" as const, inset: 0, zIndex: isFocused ? 100 : 1 }
    : {
        position: "absolute" as const,
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: isFocused ? 100 : 1,
      };

  return (
    <div className="window" style={style} onMouseDown={onFocus}>
      <div
        className="title-bar"
        onPointerDown={handleTitlePointerDown}
        onPointerMove={handleTitlePointerMove}
        onPointerUp={handleTitlePointerUp}
        style={{ cursor: isMobile ? "default" : "move" }}
      >
        <div className="title-bar-text">{title}</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" onClick={onMinimize} />
          <button aria-label="Close" onClick={onClose} />
        </div>
      </div>
      <div className="window-body" style={{ height: isMobile ? "calc(100% - 33px)" : size.height - 33, overflow: "auto" }}>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- Window.test`
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/app/globals.css src/components/desktop/Window.tsx src/components/desktop/Window.test.tsx
git commit -m "feat: add Window component with 98.css chrome and drag support"
```

---

### Task 6: `DesktopIcon` and `DesktopIcons`

**Files:**
- Create: `src/components/desktop/DesktopIcon.tsx`
- Create: `src/components/desktop/DesktopIcons.tsx`
- Test: `src/components/desktop/DesktopIcon.test.tsx`

**Interfaces:**
- Consumes: `appRegistry`, `AppId` from `@/lib/appRegistry` (Task 2)
- Produces: `<DesktopIcons isMobile onOpen={(id: AppId) => void} />`, used by `Desktop.tsx` (Task 15)

- [ ] **Step 1: Write the failing tests**

```tsx
// src/components/desktop/DesktopIcon.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DesktopIcon from "./DesktopIcon";

describe("DesktopIcon", () => {
  it("calls onOpen on double-click when not mobile", () => {
    const onOpen = vi.fn();
    render(<DesktopIcon label="About.txt" icon="📄" isMobile={false} onOpen={onOpen} />);
    fireEvent.doubleClick(screen.getByText("About.txt"));
    expect(onOpen).toHaveBeenCalled();
  });

  it("calls onOpen on single click when mobile", () => {
    const onOpen = vi.fn();
    render(<DesktopIcon label="About.txt" icon="📄" isMobile onOpen={onOpen} />);
    fireEvent.click(screen.getByText("About.txt"));
    expect(onOpen).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- DesktopIcon.test`
Expected: FAIL — `Cannot find module './DesktopIcon'`

- [ ] **Step 3: Create `src/components/desktop/DesktopIcon.tsx`**

```tsx
"use client";

interface DesktopIconProps {
  label: string;
  icon: string;
  isMobile: boolean;
  onOpen: () => void;
}

export default function DesktopIcon({ label, icon, isMobile, onOpen }: DesktopIconProps) {
  return (
    <button
      className="desktop-icon"
      onDoubleClick={!isMobile ? onOpen : undefined}
      onClick={isMobile ? onOpen : undefined}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        width: isMobile ? 80 : 74,
        background: "transparent",
        border: "none",
        cursor: "pointer",
      }}
    >
      <span style={{ fontSize: isMobile ? 32 : 24 }}>{icon}</span>
      <span style={{ color: "#fff", fontSize: 11, textShadow: "1px 1px 1px #000", textAlign: "center", lineHeight: 1.3 }}>
        {label}
      </span>
    </button>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- DesktopIcon.test`
Expected: PASS (2 tests)

- [ ] **Step 5: Create `src/components/desktop/DesktopIcons.tsx`**

```tsx
"use client";

import { appRegistry, type AppId } from "@/lib/appRegistry";
import DesktopIcon from "./DesktopIcon";

interface DesktopIconsProps {
  isMobile: boolean;
  onOpen: (id: AppId) => void;
}

export default function DesktopIcons({ isMobile, onOpen }: DesktopIconsProps) {
  return (
    <div
      style={
        isMobile
          ? { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, padding: 20, position: "absolute", inset: 0 }
          : { position: "absolute", top: 16, left: 16, display: "flex", flexDirection: "column", gap: 22 }
      }
    >
      {appRegistry.map((app) => (
        <DesktopIcon key={app.id} label={app.label} icon={app.icon} isMobile={isMobile} onOpen={() => onOpen(app.id)} />
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/desktop/DesktopIcon.tsx src/components/desktop/DesktopIcon.test.tsx src/components/desktop/DesktopIcons.tsx
git commit -m "feat: add DesktopIcon and DesktopIcons components"
```

---

### Task 7: `Taskbar` and `StartMenu`

**Files:**
- Create: `src/components/desktop/StartMenu.tsx`
- Create: `src/components/desktop/Taskbar.tsx`
- Test: `src/components/desktop/Taskbar.test.tsx`

**Interfaces:**
- Consumes: `appRegistry`, `AppId` from `@/lib/appRegistry` (Task 2); `WindowState` from `@/hooks/useWindowManager` (Task 3)
- Produces: `<Taskbar isMobile windows={Record<string, WindowState>} onSelectApp={(id: AppId) => void} />`, used by `Desktop.tsx` (Task 15)

- [ ] **Step 1: Write the failing tests**

```tsx
// src/components/desktop/Taskbar.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Taskbar from "./Taskbar";

describe("Taskbar", () => {
  it("opens the Start menu and selecting an app calls onSelectApp", () => {
    const onSelectApp = vi.fn();
    render(<Taskbar isMobile={false} windows={{}} onSelectApp={onSelectApp} />);
    fireEvent.click(screen.getByText("Start"));
    fireEvent.click(screen.getByText("About.txt"));
    expect(onSelectApp).toHaveBeenCalledWith("about");
  });

  it("shows a taskbar button for each open window", () => {
    render(
      <Taskbar
        isMobile={false}
        windows={{ about: { open: true, minimized: false, zIndex: 1, position: { x: 0, y: 0 } } }}
        onSelectApp={vi.fn()}
      />
    );
    expect(screen.getAllByText(/About\.txt/).length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- Taskbar.test`
Expected: FAIL — `Cannot find module './Taskbar'`

- [ ] **Step 3: Create `src/components/desktop/StartMenu.tsx`**

```tsx
"use client";

import { appRegistry, type AppId } from "@/lib/appRegistry";

interface StartMenuProps {
  isMobile: boolean;
  onSelect: (id: AppId) => void;
  onClose: () => void;
}

export default function StartMenu({ isMobile, onSelect, onClose }: StartMenuProps) {
  return (
    <div
      role="menu"
      style={
        isMobile
          ? { position: "fixed", inset: 0, background: "#c0c0c0", zIndex: 200, padding: 16 }
          : { position: "absolute", bottom: 30, left: 0, width: 200, background: "#c0c0c0", border: "2px solid", borderColor: "#fff #000 #000 #fff", zIndex: 200 }
      }
    >
      {isMobile && (
        <button onClick={onClose} style={{ marginBottom: 12 }}>
          Close
        </button>
      )}
      {appRegistry.map((app) => (
        <button
          key={app.id}
          role="menuitem"
          onClick={() => {
            onSelect(app.id);
            onClose();
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            textAlign: "left",
            padding: "6px 10px",
            background: "transparent",
            border: "none",
            fontSize: 12,
          }}
        >
          <span>{app.icon}</span>
          {app.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create `src/components/desktop/Taskbar.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { appRegistry, type AppId } from "@/lib/appRegistry";
import type { WindowState } from "@/hooks/useWindowManager";
import StartMenu from "./StartMenu";

interface TaskbarProps {
  isMobile: boolean;
  windows: Record<string, WindowState>;
  onSelectApp: (id: AppId) => void;
}

export default function Taskbar({ isMobile, windows, onSelectApp }: TaskbarProps) {
  const [startOpen, setStartOpen] = useState(false);
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    update();
    const interval = setInterval(update, 30_000);
    return () => clearInterval(interval);
  }, []);

  const openApps = appRegistry.filter((app) => windows[app.id]?.open);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 30,
        background: "#c0c0c0",
        borderTop: "2px solid #fff",
        display: "flex",
        alignItems: "center",
        padding: "0 4px",
        gap: 4,
        zIndex: 300,
      }}
    >
      <button onClick={() => setStartOpen((v) => !v)} style={{ fontWeight: "bold", fontSize: 11, height: 22, padding: "0 10px" }}>
        Start
      </button>
      {startOpen && <StartMenu isMobile={isMobile} onSelect={(id) => onSelectApp(id)} onClose={() => setStartOpen(false)} />}
      {openApps.map((app) => (
        <button
          key={app.id}
          onClick={() => onSelectApp(app.id)}
          style={{ fontSize: 11, height: 22, padding: "0 10px", minWidth: 100, textAlign: "left" }}
        >
          {app.icon} {app.label}
        </button>
      ))}
      <div style={{ marginLeft: "auto", fontSize: 11, padding: "4px 10px", border: "1px solid #808080" }}>{time}</div>
    </div>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- Taskbar.test`
Expected: PASS (2 tests)

- [ ] **Step 6: Commit**

```bash
git add src/components/desktop/StartMenu.tsx src/components/desktop/Taskbar.tsx src/components/desktop/Taskbar.test.tsx
git commit -m "feat: add Taskbar and StartMenu components"
```

---

### Task 8: `BootSequence`

**Files:**
- Create: `src/components/desktop/BootSequence.tsx`
- Test: `src/components/desktop/BootSequence.test.tsx`

**Interfaces:**
- Produces: `<BootSequence onComplete={() => void} />`, used by `Desktop.tsx` (Task 15)

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/desktop/BootSequence.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import BootSequence from "./BootSequence";

describe("BootSequence", () => {
  it("calls onComplete immediately when clicked (skip)", () => {
    const onComplete = vi.fn();
    render(<BootSequence onComplete={onComplete} />);
    fireEvent.click(screen.getByRole("button", { name: /skip boot sequence/i }));
    expect(onComplete).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- BootSequence.test`
Expected: FAIL — `Cannot find module './BootSequence'`

- [ ] **Step 3: Create `src/components/desktop/BootSequence.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";

interface BootSequenceProps {
  onComplete: () => void;
}

const BOOT_LINES = ["KAVYA-OS 98 Setup", "Loading HIMEM.SYS...", "Loading portfolio drivers...", "Starting Windows 98..."];
const LINE_DELAY_MS = 500;

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (visibleLines >= BOOT_LINES.length) {
      const timeout = setTimeout(onComplete, LINE_DELAY_MS);
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(() => setVisibleLines((n) => n + 1), LINE_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [visibleLines, onComplete]);

  return (
    <div
      role="button"
      aria-label="Skip boot sequence"
      onClick={onComplete}
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        color: "#fff",
        fontFamily: "'Courier New', monospace",
        fontSize: 14,
        padding: 24,
        cursor: "pointer",
        zIndex: 1000,
      }}
    >
      {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- BootSequence.test`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add src/components/desktop/BootSequence.tsx src/components/desktop/BootSequence.test.tsx
git commit -m "feat: add BootSequence component"
```

---

### Task 9: Extract content data

**Files:**
- Create: `src/data/experience.ts`
- Create: `src/data/skills.ts`
- Create: `src/data/content.ts`
- Test: `src/data/content.test.ts`

**Interfaces:**
- Produces: `ExperienceRole` interface + `experience: ExperienceRole[]` (5 items); `SkillGroup` interface + `skills: SkillGroup[]` (4 items); `aboutText: string`, `contactLinks: {email, github, linkedin}`, `resumePath: string`. Consumed by `NotepadApp`, `ExperienceApp`, `SkillsApp`, `ResumeApp`, `ContactApp` (Tasks 10-14).

- [ ] **Step 1: Write the failing tests**

```ts
// src/data/content.test.ts
import { describe, it, expect } from "vitest";
import { experience } from "./experience";
import { skills } from "./skills";
import { contactLinks, resumePath } from "./content";

describe("content data integrity", () => {
  it("has all 5 experience roles", () => {
    expect(experience).toHaveLength(5);
  });

  it("has all 4 skill groups", () => {
    expect(skills).toHaveLength(4);
  });

  it("has valid contact links", () => {
    expect(contactLinks.email).toBe("kavyakat@gmail.com");
    expect(contactLinks.github).toMatch(/^https:\/\/github\.com\//);
    expect(contactLinks.linkedin).toMatch(/^https:\/\/linkedin\.com\//);
  });

  it("points resume at the existing PDF asset", () => {
    expect(resumePath).toBe("/Kavya_Kathuria_Resume.pdf");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- content.test`
Expected: FAIL — `Cannot find module './experience'`

- [ ] **Step 3: Create `src/data/experience.ts`**

```ts
export interface ExperienceRole {
  title: string;
  company: string;
  location: string;
  period: string;
  bullets: string[];
}

export const experience: ExperienceRole[] = [
  {
    title: "Senior AI Data Engineer",
    company: "SAP Commerce Cloud",
    location: "Munich, Germany",
    period: "Jan 2024 — Present",
    bullets: [
      "Engineered end-to-end data pipelines across SAP BTP and Java-based ETLs into HANA Cloud.",
      "Implemented AI-powered summarization, forecasting, and anomaly detection across the platform.",
      "Took full ownership of major data engineering projects from design through production rollout.",
    ],
  },
  {
    title: "Data Scientist",
    company: "SAP Commerce Cloud",
    location: "Munich, Germany",
    period: "May 2022 — Dec 2023",
    bullets: [
      "Built analytical dashboards in SAP Analytics Cloud delivering KPIs and AI-driven insights to stakeholders.",
      "Maintained SAP HANA Cloud data models and optimised performance for analytics at scale.",
      "Led UI/UX development for internal tools, aligning with SAP Fiori standards.",
    ],
  },
  {
    title: "Working Student",
    company: "SAP Commerce Cloud & Kyma",
    location: "Munich, Germany",
    period: "Nov 2019 — May 2022",
    bullets: [
      "Built dashboards and backend services for Commerce Cloud analytics using SAP HANA and Java.",
      "Developed a GoLang-based integration library for SAP Kyma.",
      "Worked with Kubernetes and Docker deployments across AWS, Azure, and GCP.",
    ],
  },
  {
    title: "Associate Developer",
    company: "SAP Master Data Management",
    location: "Bengaluru, India",
    period: "Aug 2018 — Aug 2019",
    bullets: [
      "Built a centralised Product Master Data orchestration solution on SAP Cloud Platform using CAP.",
      "Developed core backend services supporting product lifecycle workflows.",
      "Applied SAP HANA Cloud and Fiori across multiple project stages.",
    ],
  },
  {
    title: "Associate Developer",
    company: "SAP Fieldglass",
    location: "Bengaluru, India",
    period: "Jul 2015 — Jul 2018",
    bullets: [
      "Contributed to the SAP Fieldglass vendor management system — feature development and enhancements.",
      "Built REST APIs with the Spring framework for modular and maintainable backend services.",
      "Integrated Java microservices for smoother data exchange and operational consistency.",
    ],
  },
];
```

- [ ] **Step 4: Create `src/data/skills.ts`**

```ts
export interface SkillGroup {
  group: string;
  tags: string[];
}

export const skills: SkillGroup[] = [
  { group: "Languages", tags: ["Java", "Python", "SQL", "GoLang"] },
  { group: "SAP & Cloud", tags: ["SAP BTP", "SAP HANA Cloud", "SAP Analytics Cloud", "CAP", "SAP Fiori", "SAP Commerce Cloud"] },
  { group: "Data & AI", tags: ["Data pipelines", "Data modeling", "AI summarization", "Forecasting", "Anomaly detection"] },
  { group: "DevOps", tags: ["Jenkins", "GitHub Actions", "Kubernetes", "Docker", "AWS", "Azure", "GCP"] },
];
```

- [ ] **Step 5: Create `src/data/content.ts`**

```ts
export const aboutText = `Senior Data Engineer and Software Developer at SAP, based in Munich. I build platform-level systems — the kind that other teams depend on but never think about. Currently on the Commerce Analytics team, working on the analytics layer of SAP Commerce Cloud v2: event tracking infrastructure, data pipelines, backend services, and the dashboards and AI features built on top of them.

My stack spans Java and Python backends, SAP BTP, HANA Cloud, and SAP Analytics Cloud. I've taken projects from early design through production — owning the engineering end to end, not just a slice of it. More recently, that's included AI: summarization, forecasting, and anomaly detection running in production on real commerce data.`;

export const contactLinks = {
  email: "kavyakat@gmail.com",
  github: "https://github.com/kavyakat",
  linkedin: "https://linkedin.com/in/kavyakathuria",
};

export const resumePath = "/Kavya_Kathuria_Resume.pdf";
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test -- content.test`
Expected: PASS (4 tests)

- [ ] **Step 7: Commit**

```bash
git add src/data/experience.ts src/data/skills.ts src/data/content.ts src/data/content.test.ts
git commit -m "feat: extract portfolio content into data files"
```

---

### Task 10: `NotepadApp` (About)

**Files:**
- Create: `src/components/desktop/apps/NotepadApp.tsx`
- Test: `src/components/desktop/apps/NotepadApp.test.tsx`

**Interfaces:**
- Consumes: `aboutText` from `@/data/content` (Task 9)
- Produces: `<NotepadApp />`, used by `Desktop.tsx` (Task 15) for the `about` app

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/desktop/apps/NotepadApp.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NotepadApp from "./NotepadApp";

describe("NotepadApp", () => {
  it("renders the about bio text", () => {
    render(<NotepadApp />);
    expect(screen.getByText(/Senior Data Engineer and Software Developer at SAP/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- NotepadApp.test`
Expected: FAIL — `Cannot find module './NotepadApp'`

- [ ] **Step 3: Create `src/components/desktop/apps/NotepadApp.tsx`**

```tsx
import { aboutText } from "@/data/content";

export default function NotepadApp() {
  return (
    <div
      style={{
        background: "#fff",
        height: "100%",
        padding: 8,
        fontFamily: "'Courier New', monospace",
        fontSize: 12,
        lineHeight: 1.6,
        whiteSpace: "pre-wrap",
      }}
    >
      {aboutText}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- NotepadApp.test`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add src/components/desktop/apps/NotepadApp.tsx src/components/desktop/apps/NotepadApp.test.tsx
git commit -m "feat: add NotepadApp (About)"
```

---

### Task 11: `ExperienceApp`

**Files:**
- Create: `src/components/desktop/apps/ExperienceApp.tsx`
- Test: `src/components/desktop/apps/ExperienceApp.test.tsx`

**Interfaces:**
- Consumes: `experience` from `@/data/experience` (Task 9)
- Produces: `<ExperienceApp />`, used by `Desktop.tsx` (Task 15) for the `experience` app

- [ ] **Step 1: Write the failing tests**

```tsx
// src/components/desktop/apps/ExperienceApp.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ExperienceApp from "./ExperienceApp";
import { experience } from "@/data/experience";

describe("ExperienceApp", () => {
  it("shows the first role's details by default", () => {
    render(<ExperienceApp />);
    expect(screen.getByText(experience[0].title)).toBeInTheDocument();
  });

  it("switches details when a different folder is selected", () => {
    render(<ExperienceApp />);
    fireEvent.click(screen.getByText(`📁 ${experience[2].company}`));
    expect(screen.getByText(experience[2].title)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- ExperienceApp.test`
Expected: FAIL — `Cannot find module './ExperienceApp'`

- [ ] **Step 3: Create `src/components/desktop/apps/ExperienceApp.tsx`**

```tsx
"use client";

import { useState } from "react";
import { experience } from "@/data/experience";

export default function ExperienceApp() {
  const [selected, setSelected] = useState(0);
  const role = experience[selected];

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <div style={{ width: 160, borderRight: "1px solid #808080", overflowY: "auto" }}>
        {experience.map((r, i) => (
          <button
            key={`${r.company}-${r.period}`}
            onClick={() => setSelected(i)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              width: "100%",
              padding: 6,
              background: i === selected ? "#000080" : "transparent",
              color: i === selected ? "#fff" : "#000",
              border: "none",
              fontSize: 11,
              textAlign: "left",
            }}
          >
            📁 {r.company}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, padding: 10, fontSize: 12, overflowY: "auto" }}>
        <p style={{ fontWeight: "bold" }}>{role.title}</p>
        <p style={{ color: "#444" }}>
          {role.company} · {role.location}
        </p>
        <p style={{ color: "#666", marginBottom: 8 }}>{role.period}</p>
        <ul style={{ paddingLeft: 16 }}>
          {role.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- ExperienceApp.test`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/desktop/apps/ExperienceApp.tsx src/components/desktop/apps/ExperienceApp.test.tsx
git commit -m "feat: add ExperienceApp"
```

---

### Task 12: `SkillsApp`

**Files:**
- Create: `src/components/desktop/apps/SkillsApp.tsx`
- Test: `src/components/desktop/apps/SkillsApp.test.tsx`

**Interfaces:**
- Consumes: `skills` from `@/data/skills` (Task 9)
- Produces: `<SkillsApp />`, used by `Desktop.tsx` (Task 15) for the `skills` app

- [ ] **Step 1: Write the failing tests**

```tsx
// src/components/desktop/apps/SkillsApp.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SkillsApp from "./SkillsApp";
import { skills } from "@/data/skills";

describe("SkillsApp", () => {
  it("shows the first group's tags by default", () => {
    render(<SkillsApp />);
    expect(screen.getByText(skills[0].tags[0])).toBeInTheDocument();
  });

  it("switches tags when a different tab is selected", () => {
    render(<SkillsApp />);
    fireEvent.click(screen.getByText(skills[1].group));
    expect(screen.getByText(skills[1].tags[0])).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- SkillsApp.test`
Expected: FAIL — `Cannot find module './SkillsApp'`

- [ ] **Step 3: Create `src/components/desktop/apps/SkillsApp.tsx`**

```tsx
"use client";

import { useState } from "react";
import { skills } from "@/data/skills";

export default function SkillsApp() {
  const [activeTab, setActiveTab] = useState(0);
  const group = skills[activeTab];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", borderBottom: "1px solid #808080" }}>
        {skills.map((g, i) => (
          <button
            key={g.group}
            onClick={() => setActiveTab(i)}
            style={{
              padding: "6px 10px",
              fontSize: 11,
              background: i === activeTab ? "#c0c0c0" : "#dcdcdc",
              border: "1px solid #808080",
              marginBottom: -1,
            }}
          >
            {g.group}
          </button>
        ))}
      </div>
      <div style={{ padding: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
        {group.tags.map((tag) => (
          <span key={tag} style={{ border: "1px solid #808080", padding: "4px 8px", fontSize: 11, background: "#fff" }}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- SkillsApp.test`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/desktop/apps/SkillsApp.tsx src/components/desktop/apps/SkillsApp.test.tsx
git commit -m "feat: add SkillsApp"
```

---

### Task 13: `ResumeApp`

**Files:**
- Create: `src/components/desktop/apps/ResumeApp.tsx`
- Test: `src/components/desktop/apps/ResumeApp.test.tsx`

**Interfaces:**
- Consumes: `resumePath` from `@/data/content` (Task 9)
- Produces: `<ResumeApp />`, used by `Desktop.tsx` (Task 15) for the `resume` app

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/desktop/apps/ResumeApp.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ResumeApp from "./ResumeApp";
import { resumePath } from "@/data/content";

describe("ResumeApp", () => {
  it("points its iframe at the resume PDF", () => {
    render(<ResumeApp />);
    expect(screen.getByTitle("Resume")).toHaveAttribute("src", resumePath);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- ResumeApp.test`
Expected: FAIL — `Cannot find module './ResumeApp'`

- [ ] **Step 3: Create `src/components/desktop/apps/ResumeApp.tsx`**

```tsx
import { resumePath } from "@/data/content";

export default function ResumeApp() {
  return <iframe title="Resume" src={resumePath} style={{ width: "100%", height: "100%", border: "none" }} />;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- ResumeApp.test`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add src/components/desktop/apps/ResumeApp.tsx src/components/desktop/apps/ResumeApp.test.tsx
git commit -m "feat: add ResumeApp"
```

---

### Task 14: `ContactApp`

**Files:**
- Create: `src/components/desktop/apps/ContactApp.tsx`
- Test: `src/components/desktop/apps/ContactApp.test.tsx`

**Interfaces:**
- Consumes: `contactLinks` from `@/data/content` (Task 9)
- Produces: `<ContactApp />`, used by `Desktop.tsx` (Task 15) for the `contact` app

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/desktop/apps/ContactApp.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ContactApp from "./ContactApp";
import { contactLinks } from "@/data/content";

describe("ContactApp", () => {
  it("links to the correct email, GitHub, and LinkedIn", () => {
    render(<ContactApp />);
    expect(screen.getByText("Email me")).toHaveAttribute("href", `mailto:${contactLinks.email}`);
    expect(screen.getByText("GitHub")).toHaveAttribute("href", contactLinks.github);
    expect(screen.getByText("LinkedIn")).toHaveAttribute("href", contactLinks.linkedin);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- ContactApp.test`
Expected: FAIL — `Cannot find module './ContactApp'`

- [ ] **Step 3: Create `src/components/desktop/apps/ContactApp.tsx`**

```tsx
import { contactLinks } from "@/data/content";

export default function ContactApp() {
  return (
    <div style={{ padding: 12, fontSize: 12 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <span style={{ fontWeight: "bold", width: 40 }}>To:</span>
        <span>{contactLinks.email}</span>
      </div>
      <div style={{ borderTop: "1px solid #808080", paddingTop: 10 }}>
        <p>Interested in working together or just want to say hello? My inbox is open.</p>
        <p style={{ marginTop: 12 }}>
          <a href={`mailto:${contactLinks.email}`}>Email me</a>
          {" · "}
          <a href={contactLinks.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          {" · "}
          <a href={contactLinks.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- ContactApp.test`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add src/components/desktop/apps/ContactApp.tsx src/components/desktop/apps/ContactApp.test.tsx
git commit -m "feat: add ContactApp"
```

---

### Task 15: `Desktop.tsx` — wire it all together

**Files:**
- Create: `src/components/desktop/Desktop.tsx`

**Interfaces:**
- Consumes: everything from Tasks 2-14 (`appRegistry`, `useWindowManager`, `useIsMobile`, `BootSequence`, `DesktopIcons`, `Taskbar`, `Window`, all 5 app components)
- Produces: `<Desktop />`, the single component `page.tsx` (Task 16) renders

- [ ] **Step 1: Create `src/components/desktop/Desktop.tsx`**

```tsx
"use client";

import { useState, type ComponentType } from "react";
import { appRegistry, type AppId } from "@/lib/appRegistry";
import { useWindowManager } from "@/hooks/useWindowManager";
import { useIsMobile } from "@/hooks/useIsMobile";
import BootSequence from "./BootSequence";
import DesktopIcons from "./DesktopIcons";
import Taskbar from "./Taskbar";
import Window from "./Window";
import NotepadApp from "./apps/NotepadApp";
import ExperienceApp from "./apps/ExperienceApp";
import SkillsApp from "./apps/SkillsApp";
import ResumeApp from "./apps/ResumeApp";
import ContactApp from "./apps/ContactApp";

const APP_CONTENT: Record<AppId, ComponentType> = {
  about: NotepadApp,
  experience: ExperienceApp,
  skills: SkillsApp,
  resume: ResumeApp,
  contact: ContactApp,
};

export default function Desktop() {
  const [booted, setBooted] = useState(false);
  const isMobile = useIsMobile();
  const { windows, openWindow, closeWindow, minimizeWindow, focusWindow, moveWindow } = useWindowManager();

  if (!booted) {
    return <BootSequence onComplete={() => setBooted(true)} />;
  }

  const openStates = Object.entries(windows).filter(([, w]) => w.open && !w.minimized);
  const maxZ = openStates.length ? Math.max(...openStates.map(([, w]) => w.zIndex)) : 0;

  return (
    <div style={{ position: "relative", width: "100%", height: "100dvh", background: "#008080", overflow: "hidden" }}>
      <DesktopIcons isMobile={isMobile} onOpen={(id) => openWindow(id, appRegistry.find((a) => a.id === id)!.defaultPosition)} />

      {appRegistry.map((app) => {
        const state = windows[app.id];
        if (!state || !state.open || state.minimized) return null;
        const Content = APP_CONTENT[app.id];
        return (
          <Window
            key={app.id}
            title={app.label}
            isFocused={state.zIndex === maxZ}
            isMobile={isMobile}
            position={state.position}
            size={app.defaultSize}
            onFocus={() => focusWindow(app.id)}
            onClose={() => closeWindow(app.id)}
            onMinimize={() => minimizeWindow(app.id)}
            onMove={(pos) => moveWindow(app.id, pos)}
          >
            <Content />
          </Window>
        );
      })}

      <Taskbar
        isMobile={isMobile}
        windows={windows}
        onSelectApp={(id) => openWindow(id, appRegistry.find((a) => a.id === id)!.defaultPosition)}
      />
    </div>
  );
}
```

- [ ] **Step 2: Run the full test suite to confirm nothing broke**

Run: `npm test`
Expected: PASS (all tests from Tasks 2-14)

- [ ] **Step 3: Commit**

```bash
git add src/components/desktop/Desktop.tsx
git commit -m "feat: add Desktop component wiring window manager, icons, taskbar, and apps"
```

---

### Task 16: Wire `page.tsx`, remove obsolete files, final manual QA

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`
- Delete: `src/components/Navbar.tsx`, `src/components/ScrollHint.tsx`, `src/components/Hero.tsx`, `src/components/About.tsx`, `src/components/Experience.tsx`, `src/components/Skills.tsx`, `src/components/BeyondWork.tsx`, `src/components/Contact.tsx`, `src/hooks/useInView.ts`, `src/hooks/useActiveSection.ts`

**Interfaces:**
- Consumes: `Desktop` from `@/components/desktop/Desktop` (Task 15)

- [ ] **Step 1: Replace `src/app/page.tsx`**

```tsx
import Desktop from "@/components/desktop/Desktop";

export default function Home() {
  return <Desktop />;
}
```

- [ ] **Step 2: Remove scroll-snap CSS from `src/app/globals.css`**

Replace the full file contents with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
@import "98.css";

body {
  margin: 0;
  overflow: hidden;
}
```

- [ ] **Step 3: Delete the obsolete scroll-page files**

```bash
git rm src/components/Navbar.tsx src/components/ScrollHint.tsx src/components/Hero.tsx src/components/About.tsx src/components/Experience.tsx src/components/Skills.tsx src/components/BeyondWork.tsx src/components/Contact.tsx src/hooks/useInView.ts src/hooks/useActiveSection.ts
```

- [ ] **Step 4: Run the full test suite**

Run: `npm test`
Expected: PASS (all tests; nothing imports the deleted files anymore)

- [ ] **Step 5: Manual QA pass — run the dev server**

Run: `npm run dev`, open `http://localhost:3000`

Desktop viewport checklist:
- Boot sequence plays and is skippable by a click
- All 5 icons visible, double-click opens each window
- Each window: title bar readable, drag by title bar moves it, click anywhere raises it above other windows, minimize sends it to the taskbar, close removes it and its taskbar button
- Start button opens the cascading Start Menu; clicking an item opens that app
- Opening an already-open app focuses the existing window instead of duplicating it
- Taskbar clock updates

Resize the browser to a mobile width (< 768px) and repeat:
- Icons render as a full-screen grid
- Tapping an icon opens it full-screen (no drag)
- Taskbar is a bottom bar; Start opens a full-screen app list

- [ ] **Step 6: Commit**

```bash
git add src/app/page.tsx src/app/globals.css
git commit -m "feat: wire Desktop into page.tsx and remove obsolete scroll-page components"
```
