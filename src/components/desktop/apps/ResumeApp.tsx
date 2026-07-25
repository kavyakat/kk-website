import { resumePath } from "@/data/content";

export default function ResumeApp() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", gap: 8, padding: 8, borderBottom: "1px solid #808080", background: "#c0c0c0" }}>
        <a href={resumePath} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
          <button style={{ color: "#000", fontSize: 11, padding: "4px 12px" }}>Open in New Tab</button>
        </a>
        <a href={resumePath} download="Kavya Kathuria Resume.pdf" style={{ textDecoration: "none" }}>
          <button style={{ color: "#000", fontSize: 11, padding: "4px 12px" }}>Download</button>
        </a>
      </div>
      <iframe title="Resume" src={resumePath} style={{ flex: 1, width: "100%", border: "none" }} />
    </div>
  );
}
