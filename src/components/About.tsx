"use client";

import Image from "next/image";
import { useInView } from "@/hooks/useInView";

export default function About() {
  const { ref, isVisible } = useInView();

  return (
    <section
      id="about"
      className="relative flex items-center bg-orange-50 px-6 md:px-16 overflow-hidden"
    >
      {/* Background photo */}
      <div className="absolute inset-y-0 right-0 w-1/2 pointer-events-none select-none hidden md:block overflow-hidden">
        <Image
          src="/kavya.jpeg"
          alt=""
          fill
          className="object-cover object-top"
          style={{ opacity: 0.18, filter: "saturate(1.3) contrast(1.05)" }}
          aria-hidden
        />
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to right, #fff7ed 0%, rgba(255,247,237,0.85) 20%, rgba(255,247,237,0.2) 50%, transparent 100%)"
        }} />
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to bottom, rgba(255,247,237,0.6) 0%, transparent 20%, transparent 80%, rgba(255,247,237,0.6) 100%)"
        }} />
      </div>
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className={`fade-in max-w-2xl ${isVisible ? "visible" : ""}`}
      >
        <h2 className="font-serif italic text-5xl md:text-6xl text-orange-600 tracking-wide mb-8">
          About
        </h2>
        <p className="text-base text-gray-800 leading-loose max-w-xl mb-6">
          I&apos;m a Senior Data Engineer and Software Developer at SAP, based in Munich.
          I build platform-level systems — the kind that other teams depend on but never
          think about. Currently on the Commerce Analytics team, working on the analytics
          layer of SAP Commerce Cloud v2: event tracking infrastructure, data pipelines,
          backend services, and the dashboards and AI features built on top of them.
        </p>
        <p className="text-base text-gray-800 leading-loose max-w-xl mb-6">
          My stack spans Java and Python backends, SAP BTP, HANA Cloud, and SAP Analytics
          Cloud. I&apos;ve taken projects from early design through production — owning the
          engineering end to end, not just a slice of it. More recently, that&apos;s included
          AI: summarization, forecasting, and anomaly detection running in production on
          real commerce data.
        </p>
        <p className="text-base text-orange-400 leading-loose max-w-xl mb-8">
          10+ years in. I care about building things that are correct, reliable, and
          worth maintaining — and I still find the problems interesting.
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
