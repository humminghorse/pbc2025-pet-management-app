import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/pets/[id]/weight - 特定のペットの体重記録を取得
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // ペットの所有権を確認
    const pet = await prisma.pet.findUnique({
      where: { id },
    })

    if (!pet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 })
    }

    if (pet.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // 体重記録を取得（日付順にソート）
    const weightRecords = await prisma.weightRecord.findMany({
      where: {
        petId: id,
      },
      orderBy: {
        date: "asc",
      },
    })

    return NextResponse.json({ weightRecords }, { status: 200 })
  } catch (error) {
    console.error("Error fetching weight records:", error)
    return NextResponse.json(
      { error: "Failed to fetch weight records" },
      { status: 500 }
    )
  }
}

// POST /api/pets/[id]/weight - 新しい体重記録を作成
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // ペットの所有権を確認
    const pet = await prisma.pet.findUnique({
      where: { id },
    })

    if (!pet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 })
    }

    if (pet.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { weight, date } = body

    if (!weight || !date) {
      return NextResponse.json(
        { error: "Weight and date are required" },
        { status: 400 }
      )
    }

    // 体重記録を作成
    const weightRecord = await prisma.weightRecord.create({
      data: {
        petId: id,
        weight: parseFloat(weight),
        date: new Date(date),
      },
    })

    return NextResponse.json({ weightRecord }, { status: 201 })
  } catch (error) {
    console.error("Error creating weight record:", error)
    return NextResponse.json(
      { error: "Failed to create weight record" },
      { status: 500 }
    )
  }
}
