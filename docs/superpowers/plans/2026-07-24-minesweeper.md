# Minesweeper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a playable classic beginner Minesweeper (9×9, 10 mines) as a Windows-98 desktop app on the `win98-redesign` branch.

**Architecture:** Pure, immutable game logic in `src/lib/games/minesweeper.ts` (no React, fully unit-tested) is consumed by a `MinesweeperApp` client component that owns board state, a mine counter, a timer, and a reset "smiley". The app is wired into the existing desktop shell purely by adding it to `appRegistry` (which auto-surfaces it in desktop icons, the taskbar, and Start → Programs) and to the `APP_CONTENT` map in `Desktop.tsx`. A hand-written SVG icon avoids any binary asset.

**Tech Stack:** Next.js 14 (App Router), TypeScript, React 18 client components, 98.css styling via inline styles, Vitest 4 + React Testing Library + jsdom. Run tests with `npx vitest run <path>`; the `@` alias maps to `./src`.

---

### Task 1: Board creation and adjacency counts

**Files:**
- Create: `src/lib/games/minesweeper.ts`
- Test: `src/lib/games/minesweeper.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/games/minesweeper.test.ts
import { describe, it, expect } from "vitest";
import { createBoard, computeAdjacents, type Board } from "./minesweeper";

describe("createBoard", () => {
  it("creates a rows×cols grid of hidden, mine-free cells", () => {
    const board = createBoard(9, 9);
    expect(board.length).toBe(9);
    expect(board.every((row) => row.length === 9)).toBe(true);
    const cells = board.flat();
    expect(cells.length).toBe(81);
    expect(cells.every((c) => c.state === "hidden" && !c.mine && c.adjacent === 0)).toBe(true);
  });
});

describe("computeAdjacents", () => {
  it("counts mines in the 8 neighbours of each cell", () => {
    // mines at (0,0) and (0,1)
    const board: Board = createBoard(2, 2);
    board[0][0].mine = true;
    board[0][1].mine = true;
    const result = computeAdjacents(board);
    expect(result[0][0].adjacent).toBe(1); // neighbour (0,1)
    expect(result[0][1].adjacent).toBe(1); // neighbour (0,0)
    expect(result[1][0].adjacent).toBe(2); // neighbours (0,0),(0,1)
    expect(result[1][1].adjacent).toBe(2); // neighbours (0,0),(0,1)
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/games/minesweeper.test.ts`
Expected: FAIL — cannot find module `./minesweeper` / exports undefined.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/games/minesweeper.ts
export type CellState = "hidden" | "revealed" | "flagged";

export interface Cell {
  mine: boolean;
  adjacent: number;
  state: CellState;
}

export type Board = Cell[][];

export type GameStatus = "playing" | "won" | "lost";

export const BEGINNER = { rows: 9, cols: 9, mines: 10 } as const;

export function createBoard(rows: number, cols: number): Board {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ mine: false, adjacent: 0, state: "hidden" as CellState }))
  );
}

const NEIGHBOURS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1], [0, 1],
  [1, -1], [1, 0], [1, 1],
];

function inBounds(board: Board, r: number, c: number): boolean {
  return r >= 0 && r < board.length && c >= 0 && c < board[0].length;
}

export function computeAdjacents(board: Board): Board {
  return board.map((row, r) =>
    row.map((cell, c) => {
      if (cell.mine) return { ...cell };
      const adjacent = NEIGHBOURS.reduce(
        (count, [dr, dc]) => count + (inBounds(board, r + dr, c + dc) && board[r + dr][c + dc].mine ? 1 : 0),
        0
      );
      return { ...cell, adjacent };
    })
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/games/minesweeper.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/games/minesweeper.ts src/lib/games/minesweeper.test.ts
git commit -m "feat: add minesweeper board creation and adjacency logic"
```

---

### Task 2: Mine placement with a safe first click

**Files:**
- Modify: `src/lib/games/minesweeper.ts`
- Test: `src/lib/games/minesweeper.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// append to src/lib/games/minesweeper.test.ts
import { placeMines } from "./minesweeper";

describe("placeMines", () => {
  it("places exactly the requested number of mines", () => {
    const board = placeMines(createBoard(9, 9), 10, 4, 4);
    expect(board.flat().filter((c) => c.mine).length).toBe(10);
  });

  it("never places a mine on the safe cell or its neighbours", () => {
    for (let i = 0; i < 20; i++) {
      const board = placeMines(createBoard(9, 9), 10, 4, 4);
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          expect(board[4 + dr][4 + dc].mine).toBe(false);
        }
      }
    }
  });

  it("computes adjacency counts after placing mines", () => {
    const board = placeMines(createBoard(9, 9), 10, 4, 4);
    // every non-mine cell's adjacent equals its real neighbour-mine count
    board.forEach((row, r) =>
      row.forEach((cell, c) => {
        if (cell.mine) return;
        let expected = 0;
        for (let dr = -1; dr <= 1; dr++)
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < 9 && nc >= 0 && nc < 9 && board[nr][nc].mine) expected++;
          }
        expect(cell.adjacent).toBe(expected);
      })
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/games/minesweeper.test.ts`
Expected: FAIL — `placeMines` is not exported.

- [ ] **Step 3: Write minimal implementation**

```ts
// add to src/lib/games/minesweeper.ts
export function placeMines(
  board: Board,
  mines: number,
  safeR: number,
  safeC: number,
  rand: () => number = Math.random
): Board {
  const rows = board.length;
  const cols = board[0].length;
  const forbidden = new Set<string>();
  for (const [dr, dc] of [[0, 0], ...NEIGHBOURS]) {
    forbidden.add(`${safeR + dr}:${safeC + dc}`);
  }

  const candidates: Array<[number, number]> = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!forbidden.has(`${r}:${c}`)) candidates.push([r, c]);
    }
  }

  // Fisher–Yates shuffle, then take the first `mines`.
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  const next = board.map((row) => row.map((cell) => ({ ...cell })));
  for (let i = 0; i < Math.min(mines, candidates.length); i++) {
    const [r, c] = candidates[i];
    next[r][c].mine = true;
  }
  return computeAdjacents(next);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/games/minesweeper.test.ts`
Expected: PASS (5 tests total).

- [ ] **Step 5: Commit**

```bash
git add src/lib/games/minesweeper.ts src/lib/games/minesweeper.test.ts
git commit -m "feat: add safe-first-click mine placement to minesweeper"
```

---

### Task 3: Reveal with flood fill, and status derivation

**Files:**
- Modify: `src/lib/games/minesweeper.ts`
- Test: `src/lib/games/minesweeper.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// append to src/lib/games/minesweeper.test.ts
import { reveal, status, revealAllMines } from "./minesweeper";

function boardFromMines(rows: number, cols: number, mines: Array<[number, number]>): Board {
  const b = createBoard(rows, cols);
  mines.forEach(([r, c]) => (b[r][c].mine = true));
  return computeAdjacents(b);
}

describe("reveal", () => {
  it("reveals a single numbered cell without flooding", () => {
    // 3×3, mine at (0,0). Cell (0,1) has adjacent=1, so no flood.
    const board = boardFromMines(3, 3, [[0, 0]]);
    const next = reveal(board, 0, 1);
    expect(next[0][1].state).toBe("revealed");
    expect(next[2][2].state).toBe("hidden"); // did not flood past numbers
  });

  it("flood-fills the whole zero region and its numbered border", () => {
    // 3×3, single mine at (0,0). Revealing (2,2) floods all zero cells and their number borders.
    const board = boardFromMines(3, 3, [[0, 0]]);
    const next = reveal(board, 2, 2);
    const hidden = next.flat().filter((c) => c.state === "hidden");
    // only the mine stays hidden; all 8 non-mine cells revealed
    expect(hidden.length).toBe(1);
    expect(next[0][0].state).toBe("hidden");
    expect(next[0][0].mine).toBe(true);
  });

  it("does not reveal a flagged cell", () => {
    const board = boardFromMines(3, 3, [[0, 0]]);
    board[1][1].state = "flagged";
    const next = reveal(board, 1, 1);
    expect(next[1][1].state).toBe("flagged");
  });
});

describe("status", () => {
  it("is playing while safe cells remain hidden and no mine is revealed", () => {
    const board = boardFromMines(3, 3, [[0, 0]]);
    expect(status(board)).toBe("playing");
  });

  it("is lost when a mine is revealed", () => {
    const board = boardFromMines(3, 3, [[0, 0]]);
    const next = reveal(board, 0, 0);
    expect(status(next)).toBe("lost");
  });

  it("is won when every non-mine cell is revealed", () => {
    const board = boardFromMines(3, 3, [[0, 0]]);
    const next = reveal(board, 2, 2); // floods all 8 safe cells
    expect(status(next)).toBe("won");
  });
});

describe("revealAllMines", () => {
  it("reveals every mine cell", () => {
    const board = boardFromMines(3, 3, [[0, 0], [2, 2]]);
    const next = revealAllMines(board);
    expect(next[0][0].state).toBe("revealed");
    expect(next[2][2].state).toBe("revealed");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/games/minesweeper.test.ts`
Expected: FAIL — `reveal`, `status`, `revealAllMines` not exported.

- [ ] **Step 3: Write minimal implementation**

```ts
// add to src/lib/games/minesweeper.ts
export function reveal(board: Board, r: number, c: number): Board {
  if (!inBounds(board, r, c)) return board;
  const start = board[r][c];
  if (start.state !== "hidden") return board;

  const next = board.map((row) => row.map((cell) => ({ ...cell })));

  if (next[r][c].mine) {
    next[r][c].state = "revealed";
    return next;
  }

  const stack: Array<[number, number]> = [[r, c]];
  while (stack.length) {
    const [cr, cc] = stack.pop()!;
    const cell = next[cr][cc];
    if (cell.state !== "hidden" || cell.mine) continue;
    cell.state = "revealed";
    if (cell.adjacent === 0) {
      for (const [dr, dc] of NEIGHBOURS) {
        const nr = cr + dr, nc = cc + dc;
        if (inBounds(next, nr, nc) && next[nr][nc].state === "hidden" && !next[nr][nc].mine) {
          stack.push([nr, nc]);
        }
      }
    }
  }
  return next;
}

export function revealAllMines(board: Board): Board {
  return board.map((row) => row.map((cell) => (cell.mine ? { ...cell, state: "revealed" as CellState } : { ...cell })));
}

export function status(board: Board): GameStatus {
  const cells = board.flat();
  if (cells.some((c) => c.mine && c.state === "revealed")) return "lost";
  if (cells.every((c) => c.mine || c.state === "revealed")) return "won";
  return "playing";
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/games/minesweeper.test.ts`
Expected: PASS (all logic tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/games/minesweeper.ts src/lib/games/minesweeper.test.ts
git commit -m "feat: add reveal flood-fill, status, and reveal-all-mines"
```

---

### Task 4: Flagging and flag count

**Files:**
- Modify: `src/lib/games/minesweeper.ts`
- Test: `src/lib/games/minesweeper.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// append to src/lib/games/minesweeper.test.ts
import { toggleFlag, countFlags } from "./minesweeper";

describe("toggleFlag", () => {
  it("flags a hidden cell and unflags a flagged cell", () => {
    let board = createBoard(2, 2);
    board = toggleFlag(board, 0, 0);
    expect(board[0][0].state).toBe("flagged");
    board = toggleFlag(board, 0, 0);
    expect(board[0][0].state).toBe("hidden");
  });

  it("does not flag a revealed cell", () => {
    const board = boardFromMines(3, 3, [[0, 0]]);
    const revealed = reveal(board, 2, 2);
    const next = toggleFlag(revealed, 2, 2);
    expect(next[2][2].state).toBe("revealed");
  });
});

describe("countFlags", () => {
  it("counts flagged cells", () => {
    let board = createBoard(2, 2);
    board = toggleFlag(board, 0, 0);
    board = toggleFlag(board, 1, 1);
    expect(countFlags(board)).toBe(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/games/minesweeper.test.ts`
Expected: FAIL — `toggleFlag`, `countFlags` not exported.

- [ ] **Step 3: Write minimal implementation**

```ts
// add to src/lib/games/minesweeper.ts
export function toggleFlag(board: Board, r: number, c: number): Board {
  if (!inBounds(board, r, c)) return board;
  const cell = board[r][c];
  if (cell.state === "revealed") return board;
  const next = board.map((row) => row.map((cel) => ({ ...cel })));
  next[r][c].state = cell.state === "flagged" ? "hidden" : "flagged";
  return next;
}

export function countFlags(board: Board): number {
  return board.flat().filter((c) => c.state === "flagged").length;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/games/minesweeper.test.ts`
Expected: PASS (all logic tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/games/minesweeper.ts src/lib/games/minesweeper.test.ts
git commit -m "feat: add flag toggling and flag count to minesweeper"
```

---

### Task 5: MinesweeperApp component

**Files:**
- Create: `src/components/desktop/apps/MinesweeperApp.tsx`
- Test: `src/components/desktop/apps/MinesweeperApp.test.tsx`

**Interaction contract:**
- Renders a header with a mine counter (`mines − flags`, clamped display), a reset button (label `🙂`, or `😵` when lost / `😎` when won), and an elapsed-seconds timer.
- Renders `rows×cols` cell buttons. Each cell button has `aria-label` = `cell-${r}-${c}` so tests can target it.
- Left click reveals; the first left click places mines with that cell safe, then reveals.
- Right click (`onContextMenu`) toggles a flag and calls `e.preventDefault()`.
- On revealing a mine, the board shows all mines and the game is `lost`; further cell clicks are ignored until reset.
- Reset returns to a fresh empty board.
- Component takes no required props (matches `AppContentProps = { onLaunchApp }` — the prop is accepted but unused).

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/desktop/apps/MinesweeperApp.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import MinesweeperApp from "./MinesweeperApp";

describe("MinesweeperApp", () => {
  it("renders a 9×9 grid of cells and a reset button", () => {
    render(<MinesweeperApp onLaunchApp={vi.fn()} />);
    expect(screen.getByLabelText("cell-0-0")).toBeInTheDocument();
    expect(screen.getByLabelText("cell-8-8")).toBeInTheDocument();
    expect(screen.getAllByRole("button").filter((b) => b.getAttribute("aria-label")?.startsWith("cell-")).length).toBe(81);
    expect(screen.getByRole("button", { name: /reset/i })).toBeInTheDocument();
  });

  it("reveals cells on left click (first click never loses)", () => {
    render(<MinesweeperApp onLaunchApp={vi.fn()} />);
    const cell = screen.getByLabelText("cell-4-4");
    fireEvent.click(cell);
    // first click is always safe -> game not lost; reset face stays 🙂 or 😎
    expect(screen.getByRole("button", { name: /reset/i })).not.toHaveTextContent("😵");
  });

  it("flags a cell on right click and updates the mine counter", () => {
    render(<MinesweeperApp onLaunchApp={vi.fn()} />);
    const counter = screen.getByTestId("mine-counter");
    expect(counter).toHaveTextContent("10");
    fireEvent.contextMenu(screen.getByLabelText("cell-0-0"));
    expect(counter).toHaveTextContent("9");
  });

  it("resets to a fresh board", () => {
    render(<MinesweeperApp onLaunchApp={vi.fn()} />);
    fireEvent.contextMenu(screen.getByLabelText("cell-0-0"));
    expect(screen.getByTestId("mine-counter")).toHaveTextContent("9");
    fireEvent.click(screen.getByRole("button", { name: /reset/i }));
    expect(screen.getByTestId("mine-counter")).toHaveTextContent("10");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/desktop/apps/MinesweeperApp.test.tsx`
Expected: FAIL — module `./MinesweeperApp` not found.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/components/desktop/apps/MinesweeperApp.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  BEGINNER,
  createBoard,
  placeMines,
  reveal,
  revealAllMines,
  toggleFlag,
  countFlags,
  status,
  type Board,
} from "@/lib/games/minesweeper";

const NUMBER_COLORS = ["", "#0000ff", "#008000", "#ff0000", "#000080", "#800000", "#008080", "#000000", "#808080"];

export default function MinesweeperApp() {
  const [board, setBoard] = useState<Board>(() => createBoard(BEGINNER.rows, BEGINNER.cols));
  const [placed, setPlaced] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startedRef = useRef(false);

  const game = status(board);
  const running = placed && game === "playing";

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const reset = () => {
    setBoard(createBoard(BEGINNER.rows, BEGINNER.cols));
    setPlaced(false);
    setElapsed(0);
    startedRef.current = false;
  };

  const handleReveal = (r: number, c: number) => {
    if (game !== "playing") return;
    let working = board;
    if (!placed) {
      working = placeMines(board, BEGINNER.mines, r, c);
      setPlaced(true);
      startedRef.current = true;
    }
    let next = reveal(working, r, c);
    if (status(next) === "lost") next = revealAllMines(next);
    setBoard(next);
  };

  const handleFlag = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (game !== "playing") return;
    setBoard((b) => toggleFlag(b, r, c));
  };

  const face = game === "lost" ? "😵" : game === "won" ? "😎" : "🙂";
  const minesLeft = BEGINNER.mines - countFlags(board);

  const panel = (children: React.ReactNode) => (
    <span
      style={{
        fontFamily: "monospace",
        fontSize: 18,
        color: "#f00",
        background: "#000",
        padding: "1px 6px",
        minWidth: 44,
        textAlign: "right",
        border: "1px solid",
        borderColor: "#808080 #fff #fff #808080",
      }}
    >
      {children}
    </span>
  );

  return (
    <div style={{ padding: 8, background: "#c0c0c0", display: "inline-block" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          border: "2px solid",
          borderColor: "#808080 #fff #fff #808080",
          padding: 6,
          marginBottom: 6,
        }}
      >
        <span data-testid="mine-counter">{panel(String(Math.max(minesLeft, -99)).padStart(3, "0"))}</span>
        <button aria-label="reset" onClick={reset} style={{ fontSize: 18, width: 34, height: 30, lineHeight: 1 }}>
          {face}
        </button>
        <span data-testid="timer">{panel(String(Math.min(elapsed, 999)).padStart(3, "0"))}</span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${BEGINNER.cols}, 24px)`,
          border: "2px solid",
          borderColor: "#808080 #fff #fff #808080",
        }}
      >
        {board.map((row, r) =>
          row.map((cell, c) => {
            const revealed = cell.state === "revealed";
            const label = `cell-${r}-${c}`;
            let content: React.ReactNode = "";
            if (cell.state === "flagged") content = "🚩";
            else if (revealed && cell.mine) content = "💣";
            else if (revealed && cell.adjacent > 0)
              content = <span style={{ color: NUMBER_COLORS[cell.adjacent], fontWeight: "bold" }}>{cell.adjacent}</span>;
            return (
              <button
                key={label}
                aria-label={label}
                onClick={() => handleReveal(r, c)}
                onContextMenu={(e) => handleFlag(e, r, c)}
                style={{
                  width: 24,
                  height: 24,
                  padding: 0,
                  fontSize: 13,
                  lineHeight: 1,
                  border: revealed ? "1px solid #808080" : "2px solid",
                  borderColor: revealed ? "#808080" : "#fff #808080 #808080 #fff",
                  background: revealed && cell.mine ? "#f00" : "#c0c0c0",
                  cursor: game === "playing" ? "pointer" : "default",
                }}
              >
                {content}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/desktop/apps/MinesweeperApp.test.tsx`
Expected: PASS (4 tests).

Note: `MinesweeperApp` declares no props but is used as `<MinesweeperApp onLaunchApp={...} />`; TypeScript allows passing extra props to a component whose props type is `{}` only if the type is `Record<string, never>`-compatible. To keep the `APP_CONTENT` type (`ComponentType<{ onLaunchApp: (id: AppId) => void }>`) happy, give the component an explicit props type in Step 3 by changing its signature to:

```tsx
export default function MinesweeperApp(_props: { onLaunchApp?: (id: import("@/lib/appRegistry").AppId) => void }) {
```

If the tests in Step 1 (which pass `onLaunchApp={vi.fn()}`) type-check and pass, leave as is. If `tsc` complains in Task 6, apply the explicit props type above.

- [ ] **Step 5: Commit**

```bash
git add src/components/desktop/apps/MinesweeperApp.tsx src/components/desktop/apps/MinesweeperApp.test.tsx
git commit -m "feat: add MinesweeperApp component"
```

---

### Task 6: Wire Minesweeper into the desktop shell

**Files:**
- Create: `public/icons/minesweeper.svg`
- Modify: `src/lib/appRegistry.ts:1` (AppId union) and the `appRegistry` array
- Modify: `src/components/desktop/Desktop.tsx` (import + `APP_CONTENT` map)

- [ ] **Step 1: Create the SVG icon**

```svg
<!-- public/icons/minesweeper.svg -->
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" shape-rendering="crispEdges">
  <rect width="32" height="32" fill="#c0c0c0"/>
  <rect x="1" y="1" width="30" height="30" fill="none" stroke="#ffffff" stroke-width="2"/>
  <rect x="2" y="2" width="28" height="28" fill="none" stroke="#808080" stroke-width="1"/>
  <circle cx="16" cy="17" r="7" fill="#000000"/>
  <rect x="15" y="6" width="2" height="22" fill="#000000"/>
  <rect x="5" y="16" width="22" height="2" fill="#000000"/>
  <rect x="13" y="14" width="3" height="3" fill="#ffffff"/>
</svg>
```

- [ ] **Step 2: Add the AppId and registry entry**

In `src/lib/appRegistry.ts`, extend the union:

```ts
export type AppId = "about" | "experience" | "skills" | "resume" | "contact" | "agents" | "minesweeper";
```

Append to the `appRegistry` array (before the closing `]`):

```ts
  { id: "minesweeper", label: "Minesweeper", iconSrc: "/icons/minesweeper.svg", defaultPosition: { x: 300, y: 100 }, defaultSize: { width: 260, height: 320 } },
```

- [ ] **Step 3: Register the content component in Desktop.tsx**

Add the import near the other app imports:

```tsx
import MinesweeperApp from "./apps/MinesweeperApp";
```

Add to the `APP_CONTENT` map:

```tsx
const APP_CONTENT: Record<Exclude<AppId, "agents">, ComponentType<AppContentProps>> = {
  about: NotepadApp,
  experience: ExperienceApp,
  skills: SkillsApp,
  resume: ResumeApp,
  contact: ContactApp,
  minesweeper: MinesweeperApp,
};
```

- [ ] **Step 4: Type-check, run the full suite, and verify the build**

Run: `npx tsc --noEmit`
Expected: exit 0. (If it complains about `MinesweeperApp` props, apply the explicit props type noted in Task 5 Step 4.)

Run: `npx vitest run`
Expected: all tests pass (existing + new minesweeper tests).

Run: `npm run build` — **only if no `next dev` server is running** (concurrent builds clobber `.next`).
Expected: build succeeds.

- [ ] **Step 5: Manual browser check**

Start (or reuse) the dev server, open the desktop, double-click the **Minesweeper** desktop icon, and confirm: the window opens, first click never loses, numbers/flood-fill work, right-click flags and the counter decrements, hitting a mine reveals all mines and shows 😵, and reset returns to a fresh board.

- [ ] **Step 6: Commit**

```bash
git add public/icons/minesweeper.svg src/lib/appRegistry.ts src/components/desktop/Desktop.tsx
git commit -m "feat: wire Minesweeper into the desktop shell"
```

---

## Notes for the executor

- **DRY/YAGNI:** Only beginner difficulty (9×9, 10 mines) is in scope. Do not add difficulty selectors, high scores, or settings — they are not requested.
- **Immutability:** Every logic function returns a new `Board`; never mutate the input. The component always replaces state via the returned board.
- **No comments** unless a non-obvious WHY needs explaining.
- **First-click safety** excludes the clicked cell *and its 8 neighbours*, so the first reveal always opens a small region (a nicer classic feel than excluding only the clicked cell).
