import { MapPinIcon, ChatBubbleLeftIcon, HandThumbUpIcon } from "@heroicons/react/24/solid"
import Link from "next/link"

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
  },
  {
    id: 2,
    title: "ローマでレストランのぼったくりを回避する方法",
    content: "観光客向けレストランでよくある過剰請求の手口と、信頼できるレストランの見分け方について...",
    city: "ローマ",
    country: "イタリア",
    likes: 289,
    comments: 43,
    author: "グルメ花子",
    tags: ["飲食", "トラブル", "お金"],
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
  },
  {
    id: 4,
    title: "ロンドンの地下鉄で切符を間違えて購入してしまった時の対処法",
    content: "ロンドンの複雑な運賃システムでよくある間違いと、払い戻しの方法について説明します...",
    city: "ロンドン",
    country: "イギリス",
    likes: 234,
    comments: 29,
    author: "電車好き",
    tags: ["交通", "チケット", "返金"],
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
  },
]

export default function SearchResults() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">検索結果: {mockSearchResults.length}件</h2>
      </div>
      <div className="space-y-6">
        {mockSearchResults.map((result) => (
          <Link href={`/reports/${result.id}`} key={result.id}>
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MapPinIcon className="h-4 w-4" />
                  <span>{result.city}, {result.country}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{result.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{result.content}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {result.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
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
  )
}
