"use client"

import type React from "react"
import { useState } from "react"
import {
  GlobeAsiaAustraliaIcon,
  GlobeAmericasIcon,
  TagIcon,
  MapIcon,
  HomeIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline"

const categories = [
  { id: "all", name: "全て", icon: HomeIcon },
  { id: "region", name: "国・都市別", icon: GlobeAsiaAustraliaIcon },
  { id: "category", name: "分野別", icon: TagIcon },
  { id: "domestic", name: "日本国内", icon: MapIcon },
  { id: "overseas", name: "海外", icon: GlobeAmericasIcon },
]

const subCategories = ["交通", "宿泊", "食事", "観光", "買い物", "文化", "言語", "安全", "健康", "その他"]

interface SearchBarProps {
  isCompact?: boolean
  onSearch?: (searchTerm: string, category: string, subCategory?: string, countryFilter?: string) => void
  selectedCategory: string
  onCategoryChange?: (category: string) => void
  countryFilter?: string
  onCountryChange?: (value: string) => void
}

export default function SearchBar({
  isCompact = false,
  onSearch,
  selectedCategory,
  onCategoryChange,
  countryFilter = "",
  onCountryChange,
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentCategory, setCurrentCategory] = useState(selectedCategory)
  const [selectedSubCategory, setSelectedSubCategory] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchTerm, currentCategory, selectedSubCategory, countryFilter)
  }

  return (
    <div className={`w-full max-w-4xl mx-auto px-4 ${isCompact ? "py-4" : ""}`}>
      <div className="flex flex-col gap-4">
        {/* カテゴリーボタン */}
        <div className="flex justify-center">
          <div className="flex justify-between bg-white/20 backdrop-blur-sm rounded-full p-1 w-full">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setCurrentCategory(category.id)
                  onCategoryChange?.(category.id)
                  if (category.id !== "category") setSelectedSubCategory("")
                  if (category.id !== "region") onCountryChange?.("")
                }}
                className={`flex items-center justify-center px-2 py-1 rounded-full gap-1 transition-colors flex-1 text-sm ${
                  currentCategory === category.id ? "bg-white text-gray-900" : "text-white hover:bg-white/10"
                }`}
              >
                <category.icon className="h-4 w-4" />
                <span className="font-medium md:block hidden">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 検索フォーム */}
        <form onSubmit={handleSearch} className="flex flex-wrap gap-2 w-full">
          {/* フリーワード検索 */}
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="観光スポット、アクティビティ、ホテル..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pr-12 border-2 border-white bg-white bg-opacity-20 rounded-full text-white placeholder-gray-200 focus:outline-none focus:border-custom-green transition-colors"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-custom-green text-white px-4 py-1 rounded-full hover:bg-custom-green/90 transition-colors font-medium text-sm"
            >
              検索
            </button>
          </div>

          {/* 都市名・国名の入力（regionカテゴリの時のみ） */}
          {currentCategory === "region" && (
            <div className="flex-grow">
              <input
                type="text"
                placeholder="都市名や国名を入力"
                value={countryFilter}
                onChange={(e) => onCountryChange?.(e.target.value)}
                className="w-full px-4 py-2 border-2 border-white bg-white bg-opacity-20 rounded-full text-white placeholder-gray-200 focus:outline-none focus:border-custom-green transition-colors"
              />
            </div>
          )}

          {/* サブカテゴリ選択（categoryカテゴリの時のみ） */}
          {currentCategory === "category" && (
            <div className="relative">
              <select
                value={selectedSubCategory}
                onChange={(e) => setSelectedSubCategory(e.target.value)}
                className="appearance-none bg-white bg-opacity-20 border-2 border-white text-white rounded-full px-4 py-2 pr-8 focus:outline-none focus:border-custom-green transition-colors"
              >
                <option value="">分野を選択</option>
                {subCategories.map((subCategory) => (
                  <option key={subCategory} value={subCategory}>
                    {subCategory}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white pointer-events-none" />
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
