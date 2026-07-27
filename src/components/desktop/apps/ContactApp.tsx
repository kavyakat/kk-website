"use client";

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
        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
          <button onClick={() => { window.location.href = `mailto:${contactLinks.email}`; }}>
            Email me
          </button>
          <button onClick={() => window.open(contactLinks.github, "_blank", "noopener,noreferrer")}>
            GitHub
          </button>
          <button onClick={() => window.open(contactLinks.linkedin, "_blank", "noopener,noreferrer")}>
            LinkedIn
          </button>
          <button onClick={() => window.open(contactLinks.instagram, "_blank", "noopener,noreferrer")}>
            Instagram
          </button>
        </div>
      </div>
    </div>
  );
}
