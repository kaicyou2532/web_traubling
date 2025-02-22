import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    // `City` を取得し、`CountryId` を使って `Country` を紐付ける
    const cities = await prisma.city.findMany({
      include: {
        country: {
          select: {
            id: true,
            jaName: true,
          },
        },
      },
    })

    // `Country` ごとに `City` をグループ化
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

    return NextResponse.json(Object.values(groupedData))
  } catch (error) {
    console.error("Failed to fetch data:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}


