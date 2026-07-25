import { describe, it, expect } from "vitest";
import {
  createBoard,
  computeAdjacents,
  placeMines,
  reveal,
  revealAllMines,
  status,
  toggleFlag,
  countFlags,
  type Board,
} from "./minesweeper";

function boardFromMines(rows: number, cols: number, mines: Array<[number, number]>): Board {
  const b = createBoard(rows, cols);
  mines.forEach(([r, c]) => (b[r][c].mine = true));
  return computeAdjacents(b);
}

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
  it("counts mines in the 8 neighbours of each non-mine cell", () => {
    const board: Board = createBoard(2, 2);
    board[0][0].mine = true;
    board[0][1].mine = true;
    const result = computeAdjacents(board);
    expect(result[1][0].adjacent).toBe(2);
    expect(result[1][1].adjacent).toBe(2);
  });
});

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

describe("reveal", () => {
  it("reveals a single numbered cell without flooding", () => {
    const board = boardFromMines(3, 3, [[0, 0]]);
    const next = reveal(board, 0, 1);
    expect(next[0][1].state).toBe("revealed");
    expect(next[2][2].state).toBe("hidden");
  });

  it("flood-fills the whole zero region and its numbered border", () => {
    const board = boardFromMines(3, 3, [[0, 0]]);
    const next = reveal(board, 2, 2);
    const hidden = next.flat().filter((c) => c.state === "hidden");
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
    const next = reveal(board, 2, 2);
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
