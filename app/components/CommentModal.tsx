"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"
import { UserCircleIcon } from "@heroicons/react/24/solid"

interface Comment {
  id: number
  author: string
  content: string
}

interface Issue {
  id: number
  title: string
  author: string
  date: string
  content: string
  category: string
}

interface CommentModalProps {
  isOpen: boolean
  onClose: () => void
  issue: Issue | null
}

export function CommentModal({ isOpen, onClose, issue }: CommentModalProps) {
  const { data: session } = useSession()
  const [newComment, setNewComment] = useState("")
  const [comments, setComments] = useState<Comment[]>([])

  useEffect(() => {
    const fetchComments = async () => {
      if (!issue) return
      try {
        const res = await fetch(`/api/comment?postId=${issue.id}`)
        const data = await res.json()
        setComments(
          data.map((comment: any) => ({
            id: comment.id,
            author: comment.user?.name || "匿名ユーザー",
            content: comment.content,
          }))
        )
      } catch (error) {
        console.error("コメント取得失敗:", error)
      }
    }

    if (isOpen) fetchComments()
  }, [isOpen, issue])

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !issue || !session) return
    try {
      const res = await fetch("/api/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: issue.id, content: newComment }),
      })

      if (res.ok) {
        const newPosted = await res.json()
        setComments((prev) => [
          ...prev,
          {
            id: newPosted.id,
            author: session.user.name || "あなた",
            content: newPosted.content,
          },
        ])
        setNewComment("")
      } else {
        console.error("投稿失敗")
      }
    } catch (err) {
      console.error("コメント送信エラー:", err)
    }
  }

  if (!issue) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-hidden flex flex-col p-0 bg-white">
        <div className="p-6 flex-shrink-0 border-b">
          <button onClick={onClose} className="absolute right-4 top-4">
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <UserCircleIcon className="h-8 w-8" />
            <span className="font-medium">{issue.author}</span>
          </div>
          <h2 className="text-xl font-bold mb-1">{issue.title}</h2>
          <p className="text-sm text-gray-500">{issue.date}</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 border-b">
            <p className="text-gray-700">{issue.content}</p>
          </div>

          <div className="p-6">
            <h3 className="font-semibold mb-4">コメント</h3>
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <UserCircleIcon className="h-8 w-8" />
                  <div>
                    <p className="font-medium">{comment.author}</p>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t flex-shrink-0">
          <Textarea
            placeholder={
              session ? "コメントを入力してください。" : "ログインするとコメントできます"
            }
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="mb-4"
            disabled={!session}
          />
          <Button
            onClick={handleSubmitComment}
            className="w-full bg-gray-700 hover:bg-custom-green text-white"
            disabled={!session}
          >
            {session ? "コメントを投稿する" : "ログインしてコメントする"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
