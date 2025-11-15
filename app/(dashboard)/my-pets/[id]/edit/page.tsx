"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PetForm } from "@/components/pet-form"
import { ArrowLeft } from "lucide-react"
import { Pet } from "@/types"

export default function EditPetPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const router = useRouter()
  const [pet, setPet] = useState<Pet | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchPet()
  }, [id])

  const fetchPet = async () => {
    try {
      const res = await fetch(`/api/pets/${id}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to fetch pet")
        setLoading(false)
        return
      }

      setPet(data.pet)
      setLoading(false)
    } catch (err) {
      setError("An unexpected error occurred")
      setLoading(false)
    }
  }

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    setError("")

    try {
      const res = await fetch(`/api/pets/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const responseData = await res.json()

      if (!res.ok) {
        setError(responseData.error || "Failed to update pet")
        setIsSubmitting(false)
        return
      }

      router.push(`/my-pets/${id}`)
      router.refresh()
    } catch (err) {
      setError("An unexpected error occurred")
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push(`/my-pets/${id}`)
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-600">Loading pet details...</p>
      </div>
    )
  }

  if (error && !pet) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-600">{error}</p>
          <Link href="/my-pets">
            <Button>Back to My Pets</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link href={`/my-pets/${id}`}>
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Pet Details
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Edit Pet</CardTitle>
          <CardDescription>
            Update the information for {pet?.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
          {pet && (
            <PetForm
              initialData={pet}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isSubmitting}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
