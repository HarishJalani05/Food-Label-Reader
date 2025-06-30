"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Camera, Upload, X } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void
}

export function ImageUpload({ onImageUpload }: ImageUploadProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      processImage(file)
    }
  }

  const processImage = (file: File) => {
    setIsUploading(true)

    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      setSelectedImage(imageUrl)
      setIsUploading(false)
      onImageUpload(imageUrl)
    }
    reader.readAsDataURL(file)
  }

  const clearImage = () => {
    setSelectedImage(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (cameraInputRef.current) cameraInputRef.current.value = ""
  }

  return (
    <div className="space-y-4">
      {!selectedImage ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Gallery Upload */}
          <Card
            className="p-6 border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium">Upload from Gallery</h3>
                <p className="text-sm text-muted-foreground mt-1">Choose an image from your device</p>
              </div>
            </div>
          </Card>

          {/* Camera Capture */}
          <Card
            className="p-6 border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => cameraInputRef.current?.click()}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Camera className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-medium">Take Photo</h3>
                <p className="text-sm text-muted-foreground mt-1">Use your camera to capture the label</p>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-4">
          <div className="relative">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
              <Image
                src={selectedImage || "/placeholder.svg"}
                alt="Uploaded food label"
                fill
                className="object-contain"
              />
            </div>
            <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={clearImage}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">Image uploaded successfully. Processing text...</p>
          </div>
        </Card>
      )}

      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {isUploading && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            Processing image...
          </div>
        </div>
      )}
    </div>
  )
}
