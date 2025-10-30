import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId');
    
    // userIdパラメータがある場合は他のユーザーの投稿、なければ自分の投稿
    let userId: string;
    
    if (targetUserId && targetUserId !== 'undefined') {
      userId = targetUserId;
    } else {
      const session = await auth();
      if (!session?.user?.email) {
        return NextResponse.json(
          { message: "認証されていません。" },
          { status: 401 }
        );
      }
      // セッションからuserIdを取得
      const sessionUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      if (!sessionUser) {
        return NextResponse.json(
          { message: "ユーザーが見つかりません。" },
          { status: 404 }
        );
      }
      userId = sessionUser.id;
    }

    // userIdが無効な場合のバリデーション
    if (!userId || userId === 'undefined') {
      return NextResponse.json(
        { message: "有効なUserIDが必要です。" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "ユーザーが見つかりません。" },
        { status: 404 }
      );
    }

    const posts = await prisma.post.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        country: {
          select: { id: true, jaName: true, enName: true },
        },
        city: {
          select: { id: true, jaName: true, enName: true },
        },
        trouble: {
          select: { id: true, jaName: true, enName: true },
        },
        comments: {
          select: { id: true, content: true },
        },
        _count: {
          select: { comments: true },
        },
      },
    });

    // 各投稿のいいね情報を別途取得
    const postsWithLikes = await Promise.all(
      posts.map(async (post) => {
        const likes = await prisma.like.findMany({
          where: { postId: post.id },
          select: { userId: true },
        });

        return {
          ...post,
          likes,
          _count: {
            ...post._count,
            likes: likes.length,
          },
          category: post.trouble, // troubleをcategoryとして扱う
        };
      })
    );

    // データをそのまま返す（フロントエンド側で整形）
    return NextResponse.json(postsWithLikes, { status: 200 });
  } catch (error) {
    console.error("投稿取得エラー:", error);
    return NextResponse.json(
      { message: "投稿の取得に失敗しました。" },
      { status: 500 }
    );
  }
}