import DestinationScroll from "./DestinationScroll"
import CategoryScroll from "./CategoryScroll"
import UsefulTroubleReports from "./UsefulTroubleReports"
import RecentPosts from "./RecentPosts"
import type { City } from "@prisma/client"

type Props = {
  japanCities: City[],
  otherCities: City[]
}

export default function AllContent({japanCities, otherCities}: Props) {
  return (
    <div className="space-y-12">
      <section>
        <DestinationScroll 
        japanCities={japanCities}
        otherCities={otherCities}
        />
      </section>
      {/* <section>
        <CategoryScroll />
      </section> */}
      {/* <section>
        <UsefulTroubleReports category="all" />
      </section> */}
      <section>
        <RecentPosts category="all" />
      </section>
    </div>
  )
}

