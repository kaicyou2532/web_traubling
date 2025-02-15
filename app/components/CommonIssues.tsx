"use client"

import { useState } from "react"
import { Tab } from "@headlessui/react"
import { StarIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/solid"

const categories = [
  { id: "all", name: "全て" },
  { id: "transportation", name: "交通" },
  { id: "accommodation", name: "宿泊" },
  { id: "food", name: "飲食" },
  { id: "sightseeing", name: "観光" },
]

const issues = [
  {
    id: 1,
    category: "transportation",
    title: "地下鉄の乗り方がわからない",
    author: "ジョン・スミス",
    votes: 32,
    comments: 15,
  },
  {
    id: 2,
    category: "accommodation",
    title: "ホテルのチェックイン時間が遅い",
    author: "エミリー・ブラウン",
    votes: 24,
    comments: 8,
  },
  {
    id: 3,
    category: "food",
    title: "ベジタリアン向けのレストランが見つからない",
    author: "田中一郎",
    votes: 18,
    comments: 5,
  },
  { id: 4, category: "sightseeing", title: "人気観光地の待ち時間が長い", author: "山田花子", votes: 28, comments: 12 },
  { id: 5, category: "transportation", title: "タクシーの料金が高い", author: "鈴木次郎", votes: 35, comments: 20 },
]

export default function CommonIssues({ city }: { city: string }) {
  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredIssues =
    selectedCategory === "all" ? issues : issues.filter((issue) => issue.category === selectedCategory)

  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold mb-6">{city}でよくある困りごと</h2>
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-[#007B63]/10 p-1 mb-6">
          {categories.map((category) => (
            <Tab
              key={category.id}
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                 ${
                   selected
                     ? "bg-[#007B63] text-white shadow"
                     : "text-gray-700 hover:bg-[#007B63]/10 hover:text-[#007B63]"
                 }`
              }
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{issue.title}</h3>
                  <p className="text-gray-600 mb-4">投稿者: {issue.author}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <StarIcon className="h-5 w-5 text-yellow-500 mr-1" />
                        <span>{issue.votes}</span>
                      </div>
                      <div className="flex items-center">
                        <ChatBubbleLeftIcon className="h-5 w-5 text-gray-500 mr-1" />
                        <span>{issue.comments}</span>
                      </div>
                    </div>
                    <span className="text-sm text-[#007B63] font-medium">{issue.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}

