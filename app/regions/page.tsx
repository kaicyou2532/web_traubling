import { MapPinIcon } from "@heroicons/react/24/solid"

const regions = [
  {
    id: "hokkaido",
    name: "北海道",
    warnings: [
      "冬季の厳しい寒さと積雪に注意",
      "観光地が広域に分散しているため、移動時間の計画が重要",
      "熊出没地域での注意が必要",
    ],
  },
  {
    id: "tohoku",
    name: "東北",
    warnings: ["温泉施設でのマナーと注意点", "冬季の路面凍結に注意", "方言による意思疎通の違いに注意"],
  },
  // 他の地域も同様に追加
]

export default function RegionsPage() {
  return (
    <div className="container mx-auto px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">地域別の注意点</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {regions.map((region) => (
          <div key={region.id} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPinIcon className="h-6 w-6 text-custom-green" />
                <h2 className="text-2xl font-bold text-gray-800">{region.name}</h2>
              </div>
              <ul className="space-y-2">
                {region.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-600">
                    <span className="text-custom-green">•</span>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

