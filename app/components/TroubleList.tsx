import { StarIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/solid"

const troubles = [
  { id: 1, title: "京都で財布を無くしました", author: "田中太郎", votes: 15, comments: 7, category: "書類・手続き" },
  {
    id: 2,
    title: "新幹線の予約を間違えてしまいました",
    author: "佐藤花子",
    votes: 23,
    comments: 12,
    category: "交通機関",
  },
  { id: 3, title: "ホテルの予約が反映されていない", author: "山田次郎", votes: 8, comments: 5, category: "宿泊施設" },
]

export default function TroubleList() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {troubles.map((trouble) => (
        <div
          key={trouble.id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-2">{trouble.title}</h3>
            <p className="text-gray-600 mb-4">投稿者: {trouble.author}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <StarIcon className="h-5 w-5 text-yellow-500 mr-1" />
                  <span>{trouble.votes}</span>
                </div>
                <div className="flex items-center">
                  <ChatBubbleLeftIcon className="h-5 w-5 text-gray-500 mr-1" />
                  <span>{trouble.comments}</span>
                </div>
              </div>
              <span className="text-sm text-custom-green font-medium">{trouble.category}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

