"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { characters, type Character } from "@/lib/agents/characters";
import { useTheme } from "./useTheme";

function defaultForTheme(theme: string): Character {
  return characters.find((c) => c.id === (theme === "winxp" ? "rover" : "clippy"))!;
}

const CharacterContext = createContext<{
  character: Character;
  setCharacter: (c: Character) => void;
}>({
  character: characters.find((c) => c.id === "clippy")!,
  setCharacter: () => {},
});

export function CharacterProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const [character, setCharacter] = useState<Character>(() => defaultForTheme(theme));

  useEffect(() => {
    setCharacter(defaultForTheme(theme));
  }, [theme]);

  return <CharacterContext.Provider value={{ character, setCharacter }}>{children}</CharacterContext.Provider>;
}

export function useCharacter() {
  return useContext(CharacterContext);
}
