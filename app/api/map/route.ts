import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const troubleId = searchParams.get("troubleId");
    const countryId = searchParams.get("countryId");
    const bounds = searchParams.get("bounds"); // 地図の表示範囲 "lat1,lng1,lat2,lng2"

    // 検索条件を構築
    const searchTerms = query.split(/\s+/).filter(Boolean);
    
    const whereCondition: any = {
      AND: [
        // 緯度経度が存在する投稿のみ
        {
          latitude: { not: null },
          longitude: { not: null },
        },
        // テキスト検索（複数キーワード対応）
        ...searchTerms.map((term) => ({
          OR: [
            { title: { contains: term, mode: "insensitive" } },
            { content: { contains: term, mode: "insensitive" } },
            { country: { jaName: { contains: term, mode: "insensitive" } } },
            { country: { enName: { contains: term, mode: "insensitive" } } },
            { city: { jaName: { contains: term, mode: "insensitive" } } },
            { city: { enName: { contains: term, mode: "insensitive" } } },
            { trouble: { jaName: { contains: term, mode: "insensitive" } } },
            { trouble: { enName: { contains: term, mode: "insensitive" } } },
          ],
        })),
        // トラブル種別フィルタ
        ...(troubleId ? [{ troubleId: parseInt(troubleId) }] : []),
        // 国フィルタ
        ...(countryId ? [{ countryId: parseInt(countryId) }] : []),
        // 地図表示範囲フィルタ
        ...(bounds ? (() => {
          const [lat1, lng1, lat2, lng2] = bounds.split(',').map(Number);
          const minLat = Math.min(lat1, lat2);
          const maxLat = Math.max(lat1, lat2);
          const minLng = Math.min(lng1, lng2);
          const maxLng = Math.max(lng1, lng2);
          
          return [{
            latitude: { gte: minLat, lte: maxLat },
            longitude: { gte: minLng, lte: maxLng },
          }];
        })() : []),
      ],
    };

    // 投稿データを取得
    const posts = await prisma.post.findMany({
      where: whereCondition,
      select: {
        id: true,
        title: true,
        content: true,
        latitude: true,
        longitude: true,
        createdAt: true,
        // リレーションデータも含める
        country: {
          select: {
            id: true,
            jaName: true,
            enName: true,
          },
        },
        city: {
          select: {
            id: true,
            jaName: true,
            enName: true,
          },
        },
        trouble: {
          select: {
            id: true,
            jaName: true,
            enName: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        // コメント数を取得
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 500, // 地図表示のため最大件数を制限
    });

    // レスポンス用にデータを整形
    const formattedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content.substring(0, 200) + (post.content.length > 200 ? "..." : ""), // プレビュー用に短縮
      latitude: post.latitude,
      longitude: post.longitude,
      country: post.country,
      city: post.city,
      trouble: post.trouble,
      user: post.user,
      commentCount: post._count.comments,
      createdAt: post.createdAt,
    }));

    // 統計情報も一緒に返す
    const stats = {
      totalPosts: formattedPosts.length,
      countriesCount: new Set(formattedPosts.filter(p => p.country).map(p => p.country!.id)).size,
      troublesCount: new Set(formattedPosts.filter(p => p.trouble).map(p => p.trouble!.id)).size,
    };

    return NextResponse.json({
      posts: formattedPosts,
      stats,
      query: {
        searchQuery: query,
        troubleId,
        countryId,
        bounds,
      },
    });

  } catch (error) {
    console.error("地図データの取得に失敗しました:", error);
    return NextResponse.json(
      { 
        error: "地図データの取得に失敗しました",
        posts: [],
        stats: { totalPosts: 0, countriesCount: 0, troublesCount: 0 }
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// フィルタ用のメタデータを取得するエンドポイント
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type } = body; // "troubles" | "countries" | "cities"

    let data;

    switch (type) {
      case "troubles":
        data = await prisma.trouble.findMany({
          select: {
            id: true,
            jaName: true,
            enName: true,
            _count: {
              select: {
                posts: {
                  where: {
                    latitude: { not: null },
                    longitude: { not: null },
                  },
                },
              },
            },
          },
          orderBy: { jaName: "asc" },
        });
        break;

      case "countries":
        data = await prisma.country.findMany({
          select: {
            id: true,
            jaName: true,
            enName: true,
            _count: {
              select: {
                posts: {
                  where: {
                    latitude: { not: null },
                    longitude: { not: null },
                  },
                },
              },
            },
          },
          orderBy: { jaName: "asc" },
        });
        break;

      case "cities":
        data = await prisma.city.findMany({
          select: {
            id: true,
            jaName: true,
            enName: true,
            country: {
              select: {
                jaName: true,
                enName: true,
              },
            },
            _count: {
              select: {
                posts: {
                  where: {
                    latitude: { not: null },
                    longitude: { not: null },
                  },
                },
              },
            },
          },
          orderBy: { jaName: "asc" },
        });
        break;

      default:
        return NextResponse.json(
          { error: "無効なタイプが指定されました" },
          { status: 400 }
        );
    }

    // 投稿数が0でないもののみフィルタリング
    const filteredData = data.filter((item: any) => item._count.posts > 0);

    return NextResponse.json({
      type,
      data: filteredData,
      total: filteredData.length,
    });

  } catch (error) {
    console.error("フィルタデータの取得に失敗しました:", error);
    return NextResponse.json(
      { error: "フィルタデータの取得に失敗しました" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
