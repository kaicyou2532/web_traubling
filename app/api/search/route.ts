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
    const cityFilter = searchParams.get("city");
    const troubleFilter = searchParams.get("trouble");
    const sortBy = searchParams.get("sortBy") || "newest";
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

    // フィルター条件を構築
    const filters: any[] = [];

    // カテゴリーフィルター（国内/海外/カテゴリー/地域）
    if (category === "domestic") {
      // 日本国内の投稿のみ
      filters.push({ country: { id: 1 } });
    } else if (category === "overseas") {
      // 海外の投稿のみ
      filters.push({ country: { NOT: { id: 1 } } });
    } else if (category === "category") {
      // 分野別フィルター - subCategoryやtroubleFilterがあれば適用
      if (subCategory) {
        filters.push({
          trouble: {
            OR: [
              { jaName: subCategory },
              { enName: subCategory },
            ],
          },
        });
      }
    } else if (category === "region") {
      // 地域別フィルター - countryFilterがあれば適用
      if (countryFilter) {
        filters.push({
          OR: [
            {
              country: {
                OR: [
                  { jaName: { contains: countryFilter, mode: Prisma.QueryMode.insensitive } },
                  { enName: { contains: countryFilter, mode: Prisma.QueryMode.insensitive } },
                ],
              }
            },
            {
              city: {
                OR: [
                  { jaName: { contains: countryFilter, mode: Prisma.QueryMode.insensitive } },
                  { enName: { contains: countryFilter, mode: Prisma.QueryMode.insensitive } },
                ],
              }
            }
          ]
        });
      }
    }

    // 都市フィルター（カテゴリに関係なく適用）
    if (cityFilter) {
      const cityId = parseInt(cityFilter);
      if (!isNaN(cityId)) {
        filters.push({ cityId });
      }
    }

    // トラブルカテゴリーフィルター（カテゴリに関係なく適用）
    if (troubleFilter) {
      const troubleId = parseInt(troubleFilter);
      if (!isNaN(troubleId)) {
        filters.push({ troubleId });
      }
    }

    // テキスト検索条件
    if (terms.length > 0) {
      filters.push({
        AND: terms.map((word) => ({
          OR: [
            { title: { contains: word, mode: Prisma.QueryMode.insensitive } },
            { content: { contains: word, mode: Prisma.QueryMode.insensitive } },
            { country: { jaName: { contains: word, mode: Prisma.QueryMode.insensitive } } },
            { country: { enName: { contains: word, mode: Prisma.QueryMode.insensitive } } },
            { trouble: { jaName: { contains: word, mode: Prisma.QueryMode.insensitive } } },
            { trouble: { enName: { contains: word, mode: Prisma.QueryMode.insensitive } } },
            { city: { jaName: { contains: word, mode: Prisma.QueryMode.insensitive } } },
            { city: { enName: { contains: word, mode: Prisma.QueryMode.insensitive } } },
          ],
        })),
      });
    }

    const where = filters.length > 0 ? { AND: filters } : {};

    // ソート条件を決定
    let orderBy: Prisma.PostOrderByWithRelationInput;
    switch (sortBy) {
      case "likes":
        orderBy = { likeCount: "desc" };
        break;
      case "comments":
        orderBy = { comments: { _count: "desc" } };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

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
          user: { select: { id: true, name: true, email: true } },
          comments: { select: { id: true } },
          trouble: { select: { jaName: true, enName: true } },
        },
        orderBy,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.post.count({ where }),
    ]);

    // いいね情報を取得
    let userLikes: Record<number, boolean> = {};
    
    if (currentUserId && posts.length > 0) {
      try {
        // Likeテーブルから直接取得
        const likeRecords = await prisma.$queryRaw`
          SELECT "postId" 
          FROM "Like" 
          WHERE "userId" = ${currentUserId} 
          AND "postId" = ANY(${posts.map(post => post.id)})
        ` as { postId: number }[];
        
        userLikes = likeRecords.reduce((acc: Record<number, boolean>, like) => {
          acc[like.postId] = true;
          return acc;
        }, {});
      } catch (likeError) {
        console.log("Like情報の取得をスキップ:", likeError);
      }
    }

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
      user: post.user ? { id: post.user.id, name: post.user.name, email: post.user.email } : { id: "", name: "匿名", email: "" },
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
