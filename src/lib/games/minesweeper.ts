export type CellState = "hidden" | "revealed" | "flagged";

export interface Cell {
  mine: boolean;
  adjacent: number;
  state: CellState;
}

export type Board = Cell[][];

export type GameStatus = "playing" | "won" | "lost";

export const BEGINNER = { rows: 9, cols: 9, mines: 10 } as const;

const NEIGHBOURS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1], [0, 1],
  [1, -1], [1, 0], [1, 1],
];

function inBounds(board: Board, r: number, c: number): boolean {
  return r >= 0 && r < board.length && c >= 0 && c < board[0].length;
}

export function createBoard(rows: number, cols: number): Board {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ mine: false, adjacent: 0, state: "hidden" as CellState }))
  );
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
  return board.map((row) =>
    row.map((cell) => (cell.mine ? { ...cell, state: "revealed" as CellState } : { ...cell }))
  );
}

export function status(board: Board): GameStatus {
  const cells = board.flat();
  if (cells.some((c) => c.mine && c.state === "revealed")) return "lost";
  if (cells.every((c) => c.mine || c.state === "revealed")) return "won";
  return "playing";
}

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
