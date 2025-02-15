"use client"

import { useState, useRef } from "react"
import { ChevronRightIcon } from "@heroicons/react/24/solid"

const categories = [
  { id: 1, name: "交通機関", icon: "🚆", color: "bg-blue-500" },
  { id: 2, name: "宿泊施設", icon: "🏨", color: "bg-green-500" },
  { id: 3, name: "飲食", icon: "🍽️", color: "bg-yellow-500" },
  { id: 4, name: "観光スポット", icon: "🗼", color: "bg-purple-500" },
  { id: 5, name: "言語", icon: "💬", color: "bg-red-500" },
  { id: 6, name: "文化", icon: "🎎", color: "bg-pink-500" },
  { id: 7, name: "健康", icon: "🏥", color: "bg-indigo-500" },
  { id: 8, name: "お金", icon: "💰", color: "bg-orange-500" },
  { id: 9, name: "安全", icon: "🛡️", color: "bg-teal-500" },
  { id: 10, name: "その他", icon: "❓", color: "bg-gray-500" },
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
          {categories.map((category) => (
            <div
              key={category.id}
              className={`flex-none w-[200px] h-[150px] rounded-xl overflow-hidden snap-start ${category.color} flex flex-col items-center justify-center text-white cursor-pointer hover:opacity-90 transition-opacity`}
            >
              <span className="text-4xl mb-2">{category.icon}</span>
              <h3 className="text-xl font-bold">{category.name}</h3>
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

