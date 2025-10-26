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

    // ユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 })
    }

    // 投稿が存在するか確認
    const post = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      return NextResponse.json({ error: "投稿が見つかりません" }, { status: 404 })
    }

    // 一時的にlikeCountフィールドだけを使用（シンプルなトグル方式）
    // 実際のアプリでは、リクエストボディからいいね状態を受け取る
    const body = await request.json().catch(() => ({ isLiked: false }))
    const currentIsLiked = body.isLiked || false

    let isLiked: boolean
    let likeCount: number

    if (currentIsLiked) {
      // いいねを取り消し
      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: { likeCount: Math.max(0, post.likeCount - 1) }
      })
      isLiked = false
      likeCount = updatedPost.likeCount
    } else {
      // いいねを追加
      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: { likeCount: post.likeCount + 1 }
      })
      isLiked = true
      likeCount = updatedPost.likeCount
    }

    return NextResponse.json({ 
      liked: isLiked, 
      likeCount: Math.max(0, likeCount) // 負の数にならないように
    })
  } catch (error) {
    console.error("Like error:", error)
    return NextResponse.json(
      { error: "いいね処理中にエラーが発生しました" },
      { status: 500 }
    )
  }
}