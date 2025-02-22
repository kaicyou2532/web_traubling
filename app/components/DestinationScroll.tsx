"use client"

import { useState, useRef } from "react"
import { ChevronRightIcon } from "@heroicons/react/24/solid"
import { ChatBubbleLeftIcon } from "@heroicons/react/24/solid"

const domesticDestinations = [
  {
    id: 1,
    city: "京都",
    country: "日本",
    troubles: 523,
    category: "観光地",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 2,
    city: "東京",
    country: "日本",
    troubles: 245,
    category: "観光地",
    image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 3,
    city: "福岡",
    country: "日本",
    troubles: 312,
    category: "観光地",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwc8821GE6WI-ISmcNCi2muGrazmgyF7CUAg&s",
  },
  {
    id: 4,
    city: "沖縄",
    country: "日本",
    troubles: 478,
    category: "観光地",
    image: "https://www.ana.co.jp/japan-travel-planner/okinawa/img/hero.jpg",
  },
]

const internationalDestinations = [
  {
    id: 6,
    city: "パリ",
    country: "フランス",
    troubles: 856,
    category: "観光地",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop",
  },
  {
    id: 7,
    city: "ニューヨーク",
    country: "アメリカ",
    troubles: 745,
    category: "観光地",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 8,
    city: "ロンドン",
    country: "イギリス",
    troubles: 634,
    category: "観光地",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 9,
    city: "バルセロナ",
    country: "スペイン",
    troubles: 423,
    category: "観光地",
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 10,
    city: "シドニー",
    country: "オーストラリア",
    troubles: 389,
    category: "観光地",
    image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=2070&auto=format&fit=crop",
  },
]

const DestinationList = ({
  destinations,
  title,
  description,
}: {
  destinations: typeof domesticDestinations
  title: string
  description: string
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(true)

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <div className="relative mb-12">
      <h3 className="text-2xl font-semibold mb-4 text-gray-700">{title}</h3>
      <div ref={scrollRef} className="flex space-x-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
        {/* Introduction Card */}
        <div className="relative flex-none w-[300px] h-[400px] rounded-xl overflow-hidden snap-start bg-[#1a2b4b] text-white">
          <div className="p-8 h-full flex flex-col">
            <h3 className="text-2xl font-bold mb-4">人気のスポット</h3>
            <p className="text-gray-200 text-sm leading-relaxed">{description}</p>
            <button className="mt-auto bg-white/20 text-white px-6 py-2 rounded-full hover:bg-white/30 transition-colors">
              更に表示
            </button>
          </div>
        </div>

        {/* Destination Cards */}
        {destinations.map((destination) => (
          <div
            key={destination.id}
            className="relative flex-none w-[300px] h-[400px] rounded-xl overflow-hidden snap-start bg-white shadow-md transition-transform duration-300 ease-in-out hover:-translate-y-2"
          >
            <img
              src={destination.image || "/placeholder.svg"}
              alt={destination.city}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <h3 className="text-2xl font-bold mb-2">{destination.city}</h3>
              <div className="flex items-center gap-2 mb-2">
                <ChatBubbleLeftIcon className="h-5 w-5" />
                <span className="text-sm">{destination.troubles}件のお悩み</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm">{destination.country}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showScrollButton && (
        <button
          onClick={handleScroll}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
          aria-label="次の目的地を表示"
        >
          <ChevronRightIcon className="h-6 w-6 text-gray-600" />
        </button>
      )}
    </div>
  )
}

export default function DestinationScroll() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">人気の観光地のお悩みを確認する</h2>
      <DestinationList
        destinations={domesticDestinations}
        title="国内の人気都市"
        description="国内の人気観光地で起きているトラブルや困りごとをチェックして、あなたの旅行に役立てましょう。"
      />
      <DestinationList
        destinations={internationalDestinations}
        title="海外の人気都市"
        description="海外の人気都市で実際に起きたトラブルの解決方法や対策をご紹介します。"
      />
    </div>
  )
}

