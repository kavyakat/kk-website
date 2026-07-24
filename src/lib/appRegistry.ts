export type AppId =
  | "about"
  | "experience"
  | "skills"
  | "resume"
  | "contact"
  | "agents"
  | "minesweeper"
  | "solitaire"
  | "terminal"
  | "settings"
  | "find"
  | "help";

export interface AppDefinition {
  id: AppId;
  label: string;
  iconSrc: string;
  defaultPosition: { x: number; y: number };
  defaultSize: { width: number; height: number };
  hidden?: boolean;
}

export const appRegistry: AppDefinition[] = [
  { id: "about", label: "About.txt", iconSrc: "/icons/about.png", defaultPosition: { x: 140, y: 90 }, defaultSize: { width: 360, height: 260 } },
  { id: "experience", label: "Experience", iconSrc: "/icons/experience.png", defaultPosition: { x: 200, y: 120 }, defaultSize: { width: 480, height: 360 } },
  { id: "skills", label: "System Properties", iconSrc: "/icons/skills.png", defaultPosition: { x: 260, y: 150 }, defaultSize: { width: 440, height: 380 } },
  { id: "resume", label: "Resume.pdf", iconSrc: "/icons/resume.png", defaultPosition: { x: 320, y: 80 }, defaultSize: { width: 500, height: 620 } },
  { id: "contact", label: "Contact.exe", iconSrc: "/icons/contact.png", defaultPosition: { x: 180, y: 200 }, defaultSize: { width: 420, height: 320 } },
  { id: "agents", label: "About Kavya", iconSrc: "/icons/agents.png", defaultPosition: { x: 240, y: 60 }, defaultSize: { width: 400, height: 480 } },
  { id: "minesweeper", label: "Minesweeper", iconSrc: "/icons/minesweeper.svg", defaultPosition: { x: 300, y: 100 }, defaultSize: { width: 250, height: 322 } },
  { id: "solitaire", label: "Solitaire", iconSrc: "/icons/solitaire.svg", defaultPosition: { x: 120, y: 60 }, defaultSize: { width: 480, height: 440 } },
  { id: "terminal", label: "MS-DOS Prompt", iconSrc: "/icons/terminal.svg", defaultPosition: { x: 160, y: 70 }, defaultSize: { width: 540, height: 380 }, hidden: true },
  { id: "settings", label: "Display Properties", iconSrc: "/icons/settings.svg", defaultPosition: { x: 220, y: 90 }, defaultSize: { width: 400, height: 380 }, hidden: true },
  { id: "find", label: "Find: All Files", iconSrc: "/icons/find.svg", defaultPosition: { x: 260, y: 110 }, defaultSize: { width: 440, height: 320 }, hidden: true },
  { id: "help", label: "Help", iconSrc: "/icons/help.svg", defaultPosition: { x: 300, y: 130 }, defaultSize: { width: 420, height: 340 }, hidden: true },
];
