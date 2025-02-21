import Link from "next/link"
import {
  UserCircleIcon,
  MapIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  GlobeAsiaAustraliaIcon
} from "@heroicons/react/24/solid"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Bars3Icon } from "@heroicons/react/24/solid"
import { AuthModal } from "../components/login"
import { auth, signOut } from "@/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export default async function Header() {

  const session = await auth()

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-extrabold text-custom-green">
          traubling
        </Link>

        <div className="flex justify-center items-center gap-3">
          {!session && <AuthModal>
            <button className="text-gray-700 hover:text-custom-green transition-colors">
              <UserCircleIcon className="h-8 w-8" />
            </button>
          </AuthModal>}

          {session &&
            <Popover>
              <PopoverTrigger>
                <Avatar className="border rounded-full w-8 h-8">
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
            </Popover>}

          <Sheet>
            <SheetTrigger asChild>
              <Bars3Icon className="h-8 w-8 text-gray-700" />
            </SheetTrigger>
            <SheetContent className="bg-white">
              <nav>
                <ul className="flex flex-col gap-4 items-start">
                  <li>
                    <SheetClose asChild>
                      <Link
                        href="/"
                        className="text-gray-700 hover:text-custom-green transition-colors font-medium flex items-center gap-2"
                      >
                        <MagnifyingGlassIcon className="h-7 w-7" />
                        <span>探す</span>
                      </Link>
                    </SheetClose>
                  </li>
                  <li>
                    <SheetClose asChild>
                      <Link
                        href="/cities/international"
                        className="text-gray-700 hover:text-custom-green transition-colors font-medium flex items-center gap-2"
                      >
                        <GlobeAsiaAustraliaIcon className="h-7 w-7" />
                        <span>海外で気をつけること</span>
                      </Link>
                    </SheetClose>
                  </li>
                  <li>
                    <SheetClose asChild>
                      <Link
                        href="/cities/japan"
                        className="text-gray-700 hover:text-custom-green transition-colors font-medium flex items-center gap-2"
                      >
                        <MapIcon className="h-7 w-7" />
                        <span>国内で気をつけること</span>
                      </Link>
                    </SheetClose>
                  </li>
                  <li>
                    <SheetClose asChild>
                      <Link
                        href="/post"
                        className="text-gray-700 hover:text-custom-green transition-colors font-medium flex items-center gap-2"
                      >
                        <PencilSquareIcon className="h-7 w-7" />
                        <span>トラブルを共有する</span>
                      </Link>
                    </SheetClose>
                  </li>
                </ul>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

