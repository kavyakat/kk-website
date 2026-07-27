"use client";

import { useEffect, useRef, useState } from "react";
import type { Character } from "@/lib/agents/characters";
import type { WindowState } from "@/hooks/useWindowManager";
import Avatar from "./apps/chat/Avatar";

const CORNER_SIZE = 80;
export const DOCK_SIZE = 32;
const TASKBAR_H = 30;

const MOTION: Record<Character["id"], { ms: number; easing: string; anim: string }> = {
  clippy: { ms: 1400, easing: "cubic-bezier(0.28,0.84,0.42,1)", anim: "buddyHop" },
  merlin: { ms: 1550, easing: "cubic-bezier(0.4,0,0.2,1)", anim: "buddyFly" },
  rover: { ms: 1000, easing: "cubic-bezier(0.3,0.1,0.3,1)", anim: "buddyRun" },
  genius: { ms: 1250, easing: "cubic-bezier(0.4,0,0.2,1)", anim: "buddyFloat" },
};

interface DesktopBuddyProps {
  character: Character;
  agents: WindowState | undefined;
  onOpen: () => void;
}

export default function DesktopBuddy({ character, agents, onOpen }: DesktopBuddyProps) {
  const [viewport, setViewport] = useState({ w: 0, h: 0 });
  const [flying, setFlying] = useState(false);
  const [tripId, setTripId] = useState(0);
  const active = !!agents?.open && !agents.minimized;
  const maximized = !!agents?.maximized;
  const [display, setDisplay] = useState({ active, maximized });
  const signature = `${active}:${maximized}`;
  const prevSignature = useRef(signature);
  const motion = MOTION[character.id];

  useEffect(() => {
    const measure = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    if (prevSignature.current === signature) return;
    prevSignature.current = signature;
    setFlying(true);
    setTripId((n) => n + 1);
    const raf = requestAnimationFrame(() => setDisplay({ active, maximized }));
    const t = setTimeout(() => setFlying(false), motion.ms + 100);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [signature, active, maximized, motion.ms]);

  if (!viewport.w) return null;

  const target =
    display.active && agents
      ? {
          left: (display.maximized ? 0 : agents.position.x) + 9,
          top: (display.maximized ? 0 : agents.position.y) + 30,
          size: DOCK_SIZE,
        }
      : {
          left: viewport.w - CORNER_SIZE - 24,
          top: viewport.h - TASKBAR_H - CORNER_SIZE - 18,
          size: CORNER_SIZE,
        };

  const atRest = !active && !flying;

  const zIndex = flying ? 1000 : display.active && agents ? agents.zIndex + 1 : 0;

  const innerAnimation = flying
    ? `${motion.anim} ${motion.ms}ms ${motion.easing}`
    : atRest
      ? "buddyBob 2.4s ease-in-out infinite"
      : undefined;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open chat with ${character.name}`}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      style={{
        position: "fixed",
        left: target.left,
        top: target.top,
        width: target.size,
        height: target.size,
        zIndex,
        cursor: "pointer",
        transition: flying
          ? `left ${motion.ms}ms ${motion.easing}, top ${motion.ms}ms ${motion.easing}, width ${motion.ms}ms ${motion.easing}, height ${motion.ms}ms ${motion.easing}`
          : "none",
      }}
    >
      <div
        key={tripId}
        style={{
          width: "100%",
          height: "100%",
          animation: innerAnimation,
          filter: !active ? "drop-shadow(1px 2px 2px rgba(0,0,0,0.4))" : undefined,
        }}
      >
        <Avatar character={character} size={target.size} />
      </div>

      {atRest && (
        <div
          style={{
            position: "absolute",
            right: "100%",
            bottom: 12,
            marginRight: 8,
            whiteSpace: "nowrap",
            background: "#ffffe1",
            border: "1px solid #000",
            padding: "4px 8px",
            fontSize: 11,
            color: "#000",
            boxShadow: "2px 2px 0 rgba(0,0,0,0.25)",
          }}
        >
          Click me to chat!
        </div>
      )}
    </div>
  );
}
