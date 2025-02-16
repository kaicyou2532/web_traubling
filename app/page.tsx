import Link from "next/link"
import { PlusCircleIcon } from "@heroicons/react/24/solid"
import TroubleList from "./components/TroubleList"
import SearchBar from "./components/SearchBar"
import DestinationScroll from "./components/DestinationScroll"
import CategoryScroll from "./components/CategoryScroll"
import MapSection from "./components/MapSection"
import UsefulTroubleReports from "./components/UsefulTroubleReports"

export default function Home() {
  return (
    <div>
      <div
        className="relative h-[60vh] bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-8 leading-tight">旅のお悩み解決サイト</h1>
          <SearchBar />
        </div>
      </div>
      <DestinationScroll />
      <CategoryScroll />
      <UsefulTroubleReports />
      <MapSection />
      <div className="container mx-auto px-8">
        <div className="flex justify-between items-center my-8">
          <h2 className="text-3xl font-bold text-gray-800">最近の投稿</h2>
          <Link
            href="/post"
            className="bg-custom-green text-white px-6 py-3 rounded-full flex items-center hover:bg-custom-green/90 transition-colors font-medium"
          >
            <PlusCircleIcon className="h-5 w-5 mr-2" />
            投稿する
          </Link>
        </div>
        <TroubleList />
      </div>
    </div>
  )
}

