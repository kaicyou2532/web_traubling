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

    // プロフィールデータの整形（profileフィールドはJSONとして保存されている）
    let profileData: any = {};
    try {
      profileData = user.profile ? JSON.parse(user.profile) : {};
    } catch {
      profileData = { bio: user.profile || "" }; // 既存データの互換性
    }

    const profile = {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      bio: profileData.bio || "",
      location: profileData.location || "",
      website: profileData.website || "",
      avatarUrl: user.image,
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
    const { bio, name, location, website } = body;

    // 文字数制限チェック
    if (bio && bio.length > 50) {
      return NextResponse.json(
        { message: "自己紹介は50文字以内で入力してください。" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "ユーザーが見つかりません。" },
        { status: 404 }
      );
    }

    // プロフィール情報の構造化（JSONとして保存）
    let currentProfile: any = {};
    try {
      currentProfile = user.profile ? JSON.parse(user.profile) : {};
    } catch {
      currentProfile = {};
    }

    const updatedProfile = {
      ...currentProfile,
      bio: bio || "",
      location: location || "",
      website: website || "",
    };

    // ユーザー名と構造化されたプロフィール情報を更新
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        name: name || user.name,
        profile: JSON.stringify(updatedProfile),
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