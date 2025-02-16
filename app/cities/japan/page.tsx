"use client"

import { useState } from "react"
import { MagnifyingGlassIcon, MapPinIcon } from "@heroicons/react/24/solid"
import Link from "next/link"

const cities = [
  {
    id: "tokyo",
    name: "東京",
    troubles: 1245,
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1794&auto=format&fit=crop",
  },
  {
    id: "kyoto",
    name: "京都",
    troubles: 523,
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: "osaka",
    name: "大阪",
    troubles: 687,
    image: "https://images.unsplash.com/photo-1590559899731-a382839e5549?q=80&w=1974&auto=format&fit=crop",
  },
  {
    id: "sapporo",
    name: "札幌",
    troubles: 245,
    image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: "fukuoka",
    name: "福岡",
    troubles: 312,
    image: "https://images.unsplash.com/photo-1617876139746-56e60b7a3c68?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: "naha",
    name: "那覇",
    troubles: 178,
    image: "https://images.unsplash.com/photo-1604842585455-e731d3f2de9d?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: "yokohama",
    name: "横浜",
    troubles: 398,
    image: "https://images.unsplash.com/photo-1607942941248-4b2210a2f4a8?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: "kobe",
    name: "神戸",
    troubles: 287,
    image: "https://images.unsplash.com/photo-1590559427911-45e3e4e565df?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: "nagoya",
    name: "名古屋",
    troubles: 356,
    image: "https://images.unsplash.com/photo-1605465461949-41c7f2a9a62e?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: "sendai",
    name: "仙台",
    troubles: 201,
    image: "https://images.unsplash.com/photo-1578271887552-5ac3a72752bc?q=80&w=1926&auto=format&fit=crop",
  },
]

export default function JapaneseCitiesPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCities = cities.filter((city) => city.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div>
      <div
        className="relative h-[40vh] bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80')",
        }}
      >
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
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-custom-green text-white p-2 rounded-full hover:bg-custom-green/90 transition-colors"
              onClick={() => {
                /* 検索機能をここに実装 */
              }}
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCities.map((city) => (
            <Link href={`/cities/${city.id}`} key={city.id}>
              <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <div className="relative h-48">
                  <img src={city.image || "/placeholder.svg"} alt={city.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black bg-opacity-40" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h2 className="text-2xl font-bold">{city.name}</h2>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-custom-green">
                      <MapPinIcon className="h-5 w-5 mr-1" />
                      <span>{city.troubles} 件のお悩み</span>
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

