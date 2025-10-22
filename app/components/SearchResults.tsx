"use client"

import { useState, useEffect } from "react"
import { MapPinIcon, ChatBubbleLeftIcon, HeartIcon } from "@heroicons/react/24/solid"
import { HeartIcon as HeartOutlineIcon } from "@heroicons/react/24/outline"
import { CommentModal } from "./CommentModal"

interface Post {
  id: number
  title: string
  content: string
  country: { id: number; jaName: string; enName: string } | null
  comments: { id: number }[]
  user: { name: string }
  tags: string[]
  isJapan: boolean
  likeCount: number
  isLiked: boolean // ★ いいね状態を追加
}

interface SearchResultsProps {
  searchTerm: string
  category: string
  subCategory?: string
  countryFilter?: string
}

const POSTS_PER_PAGE = 10

export default function SearchResults({ searchTerm, category, subCategory, countryFilter }: SearchResultsProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  const [selectedPost, setSelectedPost] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    async function fetchPosts() {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          term: searchTerm,
          category,
          subCategory: subCategory || "",
          country: countryFilter || "",
          page: currentPage.toString(),
        })

        const res = await fetch(`/api/search?${params.toString()}`)
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
  }, [searchTerm, category, subCategory, countryFilter, currentPage])

  // ★ いいねボタンのハンドラーを追加
  const handleLikeClick = async (e: React.MouseEvent, postId: number) => {
    e.stopPropagation() // 投稿クリックイベントを防ぐ

    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
      })

      if (res.ok) {
        const data = await res.json()
        
        // 投稿リストを更新
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId 
              ? { ...post, isLiked: data.liked, likeCount: data.likeCount }
              : post
          )
        )
      } else {
        console.error('Failed to toggle like')
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  // ★ HTMLタグを除去する関数を追加
  const stripHtmlTags = (html: string): string => {
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent || div.innerText || ''
  }

  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE)

  const handlePostClick = (post: Post) => {
    setSelectedPost({
      id: post.id,
      title: post.title,
      author: post.user.name,
      content: stripHtmlTags(post.content), // ★ HTMLタグを除去
      date: "2025-04-16",
      category,
    })
    setIsModalOpen(true)
  }

  if (isLoading) {
    return <div className="h-[450px] flex items-center justify-center">読み込み中...</div>
  }

  if (posts.length === 0) {
    return <div className="h-[450px] flex items-center justify-center">検索結果がありません。</div>
  }

  return (
    <>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-4">検索結果: {totalCount}件</h2>
        {posts.map((post) => (
          <div
            key={post.id}
            onClick={() => handlePostClick(post)}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <div className="p-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <MapPinIcon className="h-4 w-4" />
                <span>{post.country?.jaName || "不明"}</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">{post.title}</h3>
              <div className="text-gray-600 mb-4 line-clamp-3" dangerouslySetInnerHTML={{ __html: post.content }} />
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4 text-gray-500">
                  {/* ★ いいねボタン（クリック可能、色変化対応） */}
                  <button
                    onClick={(e) => handleLikeClick(e, post.id)}
                    className="flex items-center hover:scale-110 transition-transform"
                  >
                    {post.isLiked ? (
                      <HeartIcon className="h-5 w-5 mr-1 text-red-500" />
                    ) : (
                      <HeartOutlineIcon className="h-5 w-5 mr-1 text-gray-400 hover:text-red-500" />
                    )}
                    <span className={post.isLiked ? "text-red-500" : ""}>{post.likeCount || 0}</span>
                  </button>
                  {/* 既存のコメント数 */}
                  <div className="flex items-center">
                    <ChatBubbleLeftIcon className="h-5 w-5 mr-1" />
                    <span>{post.comments.length}</span>
                  </div>
                </div>
                <span className="text-sm text-[#007B63]">{post.user.name}</span>
              </div>
            </div>
          </div>
        ))}

        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-full ${currentPage === i + 1 ? "bg-custom-green text-white" : "bg-gray-200 text-gray-700"
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      <CommentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        issue={selectedPost}
      />
    </>
  )
}
