import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "ログインが必要です" }, { status: 401 })
    }

    const postId = parseInt(params.id)
    if (isNaN(postId)) {
      return NextResponse.json({ error: "無効な投稿IDです" }, { status: 400 })
    }

    // ユーザーを取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 })
    }

    // 既存のいいねを確認
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: postId
        }
      }
    })

    if (existingLike) {
      // いいねを削除（取り消し）
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId: user.id,
            postId: postId
          }
        }
      })

      // 新しいいいね数を取得
      const likeCount = await prisma.like.count({
        where: { postId: postId }
      })

      return NextResponse.json({ 
        liked: false, 
        likeCount 
      })
    } else {
      // いいねを追加
      await prisma.like.create({
        data: {
          userId: user.id,
          postId: postId
        }
      })

      // 新しいいいね数を取得
      const likeCount = await prisma.like.count({
        where: { postId: postId }
      })

      return NextResponse.json({ 
        liked: true, 
        likeCount 
      })
    }
  } catch (error) {
    console.error("Like error:", error)
    return NextResponse.json(
      { error: "いいね処理中にエラーが発生しました" },
      { status: 500 }
    )
  }
}