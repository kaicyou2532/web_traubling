import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { commentId: string } }
) {
  try {
    const commentId = parseInt(params.commentId);
    
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ユーザーIDを取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // まずは基本的なベストアンサー機能のみ実装
    // Prismaクライアントの型が更新されるまでは、この実装で動作確認
    return NextResponse.json({ 
      success: true,
      message: "ベストアンサー機能は開発中です。Prismaマイグレーション後に有効になります。"
    });

  } catch (error) {
    console.error("Error setting best answer:", error);
    return NextResponse.json({ 
      error: "Internal server error" 
    }, { status: 500 });
  }
}