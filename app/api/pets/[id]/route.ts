import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/pets/[id] - 特定のペットを取得
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

    const pet = await prisma.pet.findUnique({
      where: { id },
    })

    if (!pet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 })
    }

    // 権限チェック：自分のペットかどうか
    if (pet.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({ pet }, { status: 200 })
  } catch (error) {
    console.error("Error fetching pet:", error)
    return NextResponse.json({ error: "Failed to fetch pet" }, { status: 500 })
  }
}

// PUT /api/pets/[id] - ペット情報を更新
export async function PUT(
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

    const pet = await prisma.pet.findUnique({
      where: { id },
    })

    if (!pet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 })
    }

    // 権限チェック：自分のペットかどうか
    if (pet.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { name, category, breed, birthday, gender, imageUrl } = body

    if (!name || !category) {
      return NextResponse.json(
        { error: "Name and category are required" },
        { status: 400 }
      )
    }

    const updatedPet = await prisma.pet.update({
      where: { id },
      data: {
        name,
        category,
        breed: breed || null,
        birthday: birthday ? new Date(birthday) : null,
        gender: gender || null,
        imageUrl: imageUrl || null,
      },
    })

    return NextResponse.json({ pet: updatedPet }, { status: 200 })
  } catch (error) {
    console.error("Error updating pet:", error)
    return NextResponse.json({ error: "Failed to update pet" }, { status: 500 })
  }
}

// DELETE /api/pets/[id] - ペットを削除
export async function DELETE(
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

    const pet = await prisma.pet.findUnique({
      where: { id },
    })

    if (!pet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 })
    }

    // 権限チェック：自分のペットかどうか
    if (pet.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.pet.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Pet deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting pet:", error)
    return NextResponse.json({ error: "Failed to delete pet" }, { status: 500 })
  }
}
