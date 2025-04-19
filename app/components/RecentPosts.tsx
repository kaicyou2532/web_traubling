"use client"

import { useState, useEffect } from "react"
import { MapPinIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/solid"
import Link from "next/link"

interface Post {
  id: number
  title: string
  content: string
  country: { id: number; jaName: string; enName: string } | null
  comments: { id: number }[]
  user: { name: string }
  tags: string[]
  isJapan: boolean
}

const POSTS_PER_PAGE = 10

export default function RecentPosts({ category }: { category: string }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    async function fetchPosts() {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          term: "", // 空検索（全件取得）
          category,
          page: currentPage.toString(),
        })
        const res = await fetch(`/api/search?${params}`)
        const data = await res.json()
        setPosts(data.posts || [])
        setTotalCount(data.totalCount || 0)
      } catch (error) {
        console.error("Error fetching posts:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPosts()
  }, [category, currentPage])

  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE)

  if (isLoading) return <div className="text-center py-12">読み込み中...</div>
  if (posts.length === 0) return <div className="text-center py-12">投稿がありません。</div>

  return (
    <div className="space-y-6 px-4 py-12">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">最近の投稿</h2>
      {posts.map((post) => (
        <div key={post.id} className="space-y-2 block">
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <MapPinIcon className="h-4 w-4" />
                <span>{post.country?.jaName || "不明"}</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">{post.title}</h3>
              {/* biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation> */}
              <div className="text-gray-600 mb-4 line-clamp-3" dangerouslySetInnerHTML={{ __html: post.content }} />
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">{tag}</span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center text-gray-500">
                  <ChatBubbleLeftIcon className="h-5 w-5 mr-1" />
                  <span>{post.comments.length}</span>
                </div>
                <span className="text-sm text-[#007B63]">{post.user.name}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              type="button"
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded-full ${currentPage === i + 1 ? "bg-custom-green text-white" : "bg-gray-200 text-gray-700"}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
