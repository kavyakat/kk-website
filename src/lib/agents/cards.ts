import type { AgentCard } from "./types";

export const kavyaCard: AgentCard = {
  name: "Kavya Agent",
  description:
    "Coordinator agent that answers questions about Kavya Kathuria's background, experience, skills, and contact info, and delegates hobby questions to specialist agents.",
  url: "/api/agents/kavya",
  version: "1.0.0",
  skills: [
    { id: "about", name: "About Kavya", description: "Bio and professional summary." },
    { id: "experience", name: "Experience", description: "Roles, companies, and accomplishments." },
    { id: "skills", name: "Skills", description: "Languages, SAP & cloud, data & AI, DevOps." },
    { id: "contact", name: "Contact", description: "Email and professional links." },
  ],
};

export const funFactsCard: AgentCard = {
  name: "Fun Facts Agent",
  description: "Specialist agent for Kavya's table tennis / beyond-work life.",
  url: "/api/agents/fun-facts",
  version: "1.0.0",
  skills: [
    { id: "table-tennis", name: "Table Tennis", description: "Club, league, TTR rating, and competitive play." },
  ],
};
