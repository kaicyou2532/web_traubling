"use client";

import { useState, useEffect } from "react";
import {
  MapPinIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
} from "@heroicons/react/24/solid";
import { HeartIcon as HeartOutlineIcon } from "@heroicons/react/24/outline";
import { CommentModal } from "./CommentModal";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import "leaflet/dist/leaflet.css";

// Leafletを動的にインポート（SSRエラー回避）
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

interface Post {
  id: number;
  title: string;
  content: string;
  latitude?: number; // 座標データを追加
  longitude?: number; // 座標データを追加
  country: { id: number; jaName: string; enName: string } | null;
  city: { id: number; jaName: string; enName: string } | null;
  comments: { id: number }[];
  user: { name: string };
  tags: string[];
  isJapan: boolean;
  likeCount: number;
  isLiked: boolean;
}

interface SearchResultsProps {
  searchTerm: string;
  category: string;
  subCategory?: string;
  countryFilter?: string;
}

const POSTS_PER_PAGE = 10;

export default function SearchResults({
  searchTerm,
  category,
  subCategory,
  countryFilter,
}: SearchResultsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredPostId, setHoveredPostId] = useState<number | null>(null);
  const router = useRouter();

  // 有効な座標を持つ投稿をフィルタリング（デバッグ用）
  const postsWithLocation = posts.filter((post) => {
    const lat = post.latitude;
    const lng = post.longitude;

    return (
      typeof lat === "number" &&
      isFinite(lat) &&
      lat >= -90 &&
      lat <= 90 &&
      typeof lng === "number" &&
      isFinite(lng) &&
      lng >= -180 &&
      lng <= 180
    );
  });

  useEffect(() => {
    async function fetchPosts() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          term: searchTerm,
          category,
          subCategory: subCategory || "",
          country: countryFilter || "",
          page: currentPage.toString(),
        });

        const res = await fetch(`/api/search?${params.toString()}`);
        const data = await res.json();

      // ★★★ データのクリーンアップと数値変換を強化 ★★★
      const processedPosts = (data.posts || []).map(
        (post: Post) => {
          let lat: number | undefined = post.latitude;
          let lng: number | undefined = post.longitude;

          // 1. 値が存在し、かつ数値でない（=文字列の）場合に parseFloat を試行
          if (typeof lat !== 'number' && lat) {
              // 文字列の "35.56..." を数値に変換
              lat = parseFloat(String(lat));
          }
          if (typeof lng !== 'number' && lng) {
              // 文字列の "139.39..." を数値に変換
              lng = parseFloat(String(lng));
          }

          // 2. 変換後に NaN (例: parseFloat("NULL")) や 無限大になった値を undefined に戻す
          if (typeof lat !== 'number' || !isFinite(lat)) {
              lat = undefined;
          }
          if (typeof lng !== 'number' || !isFinite(lng)) {
              lng = undefined;
          }

          return {
              ...post,
              latitude: lat,
              longitude: lng,
          };
        }
      );
      
        setPosts(processedPosts);
        setTotalCount(data.totalCount || 0);

        // ★★★ デバッグログを追加 ★★★
        console.log("--- 投稿データデバッグ ---");
        console.log("全投稿数:", data.posts.length);
        const debugLocationPosts = (data.posts || []).filter(
          (post: { latitude: number; longitude: number }) => {
            const lat = post.latitude;
            const lng = post.longitude;
            return (
              typeof lat === "number" &&
              isFinite(lat) &&
              lat >= -90 &&
              lat <= 90 &&
              typeof lng === "number" &&
              isFinite(lng) &&
              lng >= -180 &&
              lng <= 180
            );
          }
        );
        console.log(
          "フィルタリング後の位置情報付き投稿数:",
          debugLocationPosts.length
        );
        if (debugLocationPosts.length === 0) {
          console.error("有効な位置情報を持つ投稿がゼロです。");
        }
        // ★★★ デバッグログ終了 ★★★
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPosts();
  }, [searchTerm, category, subCategory, countryFilter, currentPage]);

  const handleLikeClick = async (e: React.MouseEvent, postId: number) => {
    e.stopPropagation();

    try {
      // 現在のいいね状態を取得
      const currentPost = posts.find(p => p.id === postId);
      if (!currentPost) return;

      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isLiked: currentPost.isLiked
        }),
      });

      if (res.ok) {
        const data = await res.json();

        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? { ...post, isLiked: data.liked, likeCount: data.likeCount }
              : post
          )
        );
      } else {
        console.error("Failed to toggle like");
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const stripHtmlTags = (html: string): string => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  // 地図をクリックした時の処理
  const handleMapClick = () => {
    // 現在の検索条件をクエリパラメータとして渡す
    const params = new URLSearchParams({
      q: searchTerm,
      ...(category && { category }),
      ...(subCategory && { subCategory }),
      ...(countryFilter && { country: countryFilter }),
    });

    router.push(`/map?${params.toString()}`);
  };

  // マーカーをクリックした時の処理
  const handleMarkerClick = (post: Post) => {
    const params = new URLSearchParams({
      postId: post.id.toString(),
      lat: post.latitude!.toString(),
      lng: post.longitude!.toString(),
    });

    router.push(`/map?${params.toString()}`);
  };

  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);

  const handlePostClick = (post: Post) => {
    setSelectedPost({
      id: post.id,
      title: post.title,
      author: post.user.name,
      content: post.content,
      date: "2025-04-16",
      category,
    });
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="h-[450px] flex items-center justify-center">
        読み込み中...
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="h-[450px] flex items-center justify-center">
        検索結果がありません。
      </div>
    );
  }

  return (
    <>
      <div className="w-full">
        {/* 検索結果リスト */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">検索結果: {totalCount}件</h2>
          {posts.map((post) => (
            <div
              key={post.id}
              onClick={() => handlePostClick(post)}
              onMouseEnter={() => setHoveredPostId(post.id)}
              onMouseLeave={() => setHoveredPostId(null)}
              className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer ${
                hoveredPostId === post.id ? "ring-2 ring-blue-300" : ""
              }`}
            >
              <div className="flex h-auto">
                {/* 左側：投稿コンテンツ */}
                <div className="flex-1 p-6 flex flex-col">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <MapPinIcon className="h-4 w-4" />
                    <span>{post.country?.jaName || "不明"}</span>
                    {post.city && <span>・{post.city.jaName}</span>}
                    {post.latitude && post.longitude && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkerClick(post);
                        }}
                        className="ml-auto text-blue-600 hover:text-blue-800 text-xs underline"
                      >
                        地図で確認する
                      </button>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">
                    {post.title}
                  </h3>
                  <div
                    className="text-gray-600 mb-4 line-clamp-3 flex-1"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                  <div className="mt-auto">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-gray-500">
                        <button
                          onClick={(e) => handleLikeClick(e, post.id)}
                          className="flex items-center hover:scale-110 transition-transform"
                        >
                          {post.isLiked ? (
                            <HeartIcon className="h-5 w-5 mr-1 text-red-500" />
                          ) : (
                            <HeartOutlineIcon className="h-5 w-5 mr-1 text-gray-400 hover:text-red-500" />
                          )}
                          <span className={post.isLiked ? "text-red-500" : ""}>
                            {post.likeCount || 0}
                          </span>
                        </button>
                        <div className="flex items-center">
                          <ChatBubbleLeftIcon className="h-5 w-5 mr-1" />
                          <span>{post.comments.length}</span>
                        </div>
                      </div>
                      <span className="text-sm text-[#007B63]">
                        {post.user.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 右側：地図 */}
                {post.latitude && post.longitude && (
                  <div className="w-80 border-l border-gray-200">
                    <div className="p-4 bg-gray-50 border-b">
                      <h4 className="text-sm font-semibold text-gray-800 flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        投稿位置
                      </h4>
                      <p className="text-xs text-gray-600">
                        {post.country?.jaName}{post.city && ` - ${post.city.jaName}`}
                      </p>
                    </div>
                    <div 
                      className="h-64 cursor-pointer hover:bg-gray-50 transition-colors relative"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkerClick(post);
                      }}
                    >
                      {typeof window !== "undefined" && (
                        <MapContainer
                          center={[post.latitude, post.longitude]}
                          zoom={12}
                          style={{ height: "100%", width: "100%" }}
                          scrollWheelZoom={false}
                          doubleClickZoom={false}
                          dragging={false}
                          zoomControl={false}
                          attributionControl={false}
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <Marker position={[post.latitude, post.longitude]}>
                            <Popup>
                              <div className="p-2 max-w-xs">
                                <h4 className="font-semibold text-sm mb-1">
                                  {post.title}
                                </h4>
                                <p className="text-xs text-gray-600">
                                  {post.country?.jaName}
                                  {post.city && ` - ${post.city.jaName}`}
                                </p>
                              </div>
                            </Popup>
                          </Marker>
                        </MapContainer>
                      )}
                      {/* 地図クリック促進オーバーレイ */}
                      <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-md px-3 py-1 text-xs text-gray-700 pointer-events-none shadow-md">
                        クリックで詳細地図へ
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded-full ${
                    currentPage === i + 1
                      ? "bg-custom-green text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <CommentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        issue={selectedPost}
      />
    </>
  );
}
