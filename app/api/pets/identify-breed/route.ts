import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import type { BreedIdentificationResult } from "@/types"

// POST /api/pets/identify-breed - 画像から犬種/猫種を識別
export async function POST(request: Request) {
  try {
    // 認証チェック
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Google Gemini APIキーの確認
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Gemini API key is not configured" },
        { status: 500 }
      )
    }

    // リクエストボディから画像データとカテゴリを取得
    const body = await request.json()
    const { imageData, category } = body

    if (!imageData || !category) {
      return NextResponse.json(
        { error: "Image data and category are required" },
        { status: 400 }
      )
    }

    // Google Gemini APIの初期化
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    // プロンプトの作成（カテゴリに応じて変更）
    const categoryText = category === "Dog" ? "犬" : category === "Cat" ? "猫" : "動物"
    const prompt = `この画像に写っている${categoryText}の品種を特定してください。
品種名のみを日本語で、簡潔に回答してください（例: 柴犬、アメリカンショートヘア、など）。
品種が不明な場合は「ミックス」または「不明」と回答してください。`

    // Base64データからMIMEタイプを抽出
    let mimeType = "image/jpeg"
    let base64Data = imageData

    if (imageData.startsWith("data:")) {
      const matches = imageData.match(/^data:([^;]+);base64,(.+)$/)
      if (matches) {
        mimeType = matches[1]
        base64Data = matches[2]
      }
    }

    // 画像データの準備
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    }

    // Gemini APIに画像を送信して分析
    const result = await model.generateContent([prompt, imagePart])
    const response = await result.response
    const text = response.text()

    // レスポンスの作成
    const identificationResult: BreedIdentificationResult = {
      breed: text.trim(),
      confidence: 0.8, // Gemini APIは信頼度を直接提供しないため、固定値
      category: category,
      description: `Google Gemini AIによる識別結果`,
    }

    return NextResponse.json(identificationResult, { status: 200 })
  } catch (error) {
    console.error("Error identifying breed:", error)

    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    return NextResponse.json(
      {
        breed: "",
        confidence: 0,
        category: "Other",
        error: `Failed to identify breed: ${errorMessage}`,
      } as BreedIdentificationResult,
      { status: 500 }
    )
  }
}
