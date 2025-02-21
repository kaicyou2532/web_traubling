import DestinationScroll from "./DestinationScroll"
import UsefulTroubleReports from "./UsefulTroubleReports"
import RecentPosts from "./RecentPosts"

export default function OverseasContent() {
  return (
    <div className="space-y-12">
      <section>
        <DestinationScroll category="overseas" />
      </section>
      <section>
        <h2 className="text-3xl font-bold mb-8 text-gray-800">ランキング</h2>
        <UsefulTroubleReports category="overseas" />
      </section>
      <section>
        <h2 className="text-3xl font-bold mb-8 text-gray-800">海外の最近の投稿</h2>
        <RecentPosts category="overseas" />
      </section>
    </div>
  )
}

