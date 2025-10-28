import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// フォロー/アンフォロー
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "認証されていません。" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { targetEmail } = body;

    if (!targetEmail) {
      return NextResponse.json(
        { message: "フォロー対象のユーザーEmailが必要です。" },
        { status: 400 }
      );
    }

    const [user, targetUser] = await Promise.all([
      prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      }),
      prisma.user.findUnique({
        where: { email: targetEmail },
        select: { id: true },
      }),
    ]);

    if (!user) {
      return NextResponse.json(
        { message: "ユーザーが見つかりません。" },
        { status: 404 }
      );
    }

    if (!targetUser) {
      return NextResponse.json(
        { message: "フォロー対象のユーザーが見つかりません。" },
        { status: 404 }
      );
    }

    // 自分自身をフォローすることはできない
    if (user.id === targetUser.id) {
      return NextResponse.json(
        { message: "自分自身をフォローすることはできません。" },
        { status: 400 }
      );
    }

    // 既にフォローしているかチェック
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: targetUser.id,
        },
      },
    });

    if (existingFollow) {
      // フォロー解除
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: user.id,
            followingId: targetUser.id,
          },
        },
      });

      return NextResponse.json(
        { isFollowing: false, message: "フォローを解除しました。" },
        { status: 200 }
      );
    } else {
      // フォロー
      await prisma.follow.create({
        data: {
          followerId: user.id,
          followingId: targetUser.id,
        },
      });

      return NextResponse.json(
        { isFollowing: true, message: "フォローしました。" },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("フォロー処理エラー:", error);
    return NextResponse.json(
      { message: "フォロー処理に失敗しました。" },
      { status: 500 }
    );
  }
}

// フォロー状態の確認
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "認証されていません。" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const targetEmail = searchParams.get('targetEmail');

    if (!targetEmail) {
      return NextResponse.json(
        { message: "対象ユーザーEmailが必要です。" },
        { status: 400 }
      );
    }

    const [user, targetUser] = await Promise.all([
      prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      }),
      prisma.user.findUnique({
        where: { email: targetEmail },
        select: { id: true },
      }),
    ]);

    if (!user) {
      return NextResponse.json(
        { message: "ユーザーが見つかりません。" },
        { status: 404 }
      );
    }

    if (!targetUser) {
      return NextResponse.json(
        { message: "対象ユーザーが見つかりません。" },
        { status: 404 }
      );
    }

    const isFollowing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: targetUser.id,
        },
      },
    });

    return NextResponse.json(
      { isFollowing: !!isFollowing },
      { status: 200 }
    );
  } catch (error) {
    console.error("フォロー状態確認エラー:", error);
    return NextResponse.json(
      { message: "フォロー状態の確認に失敗しました。" },
      { status: 500 }
    );
  }
}