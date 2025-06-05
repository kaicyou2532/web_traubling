import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

interface SearchPost {
  id: number
  title: string
  content: string
  country: { id: number; jaName: string; enName: string } | null
  user: { name: string } | null
  comments: { id: number }[]
  trouble: { jaName: string | null; enName: string | null } | null
}

const prisma = new PrismaClient();
const PAGE_SIZE = 10;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const term = searchParams.get("term")?.toLowerCase() || "";
    const category = searchParams.get("category");
    const subCategory = searchParams.get("subCategory");
    const countryFilter = searchParams.get("country")?.toLowerCase() || "";
    const page = parseInt(searchParams.get("page") || "1", 10);

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
            { jaName: { contains: countryFilter, mode: "insensitive" } },
            { enName: { contains: countryFilter, mode: "insensitive" } },
          ],
        },
      }),
      AND: terms.map((word) => ({
        OR: [
          { title: { contains: word, mode: "insensitive" } },
          { content: { contains: word, mode: "insensitive" } },
          { country: { jaName: { contains: word, mode: "insensitive" } } },
          { country: { enName: { contains: word, mode: "insensitive" } } },
          { trouble: { jaName: { contains: word, mode: "insensitive" } } },
          { trouble: { enName: { contains: word, mode: "insensitive" } } },
        ],
      })),
    };

    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          country: { select: { id: true, jaName: true, enName: true } },
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

    const formattedPosts = posts.map((post: SearchPost) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      country: post.country
        ? { id: post.country.id, jaName: post.country.jaName, enName: post.country.enName }
        : null,
      comments: post.comments || [],
      user: post.user ? { name: post.user.name } : { name: "匿名" },
      tags: [post.trouble?.jaName || post.trouble?.enName || "不明"],
      isJapan: post.country?.id === 1,
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
