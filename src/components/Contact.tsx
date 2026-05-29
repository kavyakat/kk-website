"use client";

import { useInView } from "@/hooks/useInView";

export default function Contact() {
  const { ref, isVisible } = useInView();

  return (
    <section
      id="contact"
      className="relative flex items-center bg-white px-6 md:px-16"
    >
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className={`fade-in max-w-2xl ${isVisible ? "visible" : ""}`}
      >
        <h2 className="font-serif italic text-5xl md:text-6xl text-gray-900 tracking-wide mb-6">
          Contact
        </h2>
        <p className="text-base text-gray-500 leading-loose mb-10 max-w-md">
          Interested in working together or just want to say hello? My inbox is open.
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <a
            href="mailto:kavyakat@gmail.com"
            className="px-6 py-3 bg-gray-900 text-white text-xs font-bold tracking-wide rounded-lg hover:bg-gray-700 transition-colors"
          >
            Email me
          </a>
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

      <span className="absolute bottom-6 left-6 md:left-16 text-xs text-gray-200 tracking-widest">
        05 / 05
      </span>
    </section>
  );
}
