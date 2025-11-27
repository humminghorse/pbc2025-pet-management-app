"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PetCard } from "@/components/pet-card"
import { PetBreedingSimulator } from "@/components/pet-breeding-simulator"
import { Plus } from "lucide-react"
import { Pet } from "@/types"

export default function MyPetsPage() {
  const router = useRouter()
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchPets()
  }, [])

  const fetchPets = async () => {
    try {
      const res = await fetch("/api/pets")
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to fetch pets")
        setLoading(false)
        return
      }

      setPets(data.pets)
      setLoading(false)
    } catch (err) {
      setError("An unexpected error occurred")
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-gray-600">Loading your pets...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-600">{error}</p>
          <Button onClick={() => router.push("/login")}>Back to Login</Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Pets</h1>
          <p className="mt-1 text-gray-600">
            Manage and view all your beloved pets
          </p>
        </div>
        <Link href="/my-pets/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Pet
          </Button>
        </Link>
      </div>

      {pets.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-12">
          <p className="mb-4 text-lg text-gray-600">
            You don&apos;t have any pets yet
          </p>
          <Link href="/my-pets/add">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Pet
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>

          {/* ペット繁殖シミュレーター - 2匹以上いる場合のみ表示 */}
          {pets.length >= 2 && (
            <div className="mt-12">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">
                Pet Breeding Simulator
              </h2>
              <PetBreedingSimulator pets={pets} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
