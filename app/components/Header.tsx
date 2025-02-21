import Link from "next/link"
import {
  UserCircleIcon,
  MapIcon,
  MagnifyingGlassIcon,
  ShareIcon,
} from "@heroicons/react/24/solid"
import { AuthModal } from "../components/login"
import { auth, signOut } from "@/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

export default async function Header() {

  const session = await auth()

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
                href="/cities/international"
                className="text-gray-700 hover:text-custom-green transition-colors font-medium flex items-center gap-2"
              >
                <MapIcon className="h-5 w-5" />
                <span>海外で気をつけること</span>
              </Link>
            </li>
            <li>
              <Link
                href="/cities/japan"
                className="text-gray-700 hover:text-custom-green transition-colors font-medium flex items-center gap-2"
              >
                <MapIcon className="h-5 w-5" />
                <span>国内で気をつけること</span>
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
            {!session && <AuthModal>
              <button className="text-gray-700 hover:text-custom-green transition-colors">
                <UserCircleIcon className="h-8 w-8" />
              </button>
            </AuthModal>}

            {session &&
              <Popover>
                <PopoverTrigger>
                  <Avatar className="border rounded-full">
                    <AvatarImage src={session.user?.image as string} alt="ユーザー" />
                    <AvatarFallback>{session.user?.name}</AvatarFallback>
                  </Avatar>
                </PopoverTrigger>
                <PopoverContent className="bg-white w-[200px]" align="end">
                  <form action={async () => {
                    "use server"
                    await signOut()
                  }}>
                    <button
                      type="submit"
                    >
                      ログアウト
                    </button>
                  </form>
                </PopoverContent>
              </Popover>
            }
          </ul>
        </nav>
      </div>
    </header>
  )
}

