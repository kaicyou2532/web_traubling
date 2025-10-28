"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Lock, Heart, MessageSquare, Globe, UserPlus, UserMinus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

// 投稿の型定義
interface Post {
  id: number;
  title: string;
  content: string;
  date: string;
  likes: number;
  comments: number;
  tags: string[];
}

// ユーザープロフィールの型定義
interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  bio?: string;
  location?: string;
  website?: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

interface UserPageProps {
  userId: string;
}

export default function UserPage({ userId }: UserPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  // ユーザープロフィールと投稿データを取得
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // ユーザープロフィールを取得
        const profileResponse = await fetch(`/api/user/${userId}`);
        if (!profileResponse.ok) {
          throw new Error("ユーザーが見つかりません");
        }
        const profileData = await profileResponse.json();
        setUserProfile(profileData);

        // ユーザーの投稿を取得
        const postsResponse = await fetch(`/api/user/${userId}/posts`);
        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          setPosts(postsData);
        }
      } catch (error) {
        console.error("ユーザーデータ取得エラー:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId, router]);

  // フォロー/アンフォロー処理
  const handleFollowToggle = async () => {
    if (!session?.user || !userProfile) return;

    try {
      setIsFollowLoading(true);
      
      const response = await fetch(`/api/user/${userId}/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: userProfile.isFollowing ? "unfollow" : "follow"
        }),
      });

      if (!response.ok) {
        throw new Error("フォロー処理に失敗しました");
      }

      const data = await response.json();
      
      // プロフィール状態を更新
      setUserProfile(prev => prev ? {
        ...prev,
        isFollowing: data.isFollowing,
        followersCount: data.followersCount
      } : null);

    } catch (error) {
      console.error("フォローエラー:", error);
      alert("フォロー処理に失敗しました");
    } finally {
      setIsFollowLoading(false);
    }
  };

  // ローディング中の表示
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#007B63]"></div>
      </div>
    );
  }

  // ユーザーが見つからない場合
  if (!userProfile) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4 text-center">
        <Lock className="h-24 w-24 text-gray-400 mb-6" />
        <h2 className="text-2xl font-bold mb-3">ユーザーが見つかりません</h2>
        <p className="text-gray-600 mb-6">
          指定されたユーザーは存在しないか、削除された可能性があります。
        </p>
        <Button
          onClick={() => router.push("/")}
          className="bg-[#007B63] hover:bg-[#006854] text-white"
        >
          トップページに戻る
        </Button>
      </div>
    );
  }

  const isOwnProfile = session?.user?.email === userProfile.email;

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      {/* プロフィールセクション */}
      <section className="bg-white pt-6 pb-4 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-start gap-4">
            <div className="relative">
              {userProfile.image ? (
                <Avatar className="w-24 h-24 border-4 border-white shadow-md">
                  <AvatarImage
                    src={userProfile.image || "/placeholder.svg"}
                    alt={userProfile.name}
                  />
                  <AvatarFallback className="text-2xl bg-[#007B63] text-white">
                    {userProfile.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Image
                  src="/placeholder.svg?height=100&width=100"
                  alt="プロフィール画像"
                  width={100}
                  height={100}
                  className="rounded-full border-4 border-white shadow-md object-cover"
                />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">{userProfile.name || "名前未設定"}</h2>
                  <p className="text-gray-600 text-sm">{userProfile.email}</p>
                  
                  {userProfile.location && (
                    <p className="text-gray-600 text-sm flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {userProfile.location}
                    </p>
                  )}
                  
                  {userProfile.website && (
                    <p className="text-gray-600 text-sm flex items-center gap-1 mt-1">
                      <Globe className="h-3 w-3" />
                      <a
                        href={
                          userProfile.website.startsWith("http")
                            ? userProfile.website
                            : `https://${userProfile.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#007B63]"
                      >
                        {userProfile.website}
                      </a>
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {!isOwnProfile && session?.user && (
                    <Button
                      onClick={handleFollowToggle}
                      disabled={isFollowLoading}
                      className={
                        userProfile.isFollowing
                          ? "bg-gray-600 hover:bg-gray-700 text-white"
                          : "bg-[#007B63] hover:bg-[#006854] text-white"
                      }
                      type="button"
                    >
                      {isFollowLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      ) : userProfile.isFollowing ? (
                        <>
                          <UserMinus className="h-4 w-4 mr-2" />
                          フォロー中
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          フォローする
                        </>
                      )}
                    </Button>
                  )}
                  
                  {isOwnProfile && (
                    <Link href="/mypage">
                      <Button
                        className="bg-[#007B63] hover:bg-[#006854] text-white"
                        type="button"
                      >
                        プロフィールを編集
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              <div className="flex gap-6 mt-4">
                <div className="text-center">
                  <p className="font-bold">{userProfile.postsCount}</p>
                  <p className="text-sm text-gray-600">投稿</p>
                </div>
                <div className="text-center">
                  <p className="font-bold">{userProfile.followersCount}</p>
                  <p className="text-sm text-gray-600">フォロワー</p>
                </div>
                <div className="text-center">
                  <p className="font-bold">{userProfile.followingCount}</p>
                  <p className="text-sm text-gray-600">フォロー中</p>
                </div>
              </div>

              {userProfile.bio && (
                <p className="mt-4 text-sm text-gray-700">{userProfile.bio}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 投稿一覧 */}
      <div className="container mx-auto px-4 mt-4">
        <div className="grid gap-4">
          {posts.length === 0 ? (
            <Card className="bg-white p-6 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                  <Lock className="h-10 w-10 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">まだ投稿がありません</h3>
                  <p className="text-gray-600 mt-2">
                    {isOwnProfile 
                      ? "旅行中に経験したトラブルを共有しましょう" 
                      : "このユーザーはまだ投稿していません"
                    }
                  </p>
                </div>
                {isOwnProfile && (
                  <Link href="/post">
                    <Button
                      type="button"
                      className="bg-[#007B63] hover:bg-[#006854] text-white mt-2"
                    >
                      トラブルを投稿する
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={`post-${post.id}`} className="bg-white overflow-hidden">
                <div className="p-4 border-b">
                  <div className="flex items-center gap-3">
                    {userProfile.image ? (
                      <Avatar className="w-10 h-10">
                        <AvatarImage
                          src={userProfile.image || "/placeholder.svg"}
                          alt={userProfile.name}
                        />
                        <AvatarFallback className="bg-[#007B63] text-white">
                          {userProfile.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <Image
                        src="/placeholder.svg?height=40&width=40"
                        alt="ユーザーアイコン"
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-semibold">{userProfile.name}</p>
                      <p className="text-xs text-gray-500">{post.date}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{post.title}</h3>
                  <div
                    className="text-gray-700 leading-relaxed rich-text-content"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                  <div className="flex gap-2 mb-3">
                    {post.tags.map((tag) => (
                      <Badge
                        key={`tag-${tag}`}
                        className="bg-[#007B63]/10 text-[#007B63] hover:bg-[#007B63]/20"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        className="flex items-center gap-1 text-gray-500"
                      >
                        <Heart className="h-4 w-4" />
                        <span className="text-sm">{post.likes}</span>
                      </button>
                      <button
                        type="button"
                        className="flex items-center gap-1 text-gray-500"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-sm">{post.comments}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}