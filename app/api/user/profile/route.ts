import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId');
    
    // userIdパラメータがある場合は他のユーザーのプロフィール、なければ自分のプロフィール
    let userId: string;
    
    if (targetUserId && targetUserId !== 'undefined') {
      userId = targetUserId;
    } else {
      const session = await auth();
      if (!session?.user?.email) {
        return NextResponse.json(
          { message: "認証されていません。" },
          { status: 401 }
        );
      }
      // セッションからuserIdを取得
      const sessionUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      if (!sessionUser) {
        return NextResponse.json(
          { message: "ユーザーが見つかりません。" },
          { status: 404 }
        );
      }
      userId = sessionUser.id;
    }

    // userIdが無効な場合のバリデーション
    if (!userId || userId === 'undefined') {
      return NextResponse.json(
        { message: "有効なUserIDが必要です。" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "ユーザーが見つかりません。" },
        { status: 404 }
      );
    }

    // 投稿数を個別に取得
    const postsCount = await prisma.post.count({
      where: { userId: user.id },
    });

    // フォロワー・フォロー数を個別に取得
    const followersCount = await prisma.follow.count({
      where: { followingId: user.id },
    });
    
    const followingCount = await prisma.follow.count({
      where: { followerId: user.id },
    });

    // プロフィールデータの整形
    const profile = {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      bio: user.profile?.bio || "",
      avatarUrl: user.profile?.avatarUrl || user.image,
      postsCount,
      followersCount,
      followingCount,
      createdAt: user.createdAt,
    };

    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    console.error("プロフィール取得エラー:", error);
    return NextResponse.json(
      { message: "プロフィールの取得に失敗しました。" },
      { status: 500 }
    );
  }
}

// プロフィール更新
export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "認証されていません。" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bio, name } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "ユーザーが見つかりません。" },
        { status: 404 }
      );
    }

    // ユーザー名を更新
    if (name !== undefined) {
      await prisma.user.update({
        where: { id: user.id },
        data: { name },
      });
    }

    // プロフィールを更新（存在しない場合は作成）
    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        bio: bio || "",
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        bio: bio || "",
        avatarUrl: user.image,
      },
    });

    return NextResponse.json(
      { message: "プロフィールが更新されました。" },
      { status: 200 }
    );
  } catch (error) {
    console.error("プロフィール更新エラー:", error);
    return NextResponse.json(
      { message: "プロフィールの更新に失敗しました。" },
      { status: 500 }
    );
  }
}