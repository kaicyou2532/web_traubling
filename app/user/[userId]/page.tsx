"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { MapPinIcon, GlobeAltIcon, CalendarIcon, UserPlusIcon, UserMinusIcon } from "@heroicons/react/24/outline";
import { HeartIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/solid";
import { HeartIcon as HeartOutlineIcon } from "@heroicons/react/24/outline";

interface User {
  id: number;
  name: string | null;
  email: string;
  image: string | null;
  profile: {
    bio: string | null;
    location: string | null;
    website: string | null;
  } | null;
  postsCount: number;
  followersCount: number;
  followingCount: number;
}

interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  country: { id: number; jaName: string; enName: string } | null;
  city: { id: number; jaName: string; enName: string } | null;
  category: { id: number; name: string } | null;
  likes: { userId: number }[];
  comments: { id: number; content: string }[];
  _count: {
    likes: number;
    comments: number;
  };
}

export default function UserProfilePage() {
  const params = useParams();
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const userId = params.userId ? decodeURIComponent(params.userId as string) : "";

  // ユーザー情報とフォロー状態を取得
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // ユーザー情報を取得
        const userResponse = await fetch(`/api/user/profile?userId=${encodeURIComponent(userId)}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
        } else {
          console.error("ユーザー情報取得エラー:", userResponse.status);
        }

        // ユーザーの投稿を取得
        const postsResponse = await fetch(`/api/user/posts?userId=${encodeURIComponent(userId)}`);
        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          setPosts(postsData);
        } else {
          console.error("投稿取得エラー:", postsResponse.status);
        }

        // 現在のユーザーがこのユーザーをフォローしているかチェック
        if (session?.user?.email) {
          // 自分のuserIdを取得
          const profileResponse = await fetch('/api/user/profile');
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            if (profileData.id !== userId) {
              const followResponse = await fetch(`/api/user/follow?targetUserId=${encodeURIComponent(userId)}`);
              if (followResponse.ok) {
                const followData = await followResponse.json();
                setIsFollowing(followData.isFollowing);
              } else {
                console.error("フォロー状態取得エラー:", followResponse.status);
              }
            }
          }
        }
      } catch (error) {
        console.error("ユーザーデータ取得エラー:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId && userId !== 'undefined') {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [userId, session]);

  // フォロー/アンフォロー処理
  const handleFollowToggle = async () => {
    if (!session?.user?.email) return;
    
    setFollowLoading(true);
    try {
      const response = await fetch('/api/user/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId: userId,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setIsFollowing(result.isFollowing);
        
        // フォロワー数を更新
        setUser(prev => prev ? {
          ...prev,
          followersCount: prev.followersCount + (result.isFollowing ? 1 : -1)
        } : null);
      }
    } catch (error) {
      console.error("フォロー操作エラー:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  // いいね処理
  const handleLikeToggle = async (postId: number) => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch('/api/post/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId }),
      });

      if (response.ok) {
        const result = await response.json();
        setPosts(prevPosts =>
          prevPosts.map(post => {
            if (post.id === postId) {
              const isLiked = post.likes.some(like => like.userId === session.user?.id);
              return {
                ...post,
                likes: result.isLiked 
                  ? [...post.likes, { userId: session.user?.id || 0 }]
                  : post.likes.filter(like => like.userId !== session.user?.id),
                _count: {
                  ...post._count,
                  likes: post._count.likes + (result.isLiked ? 1 : -1)
                }
              };
            }
            return post;
          })
        );
      }
    } catch (error) {
      console.error("いいね操作エラー:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#007B63] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">ユーザー情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">ユーザーが見つかりません</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = user?.id && session?.user?.email === user.email;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* プロフィールヘッダー */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
            <div className="flex-shrink-0">
              <Image
                src={user.image || "/default-avatar.png"}
                alt={user.name || "ユーザー"}
                width={120}
                height={120}
                className="rounded-full mx-auto md:mx-0"
              />
            </div>
            
            <div className="flex-grow mt-4 md:mt-0 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.name || "名前未設定"}
                  </h1>
                  <p className="text-gray-600">{user.email}</p>
                </div>
                
                {!isOwnProfile && session?.user && (
                  <button
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={`mt-4 md:mt-0 px-6 py-2 rounded-full font-medium transition-colors ${
                      isFollowing
                        ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        : "bg-[#007B63] text-white hover:bg-[#006854]"
                    } ${followLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {followLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        処理中...
                      </div>
                    ) : isFollowing ? (
                      <>
                        <UserMinusIcon className="h-5 w-5 inline mr-2" />
                        フォロー中
                      </>
                    ) : (
                      <>
                        <UserPlusIcon className="h-5 w-5 inline mr-2" />
                        フォローする
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="flex gap-6 mt-4 justify-center md:justify-start">
                <div className="text-center">
                  <p className="font-bold text-lg">{user.postsCount}</p>
                  <p className="text-sm text-gray-600">投稿</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg">{user.followersCount}</p>
                  <p className="text-sm text-gray-600">フォロワー</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg">{user.followingCount}</p>
                  <p className="text-sm text-gray-600">フォロー中</p>
                </div>
              </div>

              {user.profile?.bio && (
                <p className="mt-4 text-gray-700">{user.profile.bio}</p>
              )}

              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600 justify-center md:justify-start">
                {user.profile?.location && (
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {user.profile.location}
                  </div>
                )}
                {user.profile?.website && (
                  <div className="flex items-center">
                    <GlobeAltIcon className="h-4 w-4 mr-1" />
                    <a 
                      href={user.profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#007B63] hover:underline"
                    >
                      {user.profile.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 投稿一覧 */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              {isOwnProfile ? "あなたの投稿" : `${user.name || "ユーザー"}の投稿`}
            </h2>
          </div>

          {posts.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {posts.map((post) => {
                const isLiked = session?.user && post.likes.some(like => like.userId === session.user.id);
                
                return (
                  <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-700 mb-3">{post.content}</p>
                      
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                        {post.country && (
                          <span className="flex items-center">
                            <MapPinIcon className="h-4 w-4 mr-1" />
                            {post.country.jaName}
                            {post.city && ` - ${post.city.jaName}`}
                          </span>
                        )}
                        {post.category && (
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {post.category.name}
                          </span>
                        )}
                        <span className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {new Date(post.createdAt).toLocaleDateString('ja-JP')}
                        </span>
                      </div>

                      <div className="flex items-center gap-6">
                        <button
                          onClick={() => handleLikeToggle(post.id)}
                          disabled={!session?.user}
                          className="flex items-center text-gray-600 hover:text-red-500 transition-colors disabled:cursor-not-allowed"
                        >
                          {isLiked ? (
                            <HeartIcon className="h-5 w-5 mr-1 text-red-500" />
                          ) : (
                            <HeartOutlineIcon className="h-5 w-5 mr-1" />
                          )}
                          <span>{post._count.likes}</span>
                        </button>
                        
                        <div className="flex items-center text-gray-600">
                          <ChatBubbleLeftIcon className="h-5 w-5 mr-1" />
                          <span>{post._count.comments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-gray-600">
                {isOwnProfile ? "まだ投稿がありません" : "このユーザーはまだ投稿していません"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}