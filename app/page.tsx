"use client"

import { useState } from "react"
import SearchBar from "./components/SearchBar"
import SearchResults from "./components/SearchResults"
import AllContent from "./components/AllContent"
import DomesticContent from "./components/DomesticContent"
import OverseasContent from "./components/OverseasContent"
import CategoryContent from "./components/CategoryContent"

export default function Home() {
  const [isSearching, setIsSearching] = useState(false)
  const [searchCategory, setSearchCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearch = (term: string, category: string) => {
    setIsSearching(true)
    setSearchTerm(term)
    setSearchCategory(category)
  }

  const handleCategoryChange = (category: string) => {
    setSearchCategory(category)
    setIsSearching(false)
    setSearchTerm("")
  }

  const renderContent = () => {
    if (isSearching) {
      return <SearchResults searchTerm={searchTerm} />
    }

    switch (searchCategory) {
      case "all":
        return <AllContent />
      case "domestic":
        return <DomesticContent />
      case "overseas":
        return <OverseasContent />
      case "category":
        return <CategoryContent />
      default:
        return <AllContent />
    }
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
            旅のお悩みを共有
          </h1>
          <SearchBar
            isCompact={isSearching}
            onSearch={handleSearch}
            selectedCategory={searchCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">{renderContent()}</div>
    </div>
  )
}

