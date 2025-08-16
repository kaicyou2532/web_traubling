"use client";

import { useState } from "react";
import SearchResults from "./SearchResults";
import AllContent from "./AllContent";
import DomesticContent from "./DomesticContent";
import OverseasContent from "./OverseasContent";
import CategoryContent from "./CategoryContent";
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

  const handleSearch = (term: string, category: string) => {
    setIsSearching(true);
    setSearchTerm(term);
    setSearchCategory(category);
  };

  const handleCategoryChange = (category: string) => {
    setSearchCategory(category);
    setIsSearching(false);
    setSearchTerm("");
  };

  const renderContent = () => {
    if (isSearching) {
      return (
        <SearchResults searchTerm={searchTerm} category={searchCategory} />
      );
    }

    switch (searchCategory) {
      case "all":
        return (
          <AllContent japanCities={japanCities} otherCities={otherCities} />
        );
      case "domestic":
        return (
          <DomesticContent
            japanCities={japanCities}
            otherCities={otherCities}
          />
        );
      case "overseas":
        return (
          <OverseasContent
            japanCities={japanCities}
            otherCities={otherCities}
          />
        );
      case "category":
        return <></>;
      default:
        return (
          <AllContent japanCities={japanCities} otherCities={otherCities} />
        );
    }
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
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">{renderContent()}</div>
    </div>
  );
}
