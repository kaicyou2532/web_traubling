import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { auth } from "@/auth"

// 動的レンダリングを強制
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const term = searchParams.get("term")?.toLowerCase() || "";
    const category = searchParams.get("category");
    const subCategory = searchParams.get("subCategory");
    const countryFilter = searchParams.get("country")?.toLowerCase() || "";
    const page = parseInt(searchParams.get("page") || "1", 10);

    // ★ セッション情報を安全に取得
    let currentUserId = null;
    try {
      const session = await auth();
      if (session?.user?.email) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email }
        });
        currentUserId = user?.id;
      }
    } catch (authError) {
      console.log("Auth not available, continuing without user context");
    }

    const terms = term.split(/\s+/).filter(Boolean);

    const where = {
      ...(category === "domestic" && { country: { id: 1 } }),
      ...(category === "overseas" && { country: { NOT: { id: 1 } } }),
      ...(category === "category" && subCategory && {
        trouble: {
          OR: [
            { jaName: subCategory },
            { enName: subCategory },
          ],
        },
      }),
      ...(category === "region" && countryFilter && {
        country: {
          OR: [
            { jaName: { contains: countryFilter, mode: Prisma.QueryMode.insensitive } },
            { enName: { contains: countryFilter, mode: Prisma.QueryMode.insensitive } },
          ],
        },
      }),
      AND: terms.map((word) => ({
        OR: [
          { title: { contains: word, mode: Prisma.QueryMode.insensitive } },
          { content: { contains: word, mode: Prisma.QueryMode.insensitive } },
          { country: { jaName: { contains: word, mode: Prisma.QueryMode.insensitive } } },
          { country: { enName: { contains: word, mode: Prisma.QueryMode.insensitive } } },
          { trouble: { jaName: { contains: word, mode: Prisma.QueryMode.insensitive } } },
          { trouble: { enName: { contains: word, mode: Prisma.QueryMode.insensitive } } },
        ],
      })),
    };

    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where,
        select: {
          id: true,
          title: true,
          content: true,
          latitude: true,  // 緯度を追加
          longitude: true, // 経度を追加
          likeCount: true, // いいね数を追加
          createdAt: true,
          country: { select: { id: true, jaName: true, enName: true } },
          city: { select: { id: true, jaName: true, enName: true } },    // 都市を追加
          user: { select: { name: true } },
          comments: { select: { id: true } },
          trouble: { select: { jaName: true, enName: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.post.count({ where }),
    ]);

    // いいね情報を取得（Likeモデルが利用可能になるまで一時的に無効化）
    let userLikes: Record<number, boolean> = {};

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      latitude: post.latitude,   // 緯度を追加
      longitude: post.longitude, // 経度を追加
      country: post.country
        ? { id: post.country.id, jaName: post.country.jaName, enName: post.country.enName }
        : null,
      city: post.city
        ? { id: post.city.id, jaName: post.city.jaName, enName: post.city.enName }
        : null,                  // 都市を追加
      comments: post.comments || [],
      user: post.user ? { name: post.user.name } : { name: "匿名" },
      tags: [post.trouble?.jaName || post.trouble?.enName || "不明"],
      isJapan: post.country?.id === 1,
      // いいね情報を追加
      likeCount: post.likeCount || 0,
      isLiked: userLikes[post.id] || false,
    }));

    return NextResponse.json({
      posts: formattedPosts,
      totalCount,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}
