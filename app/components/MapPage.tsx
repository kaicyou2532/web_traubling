"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  Search,
  X,
  MapPin,
  MessageCircle,
  User,
  Globe,
  AlertTriangle,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Leafletアイコン設定
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

type PostData = {
  id: number;
  title: string;
  content: string;
  latitude: number;
  longitude: number;
  country: { jaName: string; enName: string } | null;
  city: {
    id: number;
    jaName: string;
    enName: string;
    photoUrl?: string;
  } | null;
  trouble: { jaName: string; enName: string } | null;
  user: { name: string } | null;
  commentCount: number;
  createdAt: string;
};

type SearchResult = {
  id: string;
  name: string;
  address?: string;
  type: "recent" | "suggestion" | "post";
  lat?: number;
  lng?: number;
  post?: PostData;
};

// 地図の中心を動的に変更するコンポーネント
function ChangeView({
  coords,
  zoom,
}: {
  coords: [number, number];
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, zoom, { animate: true, duration: 1 });
  }, [coords, zoom, map]);
  return null;
}

// 投稿詳細ダイアログ
function PostDetailDialog({
  post,
  trigger,
}: {
  post: PostData;
  trigger: React.ReactNode;
}) {
  const router = useRouter();

  const handleCityClick = () => {
    if (post.city) {
      router.push(`/cities/${post.city.id}`);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{post.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* ヘッダー画像 */}
          {post.city?.photoUrl && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden">
              <Image
                src={post.city.photoUrl}
                alt={post.city.jaName}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* バッジ */}
          <div className="flex flex-wrap gap-2">
            {post.trouble && (
              <Badge variant="destructive">{post.trouble.jaName}</Badge>
            )}
            {post.country && (
              <Badge variant="outline">
                <Globe className="h-3 w-3 mr-1" />
                {post.country.jaName}
              </Badge>
            )}
            {post.city && (
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-blue-50"
                onClick={handleCityClick}
              >
                <MapPin className="h-3 w-3 mr-1" />
                {post.city.jaName}
                <ExternalLink className="h-3 w-3 ml-1" />
              </Badge>
            )}
          </div>

          {/* 内容 */}
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">{post.content}</p>
          </div>

          {/* メタ情報 */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                {post.commentCount} コメント
              </span>
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {post.user?.name || "匿名"}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(post.createdAt).toLocaleDateString("ja-JP")}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// 検索コンポーネント
function MapSearchComponent({
  posts,
  onLocationSelect,
  onPostSelect,
}: {
  posts: PostData[];
  onLocationSelect: (lat: number, lng: number) => void;
  onPostSelect: (post: PostData) => void;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 最近の検索履歴（モック）
  const recentSearches: SearchResult[] = [
    {
      id: "1",
      name: "東京",
      type: "recent",
      lat: 35.6762,
      lng: 139.6503,
    },
    {
      id: "2",
      name: "大阪",
      type: "recent",
      lat: 34.6937,
      lng: 135.5023,
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

    if (value.trim()) {
      // 投稿を検索
      const matchedPosts = posts
        .filter(
          (post) =>
            post.title.toLowerCase().includes(value.toLowerCase()) ||
            post.content.toLowerCase().includes(value.toLowerCase()) ||
            post.country?.jaName.toLowerCase().includes(value.toLowerCase()) ||
            post.city?.jaName.toLowerCase().includes(value.toLowerCase()) ||
            post.trouble?.jaName.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 5)
        .map((post) => ({
          id: `post-${post.id}`,
          name: post.title,
          address: `${post.country?.jaName || ""} ${
            post.city?.jaName || ""
          }`.trim(),
          type: "post" as const,
          lat: post.latitude,
          lng: post.longitude,
          post,
        }));

      // 地名候補（モック）
      const locationSuggestions: SearchResult[] = [
        {
          id: "loc-1",
          name: `${value} - 日本`,
          type: "suggestion",
          lat: 35.6762,
          lng: 139.6503,
        },
      ];

      setResults([...matchedPosts, ...locationSuggestions]);
    } else {
      setResults(recentSearches);
    }
  };

  const handleResultSelect = (result: SearchResult) => {
    setQuery(result.name);
    setIsOpen(false);

    if (result.lat && result.lng) {
      onLocationSelect(result.lat, result.lng);
    }

    if (result.post) {
      onPostSelect(result.post);
    }

    inputRef.current?.blur();
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
    <div ref={containerRef} className="relative w-full max-w-lg">
      <div className="relative flex items-center bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50">
        <div className="pl-5">
          <Search className="h-6 w-6 text-gray-400" />
        </div>

        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleFocus}
          placeholder="場所や投稿を検索..."
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg h-14 bg-transparent px-4"
        />

        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="mr-3 h-10 w-10 text-gray-400 hover:text-gray-600"
            onClick={handleClear}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden z-50">
          <div className="max-h-96 overflow-y-auto">
            {results.map((result) => (
              <button
                key={result.id}
                onClick={() => handleResultSelect(result)}
                className="w-full px-5 py-4 flex items-start gap-4 hover:bg-gray-50/80 transition-colors text-left"
              >
                <div className="mt-1">
                  {result.type === "post" ? (
                    <MessageCircle className="h-5 w-5 text-blue-500" />
                  ) : (
                    <MapPin className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate text-base">
                    {result.name}
                  </div>
                  {result.address && (
                    <div className="text-sm text-gray-500 truncate">
                      {result.address}
                    </div>
                  )}
                  {result.type === "post" && result.post && (
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {result.post.trouble?.jaName}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {result.post.commentCount} コメント
                      </span>
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

export default function MapPage() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<PostData | null>(null);
  const [center, setCenter] = useState<[number, number]>([35.6762, 139.6503]);
  const [zoom, setZoom] = useState(5);
  const router = useRouter();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/map");
        const data = await res.json();
        setPosts(data.posts || []);
      } catch (error) {
        console.error("投稿の取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleLocationSelect = (lat: number, lng: number) => {
    setCenter([lat, lng]);
    setZoom(12);
  };

  const handlePostSelect = (post: PostData) => {
    setSelectedPost(post);
    setCenter([post.latitude, post.longitude]);
    setZoom(14);
  };

  const handleMarkerClick = (post: PostData) => {
    setSelectedPost(post);
  };

  const handleCityClick = (cityId: number) => {
    router.push(`/cities/${cityId}`);
  };

  return (
    <div className="relative h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
      {/* フィルターボタン - 左上 */}
      <div className="absolute top-4 left-4 z-[1000] flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-white/95 backdrop-blur-sm border-gray-200/50"
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          トラブル種別
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-white/95 backdrop-blur-sm border-gray-200/50"
        >
          <Globe className="h-4 w-4 mr-2" />
          国・地域
        </Button>
      </div>

      {/* 検索バー - 右上（大きくしました） */}
      <div className="absolute top-4 right-4 z-[1000]">
        <MapSearchComponent
          posts={posts}
          onLocationSelect={handleLocationSelect}
          onPostSelect={handlePostSelect}
        />
      </div>

      {/* 地図 */}
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
            <Skeleton className="w-40 h-6" />
          </div>
        </div>
      ) : (
        <MapContainer
          center={center}
          zoom={zoom}
          minZoom={3}
          maxBounds={[
            [-85.0511, -180],
            [85.0511, 180],
          ]}
          worldCopyJump={false}
          maxBoundsViscosity={1.0}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            noWrap={true}
          />

          <ChangeView coords={center} zoom={zoom} />

          {posts.map((post) => (
            <Marker
              key={post.id}
              position={[post.latitude, post.longitude]}
              eventHandlers={{
                click: () => handleMarkerClick(post),
              }}
            >
              <Popup>
                <Card className="w-80 border-0 shadow-none">
                  {/* ヘッダー画像 */}
                  {post.city?.photoUrl && (
                    <CardHeader className="p-0">
                      <div className="relative w-full h-32 rounded-t-lg overflow-hidden">
                        <Image
                          src={post.city.photoUrl}
                          alt={post.city.jaName}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            // 画像が読み込めない場合の処理
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                          }}
                        />
                      </div>
                    </CardHeader>
                  )}

                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {post.content.replace(/<[^>]+>/g, "")}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {post.trouble && (
                          <Badge variant="destructive" className="text-xs">
                            {post.trouble.jaName}
                          </Badge>
                        )}
                        {post.country && (
                          <Badge variant="outline" className="text-xs">
                            <Globe className="h-3 w-3 mr-1" />
                            {post.country.jaName}
                          </Badge>
                        )}
                        {post.city && (
                          <Badge
                            variant="outline"
                            className="text-xs cursor-pointer hover:bg-blue-50"
                            onClick={() => handleCityClick(post.city!.id)}
                          >
                            <MapPin className="h-3 w-3 mr-1" />
                            {post.city.jaName}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            {post.commentCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {post.user?.name || "匿名"}
                          </span>
                        </div>
                        <PostDetailDialog
                          post={post}
                          trigger={
                            <Button size="sm" variant="outline">
                              詳細を見る
                            </Button>
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}

      {/* 選択された投稿の詳細パネル - レスポンシブ（ヘッダー画像付き） */}
      {selectedPost && (
        <div className="absolute bottom-4 left-4 right-4 md:left-4 md:right-auto md:w-96 z-[1000] max-h-[50vh] md:max-h-[60vh]">
          <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50 shadow-xl">
            {/* ヘッダー画像 */}
            {selectedPost.city?.photoUrl && (
              <CardHeader className="p-0">
                <div className="relative w-full h-24 md:h-32 rounded-t-lg overflow-hidden">
                  <Image
                    src={selectedPost.city.photoUrl}
                    alt={selectedPost.city.jaName}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      // 画像が読み込めない場合の処理
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                </div>
              </CardHeader>
            )}

            <CardContent className="p-4 md:p-6 overflow-y-auto max-h-[45vh] md:max-h-[55vh]">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-2 truncate">
                    {selectedPost.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedPost.trouble && (
                      <Badge variant="destructive" className="text-xs">
                        {selectedPost.trouble.jaName}
                      </Badge>
                    )}
                    {selectedPost.country && (
                      <Badge variant="outline" className="text-xs">
                        <Globe className="h-3 w-3 mr-1" />
                        {selectedPost.country.jaName}
                      </Badge>
                    )}
                    {selectedPost.city && (
                      <Badge
                        variant="outline"
                        className="text-xs cursor-pointer hover:bg-blue-50"
                        onClick={() => handleCityClick(selectedPost.city!.id)}
                      >
                        <MapPin className="h-3 w-3 mr-1" />
                        {selectedPost.city.jaName}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={() => setSelectedPost(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
                {selectedPost.content.replace(/<[^>]+>/g, "")}
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-gray-100 gap-3">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    {selectedPost.commentCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {selectedPost.user?.name || "匿名"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    共有
                  </Button>
                  <PostDetailDialog
                    post={selectedPost}
                    trigger={<Button size="sm">詳細を見る</Button>}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 投稿数表示 - レスポンシブ */}
      <div className="absolute bottom-4 right-4 z-[1000]">
        <Card className="bg-white/95 backdrop-blur-sm border-gray-200/50">
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-gray-900">
                {posts.length}
              </div>
              <div className="text-xs md:text-sm text-gray-500">件の投稿</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
