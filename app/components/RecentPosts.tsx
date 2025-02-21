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
  user: { name: string } | null
  isDraft: boolean
  tags: string[]
}

export default function RecentPosts({ category }: { category: string }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchPosts() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/post?category=${category}`)
        const data = await res.json()
        setPosts(data)
      } catch (error) {
        console.error("Error fetching posts:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPosts()
  }, [category])

  if (isLoading) {
    return <div className="text-center py-12">読み込み中...</div>
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Link href={`/reports/${post.id}`} key={post.id}>
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
            <div className="p-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <MapPinIcon className="h-4 w-4" />
                <span>{post.country?.jaName || "不明"}</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">{post.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-3">{post.content}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-gray-500">
                    <ChatBubbleLeftIcon className="h-5 w-5 mr-1" />
                    <span>{post.comments.length}</span>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{post.user?.name || "匿名"}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

