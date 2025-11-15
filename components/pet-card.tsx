import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Pet } from "@/types"

interface PetCardProps {
  pet: Pet
}

export function PetCard({ pet }: PetCardProps) {
  const getPetInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getCategoryEmoji = (category: string) => {
    const categoryLower = category.toLowerCase()
    if (categoryLower === "dog") return "🐕"
    if (categoryLower === "cat") return "🐈"
    if (categoryLower === "bird") return "🦜"
    if (categoryLower === "fish") return "🐠"
    if (categoryLower === "rabbit") return "🐰"
    if (categoryLower === "hamster") return "🐹"
    return "🐾"
  }

  return (
    <Link href={`/my-pets/${pet.id}`}>
      <Card className="transition-shadow hover:shadow-lg">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            {pet.imageUrl ? (
              <AvatarImage src={pet.imageUrl} alt={pet.name} />
            ) : (
              <AvatarFallback className="text-lg">
                {getPetInitials(pet.name)}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-xl">{pet.name}</CardTitle>
            <p className="text-sm text-gray-500">
              {getCategoryEmoji(pet.category)} {pet.category}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {pet.breed && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Breed:</span> {pet.breed}
            </p>
          )}
          {pet.gender && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Gender:</span> {pet.gender}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
