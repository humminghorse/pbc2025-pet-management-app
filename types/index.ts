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
