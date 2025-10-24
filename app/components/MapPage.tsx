"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
};

// 🔹 地図の中心を動的に変更する
function ChangeView({
  coords,
  zoom,
}: {
  coords: [number, number];
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, zoom, { animate: true });
  }, [coords, zoom, map]);
  return null;
}

export default function MapPage() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [center, setCenter] = useState<[number, number]>([35.6812, 139.7671]);
  const [zoom, setZoom] = useState(4);

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch("/api/map");
      const data = await res.json();
      setPosts(data);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  // 🔍 投稿内検索 → マップ移動
  const handleSearch = () => {
    if (!search) return;

    const matched = posts.filter(
      (post) => post.title.includes(search) || post.content.includes(search)
    );

    if (matched.length === 0) {
      alert("該当する投稿が見つかりませんでした。");
      return;
    }

    // 複数マッチ → 平均座標を求める
    const avgLat =
      matched.reduce((sum, p) => sum + p.latitude, 0) / matched.length;
    const avgLng =
      matched.reduce((sum, p) => sum + p.longitude, 0) / matched.length;

    setCenter([avgLat, avgLng]);

    // 🔹 マッチ数が1なら近くへ、複数なら少し広めに表示
    setZoom(matched.length === 1 ? 13 : 10);
  };

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full">
      {/* 🔍 検索バー */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-xl shadow-md p-2 flex gap-2 w-[90%] max-w-md">
        <Input
          placeholder="投稿タイトル・内容で検索"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={handleSearch}>検索</Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-full">
          <Skeleton className="w-40 h-10" />
        </div>
      ) : (
        <MapContainer
          center={{ lat: center[0], lng: center[1] }}
          zoom={zoom}
          minZoom={3}
          maxBounds={[
            [-90, -180],
            [90, 180],
          ]}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {/* 中心移動 */}
          <ChangeView coords={center} zoom={zoom} />

          {/* 投稿ピン */}
          {posts.map((post) => (
            <Marker key={post.id} position={[post.latitude, post.longitude]}>
              <Popup>
                <Card className="max-w-xs">
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-base mb-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {post.content.replace(/<[^>]+>/g, "")}
                    </p>
                  </CardContent>
                </Card>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
}

// "use client";

// import { useEffect, useState } from "react";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";
// import { Card, CardContent } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";

// // Leafletアイコン設定（必須）
// delete (L.Icon.Default.prototype as any)._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl:
//     "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
//   iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
//   shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
// });

// type PostData = {
//   id: number;
//   title: string;
//   content: string;
//   latitude: number;
//   longitude: number;
// };

// export default function MapPage() {
//   const [posts, setPosts] = useState<PostData[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchPosts = async () => {
//       const res = await fetch("/api/map");
//       const data = await res.json();
//       setPosts(data);
//       setLoading(false);
//     };
//     fetchPosts();
//   }, []);

//   return (
//     <div className="h-[calc(100vh-4rem)] w-full">
//       {loading ? (
//         <div className="flex justify-center items-center h-full">
//           <Skeleton className="w-40 h-10" />
//         </div>
//       ) : (
//         <MapContainer
//           center={{ lat: 35.6812, lng: 139.7671 }}
//           zoom={4}
//           minZoom={3}
//           maxBounds={[
//             [-90, -180],
//             [90, 180],
//           ]}
//           worldCopyJump={false}
//           maxBoundsViscosity={1.0}
//           style={{ height: "100%", width: "100%" }}
//         >
//           <TileLayer
//             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//             attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
//           />

//           {posts.map((post) => (
//             <Marker key={post.id} position={[post.latitude, post.longitude]}>
//               <Popup>
//                 <Card className="max-w-xs">
//                   <CardContent className="p-3">
//                     <h3 className="font-semibold text-base mb-2">
//                       {post.title}
//                     </h3>
//                     <p className="text-sm text-gray-600 line-clamp-3">
//                       {post.content.replace(/<[^>]+>/g, "")}
//                     </p>
//                   </CardContent>
//                 </Card>
//               </Popup>
//             </Marker>
//           ))}
//         </MapContainer>
//       )}
//     </div>
//   );
// }
