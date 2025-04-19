import DestinationScroll from "./DestinationScroll"
import UsefulTroubleReports from "./UsefulTroubleReports"
import RecentPosts from "./RecentPosts"
import type { City } from "@prisma/client"

type Props = {
  japanCities: City[]
  otherCities: City[]
}

export default function DomesticContent({ japanCities, otherCities }: Props) {
  return (
    <div className="space-y-12">
      <section>
        <DestinationScroll
          japanCities={japanCities}
          otherCities={otherCities}
        />
      </section>
      {/* <section>
        <h2 className="text-3xl font-bold mb-8 text-gray-800">ランキング</h2>
        <UsefulTroubleReports category="domestic" />
      </section> */}
      <section>
        <h2 className="text-3xl font-bold mb-8 text-gray-800">国内の最近の投稿</h2>
        <RecentPosts category="domestic" />
      </section>
    </div>
  )
}

