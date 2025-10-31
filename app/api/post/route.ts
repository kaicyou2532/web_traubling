import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const POST = async (req: NextRequest) => {
  try {
    const payload = await req.json();
    
    // デバッグ用ログ
    console.log("API受信データ:", payload);
    console.log("コンテンツデータ:", {
      content: payload.content,
      contentLength: payload.content?.length,
      title: payload.title
    });
    
    const {
      countryId,
      cityId,
      troubleId,
      travelMonth,
      travelYear,
      content,
      title,
      latitude,
      longitude,
    } = payload;
    
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // セッションのemailからユーザーを取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (travelMonth < 1 || travelMonth > 12) {
      return NextResponse.json({ error: "Invalid travel month" }, { status: 400 });
    }
    if (travelYear < 2005 || travelYear > 2025) {
      return NextResponse.json({ error: "Invalid travel year" }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        userId: user.id,
        countryId,
        cityId,
        troubleId,
        travelMonth,
        travelYear,
        content,
        title,
        latitude,
        longitude,
      },
    });
    
    // 作成された投稿を確認
    console.log("作成された投稿:", {
      id: post.id,
      title: post.title,
      contentLength: post.content?.length,
      content: post.content?.substring(0, 100) + "..." // 最初の100文字のみ表示
    });
    
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Post creation error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
};

export { POST };
