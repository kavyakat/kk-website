"use client";

import { useState, type ComponentType } from "react";
import { appRegistry, type AppId } from "@/lib/appRegistry";
import { useWindowManager } from "@/hooks/useWindowManager";
import { useIsMobile } from "@/hooks/useIsMobile";
import BootSequence from "./BootSequence";
import ShutdownSequence from "./ShutdownSequence";
import DesktopIcons from "./DesktopIcons";
import Taskbar from "./Taskbar";
import Window from "./Window";
import NotepadApp from "./apps/NotepadApp";
import ExperienceApp from "./apps/ExperienceApp";
import SkillsApp from "./apps/SkillsApp";
import ResumeApp from "./apps/ResumeApp";
import ContactApp from "./apps/ContactApp";
import AgentChatApp from "./apps/AgentChatApp";

type AppContentProps = { onLaunchApp: (id: AppId) => void };

const APP_CONTENT: Record<AppId, ComponentType<AppContentProps>> = {
  about: NotepadApp,
  experience: ExperienceApp,
  skills: SkillsApp,
  resume: ResumeApp,
  contact: ContactApp,
  agents: AgentChatApp,
};

type Phase = "boot" | "running" | "shutdown";

export default function Desktop() {
  const [phase, setPhase] = useState<Phase>("boot");
  const isMobile = useIsMobile();
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
    <div style={{ position: "relative", width: "100%", height: "100dvh", background: "#008080", overflow: "hidden" }}>
      <DesktopIcons isMobile={isMobile} onOpen={launch} />

      {appRegistry.map((app) => {
        const state = windows[app.id];
        if (!state || !state.open || state.minimized) return null;
        const Content = APP_CONTENT[app.id];
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
            <Content onLaunchApp={launch} />
          </Window>
        );
      })}

      <Taskbar isMobile={isMobile} windows={windows} onSelectApp={launch} onShutDown={() => setPhase("shutdown")} />
    </div>
  );
}
