"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Clock, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// 🔽 `MapPage`からインポートできるように型をexportします
export type SearchResult = {
  id: string;
  name: string;
  address?: string;
  type: "recent" | "suggestion";
  lat?: number;
  lng?: number;
};

type MapSearchProps = {
  onSearch: (query: string, result?: SearchResult) => void;
  onLocationSelect?: (lat: number, lng: number) => void; // 緯度経度を受け取るコールバック
  placeholder?: string;
};

export function MapSearch({
  onSearch,
  onLocationSelect, // 🔽 propsで受け取る
  placeholder = "Google マップを検索する",
}: MapSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mock recent searches
  const recentSearches: SearchResult[] = [
    {
      id: "1",
      name: "Hiroshima Grand Intelligent Hotel",
      address: "1 Kyobashicho, Minami Ward, Hiroshima",
      type: "recent",
      lat: 34.3853,
      lng: 132.4553,
    },
    {
      id: "2",
      name: "日本",
      type: "recent",
      lat: 36.2048,
      lng: 138.2529,
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setIsOpen(true);

    // Mock search results
    if (value.trim()) {
      const mockResults: SearchResult[] = [
        // 検索APIのモック結果
        {
          id: "s1",
          name: `${value} (検索候補)`,
          address: "123 Example St, City",
          type: "suggestion",
          lat: 35.6895, // 仮の緯度
          lng: 139.6917, // 仮の経度
        },
      ];
      setResults(mockResults);
    } else {
      setResults(recentSearches);
    }
  };

  const handleSearch = (result?: SearchResult) => {
    if (result) {
      setQuery(result.name);
      onSearch(result.name, result); // 検索イベントを親に通知
      // 🔽 緯度経度があり、onLocationSelectが渡されていれば実行
      if (result.lat && result.lng && onLocationSelect) {
        onLocationSelect(result.lat, result.lng);
      }
    } else if (query.trim()) {
      // 検索結果をクリックせず、Enterキーで検索した場合
      onSearch(query);
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery("");
    setResults(recentSearches);
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    setIsOpen(true);
    if (!query.trim()) {
      setResults(recentSearches);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative flex items-center bg-white rounded-lg shadow-lg border border-border">
        <Button
          variant="ghost"
          size="icon"
          className="ml-2 h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => handleSearch()} // Enterキー押下時と同じ動作
        >
          <Search className="h-5 w-5" />
        </Button>

        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              // 🔽 検索候補のトップを選択するか、テキストで検索する
              handleSearch(results.length > 0 ? results[0] : undefined);
            }
          }}
          placeholder={placeholder}
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base h-12"
        />

        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={handleClear}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-border overflow-hidden z-50">
          <div className="max-h-96 overflow-y-auto">
            {results.map((result) => (
              <button
                key={result.id}
                onClick={() => handleSearch(result)} // 🔽 選択した結果で検索
                className="w-full px-4 py-3 flex items-start gap-3 hover:bg-muted transition-colors text-left"
              >
                <div className="mt-0.5">
                  {result.type === "recent" ? (
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground truncate">
                    {result.name}
                  </div>
                  {result.address && (
                    <div className="text-sm text-muted-foreground truncate">
                      {result.address}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface MapPost {
  id: number;
  title: string;
  content: string;
  latitude: number;
  longitude: number;
  country: { jaName: string; enName: string } | null;
  city: { jaName: string; enName: string } | null;
  trouble: { jaName: string; enName: string } | null;
  user: { name: string } | null;
  commentCount: number;
}

export default function MapView() {
  const [mapPosts, setMapPosts] = useState<MapPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<MapPost | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 35.6762, lng: 139.6503 });

  // 検索結果更新時の処理
  const handleSearchResults = (results: MapPost[]) => {
    setMapPosts(results);
  };

  // 検索結果選択時の処理
  const handleResultSelect = (result: MapPost) => {
    setSelectedPost(result);
    setMapCenter({ lat: result.latitude, lng: result.longitude });
  };

  // 地図の中心を移動する処理
  const handleLocationMove = (lat: number, lng: number) => {
    setMapCenter({ lat, lng });
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 検索バー */}
      <div className="absolute top-6 left-6 z-20">
        <MapSearch
          onSearch={handleSearchResults}
          onLocationSelect={handleResultSelect}
          onLocationMove={handleLocationMove}
        />
      </div>

      {/* 地図エリア */}
      <div className="w-full h-full rounded-lg overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">地図コンポーネント</p>
            <p className="text-sm text-gray-500 mt-1">
              中心座標: {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
            </p>
          </div>
        </div>
      </div>

      {/* 選択された投稿の詳細 */}
      {selectedPost && (
        <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6 z-20">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                {selectedPost.title}
              </h3>
              <p className="text-gray-600 mb-3 line-clamp-2">
                {selectedPost.content}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                    </svg>
                    {selectedPost.country?.jaName}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    {selectedPost.commentCount}
                  </span>
                </div>
                <span className="text-sm font-medium text-blue-600">
                  {selectedPost.user?.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const bounds = searchParams.get("bounds"); // 地図の表示範囲

    // 検索条件を構築
    const searchTerms = query.split(/\s+/).filter(Boolean);

    const whereCondition = {
      AND: [
        // テキスト検索
        ...searchTerms.map((term) => ({
          OR: [
            { title: { contains: term, mode: "insensitive" } },
            { content: { contains: term, mode: "insensitive" } },
            { country: { jaName: { contains: term, mode: "insensitive" } } },
            { country: { enName: { contains: term, mode: "insensitive" } } },
            { trouble: { jaName: { contains: term, mode: "insensitive" } } },
            { trouble: { enName: { contains: term, mode: "insensitive" } } },
            { city: { jaName: { contains: term, mode: "insensitive" } } },
            { city: { enName: { contains: term, mode: "insensitive" } } },
          ],
        })),
      ],
    };

    const posts = await prisma.post.findMany({
      where: whereCondition,
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        country: {
          select: {
            id: true,
            jaName: true,
            enName: true,
          },
        },
        city: {
          select: {
            id: true,
            jaName: true,
            enName: true,
          },
        },
        trouble: {
          select: {
            jaName: true,
            enName: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // 座標付きデータに変換（国名から推定）
    const postsWithCoordinates = posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content.substring(0, 100) + "...", // プレビュー用に短縮
      latitude: getCoordinatesByCountry(post.country?.jaName).lat,
      longitude: getCoordinatesByCountry(post.country?.jaName).lng,
      country: post.country,
      city: post.city,
      trouble: post.trouble,
      user: post.user,
      commentCount: post._count.comments,
      createdAt: post.createdAt,
    }));

    return NextResponse.json({
      posts: postsWithCoordinates,
      total: posts.length,
    });
  } catch (error) {
    console.error("地図検索エラー:", error);
    return NextResponse.json(
      { error: "検索に失敗しました" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 国名から座標を取得する関数
function getCoordinatesByCountry(
  countryName: string | null | undefined
) {
  const coordinates: { [key: string]: { lat: number; lng: number } } = {
    日本: { lat: 35.6762, lng: 139.6503 },
    アメリカ: { lat: 39.8283, lng: -98.5795 },
    イギリス: { lat: 51.5074, lng: -0.1278 },
    フランス: { lat: 48.8566, lng: 2.3522 },
    ドイツ: { lat: 52.52, lng: 13.405 },
    オーストラリア: { lat: -33.8688, lng: 151.2093 },
    カナダ: { lat: 45.4215, lng: -75.6972 },
    韓国: { lat: 37.5665, lng: 126.978 },
    中国: { lat: 39.9042, lng: 116.4074 },
    タイ: { lat: 13.7563, lng: 100.5018 },
    インド: { lat: 20.5937, lng: 78.9629 },
    ブラジル: { lat: -14.235, lng: -51.9253 },
    メキシコ: { lat: 23.6345, lng: -102.5528 },
    スペイン: { lat: 40.4637, lng: -3.7492 },
    イタリア: { lat: 41.8719, lng: 12.5674 },
  };

  return coordinates[countryName || ""] || { lat: 35.6762, lng: 139.6503 }; // デフォルトは東京
}
