import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "認証されていません。" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "ユーザーが見つかりません。" },
        { status: 404 }
      );
    }

    // いいねした投稿を取得
    const likedPosts = await prisma.like.findMany({
      where: { userId: user.id },
      include: {
        post: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            city: {
              select: {
                jaName: true,
                enName: true,
              },
            },
            country: {
              select: {
                jaName: true,
                enName: true,
              },
            },
            trouble: {
              select: {
                jaName: true,
                enName: true,
              },
            },
            comments: {
              select: { id: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // データの整形
    const formattedPosts = likedPosts.map((like) => ({
      id: like.post.id,
      title: like.post.title,
      content: like.post.content,
      date: new Date(like.post.createdAt).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      }),
      likes: like.post.likeCount,
      comments: like.post.comments.length,
      tags: [like.post.trouble.jaName],
      user: like.post.user,
      location: `${like.post.country.jaName}・${like.post.city.jaName}`,
      likedAt: like.createdAt,
    }));

    return NextResponse.json(formattedPosts, { status: 200 });
  } catch (error) {
    console.error("いいねした投稿取得エラー:", error);
    return NextResponse.json(
      { message: "いいねした投稿の取得に失敗しました。" },
      { status: 500 }
    );
  }
}