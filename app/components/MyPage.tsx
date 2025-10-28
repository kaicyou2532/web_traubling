"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Edit, Lock, Heart, MessageSquare, Globe, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import dynamic from "next/dynamic";

// ReactQuillを動的にインポートしてSSRを無効化
const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <div className="border rounded p-4 min-h-[200px]">エディターを読み込み中...</div>,
});

// react-quillのスタイルは動的にロードされる

// 投稿の型定義
interface Post {
  id: number;
  title: string;
  content: string;
  date: string; // 例: "2025年4月15日"
  likes: number;
  comments: number;
  tags: string[]; // 例: ["ホテル", "予約"]
}

// いいねした投稿の型定義
interface LikedPost {
  id: number;
  title: string;
  content: string;
  date: string;
  likes: number;
  comments: number;
  tags: string[];
  user: {
    id: number;
    name: string;
    image: string | null;
  };
  country: string;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  isLiked: boolean;
}

// 通知の型定義
interface Notification {
  id: number;
  type: "LIKE" | "COMMENT" | "FOLLOW";
  message: string;
  isRead: boolean;
  createdAt: string;
  fromUser: {
    name: string;
    email: string;
    image: string | null;
  } | null;
  post: {
    id: number;
    title: string;
  } | null;
}

// プロフィールの型定義
interface Profile {
  name: string;
  username: string; // 現在はemailで代用
  location: string;
  website: string;
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
  bio: string;
  image?: string;
}

export default function MyPage() {
  const { data: session, status } = useSession();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isEditPostDialogOpen, setIsEditPostDialogOpen] = useState(false);

  // プロフィール情報の状態
  const [profile, setProfile] = useState<Profile>({
    name: "",
    username: "",
    location: "",
    website: "",
    bio: "",
    image: "",
  });

  // 投稿のサンプルデータ（初期は空）
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<LikedPost[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [activeTab, setActiveTab] = useState("posts");

  // プロフィール情報の取得
  useEffect(() => {
    const fetchProfile = async () => {
      // セッション情報があり、認証済みの場合
      if (status === "authenticated" && session?.user) {
        try {
          // まずAPIから永続化されたプロフィール情報を取得
          const response = await fetch("/api/user/profile");

          // APIから取得したプロフィールデータ（なければ空のオブジェクト）
          const dbProfile: Partial<Profile> = response.ok
            ? await response.json()
            : {};

          // セッション情報とDBの情報をマージして最終的なプロフィールを作成
          // DBに値があればそれを優先し、なければセッション情報でフォールバックする
          const mergedProfile: Profile = {
            name: dbProfile.name || session.user.name || "名前未設定",
            // usernameは通常emailで、変更不可なのでセッションのものを正とする
            username: session.user.email || "",
            location: dbProfile.location || "",
            website: dbProfile.website || "",
            bio: dbProfile.bio || "",
            image: dbProfile.image || session.user.image || "",
            postsCount: dbProfile.postsCount || 0,
            followersCount: dbProfile.followersCount || 0,
            followingCount: dbProfile.followingCount || 0,
          };

          setProfile(mergedProfile);
        } catch (error) {
          console.error("プロフィールフェッチエラー:", error);
          // エラーが発生した場合でも、セッション情報から基本的なプロフィールを設定
          if (session.user) {
            setProfile({
              name: session.user.name || "名前未設定",
              username: session.user.email || "",
              location: "",
              website: "",
              bio: "",
              image: session.user.image || "",
            });
          }
        }
      }
    };

    fetchProfile();
  }, [status, session]);

  // 投稿の取得
  useEffect(() => {
    const fetchPosts = async () => {
      // プロフィール情報がロードされ、ユーザーが認証されていれば投稿を取得
      if (status === "authenticated" && profile.username) {
        try {
          const response = await fetch("/api/user/posts");
          if (!response.ok) {
            throw new Error("投稿の取得に失敗しました。");
          }
          const data: Post[] = await response.json();
          setPosts(data);
        } catch (error) {
          console.error("投稿フェッチエラー:", error);
          // エラー処理
        }
      }
    };

    fetchPosts();
  }, [status, profile.username]); // profile.usernameに依存させることで、プロフィールロード後に投稿を取得

  // いいねした投稿の取得
  useEffect(() => {
    const fetchLikedPosts = async () => {
      if (status === "authenticated" && profile.username) {
        try {
          const response = await fetch("/api/user/liked-posts");
          if (!response.ok) {
            throw new Error("いいねした投稿の取得に失敗しました。");
          }
          const data: LikedPost[] = await response.json();
          setLikedPosts(data);
        } catch (error) {
          console.error("いいねした投稿フェッチエラー:", error);
          // エラー処理
        }
      }
    };

    fetchLikedPosts();
  }, [status, profile.username]);

  // 通知の取得
  useEffect(() => {
    const fetchNotifications = async () => {
      if (status === "authenticated" && session?.user) {
        try {
          const response = await fetch("/api/notifications");
          if (response.ok) {
            const data = await response.json();
            setNotifications(data);
          }
        } catch (error) {
          console.error("通知フェッチエラー:", error);
        }
      }
    };

    fetchNotifications();
  }, [status, session]);

  // URL パラメータからタブを設定
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get("tab");
      if (tab && ["posts", "liked", "notifications"].includes(tab)) {
        setActiveTab(tab);
      }
    }
  }, []);

  // 通知を既読にする処理
  const markAsRead = async (notificationId?: number) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notificationId,
          markAllAsRead: !notificationId,
        }),
      });

      if (response.ok) {
        // 通知リストを更新
        if (notificationId) {
          setNotifications(prev => 
            prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
          );
        } else {
          setNotifications(prev => 
            prev.map(n => ({ ...n, isRead: true }))
          );
        }
      }
    } catch (error) {
      console.error("通知の既読処理エラー:", error);
    }
  };

  // プロフィール更新処理
  const handleProfileUpdate = async () => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error("プロフィールの更新に失敗しました。");
      }

      const updatedProfile: Profile = await response.json();
      setProfile(updatedProfile);
      setIsProfileDialogOpen(false);
      // 成功メッセージ表示などの追加処理
      alert("プロフィールが更新されました！");
    } catch (error) {
      console.error("プロフィール更新エラー:", error);
      alert("プロフィールの更新に失敗しました。");
    }
  };

  // 投稿編集処理
  const handleEditPost = (post: Post) => {
    setCurrentPost(post);
    setIsEditPostDialogOpen(true);
  };

  // 投稿保存処理
  const handleSavePost = async () => {
    if (!currentPost) return;

    try {
      const response = await fetch(`/api/user/posts/${currentPost.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currentPost),
      });

      if (!response.ok) {
        throw new Error("投稿の更新に失敗しました。");
      }

      const updatedPost: Post = await response.json();
      setPosts(
        posts.map((post) => (post.id === updatedPost.id ? updatedPost : post))
      );
      setIsEditPostDialogOpen(false);
      // 成功メッセージ表示などの追加処理
      alert("投稿が更新されました！");
    } catch (error) {
      console.error("投稿保存エラー:", error);
      alert("投稿の更新に失敗しました。");
    }
  };

  // いいね解除処理
  const handleUnlikePost = async (e: React.MouseEvent, postId: number) => {
    e.stopPropagation();

    try {
      // いいねを取り消すAPIを呼び出し（isLiked: trueで送信）
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isLiked: true }),
      });

      if (!response.ok) {
        throw new Error("いいねの取り消しに失敗しました。");
      }

      const data = await response.json();

      // いいね一覧から該当投稿を削除
      setLikedPosts((prevPosts) =>
        prevPosts.filter((post) => post.id !== postId)
      );

      // 成功メッセージ（オプション）
      // alert("いいねを取り消しました。");
    } catch (error) {
      console.error("いいね解除エラー:", error);
      alert("いいねの取り消しに失敗しました。");
    }
  };

  // ローディング中の表示
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#007B63]"></div>
      </div>
    );
  }

  // 認証されていない場合の表示
  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4 text-center">
        <Lock className="h-24 w-24 text-gray-400 mb-6" />
        <h2 className="text-2xl font-bold mb-3">ログインが必要です</h2>
        <p className="text-gray-600 mb-6">
          このページを表示するにはログインしてください。
        </p>
        <Button
          // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
          onClick={() => (window.location.href = "/api/auth/signin")} // NextAuthのサインインページへリダイレクト
          className="bg-[#007B63] hover:bg-[#006854] text-white"
        >
          ログイン
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      {/* ヘッダーは別コンポーネントで実装されているため省略 */}

      {/* プロフィールセクション */}
      <section className="bg-white pt-6 pb-4 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-start gap-4">
            <div className="relative">
              {profile.image ? (
                <Avatar className="w-24 h-24 border-4 border-white shadow-md">
                  <AvatarImage
                    src={profile.image || "/placeholder.svg"}
                    alt={profile.name}
                  />
                  <AvatarFallback className="text-2xl bg-[#007B63] text-white">
                    {profile.name?.charAt(0)}
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
                  <h2 className="text-xl font-bold">
                    {profile.name || "名前未設定"}
                  </h2>
                  <p className="text-gray-600 text-sm">{profile.username}</p>{" "}
                  {/* username (email) を表示 */}
                  <p className="text-gray-600 text-sm flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />{" "}
                    {profile.location || "場所未設定"}
                  </p>
                  {profile.website && (
                    <p className="text-gray-600 text-sm flex items-center gap-1 mt-1">
                      <Globe className="h-3 w-3" />
                      <a
                        href={
                          profile.website.startsWith("http")
                            ? profile.website
                            : `https://${profile.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#007B63]"
                      >
                        {profile.website}
                      </a>
                    </p>
                  )}
                </div>
                <Button
                  className="bg-[#007B63] hover:bg-[#006854] text-white"
                  onClick={() => setIsProfileDialogOpen(true)}
                  type="button"
                >
                  プロフィールを編集
                </Button>
              </div>

              <div className="flex gap-6 mt-4">
                <div className="text-center">
                  <p className="font-bold">{profile.postsCount || posts.length}</p>
                  <p className="text-sm text-gray-600">投稿</p>
                </div>
                <div className="text-center">
                  <p className="font-bold">{profile.followersCount || 0}</p>
                  <p className="text-sm text-gray-600">フォロワー</p>
                </div>
                <div className="text-center">
                  <p className="font-bold">{profile.followingCount || 0}</p>
                  <p className="text-sm text-gray-600">フォロー中</p>
                </div>
              </div>

              {profile.bio && (
                <p className="mt-4 text-sm text-gray-700">{profile.bio}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* タブナビゲーション */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="container mx-auto px-4 mt-4">
        <TabsList className="w-full bg-white rounded-md border mb-4">
          <TabsTrigger
            value="posts"
            className="flex-1 data-[state=active]:text-[#007B63] data-[state=active]:border-b-2 data-[state=active]:border-[#007B63]"
          >
            投稿したトラブル
          </TabsTrigger>
          <TabsTrigger
            value="liked"
            className="flex-1 data-[state=active]:text-[#007B63] data-[state=active]:border-b-2 data-[state=active]:border-[#007B63]"
          >
            いいねしたトラブル
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex-1 data-[state=active]:text-[#007B63] data-[state=active]:border-b-2 data-[state=active]:border-[#007B63] relative"
          >
            通知
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {notifications.filter(n => !n.isRead).length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* 投稿したトラブル */}
        <TabsContent value="posts">
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
                      旅行中に経験したトラブルを共有しましょう
                    </p>
                  </div>
                  <Link href="/post">
                    <Button
                      type="button"
                      className="bg-[#007B63] hover:bg-[#006854] text-white mt-2"
                    >
                      トラブルを投稿する
                    </Button>
                  </Link>
                </div>
              </Card>
            ) : (
              posts.map((post) => (
                <Card
                  key={`post-${post.id}`}
                  className="bg-white overflow-hidden"
                >
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-3">
                      {profile.image ? (
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={profile.image || "/placeholder.svg"}
                            alt={profile.name}
                          />
                          <AvatarFallback className="bg-[#007B63] text-white">
                            {profile.name?.charAt(0)}
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
                        <p className="font-semibold">{profile.name}</p>
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
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-[#007B63]"
                        onClick={() => handleEditPost(post)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        編集する
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* いいねしたトラブル */}
        <TabsContent value="liked">
          <div className="grid gap-4">
            {likedPosts.length === 0 ? (
              <Card className="bg-white p-6 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                    <Heart className="h-10 w-10 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">
                      まだいいねした投稿がありません
                    </h3>
                    <p className="text-gray-600 mt-2">
                      他のユーザーの投稿をチェックしていいねしましょう
                    </p>
                  </div>
                  <Link href="/">
                    <Button
                      type="button"
                      className="bg-[#007B63] hover:bg-[#006854] text-white mt-2"
                    >
                      投稿を探す
                    </Button>
                  </Link>
                </div>
              </Card>
            ) : (
              likedPosts.map((post) => (
                <Card
                  key={`liked-${post.id}`}
                  className="bg-white overflow-hidden"
                >
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-3">
                      {post.user.image ? (
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={post.user.image || "/placeholder.svg"}
                            alt={post.user.name}
                          />
                          <AvatarFallback className="bg-[#007B63] text-white">
                            {post.user.name?.charAt(0)}
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
                        <p className="font-semibold">{post.user.name}</p>
                        <p className="text-xs text-gray-500">{post.date}</p>
                      </div>
                      <div className="ml-auto flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {post.country}
                          {post.city && ` - ${post.city}`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">{post.title}</h3>
                    <div
                      className="text-gray-700 mb-3 line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                    <div className="flex gap-2 mb-3">
                      {post.tags.map((tag, index) => (
                        <Badge
                          key={`liked-tag-${post.id}-${index}`}
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
                          onClick={(e) => handleUnlikePost(e, post.id)}
                          className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors"
                          title="いいねを取り消す"
                        >
                          <Heart className="h-4 w-4 fill-current" />
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
                      {post.latitude && post.longitude && (
                        <div className="text-xs text-gray-500">
                          位置情報あり
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* 通知タブ */}
        <TabsContent value="notifications">
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600">通知はありません</p>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">通知</h3>
                  {notifications.some(n => !n.isRead) && (
                    <Button
                      onClick={() => markAsRead()}
                      variant="outline"
                      size="sm"
                      className="text-[#007B63] border-[#007B63] hover:bg-[#007B63] hover:text-white"
                    >
                      すべて既読にする
                    </Button>
                  )}
                </div>
                
                {notifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`p-4 mb-3 cursor-pointer transition-colors ${
                      !notification.isRead ? 'bg-blue-50 border-l-4 border-l-[#007B63]' : 'bg-white'
                    }`}
                    onClick={() => {
                      if (!notification.isRead) {
                        markAsRead(notification.id);
                      }
                      // 投稿関連の通知の場合、該当投稿に移動
                      if (notification.post) {
                        // 投稿詳細ページがあれば移動
                        // window.location.href = `/posts/${notification.post.id}`;
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {notification.fromUser?.image ? (
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={notification.fromUser.image} />
                          <AvatarFallback className="bg-[#007B63] text-white">
                            {notification.fromUser.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 text-sm">
                            {notification.fromUser?.name?.charAt(0) || '?'}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.createdAt).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-[#007B63] rounded-full"></div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* プロフィール編集ダイアログ */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className=" bg-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              プロフィールを編集
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="flex items-center justify-center">
              <div className="relative">
                {profile.image ? (
                  <Avatar className="w-24 h-24 border-4 border-white shadow-md">
                    <AvatarImage
                      src={profile.image || "/placeholder.svg"}
                      alt={profile.name}
                    />
                    <AvatarFallback className="text-2xl bg-[#007B63] text-white">
                      {profile.name?.charAt(0)}
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
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full bg-white"
                >
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">編集</span>
                </Button>
                {/* 画像変更機能は未実装。ここにInput type="file"などを追加 */}
                <div className="absolute inset-0 flex items-center justify-center text-white font-bold pointer-events-none">
                  <span className="bg-black bg-opacity-50 px-2 py-1 rounded text-xs">
                    プロフィール写真を変更
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">名前</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
              />
            </div>

            {/* ユーザー名 (email) は変更不可とするか、別途変更機能を実装 */}
            <div className="grid gap-2">
              <Label htmlFor="username">ユーザー名 (メールアドレス)</Label>
              <Input
                id="username"
                value={profile.username}
                disabled
                className="bg-gray-100"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">場所</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="location"
                  value={profile.location}
                  onChange={(e) =>
                    setProfile({ ...profile, location: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="website">ウェブサイト</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="website"
                  placeholder="ウェブサイトを追加"
                  value={profile.website}
                  onChange={(e) =>
                    setProfile({ ...profile, website: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio">自己紹介</Label>
              <Textarea
                id="bio"
                placeholder="プロフィールに詳細を追加"
                className="resize-none"
                rows={4}
                value={profile.bio}
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
                }
              />
              <div className="text-right text-sm text-gray-500">
                {profile.bio.length}/160文字
              </div>
            </div>

            <div className="text-sm text-gray-500">
              [保存] をクリックすると、当社の
              <a href="#terms" className="text-[#007B63]">
                利用規約
              </a>
              に同意したものとみなされます。
            </div>
          </div>
          <DialogFooter className="flex sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsProfileDialogOpen(false)}
            >
              キャンセル
            </Button>
            <Button
              type="button"
              className="bg-[#007B63] hover:bg-[#006854]"
              onClick={handleProfileUpdate}
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 投稿編集ダイアログ */}
      {currentPost && (
        <Dialog
          open={isEditPostDialogOpen}
          onOpenChange={setIsEditPostDialogOpen}
        >
          <DialogContent className="bg-white sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                投稿を編集
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="post-title">タイトル</Label>
                <Input
                  id="post-title"
                  value={currentPost.title}
                  onChange={(e) =>
                    setCurrentPost({ ...currentPost, title: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2 mb-10">
                <Label htmlFor="post-content">内容</Label>
                <ReactQuill
                  theme="snow" // ツールバー付きの "snow" テーマを指定
                  value={currentPost.content}
                  onChange={(
                    content: string // 'e.target.value' ではなく、HTML文字列 'content' が直接渡される
                  ) => setCurrentPost({ ...currentPost, content: content })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="post-tags">タグ（カンマ区切り）</Label>
                <Input
                  id="post-tags"
                  value={currentPost.tags.join(", ")}
                  onChange={(e) =>
                    setCurrentPost({
                      ...currentPost,
                      tags: e.target.value.split(",").map((tag) => tag.trim()),
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter className="flex sm:justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditPostDialogOpen(false)}
              >
                キャンセル
              </Button>
              <Button
                type="button"
                className="bg-[#007B63] hover:bg-[#006854] text-white"
                onClick={handleSavePost}
              >
                保存
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
