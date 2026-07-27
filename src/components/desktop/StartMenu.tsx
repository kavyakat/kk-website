"use client";

import { useState, type ReactNode } from "react";
import { appRegistry, type AppId } from "@/lib/appRegistry";
import { useTheme } from "@/hooks/useTheme";

interface StartMenuProps {
  isMobile: boolean;
  onSelect: (id: AppId) => void;
  onShutDown: () => void;
  onClose: () => void;
}

function MenuItem({
  icon,
  iconSrc,
  label,
  arrow,
  onClick,
  onMouseEnter,
}: {
  icon?: string;
  iconSrc?: string;
  label: string;
  arrow?: boolean;
  onClick: () => void;
  onMouseEnter?: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      role="menuitem"
      onMouseEnter={() => {
        setHover(true);
        onMouseEnter?.();
      }}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        textAlign: "left",
        padding: "5px 14px 5px 8px",
        border: "none",
        background: hover ? "#000080" : "transparent",
        color: hover ? "#fff" : "#000",
        fontSize: 12,
        cursor: "pointer",
      }}
    >
      {iconSrc ? (
        <img src={iconSrc} alt="" width={20} height={20} style={{ imageRendering: "pixelated" }} />
      ) : (
        <span style={{ fontSize: 16, width: 20, textAlign: "center", lineHeight: 1 }}>{icon}</span>
      )}
      <span style={{ flex: 1 }}>{label}</span>
      {arrow && <span style={{ fontSize: 10 }}>▶</span>}
    </button>
  );
}

const Separator = () => (
  <div style={{ height: 0, borderTop: "1px solid #808080", borderBottom: "1px solid #fff", margin: "3px 4px" }} />
);

function Panel({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: "#c0c0c0",
        border: "2px solid",
        borderColor: "#fff #000 #000 #fff",
        boxShadow: "2px 2px 0 rgba(0,0,0,0.4)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default function StartMenu({ isMobile, onSelect, onShutDown, onClose }: StartMenuProps) {
  const [programsOpen, setProgramsOpen] = useState(false);
  const { theme } = useTheme();
  const [gamesOpen, setGamesOpen] = useState(false);
  const [allProgramsOpen, setAllProgramsOpen] = useState(false);
  const programApps = appRegistry.filter((a) => !a.hidden && a.group !== "games");
  const gameApps = appRegistry.filter((a) => a.group === "games");

  const pick = (id: AppId) => {
    onSelect(id);
    onClose();
  };

  if (isMobile) {
    return (
      <div role="menu" style={{ position: "fixed", inset: 0, background: "#c0c0c0", zIndex: 200, padding: 12, overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#000" }}>Programs</span>
          <button onClick={onClose} style={{ color: "#000" }}>Close</button>
        </div>
        {programApps.map((app) => (
          <MenuItem key={app.id} iconSrc={app.iconSrc} label={app.label} onClick={() => pick(app.id)} />
        ))}
        <div style={{ fontWeight: 700, fontSize: 13, color: "#000", margin: "8px 0 4px 8px" }}>Games</div>
        {gameApps.map((g) => (
          <MenuItem key={g.id} iconSrc={g.iconSrc} label={g.label} onClick={() => pick(g.id)} />
        ))}
        <Separator />
        <MenuItem icon="🔌" label="Shut Down..." onClick={() => { onClose(); onShutDown(); }} />
      </div>
    );
  }

  if (theme === "winxp") {
    const XpItem = ({ app }: { app: (typeof appRegistry)[number] }) => (
      <button
        role="menuitem"
        onClick={() => pick(app.id)}
        style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", border: "none", background: "transparent", padding: "5px 10px", fontSize: 12, color: "#00157f", cursor: "pointer" }}
      >
        <img src={app.xpIconSrc ?? app.iconSrc} alt="" width={22} height={22} />
        {app.label}
      </button>
    );
    const rightIds: AppId[] = ["resume", "contact", "find", "help"];
    const rightApps = rightIds.map((id) => appRegistry.find((a) => a.id === id)!).filter(Boolean);
    const pinned = programApps.filter((a) => ["agents", "experience", "about"].includes(a.id));

    return (
      <div role="menu" style={{ position: "absolute", bottom: 34, left: 0, width: 300, zIndex: 200, borderRadius: "8px 8px 0 0", overflow: "hidden", boxShadow: "3px -3px 14px rgba(0,0,0,.5)", fontFamily: "Tahoma, sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", color: "#fff", fontWeight: "bold", fontSize: 14, background: "linear-gradient(180deg,#1b52c8,#2f6fd6)", borderBottom: "2px solid #eec14a" }}>
          <img src="/icons/xp/user.png" alt="" width={30} height={30} style={{ borderRadius: 4, border: "1px solid #fff" }} />
          Kavya Kathuria
        </div>
        <div style={{ display: "flex", background: "#fff" }}>
          <div style={{ width: 178, padding: "6px 0", background: "#fff" }}>
            {pinned.map((a) => <XpItem key={a.id} app={a} />)}
            <Separator />
            <div style={{ position: "relative" }}>
              <button
                role="menuitem"
                onClick={() => setAllProgramsOpen((v) => !v)}
                onMouseEnter={() => setAllProgramsOpen(true)}
                style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", border: "none", background: "transparent", padding: "5px 10px", fontSize: 12, fontWeight: "bold", color: "#00157f", cursor: "pointer" }}
              >
                All Programs <span style={{ marginLeft: "auto" }}>▶</span>
              </button>
              {allProgramsOpen && (
                <Panel style={{ position: "absolute", left: "100%", bottom: 0, minWidth: 170, padding: "2px 0" }}>
                  {programApps.map((app) => (
                    <MenuItem key={app.id} iconSrc={app.xpIconSrc ?? app.iconSrc} label={app.label} onClick={() => pick(app.id)} onMouseEnter={() => setGamesOpen(false)} />
                  ))}
                  <div style={{ position: "relative" }}>
                    <MenuItem icon="🎮" label="Games" arrow onClick={() => setGamesOpen((v) => !v)} onMouseEnter={() => setGamesOpen(true)} />
                    {gamesOpen && (
                      <Panel style={{ position: "absolute", left: "100%", top: 0, minWidth: 150, padding: "2px 0" }}>
                        {gameApps.map((g) => <MenuItem key={g.id} iconSrc={g.xpIconSrc ?? g.iconSrc} label={g.label} onClick={() => pick(g.id)} />)}
                      </Panel>
                    )}
                  </div>
                </Panel>
              )}
            </div>
          </div>
          <div style={{ width: 122, padding: "6px 0", background: "linear-gradient(180deg,#d3e5fa,#b6d5f5)" }}>
            {rightApps.map((a) => <XpItem key={a.id} app={a} />)}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 14, padding: "6px 12px", color: "#fff", fontSize: 12, background: "linear-gradient(180deg,#2f6fd6,#1b52c8)" }}>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer" }}>⏻ Log Off</button>
          <button onClick={() => { onClose(); onShutDown(); }} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer" }}>⭘ Turn Off</button>
        </div>
      </div>
    );
  }

  return (
    <div role="menu" style={{ position: "absolute", bottom: 30, left: 0, display: "flex", zIndex: 200 }}>
      <Panel style={{ display: "flex" }}>
        <div
          style={{
            width: 28,
            background: "linear-gradient(180deg, #1084d0, #000080)",
            display: "flex",
            alignItems: "flex-end",
            padding: "10px 0",
          }}
        >
          <div
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              color: "#fff",
              fontSize: 18,
              letterSpacing: 1,
              marginLeft: 5,
              lineHeight: 1,
            }}
          >
            <span style={{ fontWeight: 400 }}>Windows</span> <b>98</b>
          </div>
        </div>

        <div style={{ position: "relative", minWidth: 190, padding: "2px 0" }}>
          <MenuItem icon="📂" label="Programs" arrow onClick={() => setProgramsOpen((v) => !v)} onMouseEnter={() => setProgramsOpen(true)} />
          <MenuItem icon="📄" label="Documents" onClick={() => pick("resume")} onMouseEnter={() => setProgramsOpen(false)} />
          <MenuItem icon="🔍" label="Find" onClick={() => pick("find")} onMouseEnter={() => setProgramsOpen(false)} />
          <MenuItem icon="❓" label="Help" onClick={() => pick("help")} onMouseEnter={() => setProgramsOpen(false)} />
          <MenuItem icon="🏁" label="Run..." onClick={() => pick("terminal")} onMouseEnter={() => setProgramsOpen(false)} />
          <Separator />
          <MenuItem icon="🔌" label="Shut Down..." onClick={() => { onClose(); onShutDown(); }} onMouseEnter={() => setProgramsOpen(false)} />

          {programsOpen && (
            <Panel style={{ position: "absolute", left: "100%", top: 2, minWidth: 180, padding: "2px 0" }}>
              {programApps.map((app) => (
                <MenuItem key={app.id} iconSrc={app.iconSrc} label={app.label} onClick={() => pick(app.id)} onMouseEnter={() => setGamesOpen(false)} />
              ))}
              <div style={{ position: "relative" }}>
                <MenuItem icon="🎮" label="Games" arrow onClick={() => setGamesOpen((v) => !v)} onMouseEnter={() => setGamesOpen(true)} />
                {gamesOpen && (
                  <Panel style={{ position: "absolute", left: "100%", top: 0, minWidth: 150, padding: "2px 0" }}>
                    {gameApps.map((g) => (
                      <MenuItem key={g.id} iconSrc={g.iconSrc} label={g.label} onClick={() => pick(g.id)} />
                    ))}
                  </Panel>
                )}
              </div>
            </Panel>
          )}
        </div>
      </Panel>
    </div>
  );
}
