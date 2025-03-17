"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Personality } from "@/lib/types"
import { defaultPersonalities } from "@/lib/default-personalities"

type PersonalityContextType = {
  personalities: Personality[]
  selectedPersonality: Personality | null
  setSelectedPersonality: (personality: Personality) => void
  addPersonality: (personality: Personality) => void
  updatePersonality: (id: string, personality: Partial<Personality>) => void
  deletePersonality: (id: string) => void
}

const PersonalityContext = createContext<PersonalityContextType | undefined>(undefined)

export function PersonalityProvider({ children }: { children: ReactNode }) {
  const [personalities, setPersonalities] = useState<Personality[]>([])
  const [selectedPersonality, setSelectedPersonality] = useState<Personality | null>(null)

  useEffect(() => {
    // Load personalities from localStorage or use defaults
    const storedPersonalities = localStorage.getItem("personalities")
    const initialPersonalities = storedPersonalities ? JSON.parse(storedPersonalities) : defaultPersonalities

    setPersonalities(initialPersonalities)

    // Set default selected personality
    if (initialPersonalities.length > 0) {
      setSelectedPersonality(initialPersonalities[0])
    }
  }, [])

  useEffect(() => {
    // Save personalities to localStorage whenever they change
    if (personalities.length > 0) {
      localStorage.setItem("personalities", JSON.stringify(personalities))
    }
  }, [personalities])

  const addPersonality = (personality: Personality) => {
    setPersonalities((prev) => [...prev, personality])
  }

  const updatePersonality = (id: string, updatedFields: Partial<Personality>) => {
    setPersonalities((prev) => prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p)))

    // Update selected personality if it's the one being edited
    if (selectedPersonality?.id === id) {
      setSelectedPersonality((prev) => (prev ? { ...prev, ...updatedFields } : null))
    }
  }

  const deletePersonality = (id: string) => {
    setPersonalities((prev) => prev.filter((p) => p.id !== id))

    // If the deleted personality was selected, select the first available one
    if (selectedPersonality?.id === id) {
      setPersonalities((prev) => {
        if (prev.length > 0 && prev[0].id !== id) {
          setSelectedPersonality(prev.find((p) => p.id !== id) || null)
        } else {
          setSelectedPersonality(null)
        }
        return prev
      })
    }
  }

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
  )
}

export function usePersonality() {
  const context = useContext(PersonalityContext)
  if (context === undefined) {
    throw new Error("usePersonality must be used within a PersonalityProvider")
  }
  return context
}

