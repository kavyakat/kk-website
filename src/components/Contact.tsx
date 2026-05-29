"use client";

import { useInView } from "@/hooks/useInView";

export default function Contact() {
  const { ref, isVisible } = useInView();

  return (
    <section
      id="contact"
      className="relative flex items-center bg-violet-950 px-6 md:px-16"
    >
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className={`fade-in max-w-4xl w-full ${isVisible ? "visible" : ""}`}
      >
        <h2 className="font-serif italic text-4xl md:text-6xl text-white tracking-wide mb-6">
          Contact
        </h2>
        <p className="text-base text-violet-300 leading-loose mb-10 max-w-2xl">
          Interested in working together or just want to say hello? My inbox is open.
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <a
            href="mailto:kavyakat@gmail.com"
            className="px-6 py-3 bg-white text-violet-950 text-xs font-bold tracking-wide rounded-lg hover:bg-violet-100 transition-colors"
          >
            Email me
          </a>
          <a
            href="https://github.com/kavyakat"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 border-2 border-violet-400 text-violet-200 text-xs font-semibold rounded-lg hover:border-white hover:text-white transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/kavyakathuria"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 border-2 border-violet-400 text-violet-200 text-xs font-semibold rounded-lg hover:border-white hover:text-white transition-colors"
          >
            LinkedIn
          </a>
        </div>
      </div>

      <span className="absolute bottom-6 left-6 md:left-16 text-xs text-violet-700 tracking-widest">
        05 / 05
      </span>
    </section>
  );
}
