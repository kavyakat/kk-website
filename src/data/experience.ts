export interface ExperienceRole {
  title: string;
  company: string;
  location: string;
  period: string;
  bullets: string[];
}

export const experience: ExperienceRole[] = [
  {
    title: "Senior AI Data Engineer",
    company: "SAP Commerce Cloud",
    location: "Munich, Germany",
    period: "Jan 2024 — Present",
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
    bullets: [
      "Contributed to the SAP Fieldglass vendor management system — feature development and enhancements.",
      "Built REST APIs with the Spring framework for modular and maintainable backend services.",
      "Integrated Java microservices for smoother data exchange and operational consistency.",
    ],
  },
];
