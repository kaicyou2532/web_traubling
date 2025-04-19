"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"
import {UserCircleIcon} from "@heroicons/react/24/solid"

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
  const [newComment, setNewComment] = useState("")
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      author: "佐藤太郎",
      content: "そうなんですね！来週ロンドン行くので参考になります",
    },
    {
      id: 2,
      author: "ライリー・ジャックソン",
      content: "私も同じような経験をしました",
    },
    {
      id: 3,
      author: "村田花子",
      content: "それは大変でしたね",
    },
  ])

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      setComments([
        ...comments,
        {
          id: comments.length + 1,
          author: "ゲストユーザー",
          content: newComment,
        },
      ])
      setNewComment("")
    }
  }

  if (!issue) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-hidden flex flex-col p-0 bg-white">
        <div className="p-6 flex-shrink-0 border-b">
          <button type="button" onClick={onClose} className="absolute right-4 top-4">
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3 mb-3">
          <UserCircleIcon className="h-8 w-8" />
            <span className="font-medium">{issue.author}</span>
          </div>
          <h2 className="text-xl font-bold mb-1　">{issue.title}</h2>
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
            placeholder="コメントを入力してください。"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="mb-4"
          />
          <Button onClick={handleSubmitComment} className="w-full bg-gray-700 hover:bg-custom-green text-white">
            コメントを投稿する
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
