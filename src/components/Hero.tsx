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
      className="relative flex items-start md:items-center bg-indigo-950 px-6 md:px-16 overflow-hidden pt-[20vh] md:pt-0"
    >
      {/* Foreground content */}
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className={`fade-in w-full flex items-center justify-between gap-12 relative z-10 ${isVisible ? "visible" : ""}`}
      >
        {/* Text */}
        <div className="w-full max-w-2xl">
          <p className="text-[10px] md:text-xs font-semibold text-indigo-300 uppercase tracking-[0.15em] md:tracking-[0.2em] mb-4 md:mb-5 whitespace-nowrap">
            Senior AI Data Engineer · SAP Commerce Cloud
          </p>
          <div className="flex items-center justify-between gap-4 mb-4 md:mb-6">
            <h1 className="text-[clamp(3rem,9vw,7rem)] font-black text-white leading-none tracking-tight">
              Kavya<br />Kathuria
            </h1>
            {/* Circle headshot — mobile only */}
            <div className="md:hidden flex-shrink-0 w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-400">
              <Image
                src="/prof_photo.jpeg"
                alt="Kavya Kathuria"
                width={96}
                height={96}
                className="object-cover object-top w-full h-full"
                style={{ transform: "scaleX(-1)" }}
              />
            </div>
          </div>
          <p className="text-sm md:text-base text-indigo-200 leading-relaxed max-w-2xl mb-8 md:mb-10">
            10+ years across software engineering, data engineering, and AI — currently focused on analytical insights at SAP Commerce Cloud. Based in Munich.
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

      {/* Scroll hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-indigo-400 animate-bounce z-10">
        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Headshot — option C: right-anchored, semi-visible */}
      <div className="absolute inset-y-0 right-0 w-1/2 pointer-events-none select-none hidden md:block overflow-hidden">
        <Image
          src="/prof_photo.jpeg"
          alt=""
          fill
          className="object-cover object-top"
          style={{ opacity: 0.68, transform: "scaleX(-1)", filter: "contrast(1.15) saturate(1.3) brightness(1.05)" }}
          priority
          aria-hidden
        />
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to right, #1e1b4b 0%, rgba(30,27,75,0.6) 40%, transparent 100%)"
        }} />
      </div>

    </section>
  );
}
