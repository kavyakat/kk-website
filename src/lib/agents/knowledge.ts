import { aboutText, contactLinks } from "@/data/content";
import { experience } from "@/data/experience";
import { skills } from "@/data/skills";
import { funFactsText } from "@/data/funFacts";

const experienceText = experience
  .map((r) => `- ${r.title}, ${r.company} (${r.period}, ${r.location}): ${r.bullets.join(" ")}`)
  .join("\n");

const skillsText = skills.map((g) => `- ${g.group}: ${g.tags.join(", ")}`).join("\n");

const contactText = `- Email: ${contactLinks.email}\n- GitHub: ${contactLinks.github}\n- LinkedIn: ${contactLinks.linkedin}`;

export const kavyaKnowledge = `ABOUT KAVYA
${aboutText}

EXPERIENCE
${experienceText}

SKILLS
${skillsText}

CONTACT
${contactText}`;

export const funFactsKnowledge = funFactsText;
