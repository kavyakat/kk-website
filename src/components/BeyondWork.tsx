"use client";

import { useInView } from "@/hooks/useInView";
import ScrollHint from "@/components/ScrollHint";

export default function BeyondWork() {
  const { ref, isVisible } = useInView();

  return (
    <section
      id="beyond-work"
      className="relative flex items-center bg-orange-50 px-6 md:px-16"
    >
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className={`fade-in max-w-4xl w-full ${isVisible ? "visible" : ""}`}
      >
        <h2 className="font-serif italic text-4xl md:text-6xl text-orange-700 tracking-wide mb-8 md:mb-10">
          Beyond Work
        </h2>
        <div className="flex flex-col gap-8 max-w-2xl">
          <p className="text-base text-orange-900 leading-loose">
            Outside of work, I play competitive table tennis. I compete in the{" "}
            <a
              href="https://www.mytischtennis.de"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-orange-600 transition-colors"
            >
              Bavarian district league
            </a>{" "}
            with TTC 1992 München, and captain the SAP Munich team in the Munich
            corporate league.
          </p>
          <a
            href="https://www.mytischtennis.de/click-tt/spieler/P1435A5023/spielerportrait"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 self-start px-5 py-3 border-2 border-orange-400 text-orange-700 text-xs font-semibold rounded-lg hover:border-orange-700 hover:text-orange-900 transition-colors"
          >
            myTischtennis profile
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        </div>
      </div>
      <ScrollHint targetId="contact" />
    </section>
  );
}