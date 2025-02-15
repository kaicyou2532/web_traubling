"use client"

import { useState } from "react"
import { MapPinIcon } from "@heroicons/react/24/solid"

const regions = [
  {
    id: "hokkaido",
    name: "北海道",
    position: "top-[15%] left-[80%]",
    troubles: 42,
  },
  {
    id: "tohoku",
    name: "東北",
    position: "top-[30%] left-[75%]",
    troubles: 156,
  },
  {
    id: "kanto",
    name: "関東",
    position: "top-[45%] left-[70%]",
    troubles: 523,
  },
  {
    id: "chubu",
    name: "中部",
    position: "top-[50%] left-[60%]",
    troubles: 234,
  },
  {
    id: "kinki",
    name: "近畿",
    position: "top-[60%] left-[50%]",
    troubles: 345,
  },
  {
    id: "chugoku",
    name: "中国",
    position: "top-[50%] left-[35%]",
    troubles: 123,
  },
  {
    id: "shikoku",
    name: "四国",
    position: "top-[70%] left-[40%]",
    troubles: 89,
  },
  {
    id: "kyushu",
    name: "九州",
    position: "top-[75%] left-[25%]",
    troubles: 234,
  },
  {
    id: "okinawa",
    name: "沖縄",
    position: "top-[90%] left-[15%]",
    troubles: 167,
  },
]

export default function MapSection() {
  const [activeRegion, setActiveRegion] = useState<string | null>(null)

  return (
    <div className="container mx-auto px-8 py-12">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">地図から探す</h2>
      <div className="relative aspect-[4/3] md:aspect-[16/9] bg-[#E8F4F3] rounded-3xl overflow-hidden">
        <div className="absolute inset-0 p-4">
          {/* Japan map outline would go here */}
          {regions.map((region) => (
            <button
              key={region.id}
              className={`absolute ${
                region.position
              } group flex items-center justify-center transition-transform hover:scale-110 ${
                activeRegion === region.id ? "scale-110" : ""
              }`}
              onMouseEnter={() => setActiveRegion(region.id)}
              onMouseLeave={() => setActiveRegion(null)}
            >
              <div className="relative">
                <MapPinIcon
                  className={`h-8 w-8 text-custom-green ${activeRegion === region.id ? "text-custom-green/80" : ""}`}
                />
                <div
                  className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-2 whitespace-nowrap bg-white rounded-lg shadow-lg px-3 py-2 text-sm transition-opacity ${
                    activeRegion === region.id ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <p className="font-bold text-gray-800">{region.name}</p>
                  <p className="text-custom-green">{region.troubles}件の投稿</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

