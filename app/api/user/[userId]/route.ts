import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { userId } = params;

    // ユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    // フォロー状態を確認（ログインユーザーのみ）
    let isFollowing = false;
    if (session?.user?.email) {
      const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (currentUser && currentUser.id !== userId) {
        const followRelation = await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: currentUser.id,
              followingId: userId,
            },
          },
        });
        isFollowing = !!followRelation;
      }
    }

    // レスポンスデータを構築
    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      bio: user.bio,
      location: user.location,
      website: user.website,
      postsCount: user._count.posts,
      followersCount: user._count.followers,
      followingCount: user._count.following,
      isFollowing,
    };

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('ユーザープロフィール取得エラー:', error);
    return NextResponse.json(
      { error: '内部サーバーエラー' },
      { status: 500 }
    );
  }
}