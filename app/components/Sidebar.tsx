// app/components/Sidebar.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import {
  MagnifyingGlassIcon,
  MapIcon,
  PencilSquareIcon,
  GlobeAsiaAustraliaIcon,
  UserCircleIcon,
  MapPinIcon,
} from "@heroicons/react/24/solid";
import type { Session } from "next-auth";
import { UserCircle } from "lucide-react";

type SidebarProps = {
  session: Session | null;
  compact?: boolean;
  isHeaderVisible?: boolean; // isHeaderVisible propを受け取る
};

export default function Sidebar({
  session,
  compact = false,
  isHeaderVisible = true,
}: SidebarProps) {
  // ヘッダーが見えているかどうかに応じて、topとheightのクラスを動的に変更
  const topClass = isHeaderVisible ? "top-16" : "top-0";
  const heightClass = isHeaderVisible ? "h-[calc(100vh-4rem)]" : "h-screen";

  return (
    <aside
      className={`bg-white border-r z-20 flex-shrink-0
        sticky transition-all duration-300
        ${topClass} ${heightClass}
        ${compact ? "w-16" : "w-60"}`}
    >
      <nav
        className={`flex flex-col gap-4 p-4 ${
          compact ? "items-center" : "items-start"
        }`}
      >
        <Link
          href="/"
          className="text-gray-700 hover:text-custom-green transition-colors font-medium flex items-center gap-2"
        >
          <MagnifyingGlassIcon className="h-7 w-7" />
          {!compact && <span>探す</span>}
        </Link>
        <Link
          href="/cities/international"
          className="text-gray-700 hover:text-custom-green transition-colors font-medium flex items-center gap-2"
        >
          <GlobeAsiaAustraliaIcon className="h-7 w-7" />
          {!compact && <span>海外で気をつけること</span>}
        </Link>
        <Link
          href="/cities/japan"
          className="text-gray-700 hover:text-custom-green transition-colors font-medium flex items-center gap-2"
        >
          <MapIcon className="h-7 w-7" />
          {!compact && <span>国内で気をつけること</span>}
        </Link>
        <Link
          href="/map"
          className="text-gray-700 hover:text-custom-green transition-colors font-medium flex items-center gap-2"
        >
          <MapPinIcon className="h-6 w-6" />
          <span className="hidden xl:inline ml-1.5">地図から探す</span>
        </Link>
        {session && (
          <Link
            href="/post"
            className="text-gray-700 hover:text-custom-green transition-colors font-medium flex items-center gap-2"
          >
            <PencilSquareIcon className="h-7 w-7" />
            {!compact && <span>トラブルを共有する</span>}
          </Link>
        )}
        {session && (
          <Link
            href="/mypage"
            className="text-gray-700 hover:text-custom-green transition-colors font-medium flex items-center gap-2"
          >
            <UserCircleIcon className="h-7 w-7" />
            {!compact && <span>マイページ</span>}
          </Link>
        )}
      </nav>
    </aside>
  );
}
