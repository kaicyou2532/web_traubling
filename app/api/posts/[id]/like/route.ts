import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

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

    // 既存のいいねをチェック
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: postId
        }
      }
    })

    let isLiked: boolean
    let likeCount: number

    if (existingLike) {
      // いいねを取り消し（Likeレコードを削除）
      await prisma.like.delete({
        where: { id: existingLike.id }
      })

      // likeCountを減算
      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: { likeCount: Math.max(0, post.likeCount - 1) }
      })
      
      isLiked = false
      likeCount = updatedPost.likeCount
    } else {
      // いいねを追加（Likeレコードを作成）
      await prisma.like.create({
        data: {
          userId: user.id,
          postId: postId
        }
      })

      // likeCountを加算
      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: { likeCount: post.likeCount + 1 }
      })
      
      // 自分の投稿でない場合のみ通知を作成
      if (post.userId !== user.id) {
        await prisma.notification.create({
          data: {
            userId: post.userId,
            type: "LIKE",
            message: `${user.name || "匿名ユーザー"}があなたの投稿「${post.title}」にいいねしました。`,
            postId: postId,
            fromUserId: user.id,
          }
        })
      }
      
      isLiked = true
      likeCount = updatedPost.likeCount
    }

    return NextResponse.json({ 
      liked: isLiked, 
      likeCount: Math.max(0, likeCount)
    })
  } catch (error) {
    console.error("Like error:", error)
    
    // ユニーク制約違反の場合（重複いいね試行）
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({ error: "既にいいねしています" }, { status: 409 })
    }
    
    return NextResponse.json(
      { error: "いいね処理中にエラーが発生しました" },
      { status: 500 }
    )
  }
}

// いいね状態を取得するGETエンドポイント
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    const postId = parseInt(params.id)
    if (isNaN(postId)) {
      return NextResponse.json({ error: "無効な投稿IDです" }, { status: 400 })
    }

    // 投稿の基本情報を取得
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { likeCount: true }
    })

    if (!post) {
      return NextResponse.json({ error: "投稿が見つかりません" }, { status: 404 })
    }

    let isLiked = false

    // ログインしている場合のみいいね状態をチェック
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      })

      if (user) {
        const like = await prisma.like.findUnique({
          where: {
            userId_postId: {
              userId: user.id,
              postId: postId
            }
          }
        })
        isLiked = !!like
      }
    }

    return NextResponse.json({
      liked: isLiked,
      likeCount: post.likeCount
    })
  } catch (error) {
    console.error("Get like status error:", error)
    return NextResponse.json(
      { error: "いいね状態の取得中にエラーが発生しました" },
      { status: 500 }
    )
  }
}