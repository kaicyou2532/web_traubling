"use client"

import { useState } from "react"
import { Tab } from "@headlessui/react"
import { CommentModal } from "@/app/components/Comment"
import type { Post, Trouble, User, Comment } from "@prisma/client"
import { ChatBubbleLeftIcon } from "@heroicons/react/24/solid"
import { StarIcon } from "lucide-react"

type PostWithUser = Post &
{ user: User } &
{ trouble: Trouble } &
{ comments: Comment[] }

export default function CommonIssues({
  city,
  posts,
  categories,
}: {
  city: string
  posts: PostWithUser[]
  categories: Trouble[]
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 1. “すべて” タブ用の擬似カテゴリを先頭に追加
  const allTab: Trouble = {
    id: 0,
    enName: "all",
    jaName: "すべて",
  }
  const tabs = [allTab, ...categories]

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
                 ${selected
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
            const filtered = category.id === 0
              ? posts
              : posts.filter((post) => post.troubleId === category.id)

            return (
              <Tab.Panel
                key={category.id}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filtered.length > 0 ? (
                  filtered.map((post) => (
                    <div
                      key={post.id}
                      className="p-6 bg-white rounded-lg shadow-md"
                      onKeyUp={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          /* 同じハンドラ呼ぶ */
                        }
                      }}
                    >
                      <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                      <p className="text-gray-600 mb-4">投稿者: {post.user.name}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <StarIcon className="h-5 w-5 text-yellow-500 mr-1" />
                            <span>{post.likeCount}</span>
                          </div>
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
            )
          })}
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}
