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
    description:
      "Engineering end-to-end data pipelines across SAP BTP and Java-based ETLs. Implementing AI-powered summarization and insights. Full ownership of major data and engineering projects from design through rollout.",
  },
  {
    title: "Data Scientist",
    company: "SAP Commerce Cloud",
    location: "Munich, Germany",
    period: "May 2022 — Dec 2023",
    logo: "https://www.sap.com/dam/application/shared/logos/sap-logo-svg.svg/sap-logo-svg.svg",
    description:
      "Built analytical dashboards in SAP Analytics Cloud delivering KPIs and AI-powered insights. Maintained SAP HANA Cloud data models and led UI/UX development for internal tools using SAP Fiori standards.",
  },
  {
    title: "Working Student",
    company: "SAP Commerce Cloud & Kyma",
    location: "Munich, Germany",
    period: "Nov 2019 — May 2022",
    logo: "https://www.sap.com/dam/application/shared/logos/sap-logo-svg.svg/sap-logo-svg.svg",
    description:
      "Built dashboards and backend services for Commerce Cloud analytics. Developed a GoLang integration library for SAP Kyma, with Kubernetes/Docker deployments on AWS, Azure, and GCP.",
  },
  {
    title: "Associate Developer",
    company: "SAP Master Data Management",
    location: "Bengaluru, India",
    period: "Aug 2018 — Aug 2019",
    logo: "https://www.sap.com/dam/application/shared/logos/sap-logo-svg.svg/sap-logo-svg.svg",
    description:
      "Built a centralised Product Master Data orchestration solution on SAP Cloud Platform using CAP. Developed core backend services; applied SAP HANA Cloud and Fiori across the project.",
  },
  {
    title: "Associate Developer",
    company: "SAP Fieldglass",
    location: "Bengaluru, India",
    period: "Jul 2015 — Jul 2018",
    logo: "https://www.sap.com/dam/application/shared/logos/sap-logo-svg.svg/sap-logo-svg.svg",
    description:
      "Contributed to the SAP Fieldglass vendor management system. Built REST APIs with Spring framework and integrated Java microservices for smoother data exchange and operational consistency.",
  },
];

export default function Experience() {
  const { ref, isVisible } = useInView();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const scrollTo = (index: number) => {
    setActive(index);
    const carousel = carouselRef.current;
    if (!carousel) return;
    const card = carousel.children[index] as HTMLElement;
    carousel.scrollTo({ left: card.offsetLeft - carousel.offsetLeft, behavior: "smooth" });
  };

  return (
    <section
      id="experience"
      className="relative flex items-center bg-white px-6 md:px-16"
    >
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className={`fade-in w-full max-w-3xl ${isVisible ? "visible" : ""}`}
      >
        <h2 className="font-serif italic text-5xl md:text-6xl text-gray-900 tracking-wide mb-8">
          Experience
        </h2>

        {/* Carousel */}
        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          {experience.map((role, i) => (
            <div
              key={i}
              onClick={() => setActive(i)}
              className="snap-start shrink-0 w-72 p-5 border rounded-xl cursor-pointer transition-colors"
              style={{ borderColor: active === i ? "#d1d5db" : "#f3f4f6" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-md border border-gray-100 bg-white flex items-center justify-center overflow-hidden shrink-0">
                  <Image src={role.logo} alt={role.company} width={24} height={24} className="object-contain" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900 leading-tight">{role.title}</p>
                  <p className="text-xs text-gray-400 leading-tight mt-0.5">{role.company}</p>
                </div>
              </div>
              <p className="text-xs text-gray-300 mb-3">{role.period} · {role.location}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{role.description}</p>
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        <div className="flex gap-2 mt-4">
          {experience.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className="w-1.5 h-1.5 rounded-full transition-colors"
              style={{ background: active === i ? "#9ca3af" : "#e5e7eb" }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <span className="absolute bottom-6 left-6 md:left-16 text-xs text-gray-200 tracking-widest">
        03 / 05
      </span>
    </section>
  );
}
