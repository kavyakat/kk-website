"use client";

import Image from "next/image";
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
      className="relative flex items-center bg-white px-6 md:px-16 overflow-hidden"
    >
      {/* Background photo — color wash, right-anchored */}
      <div className="absolute inset-0 pointer-events-none select-none hidden md:block">
        <Image
          src="/kavya.jpeg"
          alt=""
          fill
          className="object-contain object-right"
          style={{ opacity: 0.28, filter: "saturate(1.5)" }}
          priority
          aria-hidden
        />
        {/* Warm amber tinted fade from left */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to right, #ffffff 0%, #fffaf5 35%, rgba(255,248,240,0.6) 55%, transparent 80%)"
        }} />
      </div>

      {/* Foreground content */}
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className={`fade-in w-full flex items-center justify-between gap-12 relative z-10 ${isVisible ? "visible" : ""}`}
      >
        {/* Text */}
        <div className="max-w-xl">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-[0.2em] mb-5">
            Senior AI Data Engineer · SAP Commerce Cloud
          </p>
          <h1 className="text-[clamp(4rem,9vw,7rem)] font-black text-gray-900 leading-none tracking-tight mb-6">
            Kavya<br />Kathuria
          </h1>
          <p className="text-base text-gray-500 leading-relaxed max-w-md mb-10">
            10+ years building data pipelines, analytical solutions, and AI-driven
            insights across the SAP ecosystem. Based in Munich.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={scrollToContact}
              className="px-6 py-3 bg-gray-900 text-white text-xs font-bold tracking-wide rounded-lg hover:bg-gray-700 transition-colors"
            >
              Get in touch ↓
            </button>
            <a
              href="https://github.com/kavyakat"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 border-2 border-gray-200 text-gray-600 text-xs font-semibold rounded-lg hover:border-gray-900 hover:text-gray-900 transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/kavyakathuria"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 border-2 border-gray-200 text-gray-600 text-xs font-semibold rounded-lg hover:border-gray-900 hover:text-gray-900 transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>

      </div>

      <span className="absolute bottom-6 left-6 md:left-16 text-xs text-gray-200 tracking-widest z-10">
        01 / 05
      </span>
    </section>
  );
}
