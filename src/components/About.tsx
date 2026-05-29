"use client";

import { useInView } from "@/hooks/useInView";

export default function About() {
  const { ref, isVisible } = useInView();

  return (
    <section
      id="about"
      className="relative flex items-center bg-orange-50 px-6 md:px-16"
    >
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className={`fade-in max-w-2xl ${isVisible ? "visible" : ""}`}
      >
        <h2 className="font-serif italic text-5xl md:text-6xl text-orange-600 tracking-wide mb-8">
          About
        </h2>
        <p className="text-base text-gray-800 leading-loose max-w-xl mb-6">
          I'm a Senior AI Data Engineer on the Commerce Analytics team at SAP, based in Munich.
          My work sits at the intersection of platform engineering and data — I build and maintain
          the analytics layer of SAP Commerce Cloud v2 itself, not applications on top of it.
          That means the systems other teams depend on: event tracking pipelines, data models,
          and the infrastructure that turns raw commerce activity into insight.
        </p>
        <p className="text-base text-gray-800 leading-loose max-w-xl mb-6">
          Day to day, I work across the full data stack — Java and Python backends, SAP BTP services,
          HANA Cloud, and SAP Analytics Cloud. I've built ETL pipelines that move data reliably at scale,
          designed data models that hold up under real analytical load, and recently added AI to the mix:
          summarization, forecasting, and anomaly detection running in production.
        </p>
        <p className="text-base text-orange-400 leading-loose max-w-xl mb-8">
          I care about correctness, reliability, and understanding how things actually work —
          not just shipping something that looks right. 10+ years in, I still find the problems interesting.
        </p>
        <a
          href="/resume.pdf"
          download
          className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white text-xs font-bold tracking-wide rounded-lg hover:bg-orange-700 transition-colors"
        >
          Download Resume ↓
        </a>
      </div>

      <span className="absolute bottom-6 left-6 md:left-16 text-xs text-orange-200 tracking-widest">
        02 / 05
      </span>
    </section>
  );
}
