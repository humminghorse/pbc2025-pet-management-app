import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// DELETE /api/pets/[id]/weight/[recordId] - 体重記録を削除
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; recordId: string }> }
) {
  try {
    const { id, recordId } = await params
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

    // 体重記録を削除
    const weightRecord = await prisma.weightRecord.findUnique({
      where: { id: recordId },
    })

    if (!weightRecord) {
      return NextResponse.json(
        { error: "Weight record not found" },
        { status: 404 }
      )
    }

    if (weightRecord.petId !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.weightRecord.delete({
      where: { id: recordId },
    })

    return NextResponse.json(
      { message: "Weight record deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error deleting weight record:", error)
    return NextResponse.json(
      { error: "Failed to delete weight record" },
      { status: 500 }
    )
  }
}
