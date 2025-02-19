import { MapPinIcon, ChatBubbleLeftIcon, HandThumbUpIcon } from "@heroicons/react/24/solid"
import Link from "next/link"
import DestinationScroll from "./DestinationScroll"
import UsefulTroubleReports from "./UsefulTroubleReports"

// This would normally come from an API
const mockSearchResults = [
  {
    id: 1,
    title: "パリのメトロでスリに遭遇！対処法と注意点",
    content: "パリの地下鉄で気をつけるべきポイントと、もし被害に遭った場合の対処方法について共有します...",
    city: "パリ",
    country: "フランス",
    likes: 342,
    comments: 56,
    author: "旅人太郎",
    tags: ["交通", "治安", "スリ対策"],
    isJapan: false,
  },
  {
    id: 2,
    title: "京都の寺院巡りで注意すべきマナーと服装",
    content: "京都の寺院を訪れる際に気をつけるべきマナーと適切な服装について詳しく解説します...",
    city: "京都",
    country: "日本",
    likes: 289,
    comments: 43,
    author: "和風花子",
    tags: ["文化", "マナー", "観光"],
    isJapan: true,
  },
  {
    id: 3,
    title: "バルセロナでの安全なタクシーの選び方",
    content: "バルセロナで正規のタクシーを見分ける方法と、安全に目的地まで到着するためのアドバイスを...",
    city: "バルセロナ",
    country: "スペイン",
    likes: 276,
    comments: 38,
    author: "冒険次郎",
    tags: ["交通", "タクシー", "安全"],
    isJapan: false,
  },
  {
    id: 4,
    title: "東京のラーメン店で外国人が陥りやすいトラブル",
    content: "東京のラーメン店での注文方法や食べ方のマナーなど、外国人観光客が知っておくべき情報を...",
    city: "東京",
    country: "日本",
    likes: 234,
    comments: 29,
    author: "麺好き太郎",
    tags: ["食事", "マナー", "ラーメン"],
    isJapan: true,
  },
  {
    id: 5,
    title: "NYのホテルでオーバーブッキング！代替手段と補償交渉",
    content: "ニューヨークのホテルでオーバーブッキングに遭遇した際の対処法と、適切な補償を受ける方法...",
    city: "ニューヨーク",
    country: "アメリカ",
    likes: 198,
    comments: 45,
    author: "世界旅人",
    tags: ["宿泊", "トラブル", "交渉"],
    isJapan: false,
  },
]

interface SearchResultsProps {
  category: string
  subCategory?: string
}

export default function SearchResults({ category, subCategory }: SearchResultsProps) {
  let filteredResults = mockSearchResults

  if (category === "domestic") {
    filteredResults = mockSearchResults.filter((result) => result.isJapan)
  } else if (category === "overseas") {
    filteredResults = mockSearchResults.filter((result) => !result.isJapan)
  } else if (category === "category" && subCategory) {
    filteredResults = mockSearchResults.filter((result) => result.tags.includes(subCategory))
  }

  return (
    <div>
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">人気の観光地のお悩みを確認する</h2>
          <DestinationScroll category="all" />
        </div>
      </section>

      <section className="bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">ランキング</h2>
          <UsefulTroubleReports category="all" />
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">最近の投稿: {filteredResults.length}件</h2>
          <div className="space-y-10">
            {filteredResults.map((result) => (
              <Link href={`/reports/${result.id}`} key={result.id}>
                <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200">
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <MapPinIcon className="h-4 w-4" />
                      <span>
                        {result.city}, {result.country}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-800">{result.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{result.content}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {result.tags.map((tag) => (
                        <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-custom-green">
                          <HandThumbUpIcon className="h-5 w-5 mr-1" />
                          <span>{result.likes}</span>
                        </div>
                        <div className="flex items-center text-gray-500">
                          <ChatBubbleLeftIcon className="h-5 w-5 mr-1" />
                          <span>{result.comments}</span>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{result.author}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

