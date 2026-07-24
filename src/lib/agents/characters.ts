export interface Character {
  id: "clippy" | "merlin" | "rover" | "genius";
  name: string;
  greeting: string;
  avatarSrc: string;
}

export const characters: Character[] = [
  { id: "clippy", name: "Clippy", greeting: "It looks like you're exploring Kavya's portfolio! Ask me anything about her.", avatarSrc: "/characters/clippy.png" },
  { id: "merlin", name: "Merlin", greeting: "Greetings! I am Merlin. Ask, and I shall reveal what I know of Kavya.", avatarSrc: "/characters/merlin.png" },
  { id: "rover", name: "Rover", greeting: "Woof! I'm Rover, sniffing out answers about Kavya. What would you like to know?", avatarSrc: "/characters/rover.png" },
  { id: "genius", name: "Genius", greeting: "Ah, a curious mind! Ask me anything about Kavya's work.", avatarSrc: "/characters/genius.png" },
];
