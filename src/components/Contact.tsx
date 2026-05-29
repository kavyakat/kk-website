"use client";

import Image from "next/image";
import { useInView } from "@/hooks/useInView";

export default function Contact() {
  const { ref, isVisible } = useInView();

  return (
    <section
      id="contact"
      className="relative flex items-center bg-violet-950 px-6 md:px-16 overflow-hidden"
    >
      {/* Background photo */}
      <div className="absolute inset-y-0 right-0 w-1/2 pointer-events-none select-none hidden md:block overflow-hidden">
        <Image
          src="/kavya.jpeg"
          alt=""
          fill
          className="object-cover object-top"
          style={{ opacity: 0.2, filter: "saturate(1.4) contrast(1.1)" }}
          aria-hidden
        />
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to right, #2e1065 0%, rgba(46,16,101,0.85) 20%, rgba(46,16,101,0.2) 50%, transparent 100%)"
        }} />
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to bottom, rgba(46,16,101,0.6) 0%, transparent 20%, transparent 80%, rgba(46,16,101,0.6) 100%)"
        }} />
      </div>
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className={`fade-in max-w-2xl ${isVisible ? "visible" : ""}`}
      >
        <h2 className="font-serif italic text-5xl md:text-6xl text-white tracking-wide mb-6">
          Contact
        </h2>
        <p className="text-base text-violet-300 leading-loose mb-10 max-w-md">
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
