import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface PetInfo {
  name: string
  category: string
  breed?: string | null
  age?: string
}

// POST /api/pets/[id]/care-advice - ペットケアのアドバイスを取得
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // リクエストボディから情報を取得
    const body = await request.json()
    const {
      message,
      petInfo,
      conversationHistory,
    }: {
      message: string
      petInfo: PetInfo
      conversationHistory: Message[]
    } = body

    if (!message || !petInfo) {
      return NextResponse.json(
        { error: "Message and pet info are required" },
        { status: 400 }
      )
    }

    // Google Gemini APIの初期化
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    // システムプロンプトの作成
    const systemPrompt = `あなたは経験豊富なペットケアアドバイザーです。以下のペットについて、飼い主からの質問に答えてください。

ペット情報：
- 名前: ${petInfo.name}
- 種類: ${petInfo.category}
${petInfo.breed ? `- 品種: ${petInfo.breed}` : ""}
${petInfo.age ? `- 年齢: ${petInfo.age}` : ""}

重要な注意事項：
1. 常に日本語で回答してください
2. 一般的なケアアドバイス（食事、運動、しつけ、グルーミングなど）を提供してください
3. 医療的な診断や治療の提案は避け、健康上の懸念がある場合は必ず獣医師に相談するよう促してください
4. 具体的で実践的なアドバイスを心がけてください
5. 親しみやすく、分かりやすい言葉で説明してください
6. ペットの種類や品種の特性を考慮したアドバイスをしてください`

    // 会話履歴をGemini形式に変換
    const chatHistory = conversationHistory
      .map((msg) => {
        if (msg.role === "user") {
          return `ユーザー: ${msg.content}`
        } else {
          return `アシスタント: ${msg.content}`
        }
      })
      .join("\n\n")

    // 完全なプロンプトの作成
    const fullPrompt = `${systemPrompt}

これまでの会話:
${chatHistory}

ユーザーの質問: ${message}

上記の質問に対して、ペット情報を考慮した具体的で役立つアドバイスを提供してください。`

    // Gemini APIにリクエスト
    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    const advice = response.text()

    return NextResponse.json({ advice: advice.trim() }, { status: 200 })
  } catch (error) {
    console.error("Error getting care advice:", error)

    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    return NextResponse.json(
      {
        error: `Failed to get care advice: ${errorMessage}`,
      },
      { status: 500 }
    )
  }
}
