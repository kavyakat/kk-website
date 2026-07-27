"use client";

import { useState, type ComponentType } from "react";
import { appRegistry, type AppId } from "@/lib/appRegistry";
import { useWindowManager } from "@/hooks/useWindowManager";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useAgentChat } from "@/hooks/useAgentChat";
import { useTheme } from "@/hooks/useTheme";
import { useCharacter } from "@/hooks/useCharacter";
import BootSequence from "./BootSequence";
import ShutdownSequence from "./ShutdownSequence";
import DesktopIcons from "./DesktopIcons";
import DesktopBuddy from "./DesktopBuddy";
import Taskbar from "./Taskbar";
import Window from "./Window";
import NotepadApp from "./apps/NotepadApp";
import ExperienceApp from "./apps/ExperienceApp";
import SkillsApp from "./apps/SkillsApp";
import ResumeApp from "./apps/ResumeApp";
import ContactApp from "./apps/ContactApp";
import AgentChatApp from "./apps/AgentChatApp";
import MinesweeperApp from "./apps/MinesweeperApp";
import SolitaireApp from "./apps/SolitaireApp";
import TerminalApp from "./apps/TerminalApp";
import FindApp from "./apps/FindApp";
import HelpApp from "./apps/HelpApp";

type AppContentProps = { onLaunchApp: (id: AppId) => void; onClose?: () => void };

const APP_CONTENT: Record<Exclude<AppId, "agents">, ComponentType<AppContentProps>> = {
  about: NotepadApp,
  experience: ExperienceApp,
  skills: SkillsApp,
  resume: ResumeApp,
  contact: ContactApp,
  minesweeper: MinesweeperApp,
  solitaire: SolitaireApp,
  terminal: TerminalApp,
  find: FindApp,
  help: HelpApp,
};

type Phase = "boot" | "running" | "shutdown";

export default function Desktop() {
  const [phase, setPhase] = useState<Phase>("boot");
  const isMobile = useIsMobile();
  const chat = useAgentChat();
  const { theme } = useTheme();
  const { character, setCharacter } = useCharacter();
  const { windows, openWindow, closeWindow, minimizeWindow, focusWindow, moveWindow, resizeWindow, toggleMaximize } =
    useWindowManager();

  if (phase === "boot") {
    return <BootSequence onComplete={() => setPhase("running")} />;
  }

  if (phase === "shutdown") {
    return <ShutdownSequence onReboot={() => setPhase("boot")} />;
  }

  const openStates = Object.entries(windows).filter(([, w]) => w.open && !w.minimized);
  const maxZ = openStates.length ? Math.max(...openStates.map(([, w]) => w.zIndex)) : 0;

  const launch = (id: AppId) => {
    const app = appRegistry.find((a) => a.id === id)!;
    openWindow(id, { position: app.defaultPosition, size: app.defaultSize });
  };

  return (
    <div
      data-theme={theme}
      style={{
        position: "relative",
        width: "100%",
        height: "100dvh",
        background:
          theme === "winxp"
            ? "#5a8bd6 url(/wallpapers/bliss.jpg) center/cover no-repeat"
            : "#008080",
        overflow: "hidden",
      }}
    >
      <DesktopIcons isMobile={isMobile} onOpen={launch} />

      {appRegistry.map((app) => {
        const state = windows[app.id];
        if (!state || !state.open || state.minimized) return null;
        return (
          <Window
            key={app.id}
            title={app.label}
            isFocused={state.zIndex === maxZ}
            isMobile={isMobile}
            maximized={state.maximized}
            position={state.position}
            size={state.size}
            onFocus={() => focusWindow(app.id)}
            onClose={() => closeWindow(app.id)}
            onMinimize={() => minimizeWindow(app.id)}
            onToggleMaximize={() => toggleMaximize(app.id)}
            onMove={(pos) => moveWindow(app.id, pos)}
            onResize={(size) => resizeWindow(app.id, size)}
          >
            {app.id === "agents" ? (
              <AgentChatApp
                onLaunchApp={launch}
                character={character}
                onChangeCharacter={setCharacter}
                messages={chat.messages}
                sending={chat.sending}
                resting={chat.resting}
                send={chat.send}
              />
            ) : (
              (() => {
                const Content = APP_CONTENT[app.id];
                return <Content onLaunchApp={launch} onClose={() => closeWindow(app.id)} />;
              })()
            )}
          </Window>
        );
      })}

      {!isMobile && <DesktopBuddy character={character} agents={windows.agents} onOpen={() => launch("agents")} />}

      <Taskbar isMobile={isMobile} windows={windows} onSelectApp={launch} onShutDown={() => setPhase("shutdown")} />
    </div>
  );
}
