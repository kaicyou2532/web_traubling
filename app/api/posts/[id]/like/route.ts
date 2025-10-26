import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // いいね機能は一時的に無効化
    return NextResponse.json({ 
      liked: false, 
      likeCount: 0,
      message: "いいね機能は現在無効になっています"
    })
  } catch (error) {
    console.error("Like error:", error)
    return NextResponse.json(
      { error: "いいね処理中にエラーが発生しました" },
      { status: 500 }
    )
  }
}