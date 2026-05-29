"use client";

import { useInView } from "@/hooks/useInView";

export default function About() {
  const { ref, isVisible } = useInView();

  return (
    <section
      id="about"
      className="relative flex items-center bg-gray-50 px-6 md:px-16"
    >
      <div
        ref={ref}
        className={`fade-in max-w-2xl ${isVisible ? "visible" : ""}`}
      >
        <h2 className="font-serif italic text-5xl md:text-6xl text-gray-900 tracking-wide mb-8">
          About
        </h2>
        <p className="text-sm text-gray-600 leading-loose max-w-xl mb-10">
          I&apos;m a software developer on the Commerce Analytics team at SAP,
          where I build the CCv2 platform&apos;s analytics layer — the systems
          that track, move, and make sense of commerce events at scale. My work
          sits at the intersection of platform engineering and data, spanning
          event-driven architecture, data pipelines, and cloud-native services
          on SAP BTP.
        </p>
        <div className="flex gap-4 flex-wrap">
          {[
            { label: "Role", value: "Software Developer" },
            { label: "Company", value: "SAP" },
            { label: "Focus", value: "Platform · Analytics" },
          ].map((chip) => (
            <div
              key={chip.label}
              className="px-4 py-3 bg-white border border-gray-200 rounded-lg"
            >
              <p className="text-xs text-gray-400 mb-1">{chip.label}</p>
              <p className="text-sm text-gray-700">{chip.value}</p>
            </div>
          ))}
        </div>
      </div>

      <span className="absolute bottom-6 left-6 md:left-16 text-xs text-gray-200 tracking-widest">
        02 / 05
      </span>
    </section>
  );
}
