"use client"

import type React from "react"
import { useState, useEffect } from "react"
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

interface TroubleCategory {
  id: number;
  jaName: string;
  enName: string;
  postCount: number;
}

interface City {
  id: number;
  jaName: string;
  enName: string;
  postCount: number;
}

interface SearchBarProps {
  isCompact?: boolean
  onSearch?: (searchTerm: string, category: string, subCategory?: string, countryFilter?: string, cityFilter?: string, troubleFilter?: string) => void
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
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedTrouble, setSelectedTrouble] = useState("")
  
  // フィルターオプション
  const [troubleCategories, setTroubleCategories] = useState<TroubleCategory[]>([])
  const [citiesByCountry, setCitiesByCountry] = useState<Record<string, City[]>>({})
  const [loading, setLoading] = useState(true)

  // フィルターオプションを取得
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch('/api/search/filters')
        if (response.ok) {
          const data = await response.json()
          setTroubleCategories(data.categories)
          setCitiesByCountry(data.cities)
        }
      } catch (error) {
        console.error("フィルターオプション取得エラー:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFilterOptions()
  }, [])

  // 自動検索は無効化 - ユーザーが明示的に検索ボタンを押すかフィルターを選択した時のみ検索実行
  useEffect(() => {
    if (!loading && (selectedSubCategory || selectedCity || selectedTrouble)) {
      // フィルターが選択された場合のみ自動検索
      onSearch?.(
        searchTerm,
        currentCategory,
        selectedSubCategory,
        countryFilter,
        selectedCity,
        selectedTrouble
      )
    }
  }, [selectedSubCategory, selectedCity, selectedTrouble])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // フォームからの検索実行
    onSearch?.(
      searchTerm, 
      currentCategory, 
      selectedSubCategory, 
      countryFilter,
      selectedCity,
      selectedTrouble
    )
  }

  // カテゴリ変更時にフィルターをリセット
  const handleCategoryChange = (categoryId: string) => {
    setCurrentCategory(categoryId)
    onCategoryChange?.(categoryId)
    
    // カテゴリ変更時にフィルターをクリア
    setSelectedSubCategory("")
    setSelectedCity("")
    setSelectedTrouble("")
    onCountryChange?.("")
    
    // カテゴリ変更時は検索実行しない（ユーザーが明示的に検索する必要がある）
  }

  return (
    <div className={`w-full max-w-4xl mx-auto px-4 ${isCompact ? "py-4" : ""}`}>
      <div className="flex flex-col gap-4">
        {/* カテゴリーボタン */}
        <div className="flex justify-center">
          <div className="flex justify-between bg-white/20 backdrop-blur-sm rounded-full p-1 w-full">
            {categories.map((category) => (
              <button
                type="button"
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`flex items-center justify-center px-2 py-1 rounded-full gap-1 transition-colors flex-1 text-sm ${currentCategory === category.id ? "bg-white text-gray-900" : "text-white hover:bg-white/10"
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
              placeholder={
                currentCategory === "all" 
                  ? "何も入力せずに検索ボタンで全件表示 / キーワードで絞り込み検索" 
                  : currentCategory === "region"
                  ? "国・都市名で検索"
                  : currentCategory === "category"
                  ? "分野・トラブル内容で検索"
                  : currentCategory === "domestic"
                  ? "日本国内のトラブル内容で検索"
                  : "海外のトラブル内容で検索"
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(e as any)
                }
              }}
              className="w-full px-4 py-2 pr-12 border-2 border-white bg-white bg-opacity-20 rounded-full text-white placeholder-gray-200 focus:outline-none focus:border-custom-green transition-colors"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-custom-green text-white px-4 py-1 rounded-full hover:bg-custom-green/90 transition-colors font-medium text-sm"
            >
              検索
            </button>
          </div>

          {/* 詳細フィルター - カテゴリに応じて表示 */}
          {currentCategory !== "all" && (
            <div className="flex flex-wrap gap-2">
              {/* 国・都市別の場合 */}
              {currentCategory === "region" && (
                <>
                  {/* 都市選択 */}
                  <div className="relative">
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="appearance-none bg-white bg-opacity-20 border-2 border-white text-white rounded-full px-4 py-2 pr-8 focus:outline-none focus:border-custom-green transition-colors"
                      disabled={loading}
                    >
                      <option value="">都市を選択</option>
                      {Object.entries(citiesByCountry).map(([country, cities]) => (
                        <optgroup key={country} label={country}>
                          {cities.map((city) => (
                            <option key={city.id} value={city.id}>
                              {city.jaName} ({city.postCount}件)
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white pointer-events-none" />
                  </div>

                  {/* 都市名・国名の入力 */}
                  <div className="flex-grow">
                    <input
                      type="text"
                      placeholder="都市名や国名を入力"
                      value={countryFilter}
                      onChange={(e) => onCountryChange?.(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-white bg-white bg-opacity-20 rounded-full text-white placeholder-gray-200 focus:outline-none focus:border-custom-green transition-colors"
                    />
                  </div>
                </>
              )}

              {/* 分野別の場合 */}
              {currentCategory === "category" && (
                <div className="relative">
                  <select
                    value={selectedTrouble}
                    onChange={(e) => setSelectedTrouble(e.target.value)}
                    className="appearance-none bg-white bg-opacity-20 border-2 border-white text-white rounded-full px-4 py-2 pr-8 focus:outline-none focus:border-custom-green transition-colors"
                    disabled={loading}
                  >
                    <option value="">分野を選択</option>
                    {troubleCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.jaName} ({category.postCount}件)
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white pointer-events-none" />
                </div>
              )}

              {/* 日本国内の場合 */}
              {currentCategory === "domestic" && (
                <>
                  {/* 日本の都市選択 */}
                  <div className="relative">
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="appearance-none bg-white bg-opacity-20 border-2 border-white text-white rounded-full px-4 py-2 pr-8 focus:outline-none focus:border-custom-green transition-colors"
                      disabled={loading}
                    >
                      <option value="">都市を選択</option>
                      {citiesByCountry["日本"]?.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.jaName} ({city.postCount}件)
                        </option>
                      ))}
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white pointer-events-none" />
                  </div>

                  {/* 分野選択 */}
                  <div className="relative">
                    <select
                      value={selectedTrouble}
                      onChange={(e) => setSelectedTrouble(e.target.value)}
                      className="appearance-none bg-white bg-opacity-20 border-2 border-white text-white rounded-full px-4 py-2 pr-8 focus:outline-none focus:border-custom-green transition-colors"
                      disabled={loading}
                    >
                      <option value="">分野を選択</option>
                      {troubleCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.jaName} ({category.postCount}件)
                        </option>
                      ))}
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white pointer-events-none" />
                  </div>
                </>
              )}

              {/* 海外の場合 */}
              {currentCategory === "overseas" && (
                <>
                  {/* 海外都市選択 */}
                  <div className="relative">
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="appearance-none bg-white bg-opacity-20 border-2 border-white text-white rounded-full px-4 py-2 pr-8 focus:outline-none focus:border-custom-green transition-colors"
                      disabled={loading}
                    >
                      <option value="">都市を選択</option>
                      {Object.entries(citiesByCountry)
                        .filter(([country]) => country !== "日本")
                        .map(([country, cities]) => (
                          <optgroup key={country} label={country}>
                            {cities.map((city) => (
                              <option key={city.id} value={city.id}>
                                {city.jaName} ({city.postCount}件)
                              </option>
                            ))}
                          </optgroup>
                        ))}
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white pointer-events-none" />
                  </div>

                  {/* 分野選択 */}
                  <div className="relative">
                    <select
                      value={selectedTrouble}
                      onChange={(e) => setSelectedTrouble(e.target.value)}
                      className="appearance-none bg-white bg-opacity-20 border-2 border-white text-white rounded-full px-4 py-2 pr-8 focus:outline-none focus:border-custom-green transition-colors"
                      disabled={loading}
                    >
                      <option value="">分野を選択</option>
                      {troubleCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.jaName} ({category.postCount}件)
                        </option>
                      ))}
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white pointer-events-none" />
                  </div>
                </>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
