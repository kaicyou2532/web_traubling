"use client";

import { useState, useEffect } from "react";
import SearchResults from "./SearchResults";
import AllContent from "./AllContent";
import SearchBar from "./SearchBar";
import type { City } from "@prisma/client";

type Props = {
  japanCities: City[];
  otherCities: City[];
};

export default function Home({ japanCities, otherCities }: Props) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchCategory, setSearchCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [subCategory, setSubCategory] = useState<string>();
  const [countryFilter, setCountryFilter] = useState<string>();
  const [cityFilter, setCityFilter] = useState<string>();
  const [troubleFilter, setTroubleFilter] = useState<string>();

  const handleSearch = (
    term: string, 
    category: string, 
    subCategory?: string, 
    countryFilter?: string,
    cityFilter?: string,
    troubleFilter?: string
  ) => {
    // 「全て」カテゴリの場合は空のワードでも検索を実行
    // その他のカテゴリでは何かしらのフィルターまたはワードがある場合に検索実行
    if (category === "all" || term.trim() || subCategory || countryFilter || cityFilter || troubleFilter) {
      setIsSearching(true);
      setSearchTerm(term);
      setSearchCategory(category);
      setSubCategory(subCategory);
      setCountryFilter(countryFilter);
      setCityFilter(cityFilter);
      setTroubleFilter(troubleFilter);
    } else {
      setIsSearching(false);
      setSearchTerm("");
    }
  };

  const handleCategoryChange = (category: string) => {
    setSearchCategory(category);
  };

  const handleClearSearch = () => {
    setIsSearching(false);
    setSearchTerm("");
    setSearchCategory("all");
    setSubCategory(undefined);
    setCountryFilter(undefined);
    setCityFilter(undefined);
    setTroubleFilter(undefined);
  };

  // ヘッダーのロゴクリック用にグローバルに関数を公開
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).handleClearSearch = handleClearSearch;
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).handleClearSearch;
      }
    };
  }, []);

  const renderContent = () => {
    if (isSearching) {
      return (
        <SearchResults 
          searchTerm={searchTerm} 
          category={searchCategory}
          subCategory={subCategory}
          countryFilter={countryFilter}
          cityFilter={cityFilter}
          troubleFilter={troubleFilter}
        />
      );
    }

    return (
      <AllContent japanCities={japanCities} otherCities={otherCities} />
    );
  };

  return (
    <div>
      <div
        className={`relative bg-cover bg-center flex items-center justify-center transition-all duration-300 ${
          isSearching ? "h-[30vh]" : "h-[60vh]"
        }`}
        style={{
          backgroundImage:
            "url('https://cdn.pixabay.com/photo/2021/11/28/16/53/temple-6830795_1280.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-30" />
        <div className="relative z-10 text-center w-full">
          <h1
            className={`font-extrabold text-white mb-8 leading-tight transition-all duration-300 ${
              isSearching ? "text-3xl md:text-4xl" : "text-4xl md:text-6xl"
            }`}
          >
            旅のお悩みを共有
          </h1>
          <SearchBar
            isCompact={isSearching}
            onSearch={handleSearch}
            selectedCategory={searchCategory}
            onCategoryChange={handleCategoryChange}
            countryFilter={countryFilter}
            onCountryChange={setCountryFilter}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">{renderContent()}</div>
    </div>
  );
}
