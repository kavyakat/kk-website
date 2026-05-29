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
      className="relative flex items-center bg-indigo-950 px-6 md:px-16 overflow-hidden"
    >
      {/* Background photo — tight crop, high contrast, right-anchored */}
      <div className="absolute inset-y-0 right-0 w-1/2 pointer-events-none select-none hidden md:block overflow-hidden">
        <Image
          src="/kavya.jpeg"
          alt=""
          fill
          className="object-cover object-top"
          style={{ opacity: 0.28, filter: "saturate(1.6) contrast(1.1)" }}
          priority
          aria-hidden
        />
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to right, #1e1b4b 0%, rgba(30,27,75,0.85) 20%, rgba(30,27,75,0.2) 50%, transparent 100%)"
        }} />
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to bottom, rgba(30,27,75,0.6) 0%, transparent 20%, transparent 80%, rgba(30,27,75,0.6) 100%)"
        }} />
      </div>

      {/* Foreground content */}
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className={`fade-in w-full flex items-center justify-between gap-12 relative z-10 ${isVisible ? "visible" : ""}`}
      >
        {/* Text */}
        <div className="w-full max-w-2xl">
          <p className="text-xs font-semibold text-indigo-300 uppercase tracking-[0.2em] mb-4 md:mb-5">
            Senior AI Data Engineer · SAP Commerce Cloud
          </p>
          <h1 className="text-[clamp(3rem,9vw,7rem)] font-black text-white leading-none tracking-tight mb-4 md:mb-6">
            Kavya<br />Kathuria
          </h1>
          <p className="text-sm md:text-base text-indigo-200 leading-relaxed max-w-2xl mb-8 md:mb-10">
            10+ years building data pipelines, analytical solutions, and AI-driven
            insights across the SAP ecosystem. Based in Munich.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={scrollToContact}
              className="px-6 py-3 bg-white text-indigo-950 text-xs font-bold tracking-wide rounded-lg hover:bg-indigo-100 transition-colors"
            >
              Get in touch ↓
            </button>
            <a
              href="https://github.com/kavyakat"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 border-2 border-indigo-400 text-indigo-200 text-xs font-semibold rounded-lg hover:border-white hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/kavyakathuria"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 border-2 border-indigo-400 text-indigo-200 text-xs font-semibold rounded-lg hover:border-white hover:text-white transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>

      <span className="absolute bottom-6 left-6 md:left-16 text-xs text-indigo-700 tracking-widest z-10">
        01 / 05
      </span>
    </section>
  );
}
