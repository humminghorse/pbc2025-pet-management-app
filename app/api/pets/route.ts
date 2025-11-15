import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/pets - ログインユーザーのペット一覧を取得
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const pets = await prisma.pet.findMany({
      where: {
        ownerId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ pets }, { status: 200 })
  } catch (error) {
    console.error("Error fetching pets:", error)
    return NextResponse.json({ error: "Failed to fetch pets" }, { status: 500 })
  }
}

// POST /api/pets - 新しいペットを作成
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, category, breed, birthday, gender, imageUrl } = body

    if (!name || !category) {
      return NextResponse.json(
        { error: "Name and category are required" },
        { status: 400 }
      )
    }

    const pet = await prisma.pet.create({
      data: {
        ownerId: session.user.id,
        name,
        category,
        breed: breed || null,
        birthday: birthday ? new Date(birthday) : null,
        gender: gender || null,
        imageUrl: imageUrl || null,
      },
    })

    return NextResponse.json({ pet }, { status: 201 })
  } catch (error) {
    console.error("Error creating pet:", error)
    return NextResponse.json({ error: "Failed to create pet" }, { status: 500 })
  }
}
