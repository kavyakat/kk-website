"use client";

import Image from "next/image";
import { useInView } from "@/hooks/useInView";

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
      className="relative flex items-center bg-emerald-50 px-6 md:px-16 overflow-hidden"
    >
      {/* Background photo */}
      <div className="absolute inset-y-0 right-0 w-1/2 pointer-events-none select-none hidden md:block overflow-hidden">
        <Image
          src="/kavya.jpeg"
          alt=""
          fill
          className="object-cover object-top"
          style={{ opacity: 0.12, filter: "saturate(1.2) contrast(1.05)" }}
          aria-hidden
        />
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to right, #ecfdf5 0%, rgba(236,253,245,0.85) 20%, rgba(236,253,245,0.2) 50%, transparent 100%)"
        }} />
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to bottom, rgba(236,253,245,0.6) 0%, transparent 20%, transparent 80%, rgba(236,253,245,0.6) 100%)"
        }} />
      </div>
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className={`fade-in max-w-2xl w-full ${isVisible ? "visible" : ""}`}
      >
        <h2 className="font-serif italic text-5xl md:text-6xl text-emerald-700 tracking-wide mb-10">
          Skills
        </h2>
        <div className="flex flex-col gap-6">
          {skills.map((group) => (
            <div key={group.group} className="flex items-start gap-6">
              <div className="flex items-center gap-2 text-emerald-700 w-32 pt-1 shrink-0">
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

      <span className="absolute bottom-6 left-6 md:left-16 text-xs text-emerald-200 tracking-widest">
        04 / 05
      </span>
    </section>
  );
}
