export interface SkillGroup {
  group: string;
  tags: string[];
}

export const skills: SkillGroup[] = [
  { group: "Languages", tags: ["Java", "Python", "SQL", "GoLang"] },
  { group: "SAP & Cloud", tags: ["SAP BTP", "SAP HANA Cloud", "SAP Analytics Cloud", "CAP", "SAP Fiori", "SAP Commerce Cloud"] },
  { group: "Data & AI", tags: ["Data pipelines", "Data modeling", "AI summarization", "Forecasting", "Anomaly detection"] },
  { group: "DevOps", tags: ["Jenkins", "GitHub Actions", "Kubernetes", "Docker", "AWS", "Azure", "GCP"] },
];
