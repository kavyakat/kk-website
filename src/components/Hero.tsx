"use client";

import { useInView } from "@/hooks/useInView";

export default function Hero() {
  const { ref, isVisible } = useInView();

  const scrollToContact = () => {
    const el = document.getElementById("contact");
    const container = document.getElementById("scroll-container");
    if (el && container) {
      container.scrollTo({ top: el.offsetTop, behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      className="relative flex items-center bg-white px-6 md:px-16"
    >
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className={`fade-in max-w-2xl ${isVisible ? "visible" : ""}`}
      >
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">
          Software Developer · SAP
        </p>
        <h1 className="text-7xl md:text-8xl font-bold text-gray-900 leading-none tracking-tight mb-6">
          Kavya<br />Kathuria
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed max-w-md mb-8">
          Building analytics infrastructure for SAP Commerce Cloud.
          Event-driven systems, data pipelines, platform engineering.
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={scrollToContact}
            className="px-5 py-2.5 bg-gray-900 text-white text-xs font-medium rounded hover:bg-gray-700 transition-colors"
          >
            Get in touch ↓
          </button>
          <a
            href="https://github.com/kavyakat"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 border border-gray-200 text-gray-600 text-xs rounded hover:border-gray-400 hover:text-gray-900 transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/kavyakathuria"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 border border-gray-200 text-gray-600 text-xs rounded hover:border-gray-400 hover:text-gray-900 transition-colors"
          >
            LinkedIn
          </a>
        </div>
      </div>

      <span className="absolute bottom-6 left-6 md:left-16 text-xs text-gray-200 tracking-widest">
        01 / 05
      </span>
    </section>
  );
}
