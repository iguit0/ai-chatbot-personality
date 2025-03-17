"use client"

import type React from "react"

import { useState } from "react"
import { usePersonality } from "./personality-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import type { Personality } from "@/lib/types"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { v4 as uuidv4 } from "@/lib/uuid"

type PersonalityEditorProps = {
  personality?: Personality
  onClose: () => void
  mode: "create" | "edit"
}

export function PersonalityEditor({ personality, onClose, mode }: PersonalityEditorProps) {
  const { addPersonality, updatePersonality } = usePersonality()

  const [formData, setFormData] = useState<Personality>(
    personality || {
      id: uuidv4(),
      name: "",
      description: "",
      systemPrompt: "You are a helpful AI assistant.",
      tone: 5, // 1-10 scale
      verbosity: 5, // 1-10 scale
      creativity: 5, // 1-10 scale
      formality: 5, // 1-10 scale
      isDefault: false,
    },
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSliderChange = (name: string, value: number[]) => {
    setFormData((prev) => ({ ...prev, [name]: value[0] }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (mode === "create") {
      addPersonality(formData)
    } else {
      updatePersonality(formData.id, formData)
    }

    onClose()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{mode === "create" ? "Create New Personality" : "Edit Personality"}</DialogTitle>
        <DialogDescription>
          {mode === "create" ? "Define a new personality for your AI assistant." : "Modify this personality profile."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Formal Teacher"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief description of this personality"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="systemPrompt">System Prompt</Label>
          <Textarea
            id="systemPrompt"
            name="systemPrompt"
            value={formData.systemPrompt}
            onChange={handleChange}
            placeholder="Instructions that define this personality"
            rows={3}
            required
          />
        </div>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="tone">Tone</Label>
              <span className="text-sm text-muted-foreground">{formData.tone}/10</span>
            </div>
            <Slider
              id="tone"
              min={1}
              max={10}
              step={1}
              value={[formData.tone]}
              onValueChange={(value) => handleSliderChange("tone", value)}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Serious</span>
              <span>Friendly</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="verbosity">Verbosity</Label>
              <span className="text-sm text-muted-foreground">{formData.verbosity}/10</span>
            </div>
            <Slider
              id="verbosity"
              min={1}
              max={10}
              step={1}
              value={[formData.verbosity]}
              onValueChange={(value) => handleSliderChange("verbosity", value)}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Concise</span>
              <span>Detailed</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="creativity">Creativity</Label>
              <span className="text-sm text-muted-foreground">{formData.creativity}/10</span>
            </div>
            <Slider
              id="creativity"
              min={1}
              max={10}
              step={1}
              value={[formData.creativity]}
              onValueChange={(value) => handleSliderChange("creativity", value)}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Precise</span>
              <span>Creative</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="formality">Formality</Label>
              <span className="text-sm text-muted-foreground">{formData.formality}/10</span>
            </div>
            <Slider
              id="formality"
              min={1}
              max={10}
              step={1}
              value={[formData.formality]}
              onValueChange={(value) => handleSliderChange("formality", value)}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Casual</span>
              <span>Formal</span>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{mode === "create" ? "Create Personality" : "Save Changes"}</Button>
        </DialogFooter>
      </form>
    </>
  )
}

