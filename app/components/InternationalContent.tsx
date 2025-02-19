import UsefulTroubleReports from "./UsefulTroubleReports"
import TroubleList from "./TroubleList"
import Link from "next/link"
import { PlusCircleIcon } from "@heroicons/react/24/solid"

export default function InternationalContent() {
  return (
    <>
      <div className="bg-gray-100 py-12">
        <div className="container mx-auto px-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">海外の役立つトラブル報告</h2>
          <UsefulTroubleReports category="overseas" />
        </div>
      </div>
      <div className="bg-white py-12">
        <div className="container mx-auto px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">海外の最近の投稿</h2>
            <Link
              href="/post"
              className="bg-custom-green text-white px-6 py-3 rounded-full flex items-center hover:bg-custom-green/90 transition-colors font-medium"
            >
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              投稿する
            </Link>
          </div>
          <TroubleList category="overseas" />
        </div>
      </div>
    </>
  )
}

