"use client";

import { useState, useRef, useEffect } from "react";
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
