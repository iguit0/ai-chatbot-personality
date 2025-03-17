export interface Personality {
  id: string
  name: string
  description: string
  systemPrompt: string
  tone: number // 1-10 scale
  verbosity: number // 1-10 scale
  creativity: number // 1-10 scale
  formality: number // 1-10 scale
  isDefault: boolean
}

