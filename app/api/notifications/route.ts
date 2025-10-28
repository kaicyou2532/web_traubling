import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// 通知一覧取得
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "認証されていません。" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "ユーザーが見つかりません。" },
        { status: 404 }
      );
    }

    // 通知を取得（新しい順）
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      include: {
        fromUser: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20, // 最新20件
    });

    return NextResponse.json(notifications, { status: 200 });
  } catch (error) {
    console.error("通知取得エラー:", error);
    return NextResponse.json(
      { message: "通知の取得に失敗しました。" },
      { status: 500 }
    );
  }
}

// 通知を既読にする
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
    const { notificationId, markAllAsRead } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: "ユーザーが見つかりません。" },
        { status: 404 }
      );
    }

    if (markAllAsRead) {
      // 全ての未読通知を既読にする
      await prisma.notification.updateMany({
        where: { 
          userId: user.id,
          isRead: false,
        },
        data: { isRead: true },
      });

      return NextResponse.json(
        { message: "すべての通知を既読にしました。" },
        { status: 200 }
      );
    } else if (notificationId) {
      // 特定の通知を既読にする
      await prisma.notification.update({
        where: { 
          id: notificationId,
          userId: user.id, // セキュリティ：自分の通知のみ
        },
        data: { isRead: true },
      });

      return NextResponse.json(
        { message: "通知を既読にしました。" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "通知IDまたはmarkAllAsReadが必要です。" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("通知更新エラー:", error);
    return NextResponse.json(
      { message: "通知の更新に失敗しました。" },
      { status: 500 }
    );
  }
}

// 未読通知数を取得
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }

    const unreadCount = await prisma.notification.count({
      where: { 
        userId: user.id,
        isRead: false,
      },
    });

    return NextResponse.json({ count: unreadCount }, { status: 200 });
  } catch (error) {
    console.error("未読通知数取得エラー:", error);
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}