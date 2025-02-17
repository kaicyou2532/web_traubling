import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma" // lib/prisma.ts のシングルトン Prisma を利用

export async function GET() {
  try {
    const cities = await prisma.city.findMany()
    return NextResponse.json(cities, { status: 200 })
  } catch (error) {
    console.error("Database fetch error:", error)
    return NextResponse.json({ error: "データの取得に失敗しました" }, { status: 500 })
  }
}
