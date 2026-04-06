"use client"

import { useState, useRef } from "react"
import { ImagePlus, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { imageService } from "@/app/api/images"
import { toast } from "sonner"

interface ImageUploaderProps {
  images: { imageId: string; imageUrl: string }[]
  onChange: (images: { imageId: string; imageUrl: string }[]) => void
  maxImages?: number
}

export function ImageUploader({ images, onChange, maxImages = 3 }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (images.length + files.length > maxImages) {
      toast.error(`최대 ${maxImages}개까지 이미지를 업로드할 수 있습니다.`)
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }

    setIsUploading(true)
    try {
      const newImages = [...images]
      for (const file of Array.from(files)) {
        const res = await imageService.uploadImage(file)
        newImages.push({ imageId: res.data.imageId, imageUrl: res.data.imageUrl })
      }
      onChange(newImages)
    } catch (error) {
      console.error("이미지 업로드 실패:", error)
      toast.error("이미지 업로드에 실패했습니다.")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleRemove = (imageId: string) => {
    onChange(images.filter((img) => img.imageId !== imageId))
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          {"이미지 첨부"}
          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
            {`(${images.length} / ${maxImages})`}
          </span>
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        {images.map((img) => (
          <div
            key={img.imageId}
            className="group relative h-24 w-24 overflow-hidden rounded-lg border border-border bg-muted"
          >
            <img
              src={img.imageUrl}
              alt="Uploaded content"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(img.imageId)}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={cn(
              "flex h-24 w-24 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card transition-colors hover:border-primary/50 hover:bg-muted/50",
              isUploading && "cursor-not-allowed opacity-50"
            )}
          >
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <>
                <ImagePlus className="h-5 w-5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">{"이미지 추가"}</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
