"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Pet, BreedIdentificationResult } from "@/types"
import { Loader2, Sparkles } from "lucide-react"

const petFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
  category: z.string().min(1, "Category is required"),
  breed: z.string().optional(),
  birthday: z.string().optional(),
  gender: z.enum(["Male", "Female", "Unknown", ""]).optional(),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
})

type PetFormValues = z.infer<typeof petFormSchema>

interface PetFormProps {
  initialData?: Pet
  onSubmit: (data: PetFormValues) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function PetForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: PetFormProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>(initialData?.imageUrl || "")
  const [isIdentifying, setIsIdentifying] = useState(false)
  const [identificationMessage, setIdentificationMessage] = useState("")

  const form = useForm<PetFormValues>({
    resolver: zodResolver(petFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      category: initialData?.category || "",
      breed: initialData?.breed || "",
      birthday: initialData?.birthday
        ? new Date(initialData.birthday).toISOString().split("T")[0]
        : "",
      gender: (initialData?.gender as "Male" | "Female" | "Unknown") || "",
      imageUrl: initialData?.imageUrl || "",
    },
  })

  // 画像ファイルを選択したときの処理
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      // プレビュー用のURLを作成
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setImagePreview(result)
        form.setValue("imageUrl", result)
      }
      reader.readAsDataURL(file)
    }
  }

  // AI品種識別関数
  const handleIdentifyBreed = async () => {
    const category = form.getValues("category")
    const imageUrl = form.getValues("imageUrl")

    if (!imageUrl) {
      setIdentificationMessage("画像を選択してください")
      return
    }

    if (!category) {
      setIdentificationMessage("カテゴリを選択してください")
      return
    }

    // DogとCat以外は識別をサポートしない
    if (category !== "Dog" && category !== "Cat") {
      setIdentificationMessage("品種の自動識別は犬と猫のみサポートしています")
      return
    }

    setIsIdentifying(true)
    setIdentificationMessage("")

    try {
      const response = await fetch("/api/pets/identify-breed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageData: imageUrl,
          category: category,
        }),
      })

      const result: BreedIdentificationResult = await response.json()

      if (result.error) {
        setIdentificationMessage(`エラー: ${result.error}`)
      } else if (result.breed) {
        form.setValue("breed", result.breed)
        setIdentificationMessage(`識別結果: ${result.breed} (信頼度: ${Math.round(result.confidence * 100)}%)`)
      }
    } catch (error) {
      console.error("識別エラー:", error)
      setIdentificationMessage("品種の識別に失敗しました。もう一度お試しください。")
    } finally {
      setIsIdentifying(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pet Name *</FormLabel>
              <FormControl>
                <Input placeholder="Enter pet name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Dog">Dog</SelectItem>
                  <SelectItem value="Cat">Cat</SelectItem>
                  <SelectItem value="Bird">Bird</SelectItem>
                  <SelectItem value="Fish">Fish</SelectItem>
                  <SelectItem value="Rabbit">Rabbit</SelectItem>
                  <SelectItem value="Hamster">Hamster</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="breed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Breed</FormLabel>
              <FormControl>
                <Input placeholder="Enter breed (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="birthday"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Birthday</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Gender</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Male" />
                    </FormControl>
                    <FormLabel className="font-normal">Male</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Female" />
                    </FormControl>
                    <FormLabel className="font-normal">Female</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Unknown" />
                    </FormControl>
                    <FormLabel className="font-normal">Unknown</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Photo</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {/* 画像アップロード */}
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                    <FormDescription className="mt-2">
                      画像ファイルをアップロード、またはURL入力
                    </FormDescription>
                  </div>

                  {/* URLによる画像指定（オプション） */}
                  <Input
                    placeholder="https://example.com/pet-photo.jpg"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      setImagePreview(e.target.value)
                    }}
                  />

                  {/* 画像プレビュー */}
                  {imagePreview && (
                    <div className="mt-4">
                      <img
                        src={imagePreview}
                        alt="Pet preview"
                        className="w-48 h-48 object-cover rounded-lg border"
                      />
                    </div>
                  )}

                  {/* AI品種識別ボタン */}
                  {imagePreview && (
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleIdentifyBreed}
                        disabled={isIdentifying}
                        className="w-full sm:w-auto"
                      >
                        {isIdentifying ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            識別中...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            AI品種自動識別
                          </>
                        )}
                      </Button>
                      {identificationMessage && (
                        <p className={`text-sm ${identificationMessage.includes("エラー") ? "text-red-500" : "text-green-600"}`}>
                          {identificationMessage}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : initialData ? "Update Pet" : "Create Pet"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
