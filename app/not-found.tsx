import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Search, MapPin } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        <div className="mb-8">
          <MapPin className="h-20 w-20 text-custom-green mx-auto" />
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">ページが見つかりません</h2>
        <div className="max-w-[33rem] mx-auto px-4">
          <p className="text-lg text-gray-600 mb-3">
          申し訳ありませんが、お探しのページは存在しないか、移動した可能性があります。別の目的地を探してみましょう。
        </p>  
        <div className="border-t border-gray-300 pt-4">
          <p className="text-lg text-gray-600 mb-8">
        投稿するにはログインが必要です。<br/> ログイン後に再度アクセスしてください。
        </p>  
        </div>
        
        </div>
        <div className="sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button variant="default" className="bg-gray-700 hover:bg-custom-green text-white w-full">
              <Home className="mr-2 h-4 w-4 text-white" />
              トップページに戻る
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}


