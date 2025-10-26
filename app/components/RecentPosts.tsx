"use client";
import SearchResults from "./SearchResults";

export default function RecentPosts({ category }: { category: string }) {
  return (
    <div className="space-y-6 px-4 py-12">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">最近の投稿</h2>
      <SearchResults
        searchTerm=""
        category={category}
        subCategory=""
        countryFilter=""
      />
    </div>
  );
}
