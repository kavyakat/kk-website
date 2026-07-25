# Klondike Solitaire Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a playable Klondike Solitaire (draw-1) as a Windows-98 desktop app on the `win98-redesign` branch.

**Architecture:** Pure, immutable game logic in `src/lib/games/solitaire.ts` (no React, fully unit-tested) models the deck, deal, stock draw/recycle, move validation, and move application with auto-flip. A `SolitaireApp` client component owns the `GameState`, renders the stock/waste/4 foundations/7 tableau columns as Win98-styled cards (CSS + Unicode suit glyphs, no image assets), and wires interaction via native HTML5 drag-and-drop plus a double-click-to-foundation shortcut and a "Deal" reset. The app is surfaced by adding it to `appRegistry` (auto-appears in desktop icons, taskbar, and Start → Programs) and to the `APP_CONTENT` map in `Desktop.tsx`. A hand-written SVG icon avoids any binary asset.

**Tech Stack:** Next.js 14 (App Router), TypeScript, React 18 client components, 98.css styling via inline styles, Vitest 4 + React Testing Library + jsdom. Run tests with `npx vitest run <path>`; the `@` alias maps to `./src`.

**Rules modelled (standard Klondike, draw-1):**
- 52-card deck, 4 suits (♠ spades, ♥ hearts, ♦ diamonds, ♣ clubs), ranks 1 (Ace) … 13 (King). Hearts/diamonds are red, spades/clubs black.
- Deal: 7 tableau columns; column `i` (0-based) gets `i+1` cards, only the top card face-up. Remaining 24 cards form the face-down stock. Waste and the 4 foundations start empty.
- Stock click draws 1 card to the waste (face-up). When the stock is empty, clicking recycles the waste back into the stock (face-down, order reset) and empties the waste.
- Foundation build: empty foundation accepts only an Ace; otherwise same suit, ascending by one. Only a single card may move to a foundation at a time.
- Tableau build: empty column accepts only a King; otherwise the moved card must be opposite color and exactly one rank lower than the destination's top card. A face-up descending alternating-color run may be moved together.
- After lifting cards off a tableau column, if the new top card is face-down it flips face-up.
- Win when all four foundations hold 13 cards.

**File structure:**
- Create `src/lib/games/solitaire.ts` — all pure logic and types.
- Create `src/lib/games/solitaire.test.ts` — unit tests.
- Create `src/components/desktop/apps/SolitaireApp.tsx` — the React app.
- Create `src/components/desktop/apps/SolitaireApp.test.tsx` — component tests.
- Create `public/icons/solitaire.svg` — desktop/taskbar icon.
- Modify `src/lib/appRegistry.ts` — extend `AppId`, append registry entry.
- Modify `src/components/desktop/Desktop.tsx` — import + `APP_CONTENT` entry.

---

### Task 1: Deck, card color, and deterministic shuffle

**Files:**
- Create: `src/lib/games/solitaire.ts`
- Test: `src/lib/games/solitaire.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/games/solitaire.test.ts
import { describe, it, expect } from "vitest";
import { createDeck, color, shuffle, SUITS, type Card } from "./solitaire";

describe("createDeck", () => {
  it("creates 52 unique face-down cards, 13 per suit", () => {
    const deck = createDeck();
    expect(deck.length).toBe(52);
    expect(new Set(deck.map((c) => c.id)).size).toBe(52);
    expect(deck.every((c) => !c.faceUp)).toBe(true);
    for (const suit of SUITS) {
      const ranks = deck.filter((c) => c.suit === suit).map((c) => c.rank).sort((a, b) => a - b);
      expect(ranks).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    }
  });
});

describe("color", () => {
  it("maps hearts/diamonds to red and spades/clubs to black", () => {
    expect(color("hearts")).toBe("red");
    expect(color("diamonds")).toBe("red");
    expect(color("spades")).toBe("black");
    expect(color("clubs")).toBe("black");
  });
});

describe("shuffle", () => {
  it("is a permutation (same multiset of ids) and does not mutate the input", () => {
    const deck = createDeck();
    const ids = deck.map((c) => c.id);
    const shuffled = shuffle(deck, mulberry32(42));
    expect(shuffled.length).toBe(52);
    expect(shuffled.map((c) => c.id).sort()).toEqual([...ids].sort());
    expect(deck.map((c) => c.id)).toEqual(ids); // input untouched
  });

  it("is deterministic for a given rand", () => {
    const a = shuffle(createDeck(), mulberry32(7)).map((c) => c.id);
    const b = shuffle(createDeck(), mulberry32(7)).map((c) => c.id);
    expect(a).toEqual(b);
  });
});

// small seeded PRNG for deterministic tests
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/games/solitaire.test.ts`
Expected: FAIL — cannot find module `./solitaire` / exports undefined.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/games/solitaire.ts
export type Suit = "spades" | "hearts" | "diamonds" | "clubs";
export type CardColor = "red" | "black";

export interface Card {
  id: string;
  suit: Suit;
  rank: number; // 1 = Ace ... 13 = King
  faceUp: boolean;
}

export const SUITS: Suit[] = ["spades", "hearts", "diamonds", "clubs"];
export const RANKS: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

export function color(suit: Suit): CardColor {
  return suit === "hearts" || suit === "diamonds" ? "red" : "black";
}

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ id: `${suit}-${rank}`, suit, rank, faceUp: false });
    }
  }
  return deck;
}

export function shuffle(deck: Card[], rand: () => number = Math.random): Card[] {
  const next = deck.map((c) => ({ ...c }));
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/games/solitaire.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/games/solitaire.ts src/lib/games/solitaire.test.ts
git commit -m "feat: add solitaire deck, color, and shuffle"
```

---

### Task 2: Deal to the initial Klondike layout

**Files:**
- Modify: `src/lib/games/solitaire.ts`
- Test: `src/lib/games/solitaire.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// append to src/lib/games/solitaire.test.ts
import { deal, type GameState } from "./solitaire";

describe("deal", () => {
  it("lays out 7 tableau columns of increasing size with only the top card face-up", () => {
    const state = deal(createDeck());
    expect(state.tableau.length).toBe(7);
    state.tableau.forEach((col, i) => {
      expect(col.length).toBe(i + 1);
      col.forEach((card, idx) => {
        expect(card.faceUp).toBe(idx === col.length - 1);
      });
    });
  });

  it("puts the remaining 24 cards in a face-down stock, with empty waste and foundations", () => {
    const state = deal(createDeck());
    expect(state.stock.length).toBe(24);
    expect(state.stock.every((c) => !c.faceUp)).toBe(true);
    expect(state.waste).toEqual([]);
    expect(state.foundations).toEqual([[], [], [], []]);
  });

  it("uses all 52 cards exactly once", () => {
    const state = deal(createDeck());
    const all = [...state.stock, ...state.waste, ...state.foundations.flat(), ...state.tableau.flat()];
    expect(all.length).toBe(52);
    expect(new Set(all.map((c) => c.id)).size).toBe(52);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/games/solitaire.test.ts`
Expected: FAIL — `deal` / `GameState` not exported.

- [ ] **Step 3: Write minimal implementation**

```ts
// add to src/lib/games/solitaire.ts
export interface GameState {
  stock: Card[];
  waste: Card[];
  foundations: Card[][]; // always length 4
  tableau: Card[][]; // always length 7
}

export function deal(deck: Card[]): GameState {
  const cards = deck.map((c) => ({ ...c, faceUp: false }));
  const tableau: Card[][] = [[], [], [], [], [], [], []];
  let pos = 0;
  for (let col = 0; col < 7; col++) {
    for (let n = 0; n <= col; n++) {
      const card = { ...cards[pos++] };
      card.faceUp = n === col; // last card dealt to the column is face-up
      tableau[col].push(card);
    }
  }
  const stock = cards.slice(pos).map((c) => ({ ...c, faceUp: false }));
  return { stock, waste: [], foundations: [[], [], [], []], tableau };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/games/solitaire.test.ts`
Expected: PASS (all tests so far).

- [ ] **Step 5: Commit**

```bash
git add src/lib/games/solitaire.ts src/lib/games/solitaire.test.ts
git commit -m "feat: add solitaire deal"
```

---

### Task 3: Draw from stock and recycle the waste

**Files:**
- Modify: `src/lib/games/solitaire.ts`
- Test: `src/lib/games/solitaire.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// append to src/lib/games/solitaire.test.ts
import { drawFromStock } from "./solitaire";

describe("drawFromStock", () => {
  it("moves the top stock card to the waste, face-up", () => {
    const state = deal(createDeck());
    const topId = state.stock[state.stock.length - 1].id;
    const next = drawFromStock(state);
    expect(next.stock.length).toBe(23);
    expect(next.waste.length).toBe(1);
    expect(next.waste[next.waste.length - 1].id).toBe(topId);
    expect(next.waste[next.waste.length - 1].faceUp).toBe(true);
  });

  it("recycles the waste back into the stock (face-down) when the stock is empty", () => {
    let state = deal(createDeck());
    // exhaust the stock into the waste
    for (let i = 0; i < 24; i++) state = drawFromStock(state);
    expect(state.stock.length).toBe(0);
    expect(state.waste.length).toBe(24);
    const recycled = drawFromStock(state);
    expect(recycled.stock.length).toBe(24);
    expect(recycled.waste.length).toBe(0);
    expect(recycled.stock.every((c) => !c.faceUp)).toBe(true);
  });

  it("does nothing when both stock and waste are empty", () => {
    const empty: GameState = { stock: [], waste: [], foundations: [[], [], [], []], tableau: [[], [], [], [], [], [], []] };
    expect(drawFromStock(empty)).toEqual(empty);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/games/solitaire.test.ts`
Expected: FAIL — `drawFromStock` not exported.

- [ ] **Step 3: Write minimal implementation**

```ts
// add to src/lib/games/solitaire.ts
export function drawFromStock(state: GameState): GameState {
  if (state.stock.length === 0) {
    if (state.waste.length === 0) return state;
    // recycle: waste becomes the new stock, face-down, order reset
    const stock = [...state.waste].reverse().map((c) => ({ ...c, faceUp: false }));
    return { ...state, stock, waste: [] };
  }
  const stock = state.stock.slice(0, -1);
  const drawn = { ...state.stock[state.stock.length - 1], faceUp: true };
  return { ...state, stock, waste: [...state.waste, drawn] };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/games/solitaire.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/games/solitaire.ts src/lib/games/solitaire.test.ts
git commit -m "feat: add solitaire stock draw and recycle"
```

---

### Task 4: Move validation and sequence checks

**Files:**
- Modify: `src/lib/games/solitaire.ts`
- Test: `src/lib/games/solitaire.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// append to src/lib/games/solitaire.test.ts
import { canMoveToFoundation, canMoveToTableau, isValidSequence } from "./solitaire";

const card = (suit: Suit, rank: number, faceUp = true): Card => ({ id: `${suit}-${rank}`, suit, rank, faceUp });

describe("canMoveToFoundation", () => {
  it("accepts only an Ace onto an empty foundation", () => {
    expect(canMoveToFoundation(card("hearts", 1), [])).toBe(true);
    expect(canMoveToFoundation(card("hearts", 2), [])).toBe(false);
  });

  it("accepts the next rank up of the same suit", () => {
    const foundation = [card("spades", 1)];
    expect(canMoveToFoundation(card("spades", 2), foundation)).toBe(true);
    expect(canMoveToFoundation(card("hearts", 2), foundation)).toBe(false); // wrong suit
    expect(canMoveToFoundation(card("spades", 3), foundation)).toBe(false); // skips a rank
  });
});

describe("canMoveToTableau", () => {
  it("accepts only a King onto an empty column", () => {
    expect(canMoveToTableau(card("spades", 13), [])).toBe(true);
    expect(canMoveToTableau(card("spades", 12), [])).toBe(false);
  });

  it("accepts an opposite-color card one rank lower than the top", () => {
    const col = [card("spades", 7)]; // black 7
    expect(canMoveToTableau(card("hearts", 6), col)).toBe(true); // red 6
    expect(canMoveToTableau(card("clubs", 6), col)).toBe(false); // same color
    expect(canMoveToTableau(card("hearts", 5), col)).toBe(false); // wrong rank
  });
});

describe("isValidSequence", () => {
  it("is true for a descending alternating-color face-up run", () => {
    expect(isValidSequence([card("spades", 7), card("hearts", 6), card("clubs", 5)])).toBe(true);
  });

  it("is false when color repeats or rank does not descend by one", () => {
    expect(isValidSequence([card("spades", 7), card("clubs", 6)])).toBe(false);
    expect(isValidSequence([card("spades", 7), card("hearts", 5)])).toBe(false);
  });

  it("is false if any card is face-down", () => {
    expect(isValidSequence([card("spades", 7), card("hearts", 6, false)])).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/games/solitaire.test.ts`
Expected: FAIL — validators not exported.

- [ ] **Step 3: Write minimal implementation**

```ts
// add to src/lib/games/solitaire.ts
export function canMoveToFoundation(card: Card, foundation: Card[]): boolean {
  if (foundation.length === 0) return card.rank === 1;
  const top = foundation[foundation.length - 1];
  return card.suit === top.suit && card.rank === top.rank + 1;
}

export function canMoveToTableau(card: Card, column: Card[]): boolean {
  if (column.length === 0) return card.rank === 13;
  const top = column[column.length - 1];
  return color(card.suit) !== color(top.suit) && card.rank === top.rank - 1;
}

export function isValidSequence(cards: Card[]): boolean {
  for (let i = 0; i < cards.length; i++) {
    if (!cards[i].faceUp) return false;
    if (i > 0) {
      const prev = cards[i - 1];
      const cur = cards[i];
      if (color(prev.suit) === color(cur.suit)) return false;
      if (cur.rank !== prev.rank - 1) return false;
    }
  }
  return true;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/games/solitaire.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/games/solitaire.ts src/lib/games/solitaire.test.ts
git commit -m "feat: add solitaire move validation"
```

---

### Task 5: Apply moves (with auto-flip), find-foundation, and win check

**Files:**
- Modify: `src/lib/games/solitaire.ts`
- Test: `src/lib/games/solitaire.test.ts`

**Design:**
- `PileId` identifies a source or destination pile.
- `moveToTableau(state, from, cardId, destIndex)` lifts the card `cardId` (and, for a tableau source, every card above it) and drops the run on tableau column `destIndex` if `canMoveToTableau(run[0], dest)` and, for a tableau source, `isValidSequence(run)`. Returns a new `GameState`, or `null` if the move is illegal.
- `moveToFoundation(state, from, cardId, destIndex)` moves the single top-most `cardId` to foundation `destIndex` if `canMoveToFoundation`. A tableau source may only move its own top card here (run length must be 1). Returns new state or `null`.
- After removing cards from a tableau source, the new top card auto-flips face-up.
- `findFoundationIndex(state, card)` returns the index of a foundation the card may go to, or `-1` — used by the double-click shortcut in the component.
- `isWon(state)` is true when every foundation holds 13 cards.

- [ ] **Step 1: Write the failing test**

```ts
// append to src/lib/games/solitaire.test.ts
import { moveToTableau, moveToFoundation, findFoundationIndex, isWon, type PileId } from "./solitaire";

function stateWith(overrides: Partial<GameState>): GameState {
  return {
    stock: [],
    waste: [],
    foundations: [[], [], [], []],
    tableau: [[], [], [], [], [], [], []],
    ...overrides,
  };
}

describe("moveToTableau", () => {
  it("moves a valid run between columns and auto-flips the exposed card", () => {
    const hidden = card("clubs", 9, false);
    const state = stateWith({
      tableau: [
        [hidden, card("hearts", 6)], // moving the red 6 exposes the face-down clubs 9
        [card("spades", 7)], // black 7 accepts red 6
        [], [], [], [], [],
      ],
    });
    const from: PileId = { kind: "tableau", index: 0 };
    const next = moveToTableau(state, from, "hearts-6", 1)!;
    expect(next).not.toBeNull();
    expect(next.tableau[1].map((c) => c.id)).toEqual(["spades-7", "hearts-6"]);
    expect(next.tableau[0].map((c) => c.id)).toEqual(["clubs-9"]);
    expect(next.tableau[0][0].faceUp).toBe(true); // auto-flipped
  });

  it("moves a multi-card run from the grabbed card to the end", () => {
    const state = stateWith({
      tableau: [
        [card("spades", 8), card("hearts", 7), card("clubs", 6)], // grab the 7 -> moves 7,6
        [card("diamonds", 8)], // red 8 accepts black 7
        [], [], [], [], [],
      ],
    });
    const next = moveToTableau(state, { kind: "tableau", index: 0 }, "hearts-7", 1)!;
    expect(next.tableau[1].map((c) => c.id)).toEqual(["diamonds-8", "hearts-7", "clubs-6"]);
    expect(next.tableau[0].map((c) => c.id)).toEqual(["spades-8"]);
  });

  it("returns null for an illegal drop", () => {
    const state = stateWith({
      tableau: [[card("hearts", 6)], [card("diamonds", 7)], [], [], [], [], []],
    });
    // red 6 onto red 7 is illegal (same color)
    expect(moveToTableau(state, { kind: "tableau", index: 0 }, "hearts-6", 1)).toBeNull();
  });

  it("moves the waste's top card to a tableau column", () => {
    const state = stateWith({
      waste: [card("clubs", 5)],
      tableau: [[card("hearts", 6)], [], [], [], [], [], []],
    });
    const next = moveToTableau(state, { kind: "waste" }, "clubs-5", 0)!;
    expect(next.waste).toEqual([]);
    expect(next.tableau[0].map((c) => c.id)).toEqual(["hearts-6", "clubs-5"]);
  });
});

describe("moveToFoundation", () => {
  it("moves the waste's top card onto a foundation", () => {
    const state = stateWith({ waste: [card("spades", 1)] });
    const next = moveToFoundation(state, { kind: "waste" }, "spades-1", 0)!;
    expect(next.waste).toEqual([]);
    expect(next.foundations[0].map((c) => c.id)).toEqual(["spades-1"]);
  });

  it("moves a tableau top card and auto-flips beneath it", () => {
    const hidden = card("clubs", 9, false);
    const state = stateWith({
      foundations: [[card("hearts", 1)], [], [], []],
      tableau: [[hidden, card("hearts", 2)], [], [], [], [], [], []],
    });
    const next = moveToFoundation(state, { kind: "tableau", index: 0 }, "hearts-2", 0)!;
    expect(next.foundations[0].map((c) => c.id)).toEqual(["hearts-1", "hearts-2"]);
    expect(next.tableau[0][0].faceUp).toBe(true);
  });

  it("returns null when the foundation rule is violated", () => {
    const state = stateWith({ waste: [card("spades", 2)] });
    expect(moveToFoundation(state, { kind: "waste" }, "spades-2", 0)).toBeNull();
  });

  it("refuses to move a multi-card tableau run to a foundation", () => {
    const state = stateWith({
      tableau: [[card("spades", 2), card("hearts", 1)], [], [], [], [], [], []],
    });
    // grabbing the 2 would also carry the 1 -> not a single card -> null
    expect(moveToFoundation(state, { kind: "tableau", index: 0 }, "spades-2", 0)).toBeNull();
  });
});

describe("findFoundationIndex", () => {
  it("returns a legal foundation index or -1", () => {
    const state = stateWith({ foundations: [[card("spades", 1)], [], [], []] });
    expect(findFoundationIndex(state, card("spades", 2))).toBe(0);
    expect(findFoundationIndex(state, card("hearts", 1))).toBeGreaterThanOrEqual(1);
    expect(findFoundationIndex(state, card("hearts", 5))).toBe(-1);
  });
});

describe("isWon", () => {
  it("is true only when all four foundations hold 13 cards", () => {
    const full = (suit: Suit) => RANKS.map((r) => card(suit, r));
    const won = stateWith({ foundations: [full("spades"), full("hearts"), full("diamonds"), full("clubs")] });
    expect(isWon(won)).toBe(true);
    expect(isWon(stateWith({}))).toBe(false);
  });
});
```

Note: the test file references `RANKS`; add `RANKS` to the existing import from `./solitaire` at the top of the test file.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/games/solitaire.test.ts`
Expected: FAIL — move appliers not exported.

- [ ] **Step 3: Write minimal implementation**

```ts
// add to src/lib/games/solitaire.ts
export type PileId =
  | { kind: "stock" }
  | { kind: "waste" }
  | { kind: "foundation"; index: number }
  | { kind: "tableau"; index: number };

function cloneState(state: GameState): GameState {
  return {
    stock: state.stock.map((c) => ({ ...c })),
    waste: state.waste.map((c) => ({ ...c })),
    foundations: state.foundations.map((p) => p.map((c) => ({ ...c }))),
    tableau: state.tableau.map((p) => p.map((c) => ({ ...c }))),
  };
}

// Lift the run starting at `cardId` off the source pile of `next` (mutated in place).
// Returns the lifted run, or null if the pickup is illegal.
function lift(next: GameState, from: PileId, cardId: string): Card[] | null {
  if (from.kind === "stock") return null;
  if (from.kind === "waste" || from.kind === "foundation") {
    const pile = from.kind === "waste" ? next.waste : next.foundations[from.index];
    const top = pile[pile.length - 1];
    if (!top || top.id !== cardId) return null; // only the top card is movable
    pile.pop();
    return [top];
  }
  // tableau: run from cardId to the end of the column
  const col = next.tableau[from.index];
  const idx = col.findIndex((c) => c.id === cardId);
  if (idx === -1) return null;
  const run = col.slice(idx);
  if (!isValidSequence(run)) return null;
  next.tableau[from.index] = col.slice(0, idx);
  return run;
}

function autoFlip(next: GameState, from: PileId): void {
  if (from.kind !== "tableau") return;
  const col = next.tableau[from.index];
  const top = col[col.length - 1];
  if (top && !top.faceUp) top.faceUp = true;
}

export function moveToTableau(state: GameState, from: PileId, cardId: string, destIndex: number): GameState | null {
  const next = cloneState(state);
  const run = lift(next, from, cardId);
  if (!run) return null;
  if (!canMoveToTableau(run[0], next.tableau[destIndex])) return null;
  next.tableau[destIndex] = [...next.tableau[destIndex], ...run];
  autoFlip(next, from);
  return next;
}

export function moveToFoundation(state: GameState, from: PileId, cardId: string, destIndex: number): GameState | null {
  const next = cloneState(state);
  const run = lift(next, from, cardId);
  if (!run || run.length !== 1) return null;
  if (!canMoveToFoundation(run[0], next.foundations[destIndex])) return null;
  next.foundations[destIndex] = [...next.foundations[destIndex], run[0]];
  autoFlip(next, from);
  return next;
}

export function findFoundationIndex(state: GameState, card: Card): number {
  return state.foundations.findIndex((f) => canMoveToFoundation(card, f));
}

export function isWon(state: GameState): boolean {
  return state.foundations.every((f) => f.length === 13);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/games/solitaire.test.ts`
Expected: PASS (all logic tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/games/solitaire.ts src/lib/games/solitaire.test.ts
git commit -m "feat: add solitaire move application, auto-flip, and win check"
```

---

### Task 6: SolitaireApp component with drag-and-drop

**Files:**
- Create: `src/components/desktop/apps/SolitaireApp.tsx`
- Test: `src/components/desktop/apps/SolitaireApp.test.tsx`

**Interaction contract:**
- On mount, deals a shuffled game.
- Renders the stock (a face-down back or an empty "↻" recycle slot), the waste (top card face-up), 4 foundation slots, and 7 tableau columns of overlapping cards.
- Clicking the stock draws (or recycles). The stock area has `aria-label="stock"`.
- Each face-up card is `draggable`. `onDragStart` records `{ from: PileId, cardId }` via `dataTransfer` and component state. Drop targets are the 7 tableau columns (`aria-label="tableau-${i}"`) and 4 foundations (`aria-label="foundation-${i}"`); `onDrop` calls `moveToTableau` / `moveToFoundation` and, if the result is non-null, updates state. `onDragOver` calls `e.preventDefault()` so the drop is allowed.
- Double-clicking a face-up top card sends it to a legal foundation if one exists (`findFoundationIndex`).
- A "Deal" button (`aria-label="deal"`) starts a fresh shuffled game.
- When `isWon`, a "You win!" message shows.
- Each card element has `data-testid="card-${id}"` and `aria-label="${rankLabel} of ${suit}"` (e.g. "A of spades", "10 of hearts", "K of clubs") for testing.
- Component accepts the standard `onLaunchApp` prop (unused) to satisfy `AppContentProps`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/desktop/apps/SolitaireApp.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SolitaireApp from "./SolitaireApp";

describe("SolitaireApp", () => {
  it("renders the stock, four foundations, and seven tableau columns", () => {
    render(<SolitaireApp onLaunchApp={vi.fn()} />);
    expect(screen.getByLabelText("stock")).toBeInTheDocument();
    for (let i = 0; i < 4; i++) expect(screen.getByLabelText(`foundation-${i}`)).toBeInTheDocument();
    for (let i = 0; i < 7; i++) expect(screen.getByLabelText(`tableau-${i}`)).toBeInTheDocument();
  });

  it("deals 28 cards to the tableau, 24 to the stock, and none face-up beyond column tops", () => {
    render(<SolitaireApp onLaunchApp={vi.fn()} />);
    // 7 columns, tops face-up -> exactly 7 face-up cards visible as draggable at start
    const draggable = screen.getAllByTestId(/^card-/).filter((el) => el.getAttribute("draggable") === "true");
    expect(draggable.length).toBe(7);
  });

  it("draws a card from the stock to the waste on click", () => {
    render(<SolitaireApp onLaunchApp={vi.fn()} />);
    const before = screen.getAllByTestId(/^card-/).filter((el) => el.getAttribute("draggable") === "true").length;
    fireEvent.click(screen.getByLabelText("stock"));
    const after = screen.getAllByTestId(/^card-/).filter((el) => el.getAttribute("draggable") === "true").length;
    expect(after).toBe(before + 1); // the waste card is now face-up and draggable
  });

  it("re-deals a fresh game when Deal is clicked", () => {
    render(<SolitaireApp onLaunchApp={vi.fn()} />);
    fireEvent.click(screen.getByLabelText("stock"));
    fireEvent.click(screen.getByLabelText("deal"));
    const draggable = screen.getAllByTestId(/^card-/).filter((el) => el.getAttribute("draggable") === "true");
    expect(draggable.length).toBe(7); // back to a fresh deal
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/desktop/apps/SolitaireApp.test.tsx`
Expected: FAIL — module `./SolitaireApp` not found.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/components/desktop/apps/SolitaireApp.tsx
"use client";

import { useState } from "react";
import type { AppId } from "@/lib/appRegistry";
import {
  color,
  createDeck,
  deal,
  drawFromStock,
  findFoundationIndex,
  isWon,
  moveToFoundation,
  moveToTableau,
  shuffle,
  type Card,
  type GameState,
  type PileId,
  type Suit,
} from "@/lib/games/solitaire";

const SUIT_GLYPH: Record<Suit, string> = { spades: "♠", hearts: "♥", diamonds: "♦", clubs: "♣" };

function rankLabel(rank: number): string {
  return rank === 1 ? "A" : rank === 11 ? "J" : rank === 12 ? "Q" : rank === 13 ? "K" : String(rank);
}

const CARD_W = 52;
const CARD_H = 72;
const FAN = 18; // vertical offset between stacked tableau cards

function freshGame(): GameState {
  return deal(shuffle(createDeck()));
}

interface DragSource {
  from: PileId;
  cardId: string;
}

export default function SolitaireApp(_props: { onLaunchApp?: (id: AppId) => void }) {
  const [state, setState] = useState<GameState>(freshGame);
  const [drag, setDrag] = useState<DragSource | null>(null);

  const won = isWon(state);

  const onDrawStock = () => setState((s) => drawFromStock(s));

  const startDrag = (from: PileId, cardId: string) => setDrag({ from, cardId });

  const dropOnTableau = (index: number) => {
    if (!drag) return;
    const next = moveToTableau(state, drag.from, drag.cardId, index);
    if (next) setState(next);
    setDrag(null);
  };

  const dropOnFoundation = (index: number) => {
    if (!drag) return;
    const next = moveToFoundation(state, drag.from, drag.cardId, index);
    if (next) setState(next);
    setDrag(null);
  };

  const sendToFoundation = (from: PileId, card: Card) => {
    const idx = findFoundationIndex(state, card);
    if (idx === -1) return;
    const next = moveToFoundation(state, from, card.id, idx);
    if (next) setState(next);
  };

  const allowDrop = (e: React.DragEvent) => e.preventDefault();

  const cardFace = (card: Card, extra?: React.CSSProperties) => {
    const c = color(card.suit);
    return (
      <div
        data-testid={`card-${card.id}`}
        aria-label={`${rankLabel(card.rank)} of ${card.suit}`}
        style={{
          width: CARD_W,
          height: CARD_H,
          boxSizing: "border-box",
          border: "1px solid #000",
          borderRadius: 4,
          background: "#fff",
          color: c === "red" ? "#d40000" : "#000",
          fontSize: 13,
          fontWeight: "bold",
          padding: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          ...extra,
        }}
      >
        <span>
          {rankLabel(card.rank)}
          {SUIT_GLYPH[card.suit]}
        </span>
        <span style={{ alignSelf: "flex-end", transform: "rotate(180deg)" }}>
          {rankLabel(card.rank)}
          {SUIT_GLYPH[card.suit]}
        </span>
      </div>
    );
  };

  const cardBack = (key: string) => (
    <div
      key={key}
      style={{
        width: CARD_W,
        height: CARD_H,
        boxSizing: "border-box",
        border: "1px solid #000",
        borderRadius: 4,
        background: "repeating-linear-gradient(45deg, #000080, #000080 4px, #1084d0 4px, #1084d0 8px)",
      }}
    />
  );

  const emptySlot = (label: string, onDropHere?: () => void, extra?: React.CSSProperties) => (
    <div
      aria-label={label}
      onDragOver={allowDrop}
      onDrop={onDropHere}
      style={{
        width: CARD_W,
        height: CARD_H,
        boxSizing: "border-box",
        border: "1px dashed #ffffff80",
        borderRadius: 4,
        background: "#00808040",
        ...extra,
      }}
    />
  );

  return (
    <div style={{ padding: 8, background: "#008000", minHeight: "100%", color: "#fff", fontSize: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <button aria-label="deal" onClick={() => setState(freshGame())}>
          Deal
        </button>
        {won && <span style={{ fontWeight: "bold" }}>You win! 🎉</span>}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {/* stock */}
        <div aria-label="stock" onClick={onDrawStock} style={{ cursor: "pointer" }}>
          {state.stock.length > 0 ? (
            cardBack("stock-back")
          ) : (
            emptySlot("stock-empty", undefined, { display: "flex", alignItems: "center", justifyContent: "center" })
          )}
        </div>

        {/* waste (top card only, draggable) */}
        <div style={{ width: CARD_W, height: CARD_H }}>
          {state.waste.length > 0 &&
            (() => {
              const top = state.waste[state.waste.length - 1];
              return (
                <div
                  draggable
                  onDragStart={() => startDrag({ kind: "waste" }, top.id)}
                  onDoubleClick={() => sendToFoundation({ kind: "waste" }, top)}
                  style={{ cursor: "grab" }}
                >
                  {cardFace(top)}
                </div>
              );
            })()}
        </div>

        <div style={{ flex: 1 }} />

        {/* foundations */}
        {state.foundations.map((pile, i) => {
          const top = pile[pile.length - 1];
          return (
            <div key={`foundation-${i}`} aria-label={`foundation-${i}`} onDragOver={allowDrop} onDrop={() => dropOnFoundation(i)}>
              {top ? (
                <div draggable onDragStart={() => startDrag({ kind: "foundation", index: i }, top.id)} style={{ cursor: "grab" }}>
                  {cardFace(top)}
                </div>
              ) : (
                emptySlot(`foundation-empty-${i}`)
              )}
            </div>
          );
        })}
      </div>

      {/* tableau */}
      <div style={{ display: "flex", gap: 8 }}>
        {state.tableau.map((col, i) => (
          <div
            key={`tableau-${i}`}
            aria-label={`tableau-${i}`}
            onDragOver={allowDrop}
            onDrop={() => dropOnTableau(i)}
            style={{ width: CARD_W, minHeight: CARD_H, position: "relative" }}
          >
            {col.length === 0 && emptySlot(`tableau-empty-${i}`, undefined, { position: "absolute", top: 0, left: 0 })}
            {col.map((card, idx) =>
              card.faceUp ? (
                <div
                  key={card.id}
                  draggable
                  onDragStart={() => startDrag({ kind: "tableau", index: i }, card.id)}
                  onDoubleClick={() => sendToFoundation({ kind: "tableau", index: i }, card)}
                  style={{ position: "absolute", top: idx * FAN, left: 0, cursor: "grab" }}
                >
                  {cardFace(card)}
                </div>
              ) : (
                <div key={card.id} style={{ position: "absolute", top: idx * FAN, left: 0 }}>
                  {cardBack(`${card.id}-back`)}
                </div>
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/desktop/apps/SolitaireApp.test.tsx`
Expected: PASS (4 tests).

If `tsc` later complains that `SolitaireApp`'s props type does not satisfy `ComponentType<{ onLaunchApp: (id: AppId) => void }>`, the `_props: { onLaunchApp?: (id: AppId) => void }` signature above already matches — no change needed.

- [ ] **Step 5: Commit**

```bash
git add src/components/desktop/apps/SolitaireApp.tsx src/components/desktop/apps/SolitaireApp.test.tsx
git commit -m "feat: add SolitaireApp component with drag-and-drop"
```

---

### Task 7: Wire Solitaire into the desktop shell

**Files:**
- Create: `public/icons/solitaire.svg`
- Modify: `src/lib/appRegistry.ts` (AppId union + registry array)
- Modify: `src/components/desktop/Desktop.tsx` (import + `APP_CONTENT` map)

- [ ] **Step 1: Create the SVG icon**

```svg
<!-- public/icons/solitaire.svg -->
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" shape-rendering="crispEdges">
  <rect width="32" height="32" fill="#008000"/>
  <rect x="5" y="7" width="14" height="19" rx="2" fill="#ffffff" stroke="#000000"/>
  <rect x="12" y="5" width="14" height="19" rx="2" fill="#ffffff" stroke="#000000"/>
  <text x="14" y="14" font-family="serif" font-size="7" fill="#d40000">A</text>
  <text x="18" y="21" font-family="serif" font-size="9" fill="#d40000">♥</text>
</svg>
```

- [ ] **Step 2: Add the AppId and registry entry**

In `src/lib/appRegistry.ts`, extend the union to include `"solitaire"`:

```ts
export type AppId = "about" | "experience" | "skills" | "resume" | "contact" | "agents" | "minesweeper" | "solitaire";
```

Append to the `appRegistry` array (before the closing `]`):

```ts
  { id: "solitaire", label: "Solitaire", iconSrc: "/icons/solitaire.svg", defaultPosition: { x: 120, y: 60 }, defaultSize: { width: 480, height: 440 } },
```

- [ ] **Step 3: Register the content component in Desktop.tsx**

Add the import near the other app imports:

```tsx
import SolitaireApp from "./apps/SolitaireApp";
```

Add to the `APP_CONTENT` map (after the `minesweeper` entry):

```tsx
  minesweeper: MinesweeperApp,
  solitaire: SolitaireApp,
};
```

- [ ] **Step 4: Type-check and run the full suite**

Run: `npx tsc --noEmit`
Expected: exit 0.

Run: `npx vitest run`
Expected: all tests pass (existing + new solitaire tests).

- [ ] **Step 5: Manual browser check**

Start (or reuse) the dev server, open the desktop, double-click the **Solitaire** desktop icon, and confirm: the window opens with a fresh deal; clicking the stock draws to the waste and recycles when empty; dragging a card between tableau columns respects alternating-color descending rules; dragging an Ace to a foundation works and subsequent same-suit ranks stack; double-clicking a playable card sends it to a foundation; face-down cards flip when exposed; "Deal" starts a new game. Check that the window has no scrollbars at the default size (adjust `defaultSize` in the registry if the layout overflows, as was done for Minesweeper).

- [ ] **Step 6: Commit**

```bash
git add public/icons/solitaire.svg src/lib/appRegistry.ts src/components/desktop/Desktop.tsx
git commit -m "feat: wire Solitaire into the desktop shell"
```

---

## Notes for the executor

- **DRY/YAGNI:** Draw-1 Klondike only. Do not add Vegas scoring, draw-3, timed mode, undo, or hints — none are requested.
- **Immutability:** Every logic function returns a new `GameState`; never mutate the input. `cloneState` deep-copies before any in-place edits within a move.
- **No comments** unless a non-obvious WHY needs explaining.
- **Native drag-and-drop** is the chosen interaction (no `@dnd-kit` or other libraries). jsdom does not run real drag gestures, so the component tests exercise deal/draw/re-deal and rely on the pure-logic tests for move correctness; the drag wiring is verified in the manual browser check.
- **98.css button min-width gotcha:** as found while building Minesweeper, 98.css applies `button { min-width: 75px }`. The Solitaire cards are `<div>`s (not buttons), so they are unaffected, but the "Deal" button will be ~75px wide — that is fine.
