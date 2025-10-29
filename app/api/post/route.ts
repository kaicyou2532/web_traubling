import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const POST = async (req: NextRequest) => {
  try {
    console.log("=== POST API Started ===");
    
    const payload = await req.json();
    console.log("Received payload:", payload);
    
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
    console.log("Session:", JSON.stringify(session, null, 2));
    
    if (!session?.user?.email) {
      console.log("No session or email found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // セッションのemailからユーザーを取得
    console.log("Finding user with email:", session.user.email);
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    console.log("Found user:", user);

    if (!user) {
      console.log("User not found in database");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("Validating inputs...");
    if (travelMonth < 1 || travelMonth > 12) {
      console.log("Invalid travel month:", travelMonth);
      return NextResponse.json({ error: "Invalid travel month" }, { status: 400 });
    }
    if (travelYear < 2005 || travelYear > 2025) {
      console.log("Invalid travel year:", travelYear);
      return NextResponse.json({ error: "Invalid travel year" }, { status: 400 });
    }

    console.log("Creating post with data:", {
      userId: user.id,
      countryId,
      cityId,
      troubleId,
      travelMonth,
      travelYear,
      title,
      latitude,
      longitude,
      contentLength: content?.length
    });

    // データベース操作を試行する前に、既存のPostテーブルの最新IDを確認
    const latestPost = await prisma.post.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true }
    });
    console.log("Latest post ID:", latestPost?.id || "No posts exist");

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
    
    console.log("Post created successfully:", post.id);
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
