import { aboutText } from "@/data/content";

export default function NotepadApp() {
  return (
    <div
      style={{
        background: "#fff",
        height: "100%",
        padding: 8,
        fontFamily: "'Courier New', monospace",
        fontSize: 12,
        lineHeight: 1.6,
        color: "#000",
        whiteSpace: "pre-wrap",
      }}
    >
      {aboutText}
    </div>
  );
}
