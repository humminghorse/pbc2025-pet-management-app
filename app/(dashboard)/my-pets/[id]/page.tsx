"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DeletePetDialog } from "@/components/delete-pet-dialog"
import { WeightChart } from "@/components/weight-chart"
import { WeightForm } from "@/components/weight-form"
import { Edit, ArrowLeft } from "lucide-react"
import { Pet, WeightRecord } from "@/types"
import { differenceInYears, differenceInMonths, format } from "date-fns"

export default function PetDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  const router = useRouter()
  const [pet, setPet] = useState<Pet | null>(null)
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchPet()
    fetchWeightRecords()
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

  const handleDelete = () => {
    router.push("/my-pets")
    router.refresh()
  }

  const fetchWeightRecords = async () => {
    try {
      const res = await fetch(`/api/pets/${id}/weight`)
      const data = await res.json()

      if (res.ok) {
        setWeightRecords(data.weightRecords)
      }
    } catch (err) {
      console.error("Failed to fetch weight records:", err)
    }
  }

  const handleWeightAdded = () => {
    fetchWeightRecords()
  }

  const calculateAge = (birthday: string) => {
    const birthDate = new Date(birthday)
    const years = differenceInYears(new Date(), birthDate)
    const months = differenceInMonths(new Date(), birthDate) % 12

    if (years === 0) {
      return `${months} month${months !== 1 ? "s" : ""} old`
    } else if (months === 0) {
      return `${years} year${years !== 1 ? "s" : ""} old`
    } else {
      return `${years} year${years !== 1 ? "s" : ""} and ${months} month${months !== 1 ? "s" : ""} old`
    }
  }

  const getPetInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-600">Loading pet details...</p>
      </div>
    )
  }

  if (error || !pet) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-600">{error || "Pet not found"}</p>
          <Link href="/my-pets">
            <Button>Back to My Pets</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/my-pets">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Pets
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                {pet.imageUrl ? (
                  <AvatarImage src={pet.imageUrl} alt={pet.name} />
                ) : (
                  <AvatarFallback className="text-2xl">
                    {getPetInitials(pet.name)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <CardTitle className="text-3xl">{pet.name}</CardTitle>
                <p className="text-lg text-gray-600">{pet.category}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/my-pets/${pet.id}/edit`}>
                <Button>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <DeletePetDialog
                petId={pet.id}
                petName={pet.name}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {pet.breed && (
              <div>
                <p className="text-sm font-medium text-gray-500">Breed</p>
                <p className="text-lg">{pet.breed}</p>
              </div>
            )}
            {pet.gender && (
              <div>
                <p className="text-sm font-medium text-gray-500">Gender</p>
                <p className="text-lg">{pet.gender}</p>
              </div>
            )}
            {pet.birthday && (
              <>
                <div>
                  <p className="text-sm font-medium text-gray-500">Birthday</p>
                  <p className="text-lg">
                    {format(new Date(pet.birthday), "MMMM dd, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Age</p>
                  <p className="text-lg">{calculateAge(new Date(pet.birthday).toISOString())}</p>
                </div>
              </>
            )}
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-500">
              Added on {format(new Date(pet.createdAt), "MMMM dd, yyyy")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Weight Management Section */}
      <div className="mt-8 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Weight Management</h2>
        <WeightChart weightRecords={weightRecords} />
        <WeightForm petId={pet.id} onSuccess={handleWeightAdded} />
      </div>
    </div>
  )
}
