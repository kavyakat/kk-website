"use client";

import { appRegistry, type AppId } from "@/lib/appRegistry";
import DesktopIcon from "./DesktopIcon";

interface DesktopIconsProps {
  isMobile: boolean;
  onOpen: (id: AppId) => void;
}

export default function DesktopIcons({ isMobile, onOpen }: DesktopIconsProps) {
  return (
    <div
      style={
        isMobile
          ? { display: "grid", gridTemplateColumns: "repeat(3, auto)", gap: 8, padding: 16, position: "absolute", top: 0, left: 0, alignContent: "start" }
          : { position: "absolute", top: 16, left: 16, display: "flex", flexDirection: "column", gap: 22 }
      }
    >
      {appRegistry.filter((app) => !app.hidden).map((app) => (
        <DesktopIcon key={app.id} label={app.label} iconSrc={app.iconSrc} xpIconSrc={app.xpIconSrc} isMobile={isMobile} onOpen={() => onOpen(app.id)} />
      ))}
    </div>
  );
}
