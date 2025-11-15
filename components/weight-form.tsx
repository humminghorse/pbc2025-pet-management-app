"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface WeightFormProps {
  petId: string
  onSuccess: () => void
}

export function WeightForm({ petId, onSuccess }: WeightFormProps) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [weight, setWeight] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await fetch(`/api/pets/${petId}/weight`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: new Date(date).toISOString(),
          weight: parseFloat(weight),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to add weight record")
        setIsLoading(false)
        return
      }

      // フォームをリセット
      setWeight("")
      setDate(new Date().toISOString().split("T")[0])
      setIsLoading(false)
      onSuccess()
    } catch (err) {
      setError("An unexpected error occurred")
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>計測日</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date" className="sr-only">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                disabled={isLoading}
                className="text-center text-lg"
              />
            </div>
            <div className="flex items-center gap-2">
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="12.3"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
                disabled={isLoading}
                className="text-center text-lg"
              />
              <span className="text-lg font-semibold text-blue-600">Kg</span>
            </div>
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 py-6 text-lg font-semibold uppercase hover:bg-blue-700"
          >
            {isLoading ? "Registering..." : "Register"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
