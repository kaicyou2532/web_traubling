import DestinationScroll from "./DestinationScroll"
import CategoryScroll from "./CategoryScroll"
import UsefulTroubleReports from "./UsefulTroubleReports"
import RecentPosts from "./RecentPosts"

export default function AllContent() {
  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-3xl font-bold mb-8 text-gray-800">人気の観光地のお悩みを確認する</h2>
        <DestinationScroll category="all" />
      </section>
      <section>
        <h2 className="text-3xl font-bold mb-8 text-gray-800">分野別</h2>
        <CategoryScroll />
      </section>
      <section>
        <h2 className="text-3xl font-bold mb-8 text-gray-800">ランキング</h2>
        <UsefulTroubleReports category="all" />
      </section>
      <section>
        <h2 className="text-3xl font-bold mb-8 text-gray-800">最近の投稿</h2>
        <RecentPosts category="all" />
      </section>
    </div>
  )
}

