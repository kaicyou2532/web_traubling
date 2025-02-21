import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        country: { select: { id: true, jaName: true, enName: true } },
        user: { select: { name: true } }, // ✅ `user.name` を取得
        comments: { select: { id: true } }, // ✅ コメントを取得
        trouble: { select: { jaName: true, enName: true } }, // ✅ トラブルカテゴリー
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      country: post.country
        ? { id: post.country.id, jaName: post.country.jaName, enName: post.country.enName }
        : null,
      comments: post.comments || [],
      user: post.user ? { name: post.user.name } : { name: "匿名" }, // ✅ `null` を防ぐ
      tags: [post.trouble?.jaName || post.trouble?.enName || "不明"],
      isJapan: post.country?.jaName === "日本",
    }));

    return NextResponse.json(formattedPosts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}
