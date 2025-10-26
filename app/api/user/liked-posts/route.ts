import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";

interface LikedPostWithRelations {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
  likeCount: number;
  latitude: number | null;
  longitude: number | null;
  comments: { id: number }[];
  user: {
    id: number;
    name: string | null;
    image: string | null;
  };
  country: {
    jaName: string;
  } | null;
  city: {
    jaName: string;
  } | null;
  trouble: {
    jaName: string;
  };
}

const prisma = new PrismaClient();

export async function GET() {
  try {
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

    // ユーザーがいいねした投稿を取得
    const likedPosts = await (prisma as any).like.findMany({
      where: { userId: user.id },
      select: {
        post: {
          select: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
            likeCount: true,
            latitude: true,
            longitude: true,
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            country: {
              select: {
                jaName: true,
              },
            },
            city: {
              select: {
                jaName: true,
              },
            },
            trouble: {
              select: {
                jaName: true,
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
    const formattedPosts = likedPosts.map((like: any) => {
      const post = like.post as LikedPostWithRelations;
      return {
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
        user: {
          id: post.user.id,
          name: post.user.name || "不明なユーザー",
          image: post.user.image,
        },
        country: post.country?.jaName || "不明",
        city: post.city?.jaName || null,
        latitude: post.latitude,
        longitude: post.longitude,
        isLiked: true, // いいねした投稿なので常にtrue
      };
    });

    return NextResponse.json(formattedPosts, { status: 200 });
  } catch (error) {
    console.error("いいねした投稿取得エラー:", error);
    return NextResponse.json(
      { message: "いいねした投稿の取得に失敗しました。" },
      { status: 500 }
    );
  }
}