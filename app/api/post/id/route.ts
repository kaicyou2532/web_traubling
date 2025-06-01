import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { PrismaClient } from "@prisma/client"
import { authOptions } from "@/app/api/auth/[...nextauth]/route" // authOptionsのパスを適宜修正してください

const prisma = new PrismaClient()

/**
 * @route PUT /api/post/[id]
 * @description 特定の投稿を更新します。
 * @param {Request} request - リクエストボディに更新する投稿情報 (title, content, tags) を含みます。
 * @param {object} context - Next.js の dynamic route segment パラメータ ({ params: { id: string } })
 * @returns {Response} 更新された投稿情報、またはエラーメッセージ
 */
export async function PUT(request: Request, context: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.email) {
    return NextResponse.json({ message: "認証されていません。" }, { status: 401 })
  }

  const postId = parseInt(context.params.id, 10)
  if (isNaN(postId)) {
    return NextResponse.json({ message: "無効な投稿IDです。" }, { status: 400 })
  }

  try {
    const { title, content, tags } = await request.json()

    // 投稿の所有者であるかを確認
    const postToUpdate = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true, user: { select: { email: true } } },
    })

    if (!postToUpdate) {
      return NextResponse.json({ message: "投稿が見つかりません。" }, { status: 404 })
    }

    if (postToUpdate.user.email !== session.user.email) {
      return NextResponse.json({ message: "この投稿を編集する権限がありません。" }, { status: 403 })
    }

    // `tags` は `Post` モデルに直接存在しないため、ここでは `troubleId` を更新するロジックが必要です。
    // 今回の例では、`tags` の最初の要素を `troubleId` に対応する `jaName` とみなし、
    // それに対応する `troubleId` を検索して更新します。
    let troubleIdToUpdate: number | undefined
    if (tags && tags.length > 0) {
      const trouble = await prisma.trouble.findFirst({
        where: { jaName: tags[0] },
      })
      if (trouble) {
        troubleIdToUpdate = trouble.id
      } else {
        // 新しいタグ（トラブルタイプ）を動的に作成するか、エラーとするかを検討
        // ここでは、見つからない場合は更新しないか、デフォルト値を設定します。
        // もし新しいタグの作成を許可するなら、別途ロジックが必要です。
        console.warn(`Trouble type for tag '${tags[0]}' not found.`)
      }
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title: title,
        content: content,
        troubleId: troubleIdToUpdate, // タグから取得したtroubleIdを更新
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        likeCount: true,
        comments: {
          select: { id: true },
        },
        trouble: {
          select: { jaName: true },
        },
      },
    })

    const formattedUpdatedPost = {
      id: updatedPost.id,
      title: updatedPost.title,
      content: updatedPost.content,
      date: new Date(updatedPost.createdAt).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      }),
      likes: updatedPost.likeCount,
      comments: updatedPost.comments.length,
      tags: [updatedPost.trouble.jaName],
    }

    return NextResponse.json(formattedUpdatedPost, { status: 200 })
  } catch (error) {
    console.error("投稿更新エラー:", error)
    return NextResponse.json({ message: "投稿の更新に失敗しました。" }, { status: 500 })
  }
}