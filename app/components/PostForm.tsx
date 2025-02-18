"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countries } from "@/lib/countries";
import { Editor } from "@/app/components/TextEditor";


interface PostFormProps {
  onSubmit: (data: FormDataType) => void;
  initialData?: Partial<FormDataType>;
}

interface FormDataType {
  country: string;
  otherCountry: string;
  problemType: string;
  otherDetails?: string;
  visitMonth: string;
  visitYear: string;
  experience: string;
  title: string;
  images: File[];
}

// デフォルトのフォームデータ
const defaultFormData: FormDataType = {
  country: "",
  otherCountry: "",
  problemType: "",
  otherDetails: "",
  visitMonth: "",
  visitYear: "",
  experience: "",
  title: "",
  images: [],
};

function PostForm({ onSubmit, initialData = {} }: PostFormProps) {
  const [formData, setFormData] = useState<FormDataType>({
    ...defaultFormData,
    ...initialData,
  });

  const [dragActive, setDragActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.japaneseName.includes(searchTerm)
  );

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...files],
      }));
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <div className="space-y-6"></div>
      <h1 className="font-bold text-4xl md:text-5xl">トラブルを共有する</h1>

      <div className="space-y-6">
        {/* 国選択 */}
        <div className="space-y-2">
          <Label className="text-lg font-semibold text-green-700">訪れた国</Label>
          <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
            <SelectTrigger>
              <SelectValue placeholder="訪問した国を選択してください" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <div className="sticky top-0 p-2 bg-white">
                <Input
                  placeholder="Search countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="max-h-[200px] overflow-y-auto">
                {[...filteredCountries, { code: "other", name: "Other", japaneseName: "その他" }].map((country) => (
                  <SelectItem key={country.code}　value={country.code}　className="data-[highlighted]:bg-gray-200 data-[state=checked]:bg-gray-300 cursor-pointer">
                    {country.name} ({country.japaneseName})
                  </SelectItem>
                ))}
              </div>
            </SelectContent>
          </Select>
          {formData.country === "other" && (
            <Input
              placeholder="訪問した国を入力してください"
              value={formData.otherCountry || ""}
              onChange={(e) => setFormData({ ...formData, otherCountry: e.target.value })}
              className="mt-2"
            />
          )}
        </div>

        {/* 問題タイプ */}
        <div className="space-y-2">
          <Label className="text-lg font-semibold text-green-700">どのような問題に遭遇しましたか?</Label>
          <Select value={formData.problemType} onValueChange={(value) => setFormData({ ...formData, problemType: value })}>
            <SelectTrigger>
              <SelectValue placeholder="トラブルの分野を選択してください" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {["言語", "食べ物", "服装", "気候", "ホテル", "インターネット回線", "ホスピタリティ", "その他"].map((type) => (
                <SelectItem　key={type}　value={type}　className="data-[highlighted]:bg-gray-200 data-[state=checked]:bg-gray-300 cursor-pointer">
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* "Other" の場合の入力欄 */}
        {formData.problemType === "その他" && (
          <Textarea
            placeholder="トラブルの分野を入力してください"
            value={formData.otherDetails}
            onChange={(e) => setFormData({ ...formData, otherDetails: e.target.value })}
          />
        )}

        {/* 訪問日時 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-lg font-semibold text-green-700">訪問時期</Label>
            <Select value={formData.visitMonth} onValueChange={(value) => setFormData({ ...formData, visitMonth: value })}>
              <SelectTrigger>
                <SelectValue placeholder="月" />
              </SelectTrigger>
              <SelectContent className="bg-white" position="popper">
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}　className="data-[highlighted]:bg-gray-200 data-[state=checked]:bg-gray-300 cursor-pointer">
                    {new Date(0, i).toLocaleString("default", { month: "long" })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-lg font-semibold text-green-700">　</Label>
            <Select value={formData.visitYear} onValueChange={(value) => setFormData({ ...formData, visitYear: value })}>
              <SelectTrigger>
                <SelectValue placeholder="年" />
              </SelectTrigger>
              <SelectContent className="bg-white" position="popper">
                {Array.from({ length: 20 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <SelectItem key={year} value={String(year)}　className="data-[highlighted]:bg-gray-200 data-[state=checked]:bg-gray-300 cursor-pointer">
                      {year}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 体験談 */}
        <div className="space-y-2">
          <Label className="text-lg font-semibold text-green-700">経験したトラブルの詳細</Label>
          <Editor value={formData.experience} onChange={(value) => setFormData({ ...formData, experience: value })} />
        </div>

        {/* タイトル */}
        <div className="space-y-2">
          <Label className="text-lg font-semibold text-green-700">タイトル</Label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="投稿にタイトルをつけてください"
          />
        </div>

        {/* 送信ボタン */}
        <Button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white">
          Save and Preview
        </Button>
      </div>
    </form>
  );
}

export default PostForm;
