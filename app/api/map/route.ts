import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Prismaクライアントのインスタンスを作成
const prisma = new PrismaClient();

export async function GET() {
  try {
    // データベースから投稿を取得します
    const posts = await prisma.post.findMany({
      // 緯度と経度がnullでない投稿のみをフィルタリングします
      where: {
        latitude: {
          not: null,
        },
        longitude: {
          not: null,
        },
      },
      // APIレスポンスに含めるフィールドを選択します
      select: {
        id: true,
        title: true,
        content: true,
        latitude: true,
        longitude: true,
      },
    });

    // 取得した投稿データをJSON形式で返します
    return NextResponse.json(posts);
  } catch (error) {
    // エラーハンドリング
    console.error("投稿の取得に失敗しました:", error);
    // 500 Internal Server Errorを返します
    return new NextResponse("Internal Server Error", { status: 500 });
  } finally {
    // データベース接続を切断します
    await prisma.$disconnect();
  }
}
