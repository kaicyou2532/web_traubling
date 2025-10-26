"use client";

import { useState } from "react";
import { Tab } from "@headlessui/react";
import { CommentModal } from "@/app/components/CommentModal";
import type { Post, Trouble, User, Comment } from "@prisma/client";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/solid";
import { HeartIcon } from "@heroicons/react/24/solid"; // 塗りつぶしハート
import { HeartIcon as HeartOutlineIcon } from "@heroicons/react/24/outline"; // アウトラインハート

// 必要なフィールドを全て含む投稿データ型を定義
// isLiked, likeCount, contentはバックエンドからのデータに既に含まれていることを前提とする
export type PostWithAllData = Post & { user: User } & { trouble: Trouble } & {
  comments: Comment[];
} & { isLiked: boolean; likeCount: number; content: string };

// モーダル表示用に必要な情報を持つ型
type SelectedPost = {
  id: number;
  title: string;
  author: string;
  content: string;
  date: string; // 投稿日時が必要な場合はPost型に追加してください
  category: string;
};

export default function CommonIssues({
  city,
  posts: initialPosts, // 初期データをinitialPostsとして受け取る
  categories,
}: {
  city: string;
  posts: PostWithAllData[]; // 修正後の完全な型を使用
  categories: Trouble[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<SelectedPost | null>(null);

  // 投稿の状態を管理。初期値としてpropsのデータをそのまま使用
  const [posts, setPosts] = useState<PostWithAllData[]>(initialPosts);

  // 1. “すべて” タブ用の擬似カテゴリを先頭に追加
  const allTab: Trouble = {
    id: 0,
    enName: "all",
    jaName: "すべて",
  };
  const tabs = [allTab, ...categories];

  // いいね切り替えのハンドラ (検索結果コンポーネントのロジックを再現)
  const handleLikeClick = async (e: React.MouseEvent, postId: number) => {
    e.stopPropagation(); // 親要素へのクリック伝播を防止

    try {
      // 実際にはバックエンドAPIを呼び出す
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();

        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? { ...post, isLiked: data.liked, likeCount: data.likeCount }
              : post
          )
        );
      } else {
        console.error("Failed to toggle like");
        // 失敗時も一時的にUIを更新せず、そのままにする
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      // 失敗時も一時的にUIを更新せず、そのままにする
    }
  };

  // 投稿クリック時のハンドラ（モーダル表示）
  const handlePostClick = (post: PostWithAllData) => {
    // 実際の投稿内容を使用
    setSelectedPost({
      id: post.id,
      title: post.title,
      author: post.user.name ?? "Unknown Author",
      content: post.content,
      date: "2025-04-16", // 実際の投稿日時を取得するロジックを適用してください
      category: post.trouble.jaName,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold mb-6">{city}でよくある困りごと</h2>

      <Tab.Group>
        {/* タブ見出し */}
        <Tab.List className="flex space-x-1 rounded-xl bg-[#007B63]/10 p-1 mb-6">
          {tabs.map((category) => (
            <Tab
              key={category.id}
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                 ${
                   selected
                     ? "bg-[#007B63] text-white shadow"
                     : "text-gray-700 hover:bg-[#007B63]/10 hover:text-[#007B63]"
                 }`
              }
            >
              {category.jaName}
            </Tab>
          ))}
        </Tab.List>

        {/* 各パネル */}
        <Tab.Panels>
          {tabs.map((category) => {
            // “すべて” タブならフィルタ不要
            const filtered =
              category.id === 0
                ? posts
                : posts.filter((post) => post.troubleId === post.trouble.id); // category.id ではなく post.trouble.id を使用してカテゴリをフィルタ

            return (
              <Tab.Panel
                key={category.id}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filtered.length > 0 ? (
                  filtered.map((post) => (
                    <div
                      key={post.id}
                      // 投稿クリックでモーダルを開く
                      onClick={() => handlePostClick(post)}
                      className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                      onKeyUp={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handlePostClick(post);
                        }
                      }}
                      tabIndex={0} // キーボード操作を可能にする
                    >
                      <h3 className="text-xl font-semibold mb-2 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        投稿者: {post.user.name}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* いいね機能 */}
                          <button
                            onClick={(e) => handleLikeClick(e, post.id)}
                            className="flex items-center hover:scale-110 transition-transform"
                            aria-label="いいね"
                          >
                            {post.isLiked ? (
                              <HeartIcon className="h-5 w-5 mr-1 text-red-500" />
                            ) : (
                              <HeartOutlineIcon className="h-5 w-5 mr-1 text-gray-400 hover:text-red-500" />
                            )}
                            <span
                              className={post.isLiked ? "text-red-500" : ""}
                            >
                              {post.likeCount}
                            </span>
                          </button>
                          {/* コメント数 */}
                          <div className="flex items-center">
                            <ChatBubbleLeftIcon className="h-5 w-5 text-gray-500 mr-1" />
                            <span>{post.comments.length}</span>
                          </div>
                        </div>
                        <span className="text-sm text-[#007B63] font-medium">
                          {post.trouble.jaName}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="col-span-full text-center text-gray-500">
                    このカテゴリの投稿はまだありません。
                  </p>
                )}
              </Tab.Panel>
            );
          })}
        </Tab.Panels>
      </Tab.Group>

      {/* コメント/詳細モーダル */}
      <CommentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        issue={selectedPost}
      />
    </div>
  );
}
