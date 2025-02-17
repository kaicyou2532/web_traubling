import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    // `CountryId !== 1` の `City` を取得し、`Country` の情報も取得
    const cities = await prisma.city.findMany({
      where: {
        CountryId: { not: 1 }, // ✅ 日本以外の都市を取得
      },
      include: {
        country: true, // ✅ `Country` の情報も含める
      },
    })

    // `CountryId` ごとに `City` をグループ化
    const groupedData = cities.reduce((acc, city) => {
      const countryId = city.country.id
      if (!acc[countryId]) {
        acc[countryId] = {
          id: city.country.id,
          jaName: city.country.jaName,
          cities: [],
        }
      }
      acc[countryId].cities.push({
        id: city.id,
        enName: city.enName,
        jaName: city.jaName,
        Photourl: city.Photourl,
      })
      return acc
    }, {})

    return NextResponse.json(Object.values(groupedData)) // ✅ JSON を返す
  } catch (error) {
    console.error("Failed to fetch data:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
