"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Loader2, Sparkles, X } from "lucide-react"
import { Pet } from "@/types"

interface PetBreedingSimulatorProps {
  pets: Pet[]
}

export function PetBreedingSimulator({ pets }: PetBreedingSimulatorProps) {
  const [selectedParent1, setSelectedParent1] = useState<Pet | null>(null)
  const [selectedParent2, setSelectedParent2] = useState<Pet | null>(null)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState("")

  const handleGenerate = async () => {
    if (!selectedParent1 || !selectedParent2) {
      setError("両親となる2匹のペットを選択してください")
      return
    }

    if (selectedParent1.id === selectedParent2.id) {
      setError("異なるペットを選択してください")
      return
    }

    setIsGenerating(true)
    setError("")
    setGeneratedImage(null)

    try {
      const response = await fetch("/api/pets/breeding-simulator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parent1: {
            category: selectedParent1.category,
            breed: selectedParent1.breed,
            name: selectedParent1.name,
          },
          parent2: {
            category: selectedParent2.category,
            breed: selectedParent2.breed,
            name: selectedParent2.name,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "画像生成に失敗しました")
      }

      setGeneratedImage(data.imageUrl)
    } catch (err) {
      console.error("Error generating image:", err)
      setError(
        err instanceof Error
          ? err.message
          : "画像生成に失敗しました。もう一度お試しください。"
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const handleReset = () => {
    setSelectedParent1(null)
    setSelectedParent2(null)
    setGeneratedImage(null)
    setError("")
  }

  const getPetInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-pink-500" />
          ペット繁殖シミュレーター
        </CardTitle>
        <p className="text-sm text-gray-600">
          2匹のペットを選択して、子供のイメージ画像をAIで生成します
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ペット選択エリア */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* 親1 */}
          <div>
            <h3 className="mb-3 font-semibold text-gray-700">親1を選択</h3>
            {selectedParent1 ? (
              <div className="relative rounded-lg border-2 border-pink-300 bg-pink-50 p-4">
                <button
                  onClick={() => setSelectedParent1(null)}
                  className="absolute right-2 top-2 rounded-full bg-white p-1 shadow hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-3">
                  <Avatar className="h-16 w-16">
                    {selectedParent1.imageUrl ? (
                      <AvatarImage
                        src={selectedParent1.imageUrl}
                        alt={selectedParent1.name}
                      />
                    ) : (
                      <AvatarFallback>
                        {getPetInitials(selectedParent1.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="font-semibold">{selectedParent1.name}</p>
                    <p className="text-sm text-gray-600">
                      {selectedParent1.breed || selectedParent1.category}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {pets.map((pet) => (
                  <button
                    key={pet.id}
                    onClick={() => setSelectedParent1(pet)}
                    disabled={selectedParent2?.id === pet.id}
                    className="flex w-full items-center gap-3 rounded-lg border p-3 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Avatar className="h-12 w-12">
                      {pet.imageUrl ? (
                        <AvatarImage src={pet.imageUrl} alt={pet.name} />
                      ) : (
                        <AvatarFallback>{getPetInitials(pet.name)}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="text-left">
                      <p className="font-medium">{pet.name}</p>
                      <p className="text-sm text-gray-600">
                        {pet.breed || pet.category}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 親2 */}
          <div>
            <h3 className="mb-3 font-semibold text-gray-700">親2を選択</h3>
            {selectedParent2 ? (
              <div className="relative rounded-lg border-2 border-blue-300 bg-blue-50 p-4">
                <button
                  onClick={() => setSelectedParent2(null)}
                  className="absolute right-2 top-2 rounded-full bg-white p-1 shadow hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-3">
                  <Avatar className="h-16 w-16">
                    {selectedParent2.imageUrl ? (
                      <AvatarImage
                        src={selectedParent2.imageUrl}
                        alt={selectedParent2.name}
                      />
                    ) : (
                      <AvatarFallback>
                        {getPetInitials(selectedParent2.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="font-semibold">{selectedParent2.name}</p>
                    <p className="text-sm text-gray-600">
                      {selectedParent2.breed || selectedParent2.category}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {pets.map((pet) => (
                  <button
                    key={pet.id}
                    onClick={() => setSelectedParent2(pet)}
                    disabled={selectedParent1?.id === pet.id}
                    className="flex w-full items-center gap-3 rounded-lg border p-3 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Avatar className="h-12 w-12">
                      {pet.imageUrl ? (
                        <AvatarImage src={pet.imageUrl} alt={pet.name} />
                      ) : (
                        <AvatarFallback>{getPetInitials(pet.name)}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="text-left">
                      <p className="font-medium">{pet.name}</p>
                      <p className="text-sm text-gray-600">
                        {pet.breed || pet.category}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 生成ボタン */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-2">
            <Button
              onClick={handleGenerate}
              disabled={
                !selectedParent1 || !selectedParent2 || isGenerating
              }
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  子供のイメージを生成
                </>
              )}
            </Button>
            {(selectedParent1 || selectedParent2 || generatedImage) && (
              <Button onClick={handleReset} variant="outline" size="lg">
                リセット
              </Button>
            )}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        {/* 生成された画像 */}
        {generatedImage && (
          <div className="space-y-4">
            <h3 className="text-center text-lg font-semibold">
              {selectedParent1?.name} × {selectedParent2?.name} の子供
            </h3>
            <div className="flex justify-center">
              <img
                src={generatedImage}
                alt="Generated offspring"
                className="max-h-96 rounded-lg border-4 border-purple-300 shadow-lg"
              />
            </div>
          </div>
        )}

        {/* 注意事項 */}
        <p className="text-xs text-gray-500">
          ※ この機能はAIによるイメージ生成です。実際の繁殖とは異なります。
        </p>
      </CardContent>
    </Card>
  )
}
