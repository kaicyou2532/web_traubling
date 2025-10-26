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

  // 検索処理（文字列クエリ用）
  const handleSearch = (query: string, result?: SearchResult) => {
    // ここで検索APIを呼び出してMapPostsを取得
    // 今回は一時的に空の配列をセット
    setMapPosts([]);
  };

  // 検索結果選択時の処理
  const handleResultSelect = (lat: number, lng: number) => {
    setMapCenter({ lat, lng });
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
          onSearch={handleSearch}
          onLocationSelect={handleResultSelect}
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


