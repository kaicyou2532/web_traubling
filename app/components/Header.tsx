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
  return (
    <header
      className={`bg-white shadow-md sticky top-0 z-50 h-16 flex items-center
        transition-transform duration-300 ease-in-out
        ${isVisible ? "translate-y-0" : "-translate-y-full"}`} // isVisibleに応じてクラスを適用
    >
      <div className="container mx-auto px-4 w-full flex justify-between items-center">
        <div className="flex items-center gap-4">
          {isHomePage && (
            <button
              type="button"
              onClick={toggleSidebar}
              className="text-gray-700 hover:text-custom-green"
              aria-label="サイドバーを開閉"
            >
              <Bars3Icon className="w-8 h-8" />
            </button>
          )}

          <Link href="/" className="flex items-center flex-shrink-0">
            <Image
              src="/traubling_logo.png"
              alt="Traubling ロゴ"
              height={40}
              width={160}
              priority
            />
          </Link>

          {!isHomePage && (
            <nav className="flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-700 hover:text-custom-green transition-colors font-medium flex items-center gap-2"
              >
                <MagnifyingGlassIcon className="h-6 w-6" />
                <span className="hidden xl:inline ml-1.5">探す</span>
              </Link>
              <Link
                href="/cities/international"
                className="text-gray-700 hover:text-custom-green transition-colors font-medium flex items-center gap-2"
              >
                <GlobeAsiaAustraliaIcon className="h-6 w-6" />
                <span className="hidden xl:inline ml-1.5">
                  海外で気をつけること
                </span>
              </Link>
              <Link
                href="/cities/japan"
                className="text-gray-700 hover:text-custom-green transition-colors font-medium flex items-center gap-2"
              >
                <MapIcon className="h-6 w-6" />
                <span className="hidden xl:inline ml-1.5">
                  国内で気をつけること
                </span>
              </Link>
              <Link
                href="/map"
                className="text-gray-700 hover:text-custom-green transition-colors font-medium flex items-center gap-2"
              >
                <MapPinIcon className="h-6 w-6" />
                <span className="hidden xl:inline ml-1.5">
                  地図から探す
                </span>
              </Link>
              {session && (
                <Link
                  href="/post"
                  className="text-gray-700 hover:text-custom-green transition-colors font-medium flex items-center gap-2"
                >
                  <PencilSquareIcon className="h-6 w-6" />
                  <span className="hidden xl:inline ml-1.5">
                    トラブルを共有する
                  </span>
                </Link>
              )}
              {session && (
                <Link
                  href="/mypage"
                  className="text-gray-700 hover:text-custom-green transition-colors font-medium flex items-center gap-2"
                >
                  <UserCircleIcon className="h-6 w-6" />
                  <span className="hidden xl:inline ml-1.5">マイページ</span>
                </Link>
              )}
            </nav>
          )}
        </div>

        {/* 右側のユーザーエリア */}
        <div className="flex items-center justify-end gap-3">
          {!session && (
            <AuthModal>
              <button
                type="button"
                className="text-gray-700 hover:text-custom-green"
              >
                <UserCircleIcon className="h-8 w-8" />
              </button>
            </AuthModal>
          )}
          {session && (
            <Popover>
              <PopoverTrigger asChild>
                <button type="button" aria-label="ユーザーメニュー">
                  <Avatar className="border rounded-full w-9 h-9">
                    <AvatarImage
                      src={session.user?.image as string}
                      alt="ユーザー"
                    />
                    <AvatarFallback>
                      {session.user?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </PopoverTrigger>
              <PopoverContent className="bg-white w-[200px]" align="end">
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="w-full text-left p-2 hover:bg-gray-100 rounded"
                  >
                    ログアウト
                  </button>
                </form>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </header>
  );
}
