"use client";

import { useInView } from "@/hooks/useInView";

const skills = [
  {
    group: "Languages",
    tags: ["Java", "Python", "SQL", "GoLang"],
  },
  {
    group: "SAP & Cloud",
    tags: ["SAP BTP", "SAP HANA Cloud", "SAP Analytics Cloud", "CAP", "SAP Fiori", "SAP Commerce Cloud"],
  },
  {
    group: "Data & AI",
    tags: ["Data pipelines", "Data modeling", "AI summarization", "Forecasting", "Anomaly detection"],
  },
  {
    group: "DevOps",
    tags: ["Jenkins", "GitHub Actions", "Kubernetes", "Docker", "AWS", "Azure", "GCP"],
  },
];

export default function Skills() {
  const { ref, isVisible } = useInView();

  return (
    <section
      id="skills"
      className="relative flex items-center bg-gray-50 px-6 md:px-16"
    >
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className={`fade-in max-w-2xl w-full ${isVisible ? "visible" : ""}`}
      >
        <h2 className="font-serif italic text-5xl md:text-6xl text-gray-900 tracking-wide mb-8">
          Skills
        </h2>
        <div className="flex flex-col gap-5">
          {skills.map((group) => (
            <div key={group.group} className="flex items-start gap-4">
              <span className="text-xs text-gray-400 w-24 pt-1 shrink-0">
                {group.group}
              </span>
              <div className="flex flex-wrap gap-2">
                {group.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs text-gray-600 border border-gray-200 rounded-full bg-white"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <span className="absolute bottom-6 left-6 md:left-16 text-xs text-gray-200 tracking-widest">
        04 / 05
      </span>
    </section>
  );
}
