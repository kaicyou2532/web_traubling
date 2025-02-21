import Image from "next/image"
import CommonIssues from "@/app/components/CommonIssues"
import CitySpecificTroubles from "@/app/components/CitySpecificTroubles"
import CityPrecautions from "@/app/components/CityPrecautions"

export default function CityPage({ params }: { params: { city: string } }) {
  //実際の実装では、この情報データベースから取得する
  const cityData = {
    name: "ロンドン",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2070&auto=format&fit=crop",
    country: "イギリス",
  }

  return (
    <div>
      <div className="relative h-[50vh] w-full">
        <Image
          src={cityData.image || "/placeholder.svg"}
          alt={cityData.name}
          layout="fill"
          objectFit="cover"
          className="brightness-75"
        />
        <div className="absolute bottom-8 left-8 text-white">
          <h1 className="text-5xl font-bold mb-2">{cityData.name}</h1>
          <p className="text-2xl">{cityData.country}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <CommonIssues city={cityData.name} />
        <CitySpecificTroubles city={cityData.name} />
        <CityPrecautions city={cityData.name} />
      </div>
    </div>
  )
}

