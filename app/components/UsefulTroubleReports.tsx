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
  },
  {
    id: 2,
    title: "ローマでレストランのぼったくりを回避する方法",
    likes: 289,
    comments: 43,
    author: "グルメ花子",
    city: "ローマ",
    country: "イタリア",
  },
  {
    id: 3,
    title: "バルセロナでの安全なタクシーの選び方",
    likes: 276,
    comments: 38,
    author: "冒険次郎",
    city: "バルセロナ",
    country: "スペイン",
  },
]

const medals = [
  { color: "bg-gray-300", text: "text-gray-800", label: "2位" },
  { color: "bg-yellow-400", text: "text-yellow-800", label: "1位" },
  { color: "bg-yellow-700", text: "text-yellow-100", label: "3位" },
]

export default function UsefulTroubleReports() {
  // 2位、1位、3位の順に並び替え
  const orderedReports = [mockReports[1], mockReports[0], mockReports[2]]

  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold mb-12 text-gray-800 text-center">役に立ったトラブル報告</h2>
      <div className="flex flex-col md:flex-row justify-center items-end space-y-4 md:space-y-0 md:space-x-6">
        {orderedReports.map((report, index) => (
          <Link
            href={`/reports/${report.id}`}
            key={report.id}
            className={`w-full md:w-80 transform transition-all duration-300 hover:-translate-y-1 ${
              index === 1 ? "md:-translate-y-8" : index === 0 ? "md:-translate-y-4" : ""
            }`}
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
    </div>
  )
}

