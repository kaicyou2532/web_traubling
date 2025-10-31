import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // ユーザーの専門分野（ベストアンサー数）を取得
    const expertises = await prisma.userExpertise.findMany({
      where: {
        userId: userId
      },
      include: {
        city: true,
        trouble: true
      },
      orderBy: {
        bestAnswerCount: 'desc'
      }
    });

    // マスター認定は10以上のベストアンサーが条件
    const processedExpertises = expertises.map(expertise => ({
      id: expertise.id,
      cityName: expertise.city.jaName,
      troubleName: expertise.trouble.jaName,
      bestAnswerCount: expertise.bestAnswerCount,
      isMaster: expertise.bestAnswerCount >= 10
    }));

    return NextResponse.json({
      success: true,
      expertises: processedExpertises
    });

  } catch (error) {
    console.error("Error fetching user expertises:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}