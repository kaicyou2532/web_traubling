import Link from "next/link"
import {
  UserCircleIcon,
  MapIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  ShareIcon,
} from "@heroicons/react/24/solid"

export default function Header() {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-extrabold text-custom-green">
          traubling
        </Link>
        <nav>
          <ul className="flex flex-wrap gap-4 items-center">
            <li>
              <Link
                href="/"
                className="text-gray-700 hover:text-custom-green transition-colors font-medium flex items-center gap-2"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
                <span>探す</span>
              </Link>
            </li>
            <li>
              <Link
                href="/regions"
                className="text-gray-700 hover:text-custom-green transition-colors font-medium flex items-center gap-2"
              >
                <MapIcon className="h-5 w-5" />
                <span>国別気を付けること</span>
              </Link>
            </li>
            <li>
              <Link
                href="/consult"
                className="text-gray-700 hover:text-custom-green transition-colors font-medium flex items-center gap-2"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                <span>相談する</span>
              </Link>
            </li>
            <li>
              <Link
                href="/post"
                className="text-gray-700 hover:text-custom-green transition-colors font-medium flex items-center gap-2"
              >
                <ShareIcon className="h-5 w-5" />
                <span>トラブルを共有する</span>
              </Link>
            </li>
            <li>
              <button className="text-gray-700 hover:text-custom-green transition-colors">
                <UserCircleIcon className="h-8 w-8" />
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

