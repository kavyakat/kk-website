"use client";

import { useInView } from "@/hooks/useInView";
import ScrollHint from "@/components/ScrollHint";

const skills = [
  {
    group: "Languages",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
    tags: ["Java", "Python", "SQL", "GoLang"],
  },
  {
    group: "SAP & Cloud",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
      </svg>
    ),
    tags: ["SAP BTP", "SAP HANA Cloud", "SAP Analytics Cloud", "CAP", "SAP Fiori", "SAP Commerce Cloud"],
  },
  {
    group: "Data & AI",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    ),
    tags: ["Data pipelines", "Data modeling", "AI summarization", "Forecasting", "Anomaly detection"],
  },
  {
    group: "DevOps",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
      </svg>
    ),
    tags: ["Jenkins", "GitHub Actions", "Kubernetes", "Docker", "AWS", "Azure", "GCP"],
  },
];

export default function Skills() {
  const { ref, isVisible } = useInView();

  return (
    <section
      id="skills"
      className="relative flex items-center bg-emerald-50 px-6 md:px-16"
    >
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className={`fade-in max-w-4xl w-full ${isVisible ? "visible" : ""}`}
      >
        <h2 className="font-serif italic text-4xl md:text-6xl text-emerald-700 tracking-wide mb-8 md:mb-10">
          Skills
        </h2>
        <div className="flex flex-col gap-6">
          {skills.map((group) => (
            <div key={group.group} className="flex flex-col md:flex-row md:items-start gap-2 md:gap-6">
              <div className="flex items-center gap-2 text-emerald-700 md:w-32 pt-1 md:shrink-0">
                {group.icon}
                <span className="text-xs font-bold uppercase tracking-wider">{group.group}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-1.5 text-xs font-medium text-emerald-800 border-2 border-emerald-200 rounded-full bg-white hover:border-emerald-600 hover:text-emerald-900 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <ScrollHint targetId="beyond-work" />
    </section>
  );
}
