export type AppId = "about" | "experience" | "skills" | "resume" | "contact";

export interface AppDefinition {
  id: AppId;
  label: string;
  iconSrc: string;
  defaultPosition: { x: number; y: number };
  defaultSize: { width: number; height: number };
}

export const appRegistry: AppDefinition[] = [
  { id: "about", label: "About.txt", iconSrc: "/icons/about.png", defaultPosition: { x: 140, y: 90 }, defaultSize: { width: 360, height: 260 } },
  { id: "experience", label: "Experience", iconSrc: "/icons/experience.png", defaultPosition: { x: 200, y: 120 }, defaultSize: { width: 480, height: 360 } },
  { id: "skills", label: "System Properties", iconSrc: "/icons/skills.png", defaultPosition: { x: 260, y: 150 }, defaultSize: { width: 440, height: 380 } },
  { id: "resume", label: "Resume.pdf", iconSrc: "/icons/resume.png", defaultPosition: { x: 320, y: 80 }, defaultSize: { width: 500, height: 620 } },
  { id: "contact", label: "Contact.exe", iconSrc: "/icons/contact.png", defaultPosition: { x: 180, y: 200 }, defaultSize: { width: 420, height: 320 } },
];
