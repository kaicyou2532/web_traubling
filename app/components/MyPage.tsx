"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MapPin, Edit, Lock, Heart, MessageSquare, Globe } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// 投稿の型定義
interface Post {
  id: number
  title: string
  content: string
  date: string // 例: "2025年4月15日"
  likes: number
  comments: number
  tags: string[] // 例: ["ホテル", "予約"]
}

// プロフィールの型定義
interface Profile {
  name: string
  username: string // 現在はemailで代用
  location: string
  website: string
  bio: string
  image?: string
}

export default function MyPage() {
  const { data: session, status } = useSession()
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [isEditPostDialogOpen, setIsEditPostDialogOpen] = useState(false)

  // プロフィール情報の状態
  const [profile, setProfile] = useState<Profile>({
    name: "",
    username: "",
    location: "",
    website: "",
    bio: "",
    image: "",
  })

  // 投稿のサンプルデータ（初期は空）
  const [posts, setPosts] = useState<Post[]>([])
  const [currentPost, setCurrentPost] = useState<Post | null>(null)

  // プロフィール情報の取得
  useEffect(() => {
    const fetchProfile = async () => {
      if (status === "authenticated") {
        try {
          const response = await fetch("/api/user/profile")
          if (!response.ok) {
            throw new Error("プロフィールの取得に失敗しました。")
          }
          const data: Profile = await response.json()
          setProfile(data)
        } catch (error) {
          console.error("プロフィールフェッチエラー:", error)
          // エラー処理（例: ユーザーにメッセージを表示）
        }
      }
    }

    fetchProfile()
  }, [status])

  // 投稿の取得
  useEffect(() => {
    const fetchPosts = async () => {
      // プロフィール情報がロードされ、ユーザーが認証されていれば投稿を取得
      if (status === "authenticated" && profile.username) {
        try {
          const response = await fetch("/api/user/posts")
          if (!response.ok) {
            throw new Error("投稿の取得に失敗しました。")
          }
          const data: Post[] = await response.json()
          setPosts(data)
        } catch (error) {
          console.error("投稿フェッチエラー:", error)
          // エラー処理
        }
      }
    }

    fetchPosts()
  }, [status, profile.username]) // profile.usernameに依存させることで、プロフィールロード後に投稿を取得

  // プロフィール更新処理
  const handleProfileUpdate = async () => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      })

      if (!response.ok) {
        throw new Error("プロフィールの更新に失敗しました。")
      }

      const updatedProfile: Profile = await response.json()
      setProfile(updatedProfile)
      setIsProfileDialogOpen(false)
      // 成功メッセージ表示などの追加処理
      alert("プロフィールが更新されました！")
    } catch (error) {
      console.error("プロフィール更新エラー:", error)
      alert("プロフィールの更新に失敗しました。")
    }
  }

  // 投稿編集処理
  const handleEditPost = (post: Post) => {
    setCurrentPost(post)
    setIsEditPostDialogOpen(true)
  }

  // 投稿保存処理
  const handleSavePost = async () => {
    if (!currentPost) return

    try {
      const response = await fetch(`/api/post/${currentPost.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currentPost),
      })

      if (!response.ok) {
        throw new Error("投稿の更新に失敗しました。")
      }

      const updatedPost: Post = await response.json()
      setPosts(posts.map((post) => (post.id === updatedPost.id ? updatedPost : post)))
      setIsEditPostDialogOpen(false)
      // 成功メッセージ表示などの追加処理
      alert("投稿が更新されました！")
    } catch (error) {
      console.error("投稿保存エラー:", error)
      alert("投稿の更新に失敗しました。")
    }
  }

  // ローディング中の表示
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#007B63]"></div>
      </div>
    )
  }

  // 認証されていない場合の表示
  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4 text-center">
        <Lock className="h-24 w-24 text-gray-400 mb-6" />
        <h2 className="text-2xl font-bold mb-3">ログインが必要です</h2>
        <p className="text-gray-600 mb-6">このページを表示するにはログインしてください。</p>
        <Button
          onClick={() => (window.location.href = "/api/auth/signin")} // NextAuthのサインインページへリダイレクト
          className="bg-[#007B63] hover:bg-[#006854] text-white"
        >
          ログイン
        </Button>
      </div>
    )
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
                  <AvatarImage src={profile.image || "/placeholder.svg"} alt={profile.name} />
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
                  <h2 className="text-xl font-bold">{profile.name || "名前未設定"}</h2>
                  <p className="text-gray-600 text-sm">{profile.username}</p> {/* username (email) を表示 */}
                  <p className="text-gray-600 text-sm flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" /> {profile.location || "場所未設定"}
                  </p>
                  {profile.website && (
                    <p className="text-gray-600 text-sm flex items-center gap-1 mt-1">
                      <Globe className="h-3 w-3" />
                      <a
                        href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
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
                  <p className="font-bold">{posts.length}</p>
                  <p className="text-sm text-gray-600">投稿</p>
                </div>
                <div className="text-center">
                  <p className="font-bold">0</p> {/* バックエンドから取得する場合は変更 */}
                  <p className="text-sm text-gray-600">フォロワー</p>
                </div>
                <div className="text-center">
                  <p className="font-bold">0</p> {/* バックエンドから取得する場合は変更 */}
                  <p className="text-sm text-gray-600">フォロー中</p>
                </div>
              </div>

              {profile.bio && <p className="mt-4 text-sm text-gray-700">{profile.bio}</p>}
            </div>
          </div>
        </div>
      </section>

      {/* タブナビゲーション */}
      <Tabs defaultValue="posts" className="container mx-auto px-4 mt-4">
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
                    <p className="text-gray-600 mt-2">旅行中に経験したトラブルを共有しましょう</p>
                  </div>
                  <Button type="button" className="bg-[#007B63] hover:bg-[#006854] text-white mt-2">
                    トラブルを投稿する
                  </Button>
                </div>
              </Card>
            ) : (
              posts.map((post) => (
                <Card key={`post-${post.id}`} className="bg-white overflow-hidden">
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-3">
                      {profile.image ? (
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={profile.image || "/placeholder.svg"} alt={profile.name} />
                          <AvatarFallback className="bg-[#007B63] text-white">{profile.name?.charAt(0)}</AvatarFallback>
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
                    <p className="text-gray-700 mb-3">{post.content}</p>
                    <div className="flex gap-2 mb-3">
                      {post.tags.map((tag) => (
                        <Badge key={`tag-${tag}`} className="bg-[#007B63]/10 text-[#007B63] hover:bg-[#007B63]/20">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center gap-4">
                        <button type="button" className="flex items-center gap-1 text-gray-500">
                          <Heart className="h-4 w-4" />
                          <span className="text-sm">{post.likes}</span>
                        </button>
                        <button type="button" className="flex items-center gap-1 text-gray-500">
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
            <Card className="bg-white p-6 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                  <Heart className="h-10 w-10 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">まだいいねした投稿がありません</h3>
                  <p className="text-gray-600 mt-2">他のユーザーの投稿をチェックしていいねしましょう</p>
                </div>
                <Button type="button" className="bg-[#007B63] hover:bg-[#006854] text-white mt-2">
                  投稿を探す
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* プロフィール編集ダイアログ */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className=" bg-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">プロフィールを編集</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="flex items-center justify-center">
              <div className="relative">
                {profile.image ? (
                  <Avatar className="w-24 h-24 border-4 border-white shadow-md">
                    <AvatarImage src={profile.image || "/placeholder.svg"} alt={profile.name} />
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
                  <span className="bg-black bg-opacity-50 px-2 py-1 rounded text-xs">プロフィール写真を変更</span>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">名前</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>

            {/* ユーザー名 (email) は変更不可とするか、別途変更機能を実装 */}
            <div className="grid gap-2">
              <Label htmlFor="username">ユーザー名 (メールアドレス)</Label>
              <Input id="username" value={profile.username} disabled className="bg-gray-100" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">場所</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="location"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
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
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
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
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              />
              <div className="text-right text-sm text-gray-500">{profile.bio.length}/160文字</div>
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
            <Button type="button" variant="outline" onClick={() => setIsProfileDialogOpen(false)}>
              キャンセル
            </Button>
            <Button type="button" className="bg-[#007B63] hover:bg-[#006854]" onClick={handleProfileUpdate}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 投稿編集ダイアログ */}
      {currentPost && (
        <Dialog open={isEditPostDialogOpen} onOpenChange={setIsEditPostDialogOpen}>
          <DialogContent className="bg-white sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">投稿を編集</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="post-title">タイトル</Label>
                <Input
                  id="post-title"
                  value={currentPost.title}
                  onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="post-content">内容</Label>
                <Textarea
                  id="post-content"
                  rows={6}
                  value={currentPost.content}
                  onChange={(e) => setCurrentPost({ ...currentPost, content: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="post-tags">タグ（カンマ区切り）</Label>
                <Input
                  id="post-tags"
                  value={currentPost.tags.join(", ")}
                  onChange={(e) =>
                    setCurrentPost({ ...currentPost, tags: e.target.value.split(",").map((tag) => tag.trim()) })
                  }
                />
              </div>
            </div>
            <DialogFooter className="flex sm:justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditPostDialogOpen(false)}>
                キャンセル
              </Button>
              <Button type="button" className="bg-[#007B63] hover:bg-[#006854]" onClick={handleSavePost}>
                保存
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}