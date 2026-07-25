"use client";

import { useEffect, useState } from "react";
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

function panel(children: React.ReactNode) {
  return (
    <span
      style={{
        fontFamily: "monospace",
        fontSize: 18,
        color: "#f00",
        background: "#000",
        padding: "1px 6px",
        minWidth: 44,
        display: "inline-block",
        textAlign: "right",
        border: "1px solid",
        borderColor: "#808080 #fff #fff #808080",
      }}
    >
      {children}
    </span>
  );
}

export default function MinesweeperApp() {
  const [board, setBoard] = useState<Board>(() => createBoard(BEGINNER.rows, BEGINNER.cols));
  const [placed, setPlaced] = useState(false);
  const [elapsed, setElapsed] = useState(0);

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
  };

  const handleReveal = (r: number, c: number) => {
    if (game !== "playing") return;
    let working = board;
    if (!placed) {
      working = placeMines(board, BEGINNER.mines, r, c);
      setPlaced(true);
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
        <button aria-label="reset" onClick={reset} style={{ fontSize: 18, width: 34, minWidth: 34, height: 30, lineHeight: 1 }}>
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
                  minWidth: 24,
                  boxSizing: "border-box",
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
