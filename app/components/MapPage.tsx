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
    <div className="h-[calc(100vh-4rem)] w-full mt-16">
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <Skeleton className="w-40 h-10" />
        </div>
      ) : (
        <MapContainer
          center={{ lat: 35.6812, lng: 139.7671 }}
          zoom={4}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

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
