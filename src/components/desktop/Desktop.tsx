"use client";

import { useState, type ComponentType } from "react";
import { appRegistry, type AppId } from "@/lib/appRegistry";
import { useWindowManager } from "@/hooks/useWindowManager";
import { useIsMobile } from "@/hooks/useIsMobile";
import BootSequence from "./BootSequence";
import DesktopIcons from "./DesktopIcons";
import Taskbar from "./Taskbar";
import Window from "./Window";
import NotepadApp from "./apps/NotepadApp";
import ExperienceApp from "./apps/ExperienceApp";
import SkillsApp from "./apps/SkillsApp";
import ResumeApp from "./apps/ResumeApp";
import ContactApp from "./apps/ContactApp";

const APP_CONTENT: Record<AppId, ComponentType> = {
  about: NotepadApp,
  experience: ExperienceApp,
  skills: SkillsApp,
  resume: ResumeApp,
  contact: ContactApp,
};

export default function Desktop() {
  const [booted, setBooted] = useState(false);
  const isMobile = useIsMobile();
  const { windows, openWindow, closeWindow, minimizeWindow, focusWindow, moveWindow } = useWindowManager();

  if (!booted) {
    return <BootSequence onComplete={() => setBooted(true)} />;
  }

  const openStates = Object.entries(windows).filter(([, w]) => w.open && !w.minimized);
  const maxZ = openStates.length ? Math.max(...openStates.map(([, w]) => w.zIndex)) : 0;

  return (
    <div style={{ position: "relative", width: "100%", height: "100dvh", background: "#008080", overflow: "hidden" }}>
      <DesktopIcons isMobile={isMobile} onOpen={(id) => openWindow(id, appRegistry.find((a) => a.id === id)!.defaultPosition)} />

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
            position={state.position}
            size={app.defaultSize}
            onFocus={() => focusWindow(app.id)}
            onClose={() => closeWindow(app.id)}
            onMinimize={() => minimizeWindow(app.id)}
            onMove={(pos) => moveWindow(app.id, pos)}
          >
            <Content />
          </Window>
        );
      })}

      <Taskbar
        isMobile={isMobile}
        windows={windows}
        onSelectApp={(id) => openWindow(id, appRegistry.find((a) => a.id === id)!.defaultPosition)}
      />
    </div>
  );
}
