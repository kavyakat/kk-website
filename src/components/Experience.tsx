"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useInView } from "@/hooks/useInView";

const experience = [
  {
    title: "Senior AI Data Engineer",
    company: "SAP Commerce Cloud",
    location: "Munich, Germany",
    period: "Jan 2024 — Present",
    logo: "https://www.sap.com/dam/application/shared/logos/sap-logo-svg.svg/sap-logo-svg.svg",
    bullets: [
      "Engineered end-to-end data pipelines across SAP BTP and Java-based ETLs into HANA Cloud.",
      "Implemented AI-powered summarization, forecasting, and anomaly detection across the platform.",
      "Took full ownership of major data engineering projects from design through production rollout.",
    ],
  },
  {
    title: "Data Scientist",
    company: "SAP Commerce Cloud",
    location: "Munich, Germany",
    period: "May 2022 — Dec 2023",
    logo: "https://www.sap.com/dam/application/shared/logos/sap-logo-svg.svg/sap-logo-svg.svg",
    bullets: [
      "Built analytical dashboards in SAP Analytics Cloud delivering KPIs and AI-driven insights to stakeholders.",
      "Maintained SAP HANA Cloud data models and optimised performance for analytics at scale.",
      "Led UI/UX development for internal tools, aligning with SAP Fiori standards.",
    ],
  },
  {
    title: "Working Student",
    company: "SAP Commerce Cloud & Kyma",
    location: "Munich, Germany",
    period: "Nov 2019 — May 2022",
    logo: "https://www.sap.com/dam/application/shared/logos/sap-logo-svg.svg/sap-logo-svg.svg",
    bullets: [
      "Built dashboards and backend services for Commerce Cloud analytics using SAP HANA and Java.",
      "Developed a GoLang-based integration library for SAP Kyma.",
      "Worked with Kubernetes and Docker deployments across AWS, Azure, and GCP.",
    ],
  },
  {
    title: "Associate Developer",
    company: "SAP Master Data Management",
    location: "Bengaluru, India",
    period: "Aug 2018 — Aug 2019",
    logo: "https://www.sap.com/dam/application/shared/logos/sap-logo-svg.svg/sap-logo-svg.svg",
    bullets: [
      "Built a centralised Product Master Data orchestration solution on SAP Cloud Platform using CAP.",
      "Developed core backend services supporting product lifecycle workflows.",
      "Applied SAP HANA Cloud and Fiori across multiple project stages.",
    ],
  },
  {
    title: "Associate Developer",
    company: "SAP Fieldglass",
    location: "Bengaluru, India",
    period: "Jul 2015 — Jul 2018",
    logo: "https://www.sap.com/dam/application/shared/logos/sap-logo-svg.svg/sap-logo-svg.svg",
    bullets: [
      "Contributed to the SAP Fieldglass vendor management system — feature development and enhancements.",
      "Built REST APIs with the Spring framework for modular and maintainable backend services.",
      "Integrated Java microservices for smoother data exchange and operational consistency.",
    ],
  },
];

export default function Experience() {
  const { ref, isVisible } = useInView();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const scrollTo = (index: number) => {
    const clamped = Math.max(0, Math.min(experience.length - 1, index));
    setActive(clamped);
    const carousel = carouselRef.current;
    if (!carousel) return;
    const card = carousel.children[clamped] as HTMLElement;
    carousel.scrollTo({ left: card.offsetLeft - carousel.offsetLeft, behavior: "smooth" });
  };

  return (
    <section
      id="experience"
      className="relative flex items-center bg-slate-50 px-6 md:px-16"
    >
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className={`fade-in w-full ${isVisible ? "visible" : ""}`}
      >
        {/* Header row */}
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-serif italic text-4xl md:text-6xl text-indigo-900 tracking-wide">
            Experience
          </h2>
          {/* Arrow nav */}
          <div className="flex gap-2">
            <button
              onClick={() => scrollTo(active - 1)}
              disabled={active === 0}
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-gray-900 hover:text-gray-900 disabled:opacity-20 transition-colors"
              aria-label="Previous"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <button
              onClick={() => scrollTo(active + 1)}
              disabled={active === experience.length - 1}
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-gray-900 hover:text-gray-900 disabled:opacity-20 transition-colors"
              aria-label="Next"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          {experience.map((role, i) => (
            <div
              key={i}
              onClick={() => scrollTo(i)}
              className="snap-start shrink-0 cursor-pointer rounded-2xl border p-6 transition-all"
              style={{
                width: "clamp(280px, 85vw, 520px)",
                borderColor: active === i ? "#4f46e5" : "#e2e8f0",
                background: active === i ? "#eef2ff" : "#fff",
              }}
            >
              {/* Logo + company */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg border border-gray-100 bg-white flex items-center justify-center overflow-hidden shrink-0">
                  <Image src={role.logo} alt={role.company} width={28} height={28} className="object-contain" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 leading-tight">{role.company}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{role.location}</p>
                </div>
              </div>

              {/* Title + period */}
              <p className="text-lg font-bold text-gray-900 leading-snug mb-1">{role.title}</p>
              <p className="text-xs text-gray-400 mb-5">{role.period}</p>

              {/* Bullets */}
              <ul className="flex flex-col gap-2">
                {role.bullets.map((b, j) => (
                  <li key={j} className="flex gap-2 text-xs text-gray-500 leading-relaxed">
                    <span className="text-gray-300 mt-0.5 shrink-0">—</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="flex gap-2 mt-5">
          {experience.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className="h-1 rounded-full transition-all"
              style={{
                width: active === i ? "24px" : "6px",
                background: active === i ? "#4f46e5" : "#cbd5e1",
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
