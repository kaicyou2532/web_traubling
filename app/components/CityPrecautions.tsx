import { StarIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/solid"

const precautions = [
  {
    id: 1,
    title: "英国のプラグ形状に対応した変換アダプターを用意する",
    author: "鈴木一郎",
    votes: 56,
    comments: 12,
    category: "準備",
  },
  {
    id: 2,
    title: "雨具（折りたたみ傘や軽量のレインコート）を必ず持参する",
    author: "高橋美咲",
    votes: 42,
    comments: 8,
    category: "持ち物",
  },
  {
    id: 3,
    title: "公共交通機関のOyster Cardを事前に購入しておく",
    author: "中村健一",
    votes: 38,
    comments: 15,
    category: "交通",
  },
]

export default function CityPrecautions({ city }: { city: string }) {
  return (
    <div className="mb-12">
      <h2 className="text-3xl font-bold mb-6">{city}に行く前に気をつけたほうがいいこと</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {precautions.map((precaution) => (
          <div
            key={precaution.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{precaution.title}</h3>
              <p className="text-gray-600 mb-4">投稿者: {precaution.author}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <StarIcon className="h-5 w-5 text-yellow-500 mr-1" />
                    <span>{precaution.votes}</span>
                  </div>
                  <div className="flex items-center">
                    <ChatBubbleLeftIcon className="h-5 w-5 text-gray-500 mr-1" />
                    <span>{precaution.comments}</span>
                  </div>
                </div>
                <span className="text-sm text-[#007B63] font-medium">{precaution.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

