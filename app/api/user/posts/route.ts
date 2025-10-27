// src/app/api/user/posts/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/auth"; // ★★★ getServerSessionの代わりにこれをインポートします
import { PrismaClient } from "@prisma/client";

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

// PostWithRelations 型定義は元のままでOK
interface PostWithRelations {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
  likeCount: number;
  comments: { id: number }[];
  trouble: { jaName: string };
}

const prisma = new PrismaClient();

export async function GET() {
  try {
    // ★★★ セッションの取得方法がこのようにシンプルになります ★★★
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "認証されていません。" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ message: "ユーザーが見つかりません。" }, { status: 404 });
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
          select: { id: true },
        },
        trouble: {
          select: { jaName: true },
        },
      },
    });
    
    // データの整形部分は変更なし
    const formattedPosts = posts.map((post: PostWithRelations) => ({
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
      tags: [post.trouble.jaName],
    }));

    return NextResponse.json(formattedPosts, { status: 200 });
  } catch (error) {
    console.error("投稿取得エラー:", error);
    // エラーがPrisma関連か、それ以外かでメッセージを分けることもできます
    return NextResponse.json(
      { message: "投稿の取得に失敗しました。" },
      { status: 500 }
    );
  }
}