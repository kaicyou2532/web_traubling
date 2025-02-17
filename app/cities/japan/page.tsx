"use client"

import { useState, useEffect } from "react"
import { MagnifyingGlassIcon, MapPinIcon } from "@heroicons/react/24/solid"
import Link from "next/link"

interface City {
  id: number
  enName: string
  jaName: string
  Photourl: string
}

const bannerImageURL =
  "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"

export default function JapaneseCitiesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [cities, setCities] = useState<City[]>([])
  const [bannerSrc, setBannerSrc] = useState(bannerImageURL)

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch("/api/cities")
        if (!response.ok) throw new Error("API Error")
        const data = await response.json()
        setCities(data)
      } catch (error) {
        console.error("Failed to fetch cities:", error)
      }
    }
    fetchCities()
  }, [])

  const filteredCities = cities.filter((city) =>
    city.jaName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      {/* バナー画像 */}
      <div className="relative h-[40vh] bg-cover bg-center">
        <img
          src={bannerSrc}
          alt="バナー画像"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = bannerImageURL
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-5xl font-bold text-white mb-4">日本の人気都市</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 relative">
          <div className="relative">
            <input
              type="text"
              placeholder="都市名で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-custom-green pl-12 pr-16"
            />
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCities.map((city) => (
            <Link href={`/cities/${city.id}`} key={city.id}>
              <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <div className="relative h-48">
                  <img
                    src={city.Photourl || "/placeholder.svg"}
                    alt={city.jaName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = bannerImageURL
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h2 className="text-2xl font-bold">{city.jaName}</h2>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-custom-green">
                      <MapPinIcon className="h-5 w-5 mr-1" />
                      <span>都市情報を見る</span>
                    </div>
                    <span className="text-sm text-gray-500">詳細を見る</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
