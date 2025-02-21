"use client"

import { useState } from "react"
import SearchBar from "./components/SearchBar"
import SearchResults from "./components/SearchResults"

export default function Home() {
  const [isSearching, setIsSearching] = useState(false)
  const [searchCategory, setSearchCategory] = useState("all")
  const [searchSubCategory, setSearchSubCategory] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearch = (searchTerm: string, category: string, subCategory?: string) => {
    setIsSearching(true)
    setSearchTerm(searchTerm)
    setSearchCategory(category)
    setSearchSubCategory(subCategory || "")
  }

  const handleCategoryChange = (category: string) => {
    setSearchCategory(category)
    setIsSearching(false)
    setSearchTerm("")
  }

  return (
    <div>
      <div
        className={`relative bg-cover bg-center flex items-center justify-center transition-all duration-300 ${
          isSearching ? "h-[30vh]" : "h-[60vh]"
        }`}
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 text-center w-full">
          <h1
            className={`font-extrabold text-white mb-8 leading-tight transition-all duration-300 ${
              isSearching ? "text-3xl md:text-4xl" : "text-4xl md:text-6xl"
            }`}
          >
            旅のお悩み解決サイト
          </h1>
          <SearchBar
            isCompact={isSearching}
            onSearch={handleSearch}
            selectedCategory={searchCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>
      </div>

      <SearchResults
        category={searchCategory}
        subCategory={searchSubCategory}
        searchTerm={searchTerm}
        isSearching={isSearching}
      />
    </div>
  )
}

