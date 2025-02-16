"use client"

import { useState, useRef } from "react"
import { ChevronRightIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/solid"

const categories = [
  {
    id: 1,
    name: "交通機関",
    icon: "🚆",
    troubles: 523,
    image: "https://images.unsplash.com/photo-1581262177000-8139a463e531?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "宿泊施設",
    icon: "🏨",
    troubles: 412,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "飲食",
    icon: "🍽️",
    troubles: 378,
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "観光スポット",
    icon: "🗼",
    troubles: 645,
    image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2144&auto=format&fit=crop",
  },
  {
    id: 5,
    name: "言語",
    icon: "💬",
    troubles: 289,
    image: "https://images.unsplash.com/photo-1456081101716-74e616ab23d8?q=80&w=2076&auto=format&fit=crop",
  },
  {
    id: 6,
    name: "文化",
    icon: "🎎",
    troubles: 356,
    image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?q=80&w=2074&auto=format&fit=crop",
  },
  {
    id: 7,
    name: "健康",
    icon: "🏥",
    troubles: 201,
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 8,
    name: "お金",
    icon: "💰",
    troubles: 467,
    image: "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 9,
    name: "安全",
    icon: "🛡️",
    troubles: 312,
    image: "https://images.unsplash.com/photo-1489644484856-f3ddc0adc923?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 10,
    name: "その他",
    icon: "❓",
    troubles: 534,
    image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2070&auto=format&fit=crop",
  },
]

export default function CategoryScroll() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(true)

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">分野別の困りごとを確認する</h2>

      <div className="relative">
        <div ref={scrollRef} className="flex space-x-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
          {/* Introduction Card */}
          <div className="relative flex-none w-[300px] h-[400px] rounded-xl overflow-hidden snap-start bg-[#1a2b4b] text-white">
            <div className="p-8 h-full flex flex-col">
              <h3 className="text-2xl font-bold mb-4">分野別のお悩み</h3>
              <p className="text-gray-200 text-sm leading-relaxed">
                旅行中に起こりうる様々な分野のトラブルや困りごとをチェックして、あなたの旅をより快適に。
              </p>
              <button className="mt-auto bg-white/20 text-white px-6 py-2 rounded-full hover:bg-white/30 transition-colors">
                更に表示
              </button>
            </div>
          </div>

          {/* Category Cards */}
          {categories.map((category) => (
            <div
              key={category.id}
              className="relative flex-none w-[300px] h-[400px] rounded-xl overflow-hidden snap-start bg-white shadow-md"
            >
              <img
                src={category.image || "/placeholder.svg"}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <ChatBubbleLeftIcon className="h-5 w-5" />
                  <span className="text-sm">{category.troubles}件のお悩み</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm">{category.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showScrollButton && (
          <button
            onClick={handleScroll}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
            aria-label="次のカテゴリーを表示"
          >
            <ChevronRightIcon className="h-6 w-6 text-gray-600" />
          </button>
        )}
      </div>
    </div>
  )
}

