export interface Character {
  id: "clippy" | "merlin" | "rover" | "genius";
  name: string;
  greeting: string;
  avatarSrc: string;
}

export const characters: Character[] = [
  { id: "clippy", name: "Clippy", greeting: "Hi there! I'm Clippy. Ask me anything — and if you're curious about Kavya or his work, just say the word.", avatarSrc: "/characters/clippy.png" },
  { id: "merlin", name: "Merlin", greeting: "Greetings! I am Merlin. Ask me anything, and I can also share what I know of Kavya and his work.", avatarSrc: "/characters/merlin.png" },
  { id: "rover", name: "Rover", greeting: "Woof! I'm Rover. Happy to chat about anything — I can also sniff out answers about Kavya and his work.", avatarSrc: "/characters/rover.png" },
  { id: "genius", name: "Genius", greeting: "Ah, a curious mind! Ask me anything at all, or about Kavya and his work.", avatarSrc: "/characters/genius.png" },
];
