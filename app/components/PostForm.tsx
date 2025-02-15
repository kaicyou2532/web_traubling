"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { countries } from "@/lib/countries"
import { Editor } from "@/app/components/TextEditor"

interface PostFormProps {
  onSubmit: (data: any) => void
  initialData: any
}

export function PostForm({ onSubmit, initialData }: PostFormProps) {
  interface FormDataType {
    country: string
    problemType: string
    otherDetails?: string
    visitMonth: string
    visitYear: string
    experience: string
    title: string
    images: File[]
  }
  
  const [formData, setFormData] = useState<FormDataType>(initialData)
  const [dragActive, setDragActive] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) || country.japaneseName.includes(searchTerm),
  )

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files)
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...files],
      }))
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(formData)
      }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <h1 className="font-bold text-4xl md:text-5xl">Post form frame</h1>
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => window.history.back()}>
          <X className="h-6 w-6" />
        </button>
        <div className="text-sm">LINK 1 LINK 2 LINK 3</div>
        <button type="button" className="w-6 h-6">
          ⋮
        </button>
      </div>

      <div className="space-y-6">
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

        <div className="space-y-2">
          <Label className="text-lg font-semibold text-green-700">What kind of problem?</Label>
          <Select
            value={formData.problemType}
            onValueChange={(value) => setFormData({ ...formData, problemType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select problem type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="language">Language</SelectItem>
              <SelectItem value="food">Food</SelectItem>
              <SelectItem value="clothes">Clothes</SelectItem>
              <SelectItem value="temperature">Temperature</SelectItem>
              <SelectItem value="hotel">Hotel</SelectItem>
              <SelectItem value="internet">Internet Connection</SelectItem>
              <SelectItem value="hospitability">Hospitability</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.problemType === "other" && (
          <Textarea
            placeholder="If you choose 'Other,' please provide details here."
            value={formData.otherDetails}
            onChange={(e) => setFormData({ ...formData, otherDetails: e.target.value })}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-lg font-semibold text-green-700">When was your visit?</Label>
            <Select
              value={formData.visitMonth}
              onValueChange={(value) => setFormData({ ...formData, visitMonth: value })}
            >
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
          <div className="space-y-2 pt-8">
            <Select
              value={formData.visitYear}
              onValueChange={(value) => setFormData({ ...formData, visitYear: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 20 }, (_, i) => {
                  const year = new Date().getFullYear() - i
                  return (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-lg font-semibold text-green-700">Write your experience here</Label>
          <Editor
            value={formData.experience}
            onChange={(value) => setFormData((prev) => ({ ...prev, experience: value }))}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-lg font-semibold text-green-700">Title your experience</Label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter a title for your post"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-lg font-semibold text-green-700">Add pictures (optional)</Label>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              dragActive ? "border-green-500 bg-green-50" : "border-green-300"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <p className="text-sm text-green-600">
              Select pictures from your file
              <br />
              Or drag and drop here
            </p>
            {formData.images.length > 0 && (
              <div className="mt-4 flex gap-2 flex-wrap">
                {formData.images.map((file: File, index: number) => (
                  <div key={index} className="relative">
                    <Image
                      src={URL.createObjectURL(file) || "/placeholder.svg"}
                      alt={`Upload ${index + 1}`}
                      width={100}
                      height={100}
                      className="rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = [...formData.images]
                        newImages.splice(index, 1)
                        setFormData({ ...formData, images: newImages })
                      }}
                      className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white">
        Save and Preview
      </Button>
    </form>
  )
}

