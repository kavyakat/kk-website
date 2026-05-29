"use client";

import { useInView } from "@/hooks/useInView";

const experience = [
  {
    title: "Software Developer",
    company: "SAP",
    team: "Commerce Analytics",
    period: "2023 — Present",
    description:
      "Building the analytics layer of the CCv2 platform — event tracking systems, data pipelines, and cloud-native services on SAP BTP.",
  },
  // Add more roles here
];

export default function Experience() {
  const { ref, isVisible } = useInView();

  return (
    <section
      id="experience"
      className="relative flex items-center bg-white px-6 md:px-16"
    >
      <div
        ref={ref}
        className={`fade-in max-w-2xl w-full ${isVisible ? "visible" : ""}`}
      >
        <h2 className="font-serif italic text-5xl md:text-6xl text-gray-900 tracking-wide mb-8">
          Experience
        </h2>
        <div className="flex flex-col gap-4">
          {experience.map((role, i) => (
            <div
              key={i}
              className="flex items-start justify-between p-5 border border-gray-100 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {role.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {role.company} · {role.team}
                </p>
                <p className="text-xs text-gray-400 mt-3 leading-relaxed max-w-md">
                  {role.description}
                </p>
              </div>
              <p className="text-xs text-gray-300 whitespace-nowrap ml-6 mt-0.5">
                {role.period}
              </p>
            </div>
          ))}
        </div>
      </div>

      <span className="absolute bottom-6 left-6 md:left-16 text-xs text-gray-200 tracking-widest">
        03 / 05
      </span>
    </section>
  );
}
