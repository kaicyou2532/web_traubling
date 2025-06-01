import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { PrismaClient } from "@prisma/client"
import { authOptions } from "@/app/api/auth/[...nextauth]/route" // authOptionsのパスを適宜修正してください

const prisma = new PrismaClient()

/**
 * @route GET /api/user/posts
 * @description ログインユーザーの投稿したトラブルを取得します。
 * @returns {Response} 投稿リスト、またはエラーメッセージ
 */
export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.email) {
    return NextResponse.json({ message: "認証されていません。" }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ message: "ユーザーが見つかりません。" }, { status: 404 })
    }

    const posts = await prisma.post.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        likeCount: true,
        comments: {
          select: { id: true }, // コメント数を数えるため
        },
        trouble: {
          select: { jaName: true }, // troubleIdからjaNameを取得
        },
        // mypage.tsx の Post 型に合わせるため、ここでは `tags` が必要ですが、
        // Prisma スキーマの Post モデルには直接 `tags` フィールドがありません。
        // `trouble.jaName` をタグとして利用するか、別途タグ管理の仕組みが必要です。
        // ここでは `trouble.jaName` をタグとして利用します。
      },
    })

    // `mypage.tsx` の Post 型に合わせてデータを整形します。
    const formattedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      date: new Date(post.createdAt).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      }),
      likes: post.likeCount,
      comments: post.comments.length,
      tags: [post.trouble.jaName], // TroubleのjaNameをタグとして利用
    }))

    return NextResponse.json(formattedPosts, { status: 200 })
  } catch (error) {
    console.error("投稿取得エラー:", error)
    return NextResponse.json({ message: "投稿の取得に失敗しました。" }, { status: 500 })
  }
}