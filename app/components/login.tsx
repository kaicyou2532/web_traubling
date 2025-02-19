"use client"

import { X } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[300px] bg-white rounded-[24px] !rounded-[24px] p-0 border-none">

        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        <div className="px-9 py-10">
          <h2 className="text-xl font-semibold text-custom-green mb-8 text-center">
            traublingにログインして
            <br />
            トラブルを共有しよう！
          </h2>
          <div className="space-y-6">
            <Button
              variant="outline"
              className="w-full h-12 border-2 rounded-xl border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Googleアカウントを使う
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 border-2 rounded-xl border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Discordアカウントを使う
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 border-2 rounded-xl border-gray-200 hover:bg-gray-50 transition-colors"
            >
              ???
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
