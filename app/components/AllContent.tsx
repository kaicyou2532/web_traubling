import DestinationScroll from "./DestinationScroll"
import CategoryScroll from "./CategoryScroll"
import UsefulTroubleReports from "./UsefulTroubleReports"
import RecentPosts from "./RecentPosts"

export default function AllContent() {
  return (
    <div className="space-y-12">
      <section>
        <DestinationScroll/>
      </section>
      <section>
        <CategoryScroll />
      </section>
      <section>
        <UsefulTroubleReports category="all" />
      </section>
      <section>
        <RecentPosts category="all" />
      </section>
    </div>
  )
}

