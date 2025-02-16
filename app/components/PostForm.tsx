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
      <h1 className="font-bold text-4xl md:text-5xl">Post Form</h1>

      <div className="space-y-6">
        {/* 国選択 */}
        <div className="space-y-2">
          <Label className="text-lg font-semibold text-green-700">Which Country?</Label>
          <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select a country" />
            </SelectTrigger>
            <SelectContent>
              <div className="sticky top-0 p-2 bg-white">
                <Input
                  placeholder="Search countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              {filteredCountries.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name} ({country.japaneseName})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 問題タイプ */}
        <div className="space-y-2">
          <Label className="text-lg font-semibold text-green-700">What kind of problem?</Label>
          <Select value={formData.problemType} onValueChange={(value) => setFormData({ ...formData, problemType: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select problem type" />
            </SelectTrigger>
            <SelectContent>
              {["language", "food", "clothes", "temperature", "hotel", "internet", "hospitability", "other"].map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* "Other" の場合の入力欄 */}
        {formData.problemType === "other" && (
          <Textarea
            placeholder="If you choose 'Other,' please provide details here."
            value={formData.otherDetails}
            onChange={(e) => setFormData({ ...formData, otherDetails: e.target.value })}
          />
        )}

        {/* 訪問日時 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-lg font-semibold text-green-700">Visit Month</Label>
            <Select value={formData.visitMonth} onValueChange={(value) => setFormData({ ...formData, visitMonth: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    {new Date(0, i).toLocaleString("default", { month: "long" })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-lg font-semibold text-green-700">Visit Year</Label>
            <Select value={formData.visitYear} onValueChange={(value) => setFormData({ ...formData, visitYear: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 20 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <SelectItem key={year} value={String(year)}>
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
          <Label className="text-lg font-semibold text-green-700">Write your experience</Label>
          <Editor value={formData.experience} onChange={(value) => setFormData({ ...formData, experience: value })} />
        </div>

        {/* タイトル */}
        <div className="space-y-2">
          <Label className="text-lg font-semibold text-green-700">Title</Label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter a title for your post"
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
