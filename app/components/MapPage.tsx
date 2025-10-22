"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Leafletアイコン設定（必須）
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

import { useMapEvents } from "react-leaflet";

const MapEventsHandler = () => {
  const map = useMapEvents({
    // 'move' イベントで、地図の移動中にリアルタイムで検知
    move: () => {
      const center = map.getCenter();
      let lat = center.lat;
      let needsUpdate = false;

      // 現在表示されている地図の南北の境界を取得
      const bounds = map.getBounds();
      const northBound = bounds.getNorth();
      const southBound = bounds.getSouth();
      // Webメルカトル図法の緯度の限界（約±85.05度）
      const maxLat = 85.05112878;

      // もし地図の上端が北の限界を超えた場合
      if (northBound > maxLat) {
        // はみ出した分だけ、地図の中心を南にずらす
        lat -= northBound - maxLat;
        needsUpdate = true;
      }
      // もし地図の下端が南の限界を超えた場合
      if (southBound < -maxLat) {
        // はみ出した分だけ、地図の中心を北にずらす
        lat -= southBound + maxLat;
        needsUpdate = true;
      }

      // 緯度の更新が必要な場合のみ、地図の中心を再設定
      if (needsUpdate) {
        // アニメーションなしで、計算後の座標に地図の中心を「ワープ」させる
        map.setView([lat, center.lng], map.getZoom(), { animate: false });
      }
    },
  });
  return null;
};

export default function MapPage() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch("/api/map");
      const data = await res.json();
      setPosts(data);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  return (
    <div className="h-[calc(100vh-4rem)] w-full">
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <Skeleton className="w-40 h-10" />
        </div>
      ) : (
        <MapContainer
          center={{ lat: 35.6812, lng: 139.7671 }}
          zoom={4}
          minZoom={3}
          worldCopyJump={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          <MapEventsHandler />

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
