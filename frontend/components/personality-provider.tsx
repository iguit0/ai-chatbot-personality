"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { Personality } from "@/lib/types";

type PersonalityContextType = {
  personalities: Personality[];
  selectedPersonality: Personality | null;
  setSelectedPersonality: (personality: Personality) => void;
};

const PersonalityContext = createContext<PersonalityContextType | undefined>(
  undefined
);

export function PersonalityProvider({ children }: { children: ReactNode }) {
  const [personalities, setPersonalities] = useState<Personality[]>([]);
  const [selectedPersonality, setSelectedPersonality] =
    useState<Personality | null>(null);

  useEffect(() => {
    const fetchPersonalities = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/personalities`
        );
        if (!response.ok) throw new Error("Failed to fetch personalities");
        const data = await response.json();

        const formattedPersonalities: Personality[] = data.personalities.map(
          (name: string) => ({
            id: name,
            name: name.charAt(0).toUpperCase() + name.slice(1),
            description: `${
              name.charAt(0).toUpperCase() + name.slice(1)
            } personality`,
          })
        );

        setPersonalities(formattedPersonalities);
        if (formattedPersonalities.length > 0) {
          setSelectedPersonality(formattedPersonalities[0]);
        }
      } catch (error) {
        console.error("Error fetching personalities:", error);
      }
    };

    fetchPersonalities();
  }, []);

  return (
    <PersonalityContext.Provider
      value={{
        personalities,
        selectedPersonality,
        setSelectedPersonality,
      }}
    >
      {children}
    </PersonalityContext.Provider>
  );
}

export function usePersonality() {
  const context = useContext(PersonalityContext);
  if (context === undefined) {
    throw new Error("usePersonality must be used within a PersonalityProvider");
  }
  return context;
}
