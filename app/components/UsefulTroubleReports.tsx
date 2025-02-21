import { ChatBubbleLeftIcon, HandThumbUpIcon } from "@heroicons/react/24/solid"
import Link from "next/link"

const mockReports = [
  {
    id: 1,
    title: "パリのメトロでスリに遭遇！対処法と注意点",
    likes: 342,
    comments: 56,
    author: "旅人太郎",
    city: "パリ",
    country: "フランス",
    category: "overseas",
  },
  {
    id: 2,
    title: "ローマでレストランのぼったくりを回避する方法",
    likes: 289,
    comments: 43,
    author: "グルメ花子",
    city: "ローマ",
    country: "イタリア",
    category: "overseas",
  },
  {
    id: 3,
    title: "バルセロナでの安全なタクシーの選び方",
    likes: 276,
    comments: 38,
    author: "冒険次郎",
    city: "バルセロナ",
    country: "スペイン",
    category: "overseas",
  },
]

const medals = [
  { color: "bg-gray-300", text: "text-gray-800", label: "2位" },
  { color: "bg-yellow-400", text: "text-yellow-800", label: "1位" },
  { color: "bg-yellow-700", text: "text-yellow-100", label: "3位" },
]

export default function UsefulTroubleReports({ category = "all" }: { category?: string }) {
  const filteredReports =
    category === "all" ? mockReports : mockReports.filter((report) => report.category === category)

  // orderedReports の定義を更新
  const orderedReports = [filteredReports[1], filteredReports[0], filteredReports[2]].filter(Boolean)

  return (
    <div className="container mx-auto px-4 pt-12 pb-16">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">ランキング</h2>
      {orderedReports.length > 0 ? (
        <div className="flex flex-col md:flex-row justify-center items-end space-y-4 md:space-y-0 md:space-x-6">
          {orderedReports.map((report, index) => (
            <Link
              href={`/reports/${report.id}`}
              key={report.id}
              className={`w-full transform transition-all duration-300 hover:-translate-y-1}`}
            >
              <div className={`${medals[index].color} rounded-t-xl p-2 text-center font-bold ${medals[index].text}`}>
                {medals[index].label}
              </div>
              <div className="bg-white rounded-b-xl shadow-md overflow-hidden cursor-pointer">
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 line-clamp-2">{report.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {report.city}, {report.country}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-custom-green">
                        <HandThumbUpIcon className="h-5 w-5 mr-1" />
                        <span>{report.likes}</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <ChatBubbleLeftIcon className="h-5 w-5 mr-1" />
                        <span>{report.comments}</span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{report.author}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600">該当するトラブル報告はありません。</p>
      )}
    </div>
  )
}

