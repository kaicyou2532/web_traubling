"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Country, Trouble } from "@prisma/client";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import dynamic from "next/dynamic";


// Props の定義
type Props = {
  troubleType: Trouble[];
  countries: Country[];
};


// フォームで管理したいデータの型
type FormDataType = {
  countryId: number;
  troubleId: number;
  travelMonth: number;
  travelYear: number;
  title: string;
};

function PostForm({ troubleType, countries }: Props) {
  // フォーム入力内容
  const [formData, setFormData] = useState<FormDataType>({
    countryId: 0,
    troubleId: 0,
    travelMonth: 0,
    travelYear: 0,
    title: "",
  });

  // 検索ワードを管理
  const [searchTerm, setSearchTerm] = useState("");

  // エディター
  const [textValue, setValue] = useState("");


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

  // フォーム送信時
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const countryId = formData.countryId;
    const troubleId = formData.troubleId;
    const travelMonth = formData.travelMonth;
    const travelYear = formData.travelYear;
    const titleLength = formData.title.length;
    const contentLength = textValue.length;

    if (countryId === 0 || troubleId === 0 || travelMonth === 0 || travelYear === 0 || titleLength === 0 || contentLength === 0) {
      window.alert("全ての項目を入力してください");
      return;
    }
    console.log("Submitted form data:", formData);
    console.log("Editor content:", textValue);
    console.log(`"${textValue}"`)


    const payload = {
      countryId: formData.countryId,
      troubleId: formData.troubleId,
      travelMonth: formData.travelMonth,
      travelYear: formData.travelYear,
      content: textValue,
      title: formData.title,
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
    } catch (error) {
      console.error("Error posting data:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
      <h2 className="font-bold text-4xl md:text-5xl space-y-6 mt-8 text-custom-green">
        トラブルを共有する
      </h2>

      {/* 訪問国 */}
      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-2xl font-semibold text-custom-green">
            訪れた国
          </Label>
          <Select
            value={formData.countryId ? formData.countryId.toString() : ""}
            onValueChange={(value) => setFormData({ ...formData, countryId: Number(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="訪問した国を選択してください" />
            </SelectTrigger>

            <SelectContent className="bg-white">
              <div className="sticky top-0 z-10 p-2 bg-white">
                <Input
                  placeholder="Search countries..."
                  key={searchTerm}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              {filteredCountries.map((country) => (
                <SelectItem
                  key={country.id}
                  value={country.id.toString()}
                  className="data-[highlighted]:bg-gray-200 data-[state=checked]:bg-gray-300 cursor-pointer"
                >
                  {country.jaName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* トラブルの種類 */}
      <div className="space-y-2">
        <Label className="text-2xl font-semibold text-custom-green">
          どのような問題に遭遇しましたか？
        </Label>
        <Select
          key={formData.troubleId}
          value={formData.troubleId ? formData.troubleId.toString() : ""}
          onValueChange={(value) => setFormData({ ...formData, troubleId: Number(value) })}
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
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-2xl font-semibold text-custom-green">
            訪問時期
          </Label>
          <Select
            key={formData.travelMonth}
            value={formData.travelMonth ? formData.travelMonth.toString() : ""}
            onValueChange={(value) => setFormData({ ...formData, travelMonth: Number(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="月" />
            </SelectTrigger>
            <SelectContent className="bg-white" position="popper">
              {monthItems}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-2xl font-semibold text-custom-green" >　</Label>
          <Select
            value={formData.travelYear ? formData.travelYear.toString() : ""}
            onValueChange={(value) => setFormData({ ...formData, travelYear: Number(value) })}
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
        <Label className="text-2xl font-semibold text-custom-green">
          経験したトラブルの詳細
        </Label>
        <ReactQuill theme="snow" value={textValue} onChange={setValue} />
      </div>

      {/* タイトル */}
      <div className="space-y-2">
        <Label className="text-2xl font-semibold text-custom-green">
          タイトル
        </Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="投稿にタイトルをつけてください"
        />
      </div>

      {/* 送信 */}
      <div className="mb-2">
        <Button
          type="submit"
          className="w-full bg-gray-700 hover:bg-custom-green text-white mb-8"
        >
          投稿する
        </Button>
        <div className="space-y-2">
        </div>
      </div>
    </form>
  );
}

export default PostForm;
