"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { Personality } from "@/lib/types";
import { apiClient } from "@/lib/api-client";

type PersonalityContextType = {
  personalities: Personality[];
  selectedPersonality: Personality | null;
  setSelectedPersonality: (personality: Personality) => void;
  addPersonality: (personality: Personality) => void;
  updatePersonality: (id: string, personality: Personality) => void;
  deletePersonality: (id: string) => void;
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
        const data = await apiClient.get<{ personalities: Personality[] }>(
          "/personalities"
        );
        setPersonalities(data.personalities);

        const defaultPersonality =
          data.personalities.find((p) => p.isDefault) || data.personalities[0];
        if (defaultPersonality) {
          setSelectedPersonality(defaultPersonality);
        }
      } catch (error) {
        console.error("Error fetching personalities:", error);
      }
    };

    fetchPersonalities();
  }, []);

  const addPersonality = async (personality: Personality) => {
    try {
      await apiClient.post("/personalities", personality);
      setPersonalities((prev) => [...prev, personality]);
    } catch (error) {
      console.error("Error adding personality:", error);
    }
  };

  const updatePersonality = async (id: string, personality: Personality) => {
    try {
      await apiClient.post(`/personalities/${id}`, personality);
      setPersonalities((prev) =>
        prev.map((p) => (p.id === id ? personality : p))
      );
    } catch (error) {
      console.error("Error updating personality:", error);
    }
  };

  const deletePersonality = async (id: string) => {
    try {
      await apiClient.delete(`/personalities/${id}`);
      setPersonalities((prev) => prev.filter((p) => p.id !== id));
      if (selectedPersonality?.id === id) {
        setSelectedPersonality(null);
      }
    } catch (error) {
      console.error("Error deleting personality:", error);
    }
  };

  return (
    <PersonalityContext.Provider
      value={{
        personalities,
        selectedPersonality,
        setSelectedPersonality,
        addPersonality,
        updatePersonality,
        deletePersonality,
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
