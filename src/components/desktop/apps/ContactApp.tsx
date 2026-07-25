import { contactLinks } from "@/data/content";

export default function ContactApp() {
  return (
    <div style={{ padding: 12, fontSize: 12, color: "#000" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <span style={{ fontWeight: "bold", width: 40 }}>To:</span>
        <span>{contactLinks.email}</span>
      </div>
      <div style={{ borderTop: "1px solid #808080", paddingTop: 10 }}>
        <p>Interested in working together or just want to say hello? My inbox is open.</p>
        <p style={{ marginTop: 12 }}>
          <a href={`mailto:${contactLinks.email}`}>Email me</a>
          {" · "}
          <a href={contactLinks.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          {" · "}
          <a href={contactLinks.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        </p>
      </div>
    </div>
  );
}
