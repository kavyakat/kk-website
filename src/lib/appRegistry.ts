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
  | "find"
  | "help";

export interface AppDefinition {
  id: AppId;
  label: string;
  iconSrc: string;
  xpIconSrc?: string;
  group?: "games";
  defaultPosition: { x: number; y: number };
  defaultSize: { width: number; height: number };
  hidden?: boolean;
}

export const appRegistry: AppDefinition[] = [
  { id: "about", label: "About.txt", iconSrc: "/icons/about.png", xpIconSrc: "/icons/xp/about.png", defaultPosition: { x: 140, y: 90 }, defaultSize: { width: 360, height: 260 } },
  { id: "experience", label: "Experience", iconSrc: "/icons/experience.png", xpIconSrc: "/icons/xp/experience.png", defaultPosition: { x: 200, y: 120 }, defaultSize: { width: 480, height: 360 } },
  { id: "skills", label: "System Properties", iconSrc: "/icons/skills.png", xpIconSrc: "/icons/xp/skills.png", defaultPosition: { x: 260, y: 150 }, defaultSize: { width: 440, height: 380 } },
  { id: "resume", label: "Resume.pdf", iconSrc: "/icons/resume.png", xpIconSrc: "/icons/xp/resume.png", defaultPosition: { x: 320, y: 80 }, defaultSize: { width: 500, height: 620 } },
  { id: "contact", label: "Contact.exe", iconSrc: "/icons/contact.png", xpIconSrc: "/icons/xp/contact.png", defaultPosition: { x: 180, y: 200 }, defaultSize: { width: 420, height: 320 } },
  { id: "agents", label: "About Kavya", iconSrc: "/icons/agents.png", xpIconSrc: "/icons/xp/agents.png", defaultPosition: { x: 240, y: 60 }, defaultSize: { width: 400, height: 480 } },
  { id: "minesweeper", label: "Minesweeper", iconSrc: "/icons/minesweeper.svg", xpIconSrc: "/icons/xp/minesweeper.png", group: "games", defaultPosition: { x: 300, y: 100 }, defaultSize: { width: 250, height: 322 } },
  { id: "solitaire", label: "Solitaire", iconSrc: "/icons/solitaire.svg", xpIconSrc: "/icons/xp/solitaire.png", group: "games", defaultPosition: { x: 120, y: 60 }, defaultSize: { width: 480, height: 440 } },
  { id: "terminal", label: "MS-DOS Prompt", iconSrc: "/icons/terminal.svg", xpIconSrc: "/icons/terminal.svg", defaultPosition: { x: 160, y: 70 }, defaultSize: { width: 540, height: 380 }, hidden: true },
  { id: "find", label: "Find: All Files", iconSrc: "/icons/find.svg", xpIconSrc: "/icons/xp/search.png", defaultPosition: { x: 260, y: 110 }, defaultSize: { width: 440, height: 320 }, hidden: true },
  { id: "help", label: "Help", iconSrc: "/icons/help.svg", xpIconSrc: "/icons/xp/help.png", defaultPosition: { x: 300, y: 130 }, defaultSize: { width: 420, height: 340 }, hidden: true },
];
