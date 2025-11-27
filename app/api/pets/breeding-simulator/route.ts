import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

interface ParentPet {
  category: string
  breed?: string | null
  name: string
}

// POST /api/pets/breeding-simulator - 2匹のペットから子供の画像を生成
export async function POST(request: Request) {
  try {
    // 認証チェック
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Hugging Face APIキーの確認
    const apiKey = process.env.HUGGINGFACE_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "Hugging Face API key is not configured" },
        { status: 500 }
      )
    }

    // リクエストボディから情報を取得
    const body = await request.json()
    const { parent1, parent2 }: { parent1: ParentPet; parent2: ParentPet } = body

    if (!parent1 || !parent2) {
      return NextResponse.json(
        { error: "Both parents are required" },
        { status: 400 }
      )
    }

    // プロンプトの生成
    const prompt = generatePrompt(parent1, parent2)

    console.log("Generated prompt:", prompt)

    // Hugging Face Inference APIを使って画像生成
    // Stable Diffusion XL モデルを使用
    const modelUrl = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"

    const response = await fetch(modelUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          negative_prompt: "ugly, deformed, noisy, blurry, distorted, low quality, bad anatomy",
          num_inference_steps: 30,
          guidance_scale: 7.5,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Hugging Face API error:", errorText)

      // モデルがロード中の場合
      if (response.status === 503) {
        return NextResponse.json(
          { error: "AIモデルを起動中です。数秒後にもう一度お試しください。" },
          { status: 503 }
        )
      }

      throw new Error(`Hugging Face API error: ${response.status} ${errorText}`)
    }

    // 画像データを取得（Blobとして）
    const imageBlob = await response.blob()

    // BlobをBase64に変換
    const buffer = await imageBlob.arrayBuffer()
    const base64Image = Buffer.from(buffer).toString('base64')
    const imageUrl = `data:image/png;base64,${base64Image}`

    return NextResponse.json({ imageUrl }, { status: 200 })
  } catch (error) {
    console.error("Error generating breeding image:", error)

    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    return NextResponse.json(
      {
        error: `画像生成に失敗しました: ${errorMessage}`,
      },
      { status: 500 }
    )
  }
}

// プロンプト生成関数
function generatePrompt(parent1: ParentPet, parent2: ParentPet): string {
  const breed1 = parent1.breed || parent1.category
  const breed2 = parent2.breed || parent2.category

  // 両親の品種情報を元にプロンプトを生成
  const prompt = `A cute adorable baby ${parent1.category.toLowerCase()} that is a mix between ${breed1} and ${breed2},
high quality, detailed, professional photography, studio lighting,
cute expression, fluffy fur, sitting pose, white background,
photorealistic, 8k resolution, award winning pet photography`

  return prompt
}
