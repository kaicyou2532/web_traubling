"use client";

import type React from "react";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Country, Trouble } from "@prisma/client";
// Dialogコンポーネントのインポートを更新
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Link from "next/link";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Leafletコンポーネントを動的にインポート
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

// ReactQuillとleafletを動的にインポートしてSSRを無効化
const ReactQuill = dynamic(() => import("react-quill"), { 
  ssr: false,
  loading: () => <div className="border rounded p-4 min-h-[200px]">エディターを読み込み中...</div>
});

// react-quillのスタイルは必要に応じて動的にインポート

// LocationMarkerコンポーネントを動的に作成
const LocationMarker = dynamic(() => 
  import("react-leaflet").then((mod) => {
    const { useMapEvents } = mod;
    return function LocationMarkerComponent({
      pinPosition,
      setPinPosition,
    }: {
      pinPosition: { lat: number; lng: number } | null;
      setPinPosition: (pos: { lat: number; lng: number } | null) => void;
    }) {
      const map = useMapEvents({
        click(e: any) {
          setPinPosition(e.latlng);
          map.flyTo(e.latlng, map.getZoom());
        },
      });
      return pinPosition ? <Marker position={pinPosition} /> : null;
    };
  }),
  { ssr: false }
);

// Leaflet Markerアイコンが表示されない問題を修正
if (typeof window !== "undefined") {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  });
}

type City = {
  id: number;
  jaName: string;
  countryId: number;
};

type Props = {
  troubleType: Trouble[];
  countries: Country[];
  cities: City[];
};

// フォームで管理したいデータの型
type FormDataType = {
  countryId: number;
  cityId: number;
  troubleId: number;
  travelMonth: number;
  travelYear: number;
  title: string;
};

function PostForm({ troubleType, countries, cities }: Props) {
  // フォーム入力内容
  const [formData, setFormData] = useState<FormDataType>({
    countryId: 0,
    cityId: 0,
    troubleId: 0,
    travelMonth: 0,
    travelYear: 0,
    title: "",
  });

  // 国検索ワード
  const [searchTerm, setSearchTerm] = useState("");

  // 都市検索ワード
  const [searchCityTerm, setSearchCityTerm] = useState("");

  // エディター
  const [textValue, setValue] = useState("");

  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  // --- Map related state ---
  const [showMap, setShowMap] = useState(false);
  const [pinPosition, setPinPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const mapRef = useRef<L.Map>(null);

  const handleSetCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPos = { lat: latitude, lng: longitude };
        setPinPosition(newPos);
        if (mapRef.current) {
          mapRef.current.flyTo(newPos, 13);
        }
      },
      (error) => {
        console.error("位置情報取得エラー:", {
          code: error.code,
          message: error.message,
        });

        let alertMessage = "現在地の取得に失敗しました。";
        if (error.code === 1) {
          alertMessage +=
            "\n位置情報の利用が許可されていません。OSまたはブラウザの設定を確認してください。";
        } else if (error.code === 2) {
          alertMessage += "\n内部エラーにより位置を特定できませんでした。";
        } else if (error.code === 3) {
          alertMessage += "\nタイムアウトしました。";
        }
        alert(alertMessage);
      }
    );
  };

  // 月の選択肢
  const monthItems = [];
  for (let i = 1; i <= 12; i++) {
    monthItems.push(
      <SelectItem
        key={i}
        value={i.toString()}
        className="data-[highlighted]:bg-gray-200 data-[state=checked]:bg-gray-300 cursor-pointer"
      >
        {i}月
      </SelectItem>
    );
  }

  // 年の選択肢
  const yearItems = [];
  for (let year = 2025; year >= 2005; year--) {
    yearItems.push(
      <SelectItem
        key={year}
        value={year.toString()}
        className="data-[highlighted]:bg-gray-200 data-[state=checked]:bg-gray-300 cursor-pointer"
      >
        {year}年
      </SelectItem>
    );
  }

  // 検索ワードに合致する国
  const filteredCountries = countries.filter((country) =>
    country.jaName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 検索ワードに合致する都市
  // 選択された国に紐づく都市 ＋ 都市検索ワードで絞り込み
  const filteredCities = cities.filter(
    (city) =>
      city.countryId === formData.countryId &&
      city.jaName.toLowerCase().includes(searchCityTerm.toLowerCase())
  );

  // フォーム送信時
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const countryId = formData.countryId;
    const cityId = formData.cityId;
    const troubleId = formData.troubleId;
    const travelMonth = formData.travelMonth;
    const travelYear = formData.travelYear;
    const titleLength = formData.title.length;
    const contentLength = textValue.length;

    if (
      countryId === 0 ||
      cityId === 0 ||
      troubleId === 0 ||
      travelMonth === 0 ||
      travelYear === 0 ||
      titleLength === 0 ||
      contentLength === 0
    ) {
      window.alert("全ての項目を入力してください");
      return;
    }
    console.log("Submitted form data:", formData);
    console.log("Editor content:", textValue);
    console.log(`"${textValue}"`);

    const payload = {
      countryId: formData.countryId,
      cityId: formData.cityId,
      troubleId: formData.troubleId,
      travelMonth: formData.travelMonth,
      travelYear: formData.travelYear,
      content: textValue,
      title: formData.title,
      latitude: pinPosition?.lat ?? null,
      longitude: pinPosition?.lng ?? null,
    };

    try {
      const response = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("APIエラー");
      }
      const data = await response.json();
      console.log("API response:", data);
      setIsConfirmationOpen(true); // Open the confirmation dialog
    } catch (error) {
      console.error("Error posting data:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto space-y-8 px-3 py-10"
    >
      <h2 className="font-bold text-3xl md:text-4xl space-y-6 mt-8 text-custom-green ml-[-2px]">
        トラブルを共有する
      </h2>

      {/* 訪問国 */}
      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-xl md:text-2xl font-semibold text-custom-green">
            訪れた国
          </Label>
          <Select
            value={formData.countryId ? formData.countryId.toString() : ""}
            onValueChange={(value) =>
              setFormData({ ...formData, countryId: Number(value) })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="訪問した国を選択してください" />
            </SelectTrigger>

            <SelectContent className="bg-white">
              <div className="sticky top-0 z-10 p-2 bg-white">
                <Input
                  placeholder="Search countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              {filteredCountries.length === 0 && searchTerm !== "" ? (
                <div className="p-4 text-gray-500 text-sm">
                  国が見つかりません
                </div>
              ) : (
                filteredCountries.map((country) => (
                  <SelectItem
                    key={country.id}
                    value={country.id.toString()}
                    className="data-[highlighted]:bg-gray-200 data-[state=checked]:bg-gray-300 cursor-pointer"
                  >
                    {country.jaName}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 訪問都市 */}
      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-xl md:text-2xl font-semibold text-custom-green">
            訪れた都市
          </Label>
          <Select
            value={formData.cityId ? formData.cityId.toString() : ""}
            onValueChange={(value) =>
              setFormData({ ...formData, cityId: Number(value) })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="訪問した都市を選択してください" />
            </SelectTrigger>

            <SelectContent className="bg-white">
              <div className="sticky top-0 z-10 p-2 bg-white">
                <Input
                  placeholder="Search cities..."
                  value={searchCityTerm}
                  onChange={(e) => setSearchCityTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              {filteredCities.length === 0 && searchCityTerm !== "" ? (
                <div className="p-4 text-gray-500 text-sm">
                  都市が見つかりません
                </div>
              ) : (
                filteredCities.map((city) => (
                  <SelectItem
                    key={city.id}
                    value={city.id.toString()}
                    className="data-[highlighted]:bg-gray-200 data-[state=checked]:bg-gray-300 cursor-pointer"
                  >
                    {city.jaName}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* トラブルの種類 */}
      <div className="space-y-2">
        <Label className="text-xl md:text-2xl font-semibold text-custom-green">
          どのような問題に遭遇しましたか？
        </Label>
        <Select
          key={formData.troubleId}
          value={formData.troubleId ? formData.troubleId.toString() : ""}
          onValueChange={(value) =>
            setFormData({ ...formData, troubleId: Number(value) })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="トラブルの分野を選択してください" />
          </SelectTrigger>

          <SelectContent className="bg-white">
            {troubleType.map((type) => (
              <SelectItem
                key={type.id}
                value={type.id.toString()}
                className="data-[highlighted]:bg-gray-200 data-[state=checked]:bg-gray-300 cursor-pointer"
              >
                {type.jaName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 月・年 */}
      <div className="flex gap-5 items-end">
        <div className="space-y-2 w-[50%]">
          <Label className="text-xl md:text-2xl font-semibold text-custom-green">
            訪問時期
          </Label>
          <Select
            key={formData.travelMonth}
            value={formData.travelMonth ? formData.travelMonth.toString() : ""}
            onValueChange={(value) =>
              setFormData({ ...formData, travelMonth: Number(value) })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="月" />
            </SelectTrigger>
            <SelectContent className="bg-white" position="popper">
              {monthItems}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 w-[50%]">
          {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
          <Label className="text-xl md:text-2xl font-semibold text-custom-green"></Label>
          <Select
            value={formData.travelYear ? formData.travelYear.toString() : ""}
            onValueChange={(value) =>
              setFormData({ ...formData, travelYear: Number(value) })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="年" />
            </SelectTrigger>
            <SelectContent className="bg-white" position="popper">
              {yearItems}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* エディター */}
      <div className="space-y-2">
        <Label className="text-xl md:text-2xl font-semibold text-custom-green">
          経験したトラブルの詳細
        </Label>
        <ReactQuill theme="snow" value={textValue} onChange={setValue} />
      </div>

      {/* タイトル */}
      <div className="space-y-2">
        <Label className="text-xl md:text-2xl font-semibold text-custom-green">
          タイトル
        </Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="投稿にタイトルをつけてください"
        />
      </div>

      {/* --- MAP FEATURE UI（Leaflet対応版） --- */}
      <div className="space-y-4 rounded-md border border-gray-200 p-4 bg-gray-50">
        <div className="flex items-center space-x-3">
          <Input
            type="checkbox"
            id="map-checkbox"
            checked={showMap}
            onChange={(e) => {
              setShowMap(e.target.checked);
              if (!e.target.checked) setPinPosition(null);
            }}
            className="h-5 w-5 rounded border-gray-300 text-custom-green focus:ring-custom-green"
          />
          <Label
            htmlFor="map-checkbox"
            className="text-xl md:text-2xl font-semibold text-custom-green cursor-pointer"
          >
            トラブル発生場所を地図で示す
          </Label>
        </div>

        {showMap && (
          <div className="space-y-4 pt-2 z-0">
            <p className="text-sm text-gray-600">
              地図上の発生地点をクリックしてピンを立てるか、「現在地にピンを打つ」ボタンを押してください。
            </p>

            {/* ▼ Leaflet Map ▼ */}
            <div className="h-80 w-full relative z-0">
              <MapContainer
                center={{ lat: 35.6812, lng: 139.7671 }}
                zoom={4}
                minZoom={3}
                maxBounds={[
                  [-90, -180],
                  [90, 180],
                ]}
                worldCopyJump={false}
                maxBoundsViscosity={1.0}
                style={{ height: "100%", width: "100%" }}
                ref={mapRef as any}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <LocationMarker
                  pinPosition={pinPosition}
                  setPinPosition={setPinPosition}
                />
              </MapContainer>
            </div>

            <Button
              type="button"
              onClick={handleSetCurrentLocation}
              className="w-full bg-gray-700 hover:bg-custom-green text-white mb-8"
            >
              現在地にピンを打つ
            </Button>
          </div>
        )}
      </div>

      {/* 送信 */}
      <div className="mb-2">
        <Button
          type="submit"
          className="w-full bg-gray-700 hover:bg-custom-green text-white mb-8"
        >
          投稿する
        </Button>
        {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
        <div className="space-y-2"></div>
      </div>
      {/* Confirmation Dialog */}
      <Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              投稿が完了しました
            </DialogTitle>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Link href="/">
              <Button className="bg-gray-700 hover:bg-custom-green text-white">
                トップページに戻る
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );


}

export default PostForm;
