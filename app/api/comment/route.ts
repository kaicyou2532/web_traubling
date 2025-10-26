// import { NextRequest, NextResponse } from "next/server"
// import { auth } from "@/auth"
// import { prisma } from "@/lib/prisma"
// import { getServerSession } from "next-auth/next"

// export async function GET(req: NextRequest) {
//     const { searchParams } = new URL(req.url)
//     const postId = searchParams.get
//     if (!postId) {
//         return NextResponse.json({ error: 'postId is required' }, { status: 400 })
//       }
//     const comments = await prisma.comment.findMany({
//         where: {postId: Number(postId)},
//         include: {User: true},
//         orderBy: {createAt: "asc"},
//     })
//     return NextResponse.json(comments)
// }



// const POST = async (req: NextRequest) => {
//     const session = await getServerSession(authOptions)
//     if (!session?.user?.Id) {
//         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//       }
//     const body = await req.json()
//     const{postId, content} = body
//     if (!postId || !content) {
//         return NextResponse.json({ error: 'invalid data' }, { status: 400 })
//       }
//     const comment = await prisma.comment.create({
//         data: {
//             content,
//             postId: Number(postId),
//         },
//     })

//     return NextResponse.json(post, { status: 201 })
    
// }

// export { POST }

// 修正版

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const postId = searchParams.get("postId")

    if (!postId) {
      return NextResponse.json({ error: "postId is required" }, { status: 400 })
    }

    const comments = await prisma.comment.findMany({
      where: { postId: Number(postId) },
      orderBy: { id: "asc" },
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error("コメント取得エラー:", error)
    return NextResponse.json({ error: "コメントの取得に失敗しました" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: "Unauthorized", 
        message: "認証が必要です" 
      }, { status: 401 })
    }

    // ユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true }
    })

    if (!user) {
      return NextResponse.json({ 
        error: "User not found", 
        message: "ユーザーが見つかりません" 
      }, { status: 404 })
    }

    const body = await req.json()
    const { postId, content } = body

    if (!postId || !content?.trim()) {
      return NextResponse.json({ 
        error: "Invalid data", 
        message: "投稿IDとコメント内容は必須です" 
      }, { status: 400 })
    }

    // 投稿が存在するかチェック
    const post = await prisma.post.findUnique({
      where: { id: Number(postId) }
    })

    if (!post) {
      return NextResponse.json({ 
        error: "Post not found", 
        message: "投稿が見つかりません" 
      }, { status: 404 })
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId: Number(postId),
        userId: user.id, // String IDをそのまま使用
      },
    })

    return NextResponse.json({ 
      ...comment, 
      message: "コメントを投稿しました",
      success: true 
    }, { status: 201 })

  } catch (error) {
    console.error("コメント投稿エラー:", error)
    return NextResponse.json({ 
      error: "Server error", 
      message: "コメントの投稿に失敗しました",
      success: false 
    }, { status: 500 })
  }
}
