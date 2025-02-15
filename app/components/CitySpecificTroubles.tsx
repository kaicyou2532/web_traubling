import { StarIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/solid"

const troubles = [
  {
    id: 1,
    title: "左側通行に慣れるのが難しい",
    author: "田中太郎",
    votes: 45,
    comments: 23,
    category: "交通",
  },
  {
    id: 2,
    title: "雨が多いので常に傘を持ち歩く必要がある",
    author: "佐藤花子",
    votes: 38,
    comments: 15,
    category: "天候",
  },
  {
    id: 3,
    title: "パブでのマナーや注文の仕方がわからない",
    author: "山田次郎",
    votes: 29,
    comments: 18,
    category: "文化",
  },
]

export default function CitySpecificTroubles({ city }: { city: string }) {
  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold mb-6">{city}特有のトラブル</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <span className="text-sm text-[#007B63] font-medium">{trouble.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

