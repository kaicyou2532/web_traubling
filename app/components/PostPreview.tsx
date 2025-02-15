import { X, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface PostPreviewProps {
  data: any
  onBack: () => void
  onPost: () => void
}

export function PostPreview({ data, onBack, onPost }: PostPreviewProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <button onClick={onBack}>
          <X className="h-6 w-6" />
        </button>
        <div className="text-sm">LINK 1 LINK 2 LINK 3</div>
        <button className="w-6 h-6">⋮</button>
      </div>

      <div className="border rounded-lg p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full" />
            <span className="font-medium">User Name</span>
          </div>
          <button>
            <Pencil className="h-5 w-5" />
          </button>
        </div>

        <h1 className="text-xl font-bold">{data.title}</h1>
        <p className="text-sm text-gray-600">
          {data.visitMonth}/{data.visitYear} • {data.country} • {data.problemType}
        </p>

        <div className="prose max-w-none">{data.experience}</div>

        {data.images.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {data.images.map((file: File, index: number) => (
              <Image
                key={index}
                src={URL.createObjectURL(file) || "/placeholder.svg"}
                alt={`Upload ${index + 1}`}
                width={300}
                height={300}
                className="rounded-lg object-cover w-full h-40"
              />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Set posting time (optional)</p>
          <Select
            value={data.postingTime}
            onValueChange={(value) => {
              // Handle posting time change
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select posting time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="now">Post now</SelectItem>
              <SelectItem value="later">Schedule for later</SelectItem>
            </SelectContent>
          </Select>

          {data.postingTime === "later" && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label>Time</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, hour) =>
                      Array.from({ length: 4 }, (_, quarterHour) => {
                        const time = `${hour.toString().padStart(2, "0")}:${(quarterHour * 15).toString().padStart(2, "0")}`
                        return (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        )
                      }),
                    ).flat()}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Day</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Month</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => {
                      const month = new Date(0, i).toLocaleString("default", { month: "long" })
                      return (
                        <SelectItem key={i + 1} value={String(i + 1)}>
                          {month}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 2 }, (_, i) => {
                      const year = new Date().getFullYear() + i
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
          )}
        </div>

        <Button onClick={onPost} className="w-full bg-green-600 hover:bg-green-700 text-white">
          Post now
        </Button>
      </div>
    </div>
  )
}

