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

interface Country {
  id: number
  jaName: string
  cities: City[]
}

// ✅ ヘッダー画像の URL
const HEADER_IMAGE_URL =
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80"

export default function InternationalCitiesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [countries, setCountries] = useState<Country[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/cities")
        if (!response.ok) throw new Error("API Error")
        const data: Country[] = await response.json()
        console.log("Fetched Cities:", data) // ✅ データ確認
        setCountries(data)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      }
    }
    fetchData()
  }, [])

  const filteredCountries = countries
    .map((country) => ({
      ...country,
      cities: country.cities.filter(
        (city) =>
          city.jaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          country.jaName.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }))
    .filter((country) => country.cities.length > 0)

  return (
    <div>
      {/* ✅ ヘッダー画像 */}
      <div
        className="relative h-[40vh] bg-cover bg-center"
        style={{
          backgroundImage: `url('${HEADER_IMAGE_URL}')`,
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

        {filteredCountries.length === 0 ? (
          <p className="text-center text-gray-500">データがありません</p>
        ) : (
          filteredCountries.map((country) => (
            <div key={country.id} className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-gray-800">{country.jaName}</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {country.cities.map((city) => (
                  <Link href={`/cities/${city.id}`} key={city.id}>
                    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                      <div className="relative h-48">
                        <img
                          src={city.Photourl}
                          alt={city.jaName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = HEADER_IMAGE_URL // ✅ エラー時にヘッダー画像を代替として表示
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40" />
                        <div className="absolute bottom-4 left-4 text-white">
                          <h3 className="text-2xl font-bold">{city.jaName}</h3>
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
          ))
        )}
      </div>
    </div>
  )
}
