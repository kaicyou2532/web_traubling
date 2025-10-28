import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    // トラブルカテゴリーを取得して投稿数を付与
    const categories = await prisma.trouble.findMany({
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      },
    })

    const categoriesWithCounts = categories.map(category => ({
      id: category.id,
      jaName: category.jaName,
      enName: category.enName,
      postCount: category._count.posts
    }))

    // 都市を取得して投稿数を付与
    const cities = await prisma.city.findMany({
      include: {
        country: {
          select: {
            jaName: true,
            enName: true,
          }
        },
        _count: {
          select: {
            posts: true
          }
        }
      },
    })

    // 国別にグループ化
    const citiesByCountry: Record<string, Array<{
      id: number;
      jaName: string;
      enName: string;
      postCount: number;
    }>> = {}

    cities.forEach(city => {
      const countryName = city.country.jaName
      if (!citiesByCountry[countryName]) {
        citiesByCountry[countryName] = []
      }

      citiesByCountry[countryName].push({
        id: city.id,
        jaName: city.jaName,
        enName: city.enName,
        postCount: city._count.posts
      })
    })

    // 投稿数の多い順にソート
    Object.keys(citiesByCountry).forEach(country => {
      citiesByCountry[country].sort((a, b) => b.postCount - a.postCount)
    })

    return NextResponse.json({
      categories: categoriesWithCounts.sort((a, b) => b.postCount - a.postCount),
      cities: citiesByCountry
    })
  } catch (error) {
    console.error("Error fetching filter options:", error)
    return NextResponse.json({ error: "Failed to fetch filter options" }, { status: 500 })
  }
}