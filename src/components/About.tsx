"use client";

import { useInView } from "@/hooks/useInView";

export default function About() {
  const { ref, isVisible } = useInView();

  return (
    <section
      id="about"
      className="relative flex items-center bg-gray-50 px-6 md:px-16"
    >
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className={`fade-in max-w-2xl ${isVisible ? "visible" : ""}`}
      >
        <h2 className="font-serif italic text-5xl md:text-6xl text-gray-900 tracking-wide mb-8">
          About
        </h2>
        <p className="text-sm text-gray-600 leading-loose max-w-xl mb-10">
          Senior AI Data Engineer and full-stack developer with 10+ years of experience
          across the SAP ecosystem. I specialise in building large-scale analytical
          solutions, high-performance data pipelines, and AI-driven insights — currently
          on the SAP Commerce Cloud team in Munich, where I work across SAP BTP, HANA
          Cloud, SAP Analytics Cloud, and Cloud Application Programming (CAP).
        </p>
        <div className="flex gap-4 flex-wrap">
          {[
            { label: "Role", value: "Senior AI Data Engineer" },
            { label: "Company", value: "SAP Commerce Cloud" },
            { label: "Location", value: "Munich, Germany" },
          ].map((chip) => (
            <div
              key={chip.label}
              className="px-4 py-3 bg-white border border-gray-200 rounded-lg"
            >
              <p className="text-xs text-gray-400 mb-1">{chip.label}</p>
              <p className="text-sm text-gray-700">{chip.value}</p>
            </div>
          ))}
        </div>
      </div>

      <span className="absolute bottom-6 left-6 md:left-16 text-xs text-gray-200 tracking-widest">
        02 / 05
      </span>
    </section>
  );
}
