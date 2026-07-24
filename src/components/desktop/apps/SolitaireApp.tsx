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

  const cardFace = (card: Card, interaction?: React.HTMLAttributes<HTMLDivElement> & { draggable?: boolean; key?: string }, extra?: React.CSSProperties) => {
    const c = color(card.suit);
    const { key, ...rest } = interaction ?? {};
    return (
      <div
        key={key}
        data-testid={`card-${card.id}`}
        aria-label={`${rankLabel(card.rank)} of ${card.suit}`}
        {...rest}
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
              return cardFace(
                top,
                {
                  draggable: true,
                  onDragStart: () => startDrag({ kind: "waste" }, top.id),
                  onDoubleClick: () => sendToFoundation({ kind: "waste" }, top),
                },
                { cursor: "grab" }
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
                cardFace(
                  top,
                  { draggable: true, onDragStart: () => startDrag({ kind: "foundation", index: i }, top.id) },
                  { cursor: "grab" }
                )
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
                cardFace(
                  card,
                  {
                    key: card.id,
                    draggable: true,
                    onDragStart: () => startDrag({ kind: "tableau", index: i }, card.id),
                    onDoubleClick: () => sendToFoundation({ kind: "tableau", index: i }, card),
                  } as React.HTMLAttributes<HTMLDivElement> & { draggable?: boolean; key?: string },
                  { position: "absolute", top: idx * FAN, left: 0, cursor: "grab" }
                )
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
