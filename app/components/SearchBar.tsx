"use client"

import { useState } from "react"
import { GlobeAsiaAustraliaIcon, GlobeAmericasIcon, TagIcon, MapIcon, HomeIcon } from "@heroicons/react/24/outline"

const categories = [
  { id: "all", name: "全て", icon: HomeIcon },
  { id: "region", name: "国・地域別", icon: GlobeAsiaAustraliaIcon },
  { id: "category", name: "分野別", icon: TagIcon },
  { id: "domestic", name: "日本国内", icon: MapIcon },
  { id: "overseas", name: "海外", icon: GlobeAmericasIcon },
]

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("検索:", searchTerm, "カテゴリー:", selectedCategory)
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div className="flex flex-col gap-6">
        <div className="flex justify-center">
          <div className="flex justify-between bg-white/20 backdrop-blur-sm rounded-full p-1 w-full">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center justify-center px-2 py-2 rounded-full gap-1 transition-colors flex-1 ${
                  selectedCategory === category.id ? "bg-white text-gray-900" : "text-white hover:bg-white/10"
                }`}
              >
                <category.icon className="h-5 w-5" />
                <span className="font-medium text-xs">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
        <form onSubmit={handleSearch} className="flex w-full">
          <div className="flex w-full">
            <input
              type="text"
              placeholder="観光スポット、アクティビティ、ホテル..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow px-6 py-4 border-2 border-white bg-white bg-opacity-20 rounded-l-full text-white placeholder-gray-200 focus:outline-none focus:border-custom-green transition-colors"
            />
            <button
              type="submit"
              className="bg-custom-green text-white px-8 py-4 rounded-r-full hover:bg-custom-green/90 transition-colors font-medium"
            >
              検索
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

