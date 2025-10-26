import Image from "next/image"
import CommonIssues from "@/app/components/CommonIssues"
import CitySpecificTroubles from "@/app/components/CitySpecificTroubles"
import CityPrecautions from "@/app/components/CityPrecautions"
import { prisma } from "@lib/prisma"

export default async function CityPage({ params }: { params: { city: string } }) {
  // 注: 実際の実装では、この情報はAPIやデータベースから取得します

  const { city: id } = params

  const city = await prisma.city.findUnique({
    where: {
      id: Number(id)
    },
    include: {
      country: true,
      posts: {
        include: {
          user: true,
          comments: true,
          trouble: true
        }
      }
    }
  })

  const categories = await prisma.trouble.findMany()

  if (!city) {
    return <div>このページはありません。</div>
  }

  const { jaName, country, posts } = city

  // PostWithAllData型に合うようにデータを変換
  const postsWithAllData = posts.map(post => ({
    ...post,
    isLiked: false,
    likeCount: 0
  }))

  return (
    <div>
      <div className="relative h-[50vh] w-full">
        <Image
          src={city.photoUrl || "/placeholder.svg"}
          alt={city.jaName}
          layout="fill"
          objectFit="cover"
          className="brightness-75"
        />
        <div className="absolute bottom-8 left-8 text-white">
          <h1 className="text-5xl font-bold mb-2">{jaName}</h1>
          <p className="text-2xl">{country.jaName}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <CommonIssues city={jaName} posts={postsWithAllData} categories={categories}/>
        {/* <CitySpecificTroubles city={jaName} />
        <CityPrecautions city={jaName} /> */}
      </div>
    </div>
  )
}

