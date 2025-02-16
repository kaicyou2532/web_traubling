"use client"

import Image from "next/image"
import { useState } from "react"
import { ChevronRightIcon } from "@heroicons/react/24/solid"

const categories = [
  { id: "all", name: "全て" },
  { id: "transport", name: "交通" },
  { id: "accommodation", name: "宿泊" },
  { id: "food", name: "飲食" },
  { id: "sightseeing", name: "観光" },
  { id: "culture", name: "文化" },
]

const commonIssues = [
  { id: 1, category: "transport", title: "地下鉄の乗り方がわからない" },
  { id: 2, category: "accommodation", title: "ホテルの予約がキャンセルされた" },
  { id: 3, category: "food", title: "ベジタリアン向けのレストランが見つからない" },
  { id: 4, category: "sightseeing", title: "ビッグベンが工事中で見られない" },
  { id: 5, category: "culture", title: "英国式の礼儀作法がわからない" },
]

const londonSpecificIssues = [
  "雨が多いので常に傘を持ち歩く必要がある",
  "物価が高く、予算管理が難しい",
  "ピカデリーサーカスでのスリに注意",
  "左側通行に慣れるのに時間がかかる",
]

const thingsToKnow = [
  "プラグアダプターを忘れずに（イギリスは独自の形状）",
  "パブでのチップの習慣を理解しておく",
  "オイスターカード（交通カード）を事前に入手すると便利",
  "美術館は多くが無料で入場できる",
]

export default function LondonPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredIssues =
    selectedCategory === "all" ? commonIssues : commonIssues.filter((issue) => issue.category === selectedCategory)

  return (
    <div>
      <div className="relative h-[50vh] w-full">
        <Image
          src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad"
          alt="London"
          layout="fill"
          objectFit="cover"
        />
        <div className="absolute bottom-8 left-8 text-white">
          <h1 className="text-5xl font-bold drop-shadow-lg">London</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">よくある困りごと</h2>
          <div className="flex justify-center mb-6">
            <div className="flex justify-between bg-white/20 backdrop-blur-sm rounded-full p-1 w-full max-w-3xl">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center justify-center px-4 py-2 rounded-full gap-1 transition-colors flex-1 ${
                    selectedCategory === category.id ? "bg-custom-green text-white" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="font-medium text-sm">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredIssues.map((issue) => (
              <div key={issue.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{issue.title}</h3>
                <a href="#" className="text-custom-green font-medium flex items-center">
                  詳細を見る
                  <ChevronRightIcon className="h-5 w-5 ml-1" />
                </a>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">ロンドン特有のトラブル</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <ul className="list-disc list-inside space-y-2">
              {londonSpecificIssues.map((issue, index) => (
                <li key={index} className="text-gray-700">
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6 text-gray-800">ロンドンに行く前に気をつけたほうがいいこと</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <ul className="list-disc list-inside space-y-2">
              {thingsToKnow.map((item, index) => (
                <li key={index} className="text-gray-700">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}

