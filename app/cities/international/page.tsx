"use client"

import { useState } from "react"
import { MagnifyingGlassIcon, MapPinIcon } from "@heroicons/react/24/solid"
import Link from "next/link"

const cities = [
  {
    country: "フランス",
    cities: [
      {
        id: "paris",
        name: "パリ",
        troubles: 856,
        image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop",
      },
      {
        id: "nice",
        name: "ニース",
        troubles: 312,
        image: "https://images.unsplash.com/photo-1491166617655-0723a0999cfc?q=80&w=2069&auto=format&fit=crop",
      },
    ],
  },
  {
    country: "イタリア",
    cities: [
      {
        id: "rome",
        name: "ローマ",
        troubles: 745,
        image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=2096&auto=format&fit=crop",
      },
      {
        id: "venice",
        name: "ベネチア",
        troubles: 523,
        image: "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?q=80&w=2070&auto=format&fit=crop",
      },
    ],
  },
  {
    country: "イギリス",
    cities: [
      {
        id: "london",
        name: "ロンドン",
        troubles: 934,
        image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2070&auto=format&fit=crop",
      },
      {
        id: "edinburgh",
        name: "エディンバラ",
        troubles: 287,
        image: "https://images.unsplash.com/photo-1506377585622-bedcbb027afc?q=80&w=2070&auto=format&fit=crop",
      },
    ],
  },
  {
    country: "スペイン",
    cities: [
      {
        id: "barcelona",
        name: "バルセロナ",
        troubles: 678,
        image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=2070&auto=format&fit=crop",
      },
      {
        id: "madrid",
        name: "マドリード",
        troubles: 543,
        image: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?q=80&w=2070&auto=format&fit=crop",
      },
    ],
  },
  {
    country: "アメリカ",
    cities: [
      {
        id: "new-york",
        name: "ニューヨーク",
        troubles: 1023,
        image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=2070&auto=format&fit=crop",
      },
      {
        id: "los-angeles",
        name: "ロサンゼルス",
        troubles: 789,
        image: "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?q=80&w=2070&auto=format&fit=crop",
      },
    ],
  },
]

export default function InternationalCitiesPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCities = cities
    .map((country) => ({
      ...country,
      cities: country.cities.filter(
        (city) =>
          city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          country.country.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }))
    .filter((country) => country.cities.length > 0)

  return (
    <div>
      <div
        className="relative h-[40vh] bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-5xl font-bold text-white mb-4">海外の人気都市</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 relative">
          <input
            type="text"
            placeholder="国名または都市名で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-custom-green pl-12"
          />
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
        </div>

        {filteredCities.map((country) => (
          <div key={country.country} className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">{country.country}</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {country.cities.map((city) => (
                <Link href={`/cities/${city.id}`} key={city.id}>
                  <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                    <div className="relative h-48">
                      <img
                        src={city.image || "/placeholder.svg"}
                        alt={city.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40" />
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="text-2xl font-bold">{city.name}</h3>
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
        ))}
      </div>
    </div>
  )
}

