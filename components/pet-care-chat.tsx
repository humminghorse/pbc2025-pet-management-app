"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Bot, User, Loader2 } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface PetCareChatProps {
  petId: string
  petName: string
  petCategory: string
  petBreed?: string | null
  petAge?: string
}

export function PetCareChat({
  petId,
  petName,
  petCategory,
  petBreed,
  petAge,
}: PetCareChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `こんにちは！${petName}のケアについてお手伝いします。健康管理、しつけ、食事、運動など、何でもお気軽にご質問ください。`,
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")

    // ユーザーメッセージを追加
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userMessage },
    ]
    setMessages(newMessages)
    setIsLoading(true)

    try {
      const response = await fetch(`/api/pets/${petId}/care-advice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          petInfo: {
            name: petName,
            category: petCategory,
            breed: petBreed,
            age: petAge,
          },
          conversationHistory: newMessages.slice(-10), // 直近10メッセージのみ送信
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to get advice")
      }

      // AIメッセージを追加
      setMessages([
        ...newMessages,
        { role: "assistant", content: data.advice },
      ])
    } catch (error) {
      console.error("Error getting advice:", error)
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "申し訳ございません。アドバイスの取得に失敗しました。もう一度お試しください。",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AIペットケアアドバイザー
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* メッセージ表示エリア */}
        <div className="mb-4 h-96 space-y-4 overflow-y-auto rounded-lg border bg-gray-50 p-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-900"
                }`}
              >
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              </div>
              {message.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-600">
                  <User className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="rounded-lg bg-white px-4 py-2">
                <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 入力フォーム */}
        <div className="flex gap-2">
          <Input
            placeholder="ペットケアについて質問してください..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* 免責事項 */}
        <p className="mt-4 text-xs text-gray-500">
          ※ このアドバイスは一般的な情報提供を目的としており、獣医師による診断や治療の代わりになるものではありません。健康上の懸念がある場合は、必ず獣医師にご相談ください。
        </p>
      </CardContent>
    </Card>
  )
}
