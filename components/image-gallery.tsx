"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X, ImageIcon } from "lucide-react"

interface ImageGalleryProps {
  images: string[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImageGallery({ images, open, onOpenChange }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      handlePrevious()
    } else if (e.key === "ArrowRight") {
      handleNext()
    } else if (e.key === "Escape") {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[900px] max-w-[95vw] max-h-[90vh] p-0 bg-black/95 border-none"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 text-white hover:bg-white/20 z-50"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Button>

        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[70vh] text-white">
            <ImageIcon className="h-24 w-24 opacity-50 mb-4" />
            <p className="text-xl font-medium">No images available</p>
            <p className="text-sm text-white/70 mt-2">This room doesn't have any images yet</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center h-[70vh] relative">
              <img
                src={images[currentIndex] || "/placeholder.svg"}
                alt={`Image ${currentIndex + 1}`}
                className="max-h-full max-w-full object-contain"
              />

              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70"
                    onClick={handlePrevious}
                  >
                    <ChevronLeft className="h-6 w-6" />
                    <span className="sr-only">Previous image</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70"
                    onClick={handleNext}
                  >
                    <ChevronRight className="h-6 w-6" />
                    <span className="sr-only">Next image</span>
                  </Button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="p-4 flex justify-center items-center gap-2">
                <div className="text-white text-sm">
                  {currentIndex + 1} / {images.length}
                </div>
                <div className="flex-1 flex justify-center gap-1 overflow-x-auto py-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      className={`h-16 w-16 rounded-md overflow-hidden flex-shrink-0 transition-all ${
                        index === currentIndex
                          ? "border-2 border-white scale-105"
                          : "border border-white/30 opacity-70 hover:opacity-100"
                      }`}
                      onClick={() => setCurrentIndex(index)}
                    >
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Thumbnail ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
