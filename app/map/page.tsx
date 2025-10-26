"use client";

import dynamic from 'next/dynamic';

const MapPage = dynamic(() => import("../components/MapPage"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen">
    <div className="text-xl">地図を読み込み中...</div>
  </div>
});

export default function Map() {
  return <MapPage />;
}
