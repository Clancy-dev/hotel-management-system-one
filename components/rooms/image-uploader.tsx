"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, ImageIcon, Loader2 } from "lucide-react"
import { useUploadThing } from "@/lib/uploadthing"
import { useToast } from "@/hooks/use-toast"

interface ImageUploaderProps {
  onImageAdded: (url: string) => void
}

export function ImageUploader({ onImageAdded }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const { toast } = useToast()

  const { startUpload, isUploading } = useUploadThing("roomImageUploader", {
    onClientUploadComplete: (res) => {
      if (res && res.length > 0) {
        // Add each uploaded image URL
        res.forEach((file) => {
          if (file.url) {
            onImageAdded(file.url)
          }
        })
        toast({
          title: "Upload complete",
          description: `Successfully uploaded ${res.length} image${res.length > 1 ? "s" : ""}`,
        })
      }
    },
    onUploadError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message || "Something went wrong during upload",
        variant: "destructive",
      })
    },
  })

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return

    // Convert FileList to File array
    const fileArray = Array.from(files)

    // Filter for image files only
    const imageFiles = fileArray.filter((file) => file.type.startsWith("image/"))

    if (imageFiles.length === 0) {
      toast({
        title: "Invalid files",
        description: "Please select image files only",
        variant: "destructive",
      })
      return
    }

    // Start the upload
    startUpload(imageFiles)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileUpload(e.dataTransfer.files)
  }

  return (
    <div className="space-y-2">
      <div
        className={`border-2 border-dashed rounded-md p-4 text-center ${
          isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/20"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center gap-2 py-4">
          {isUploading ? (
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          ) : (
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          )}
          <div className="text-sm font-medium">
            {isUploading ? "Uploading..." : "Drag images here or click to upload"}
          </div>
          <p className="text-xs text-muted-foreground">Upload images of the room to showcase its features</p>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept="image/*"
            multiple
            onChange={(e) => handleFileUpload(e.target.files)}
            disabled={isUploading}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById("file-upload")?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Images
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
