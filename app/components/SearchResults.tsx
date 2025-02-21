"use client"

import { useEffect, useState } from "react"
import { MapPinIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/solid"
import Link from "next/link"
import DestinationScroll from "./DestinationScroll"
import UsefulTroubleReports from "./UsefulTroubleReports"
import CategoryScroll from "./CategoryScroll"

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

interface SearchResultsProps {
  category: string
  subCategory?: string
  searchTerm: string
  isSearching: boolean
}

export default function SearchResults({ category, subCategory, searchTerm, isSearching }: SearchResultsProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchPosts() {
      setIsLoading(true)
      try {
        const res = await fetch("/api/search")
        const data = await res.json()
        setPosts(data)
      } catch (error) {
        console.error("Error fetching posts:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPosts()
  }, [])

  let filteredResults = posts

  if (searchTerm) {
    filteredResults = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  } else if (category === "domestic") {
    filteredResults = posts.filter((post) => post.country?.jaName === "日本")
  } else if (category === "overseas") {
    filteredResults = posts.filter((post) => post.country?.jaName !== "日本")
  } else if (category === "category" && subCategory) {
    filteredResults = posts.filter((post) => post.tags.includes(subCategory))
  }

  const renderContent = () => {
    if (isSearching) {
      return (
        <section>
          <h2 className="text-3xl font-bold mb-8 text-gray-800">
            "{searchTerm}"の検索結果: {filteredResults.length}件
          </h2>
          {renderPosts(filteredResults)}
        </section>
      )
    }

    switch (category) {
      case "all":
        return (
          <>
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-8 text-gray-800">人気の観光地のお悩みを確認する</h2>
              <DestinationScroll category="domestic" />
              <DestinationScroll category="overseas" />
            </section>
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-8 text-gray-800">分野別</h2>
              <CategoryScroll />
            </section>
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-8 text-gray-800">ランキング</h2>
              <UsefulTroubleReports category="all" />
            </section>
            <section>
              <h2 className="text-3xl font-bold mb-8 text-gray-800">最近の投稿</h2>
              {renderPosts(filteredResults)}
            </section>
          </>
        )
      case "category":
        return (
          <section>
            <h2 className="text-3xl font-bold mb-8 text-gray-800">分野別</h2>
            <CategoryScroll />
          </section>
        )
      case "domestic":
        return (
          <>
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-8 text-gray-800">人気の観光地のお悩みを確認する</h2>
              <DestinationScroll category="domestic" />
            </section>
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-8 text-gray-800">ランキング</h2>
              <UsefulTroubleReports category="domestic" />
            </section>
            <section>
              <h2 className="text-3xl font-bold mb-8 text-gray-800">国内の最近の投稿</h2>
              {renderPosts(filteredResults)}
            </section>
          </>
        )
      case "overseas":
        return (
          <>
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-8 text-gray-800">人気の観光地のお悩みを確認する</h2>
              <DestinationScroll category="overseas" />
            </section>
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-8 text-gray-800">ランキング</h2>
              <UsefulTroubleReports category="overseas" />
            </section>
            <section>
              <h2 className="text-3xl font-bold mb-8 text-gray-800">海外の最近の投稿</h2>
              {renderPosts(filteredResults)}
            </section>
          </>
        )
      default:
        return null
    }
  }

  const renderPosts = (posts: Post[]) => {
    if (isLoading) {
      return (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">読み込み中...</p>
        </div>
      )
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

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-12">{renderContent()}</div>
    </div>
  )
}

