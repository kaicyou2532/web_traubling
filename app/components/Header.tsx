// app/components/Header.tsx
"use client";
import { useState, useEffect } from "react"; // スクロール検知のためにインポート
import Link from "next/link";
import Image from "next/image";
import {
  Bars3Icon,
  GlobeAsiaAustraliaIcon,
  MagnifyingGlassIcon,
  MapIcon,
  PencilSquareIcon,
  UserCircleIcon,
  MapPinIcon,
  BellIcon,
} from "@heroicons/react/24/solid";
import { AuthModal } from "@/app/components/login";
import { signOutAction } from "@/app/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Session } from "next-auth";

type HeaderProps = {
  session: Session | null;
  isHomePage?: boolean;
  toggleSidebar?: () => void;
  isVisible?: boolean; // isVisible propを受け取る
};

export default function Header({
  session,
  isHomePage,
  toggleSidebar,
  isVisible = true, // デフォルト値をtrueに設定
}: HeaderProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  // 未読通知数を取得
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/notifications', {
            method: 'POST',
          });
          if (response.ok) {
            const data = await response.json();
            setUnreadCount(data.count);
          }
        } catch (error) {
          console.error("未読通知数取得エラー:", error);
        }
      }
    };

    fetchUnreadCount();
    
    // 30秒ごとに未読通知数を更新
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [session]);
  return (
    <header
      className={`bg-white shadow-md sticky top-0 z-50 h-16 flex items-center
  transition-transform duration-300 ease-in-out
  ${isVisible ? "translate-y-0" : "-translate-y-full"}`}
    >
      <div
        className={`w-full flex justify-between items-center transition-all duration-300
    ${
      isHomePage
        ? "px-4 sm:px-4 lg:px-4" // ランディングページ（SideMapあり）は少し広め
        : "px-6 sm:px-8 lg:px-12" // その他ページは余白多め
    }`}
      >
        {/* 左側：ロゴやナビ */}
        <div className="flex items-center gap-2 sm:gap-4">
          {isHomePage && (
            <button
              type="button"
              onClick={toggleSidebar}
              className="text-gray-700 hover:text-custom-green"
              aria-label="サイドバーを開閉"
            >
              <Bars3Icon className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          )}

          {isHomePage ? (
            <button
              onClick={() => {
                // ホームページの場合、検索状態をクリアする関数を呼び出す
                if (typeof window !== 'undefined' && (window as any).handleClearSearch) {
                  (window as any).handleClearSearch();
                }
              }}
              className={`flex items-center flex-shrink-0 hover:opacity-80 transition-opacity`}
            >
              <Image
                src="/traubling_logo.png"
                alt="Traubling ロゴ"
                height={32}
                width={120}
                priority
                className="h-8 w-auto sm:h-10 mr-2 sm:mr-6"
              />
            </button>
          ) : (
            <Link
              href="/"
              className={`flex items-center flex-shrink-0 -ml-1 sm:-ml-2`}
            >
              <Image
                src="/traubling_logo.png"
                alt="Traubling ロゴ"
                height={32}
                width={120}
                priority
                className="h-8 w-auto sm:h-10 mr-2 sm:mr-6"
              />
            </Link>
          )}

          {!isHomePage && (
            <nav className="flex items-center gap-3 sm:gap-4 lg:gap-6">
              <Link
                href="/"
                className="text-gray-700 hover:text-custom-green transition-colors font-medium flex items-center gap-1 sm:gap-2"
              >
                <MagnifyingGlassIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="hidden lg:inline ml-1">探す</span>
              </Link>
              <Link
                href="/cities/international"
                className="text-gray-700 hover:text-custom-green transition-colors font-medium flex items-center gap-1 sm:gap-2"
              >
                <GlobeAsiaAustraliaIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="hidden lg:inline ml-1">
                  海外で気をつけること
                </span>
              </Link>
              <Link
                href="/cities/japan"
                className="text-gray-700 hover:text-custom-green transition-colors font-medium flex items-center gap-1 sm:gap-2"
              >
                <MapIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="hidden lg:inline ml-1">
                  国内で気をつけること
                </span>
              </Link>
              <Link
                href="/map"
                className="text-gray-700 hover:text-custom-green transition-colors font-medium flex items-center gap-1 sm:gap-2"
              >
                <MapPinIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="hidden lg:inline ml-1">地図から探す</span>
              </Link>
              {session && (
                <>
                  <Link
                    href="/post"
                    className="text-gray-700 hover:text-custom-green transition-colors font-medium flex items-center gap-1 sm:gap-2"
                  >
                    <PencilSquareIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="hidden lg:inline ml-1">
                      トラブルを共有する
                    </span>
                  </Link>
                  <Link
                    href="/mypage"
                    className="text-gray-700 hover:text-custom-green transition-colors font-medium flex items-center gap-1 sm:gap-2"
                  >
                    <UserCircleIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="hidden lg:inline ml-1">マイページ</span>
                  </Link>
                </>
              )}
            </nav>
          )}
        </div>

        {/* 右側：ログイン関連 */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 pr-1 sm:pr-2 lg:pr-4">
          {!session && (
            <AuthModal>
              <button
                type="button"
                className="text-gray-700 hover:text-custom-green"
              >
                <UserCircleIcon className="h-7 w-7 sm:h-8 sm:w-8" />
              </button>
            </AuthModal>
          )}
          {session && (
            <Popover>
                <PopoverTrigger asChild>
                  <button type="button" aria-label="ユーザーメニュー">
                    <Avatar className="border rounded-full w-8 h-8 sm:w-9 sm:h-9 aspect-square">
                      <AvatarImage
                        src={session.user?.image as string}
                        alt="ユーザー"
                        className="object-cover"
                      />
                      <AvatarFallback>
                        {session.user?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </PopoverTrigger>
              <PopoverContent className="bg-white w-[180px] sm:w-[200px]" align="end">
                <div className="py-1">
                  <Link
                    href="/mypage"
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded transition-colors"
                  >
                    <UserCircleIcon className="h-4 w-4" />
                    マイページ
                  </Link>
                  <Link
                    href="/mypage?tab=notifications"
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded transition-colors relative"
                  >
                    <BellIcon className="h-4 w-4" />
                    通知
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold ml-auto">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/post"
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded transition-colors"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                    投稿する
                  </Link>
                  <hr className="my-1 border-gray-200" />
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded transition-colors text-red-600 hover:text-red-700"
                    >
                      ログアウト
                    </button>
                  </form>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </header>
  );
}
