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
        <p className="text-base text-gray-700 leading-loose max-w-xl mb-6">
          Senior AI Data Engineer and full-stack developer with 10+ years in the SAP
          ecosystem. I build large-scale analytical solutions, high-performance data
          pipelines, and AI-driven insights — currently on the SAP Commerce Cloud team
          in Munich, working across SAP BTP, HANA Cloud, SAP Analytics Cloud, and CAP.
        </p>
        <p className="text-base text-gray-400 leading-loose max-w-xl">
          Strong ownership, clean engineering, and a habit of driving projects from
          whiteboard to production. B.Tech in Computer Science, Manipal Institute of Technology.
        </p>
      </div>

      <span className="absolute bottom-6 left-6 md:left-16 text-xs text-gray-200 tracking-widest">
        02 / 05
      </span>
    </section>
  );
}
