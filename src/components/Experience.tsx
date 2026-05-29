"use client";

import { useInView } from "@/hooks/useInView";

const experience = [
  {
    title: "Senior AI Data Engineer",
    company: "SAP Commerce Cloud",
    team: "Munich, Germany",
    period: "Jan 2024 — Present",
    description:
      "Engineering end-to-end data pipelines across SAP BTP and Java-based ETLs. Implementing AI-powered summarization and insights. Driving initiatives from planning through execution with full ownership of major data and engineering projects.",
  },
  {
    title: "Data Scientist",
    company: "SAP Commerce Cloud",
    team: "Munich, Germany",
    period: "May 2022 — Dec 2023",
    description:
      "Built analytical dashboards in SAP Analytics Cloud delivering KPIs and AI-powered insights. Maintained SAP HANA Cloud data models and led UI/UX development for internal tools using SAP Fiori standards.",
  },
  {
    title: "Working Student",
    company: "SAP Commerce Cloud & SAP Kyma",
    team: "Munich, Germany",
    period: "Nov 2019 — May 2022",
    description:
      "Built dashboards and backend services for SAP Commerce Cloud analytics. Developed a GoLang-based integration library for SAP Kyma and worked with Kubernetes/Docker on AWS, Azure, and GCP.",
  },
  {
    title: "Associate Developer",
    company: "SAP Master Data Management",
    team: "Bengaluru, India",
    period: "Aug 2018 — Aug 2019",
    description:
      "Built a centralised Product Master Data orchestration solution on SAP Cloud Platform using CAP. Developed core backend services and applied SAP HANA Cloud and SAP Fiori across the project.",
  },
  {
    title: "Associate Developer",
    company: "SAP Fieldglass",
    team: "Bengaluru, India",
    period: "Jul 2015 — Jul 2018",
    description:
      "Contributed to the SAP Fieldglass vendor management system. Created REST APIs with Spring framework and integrated Java microservices for data exchange and operational consistency.",
  },
];

export default function Experience() {
  const { ref, isVisible } = useInView();

  return (
    <section
      id="experience"
      className="relative flex items-center bg-white px-6 md:px-16"
    >
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
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
