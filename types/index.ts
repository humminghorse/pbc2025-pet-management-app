import { Pet, WeightRecord } from "@prisma/client"

export type { Pet, WeightRecord }

export type PetFormData = {
  name: string
  category: string
  breed?: string
  birthday?: Date
  gender?: string
  imageUrl?: string
}

export type WeightRecordFormData = {
  weight: number
  date: Date
}

export type User = {
  id: string
  email: string
}

// AI画像識別関連の型
export type BreedIdentificationResult = {
  breed: string
  confidence: number
  category: "Dog" | "Cat" | "Other"
  description?: string
  error?: string
}

export type BreedIdentificationRequest = {
  imageData: string
  category: "Dog" | "Cat" | "Other"
}
