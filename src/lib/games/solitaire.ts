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
