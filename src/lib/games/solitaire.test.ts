import { describe, it, expect } from "vitest";
import {
  createDeck,
  color,
  shuffle,
  deal,
  drawFromStock,
  canMoveToFoundation,
  canMoveToTableau,
  isValidSequence,
  moveToTableau,
  moveToFoundation,
  findFoundationIndex,
  isWon,
  SUITS,
  RANKS,
  type Card,
  type GameState,
  type Suit,
  type PileId,
} from "./solitaire";

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
        [card("hearts", 8), card("spades", 7), card("diamonds", 6)], // grab the black 7 -> moves 7,6
        [card("diamonds", 8)], // red 8 accepts black 7
        [], [], [], [], [],
      ],
    });
    const next = moveToTableau(state, { kind: "tableau", index: 0 }, "spades-7", 1)!;
    expect(next.tableau[1].map((c) => c.id)).toEqual(["diamonds-8", "spades-7", "diamonds-6"]);
    expect(next.tableau[0].map((c) => c.id)).toEqual(["hearts-8"]);
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
