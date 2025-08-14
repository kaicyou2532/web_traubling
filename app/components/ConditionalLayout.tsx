// app/components/ConditionalLayout.tsx
"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect, type ReactNode } from "react";
import type { Session } from "next-auth";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function ConditionalLayout({
  session,
  children,
}: {
  session: Session | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // ヘッダーが表示されているかを管理する状態
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  useEffect(() => {
    // ランディングページでなければ、ヘッダーは常に表示
    if (!isHomePage) {
      setIsHeaderVisible(true);
      return;
    }

    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      // 下にスクロールしたら非表示、上にスクロールしたら表示
      if (window.scrollY > lastScrollY && window.scrollY > 50) {
        setIsHeaderVisible(false);
      } else if (window.scrollY < lastScrollY) {
        setIsHeaderVisible(true);
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isHomePage]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 1. ヘッダー: isHeaderVisibleの状態をpropで渡す */}
      <Header
        session={session}
        isHomePage={isHomePage}
        toggleSidebar={toggleSidebar}
        isVisible={isHeaderVisible}
      />

      {/* 2. ヘッダーより下の領域 */}
      <div className="flex flex-grow w-full">
        {/* ランディングページの場合のみサイドバーを表示 */}
        {isHomePage && (
          <Sidebar
            session={session}
            compact={isSidebarCollapsed}
            isHeaderVisible={isHeaderVisible} // isHeaderVisibleの状態をpropで渡す
          />
        )}

        {/* メインコンテンツ */}
        <main className="flex-grow w-full overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
